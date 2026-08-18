'use strict';

const crypto = require('crypto');
const db = require('../db');
const store = require('../store');
const uploads = require('../uploads');
const rateLimit = require('../ratelimit');
const { HttpError, sendJson, readJsonBody, assertSameOrigin, str } = require('../http');
const { PROVINCES } = require('./content');
const adminUsers = require('../admin-users');
const adminSystem = require('../admin-system');
const settings = require('../settings');

const REPORT_LIST_ALIASES = new Set(['/api/admin/reports', '/api/reports']);
const DISMISS_ALIASES = new Set(['/api/admin/reports/dismiss', '/api/admin/dismiss-report']);
const DELETE_ALIASES = new Set(['/api/admin/delete-reported-audio', '/api/admin/delete-report']);
const PENDING_ALIASES = new Set(['/api/contributions', '/api/pending-contributions']);
const APPROVE_ALIASES = new Set(['/api/approve-contribution', '/api/approve-audio']);
const REJECT_ALIASES = new Set(['/api/reject-contribution', '/api/reject-audio']);

const isAdminPath = (pathname) =>
  pathname.startsWith('/api/admin/') ||
  REPORT_LIST_ALIASES.has(pathname) ||
  PENDING_ALIASES.has(pathname) ||
  APPROVE_ALIASES.has(pathname) ||
  REJECT_ALIASES.has(pathname) ||
  pathname === '/api/add-audio';

const YOUTUBE_PATTERN = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]{11}|youtu\.be\/[\w-]{11})/;

async function handle(req, res, ctx) {
  const { pathname, method, ip } = ctx;

  if (!isAdminPath(pathname)) return false;

  // Mot cong kiem soat duy nhat cho toan bo nhom route quan tri
  if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập.');
  if (ctx.user.role !== 'admin') throw new HttpError(403, 'Chức năng này chỉ dành cho quản trị viên.');
  rateLimit.guard(res, 'admin', ip);

  const admin = ctx.user;
  const audit = (action, targetId, detail) =>
    store.writeAuditLog({ userId: admin.id, username: admin.username, action, targetId, detail, ip });

  // --- GET danh sach bao cao ---------------------------------------
  if (method === 'GET' && REPORT_LIST_ALIASES.has(pathname)) {
    sendJson(res, 200, await store.listPendingReports());
    return true;
  }

  // --- POST bo qua bao cao -----------------------------------------
  if (method === 'POST' && DISMISS_ALIASES.has(pathname)) {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const audioId = str(body.audio_id || body.id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const dismissed = await store.dismissReport(audioId);
    if (!dismissed) throw new HttpError(404, 'Không tìm thấy bản ghi tương ứng.');

    await audit('report.dismiss', audioId);
    sendJson(res, 200, { success: true, audio_id: audioId });
    return true;
  }

  // --- DELETE xoa han ban ghi bi bao cao ---------------------------
  const isDeleteReported =
    (method === 'DELETE' && pathname.startsWith('/api/admin/reports/')) ||
    (method === 'POST' && DELETE_ALIASES.has(pathname));

  if (isDeleteReported) {
    assertSameOrigin(req);

    let audioId = null;
    if (method === 'POST') {
      const body = await readJsonBody(req);
      audioId = str(body.audio_id || body.id, 64);
    } else {
      audioId = str(decodeURIComponent(pathname.slice('/api/admin/reports/'.length)), 64);
    }
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const audioUrl = await store.deleteAudio(audioId);
    await uploads.removeAudioFile(audioUrl);

    await audit('audio.delete', audioId);
    sendJson(res, 200, { success: true, id: audioId });
    return true;
  }

  // --- GET hang doi cho duyet --------------------------------------
  if (method === 'GET' && PENDING_ALIASES.has(pathname)) {
    sendJson(res, 200, await store.listPendingAudio());
    return true;
  }

  // --- POST duyet dong gop -----------------------------------------
  if (method === 'POST' && APPROVE_ALIASES.has(pathname)) {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const audioId = str(body.id || body.record?.id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const record = await store.getAudio(audioId);
    if (!record) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    const approved = await store.approveAudio(audioId, admin.id);
    if (!approved) throw new HttpError(500, 'Không cập nhật được trạng thái bản ghi.');

    await audit('audio.approve', audioId, record.title);
    sendJson(res, 200, { success: true, record: await store.getAudio(audioId) });
    return true;
  }

  // --- POST tu choi dong gop ---------------------------------------
  if (method === 'POST' && REJECT_ALIASES.has(pathname)) {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const audioId = str(body.id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const record = await store.getAudio(audioId);
    if (!record) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    await store.setAudioStatus(audioId, 'rejected', admin.id);
    await uploads.removeAudioFile(record.audioUrl);

    await audit('audio.reject', audioId, record.title);
    sendJson(res, 200, { success: true, id: audioId });
    return true;
  }

  // --- POST them ban ghi tu YouTube --------------------------------
  if (method === 'POST' && pathname === '/api/add-audio') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);

    const title = str(body.title, 255);
    const province = str(body.province, 64);
    const topic = str(body.topic, 128);
    const youtubeUrl = str(body.youtube_url, 255);

    if (!title || !province || !topic || !youtubeUrl) {
      throw new HttpError(400, 'Thiếu thông tin bắt buộc.');
    }
    if (!PROVINCES.has(province)) throw new HttpError(400, 'Tỉnh/thành không hợp lệ.');
    if (!YOUTUBE_PATTERN.test(youtubeUrl)) {
      throw new HttpError(400, 'Đường dẫn YouTube không hợp lệ.');
    }

    const record = await store.insertAudio({
      id: `yt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      title,
      speaker: 'YouTube Media',
      gender: 'Khác',
      province,
      dialectGroup: store.dialectGroupOf(province),
      ageGroup: '36-55',
      topic,
      youtubeUrl,
      startTime: Number(body.start_time) || 0,
      endTime: Number(body.end_time) || 0,
      transcriptDialect: 'Bản ghi từ YouTube (Chỉ phát âm thanh)',
      transcriptStandard: 'Bản ghi từ YouTube (Chỉ phát âm thanh)',
      subtitle: 'Bản ghi từ YouTube (Chỉ phát âm thanh)',
      verified: true,  // admin tu them nen coi nhu da kiem duyet
      tags: ['YouTube', province],
      status: 'approved',
      submittedBy: admin.id
    });

    await audit('audio.add_youtube', record.id, title);
    sendJson(res, 201, { success: true, record });
    return true;
  }

  // --- GET thong ke tong quan --------------------------------------
  if (method === 'GET' && pathname === '/api/admin/stats') {
    const [audio] = await db.query(
      `SELECT
         SUM(status = 'approved') AS approved,
         SUM(status = 'pending')  AS pending,
         SUM(is_reported = 1)     AS reported,
         COUNT(*)                 AS total
       FROM audio_records`
    );
    const [users] = await db.query(
      `SELECT COUNT(*) AS total, SUM(role = 'admin') AS admins FROM users`
    );
    const [lexicon] = await db.query('SELECT COUNT(*) AS total FROM lexicon');

    sendJson(res, 200, {
      success: true,
      audio: {
        approved: Number(audio.approved) || 0,
        pending: Number(audio.pending) || 0,
        reported: Number(audio.reported) || 0,
        total: Number(audio.total) || 0
      },
      users: { total: Number(users.total) || 0, admins: Number(users.admins) || 0 },
      lexicon: { total: Number(lexicon.total) || 0 }
    });
    return true;
  }

  // --- POST bat/tat dong y nhan ban giong cho mot ban ghi ----------
  if (method === 'POST' && pathname === '/api/admin/clone-consent') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const audioId = str(body.id || body.audio_id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');
    if (typeof body.allowed !== 'boolean') {
      throw new HttpError(400, 'Thiếu giá trị allowed (true/false).');
    }

    const record = await store.getAudio(audioId);
    if (!record) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    await store.setCloneConsent(audioId, body.allowed, admin.id);

    await audit(
      body.allowed ? 'clone_consent.grant' : 'clone_consent.revoke',
      audioId,
      `${record.title} — người nói: ${record.speaker}`
    );

    sendJson(res, 200, {
      success: true,
      id: audioId,
      allowVoiceClone: body.allowed,
      message: body.allowed
        ? 'Đã bật cho phép nhân bản giọng cho bản ghi này.'
        : 'Đã tắt. Các giọng đã nhân bản từ bản ghi này cũng bị vô hiệu.'
    });
    return true;
  }

  // --- PATCH sua sieu du lieu ban ghi -------------------------------
  if (method === 'POST' && pathname === '/api/admin/audio/update') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const audioId = str(body.id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const record = await store.getAudio(audioId);
    if (!record) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    if (body.province && !PROVINCES.has(body.province)) {
      throw new HttpError(400, 'Tỉnh/thành không hợp lệ.');
    }
    if (body.license && !store.LICENSES[body.license]) {
      throw new HttpError(400, 'Giấy phép không hợp lệ.');
    }

    const changed = await store.updateAudioMetadata(audioId, body, admin.id);
    if (!changed) throw new HttpError(400, 'Không có trường nào hợp lệ để cập nhật.');

    await audit('audio.update', audioId, Object.keys(body).filter(k => k !== 'id').join(', '));
    sendJson(res, 200, { success: true, record: await store.getAudio(audioId) });
    return true;
  }

  // --- GET cac ban ghi nghi trung nhau ------------------------------
  if (method === 'GET' && pathname === '/api/admin/duplicates') {
    const groups = await store.findDuplicates();
    const detailed = await Promise.all(groups.map(async (g) => ({
      ...g,
      records: (await Promise.all(g.ids.map(id => store.getAudio(id)))).filter(Boolean)
    })));
    sendJson(res, 200, { success: true, groups: detailed });
    return true;
  }

  // --- GET danh sach muc cau hinh (KHONG tra ve gia tri that) -------
  if (method === 'GET' && pathname === '/api/admin/settings') {
    sendJson(res, 200, { success: true, items: await settings.describeAll() });
    return true;
  }

  // --- POST luu mot muc cau hinh ------------------------------------
  if (method === 'POST' && pathname === '/api/admin/settings') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const name = str(body.name, 64);
    if (!name || !settings.DEFINITIONS[name]) throw new HttpError(400, 'Mục cấu hình không hợp lệ.');

    const result = await settings.set(name, body.value, admin.id);

    // Chi ghi TEN muc vao nhat ky, tuyet doi khong ghi gia tri
    await audit(result.cleared ? 'settings.clear' : 'settings.update', name,
      settings.DEFINITIONS[name].label);

    sendJson(res, 200, {
      success: true,
      message: result.cleared
        ? `Đã xoá ${settings.DEFINITIONS[name].label}.`
        : `Đã lưu ${settings.DEFINITIONS[name].label}.`,
      items: await settings.describeAll()
    });
    return true;
  }

  // --- POST kiem tra khoa con song khong ----------------------------
  if (method === 'POST' && pathname === '/api/admin/settings/test') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const name = str(body.name, 64);
    if (!name || !settings.DEFINITIONS[name]) throw new HttpError(400, 'Mục cấu hình không hợp lệ.');

    sendJson(res, 200, { success: true, ...(await settings.testKey(name)) });
    return true;
  }

  // --- GET tong quan he thong ---------------------------------------
  if (method === 'GET' && pathname === '/api/admin/dashboard') {
    sendJson(res, 200, { success: true, ...(await adminSystem.getDashboard()) });
    return true;
  }

  // --- GET suc khoe he thong ----------------------------------------
  if (method === 'GET' && pathname === '/api/admin/system') {
    sendJson(res, 200, { success: true, ...(await adminSystem.getSystemStatus()) });
    return true;
  }

  // --- GET danh sach tai khoan --------------------------------------
  if (method === 'GET' && pathname === '/api/admin/users') {
    const p = ctx.query;
    const result = await adminUsers.listUsers({
      q: p.get('q'), role: p.get('role'), status: p.get('status'),
      page: p.get('page'), limit: p.get('limit')
    });
    sendJson(res, 200, { success: true, ...result, currentUserId: admin.id });
    return true;
  }

  // --- POST doi quyen / khoa / go khoa tai khoan --------------------
  if (method === 'POST' && pathname === '/api/admin/users/update') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const result = await adminUsers.updateUser(admin, body.id, {
      role: str(body.role, 16),
      status: str(body.status, 16),
      unlock: Boolean(body.unlock)
    });

    await audit('user.update', String(body.id), `${result.username}: ${result.changes.join('; ')}`);
    sendJson(res, 200, {
      success: true,
      message: `Đã cập nhật "${result.username}" — ${result.changes.join('; ')}.`
    });
    return true;
  }

  // --- POST buoc dang xuat moi thiet bi cua mot tai khoan -----------
  if (method === 'POST' && pathname === '/api/admin/users/revoke-sessions') {
    assertSameOrigin(req);
    const body = await readJsonBody(req);
    const result = await adminUsers.revokeSessions(admin, body.id);

    await audit('user.revoke_sessions', String(body.id), result.username);
    sendJson(res, 200, {
      success: true,
      message: `Đã đăng xuất "${result.username}" khỏi mọi thiết bị.`
    });
    return true;
  }

  // --- GET nhat ky su dung giong noi AI ----------------------------
  if (method === 'GET' && pathname === '/api/admin/tts-log') {
    const rows = await db.query(
      `SELECT t.id, t.username, t.mode, t.voice, t.source_audio, t.text_excerpt,
              t.seconds, t.ip, t.created_at, a.title AS source_title, a.speaker AS source_speaker
         FROM tts_log t
         LEFT JOIN audio_records a ON a.id = t.source_audio
        ORDER BY t.id DESC LIMIT 200`
    );
    sendJson(res, 200, rows);
    return true;
  }

  // --- GET nhat ky hanh dong ---------------------------------------
  if (method === 'GET' && pathname === '/api/admin/audit-log') {
    const action = str(ctx.query.get('action'), 64);
    const rows = action
      ? await db.query(
        'SELECT id, username, action, target_id, detail, ip, created_at FROM audit_log WHERE action = ? ORDER BY id DESC LIMIT 300',
        [action])
      : await db.query(
        'SELECT id, username, action, target_id, detail, ip, created_at FROM audit_log ORDER BY id DESC LIMIT 300');

    const kinds = await db.query('SELECT action, COUNT(*) AS n FROM audit_log GROUP BY action ORDER BY n DESC');
    sendJson(res, 200, { success: true, items: rows, actions: kinds.map(k => ({ action: k.action, count: Number(k.n) })) });
    return true;
  }

  throw new HttpError(404, 'Không tìm thấy chức năng quản trị này.');
}

module.exports = { handle, isAdminPath };
