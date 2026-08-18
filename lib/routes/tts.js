'use strict';

const path = require('path');
const tts = require('../tts');
const store = require('../store');
const rateLimit = require('../ratelimit');
const { config } = require('../config');
const { HttpError, sendJson, readJsonBody, assertSameOrigin, str } = require('../http');

/**
 * Doc va kiem tra van ban can tong hop.
 * Tu choi khi qua dai thay vi cat bot: nguoi dung se khong hieu vi sao
 * chi nghe duoc nua cau minh vua go.
 */
function readText(body) {
  const raw = typeof body.text === 'string' ? body.text.trim() : '';
  if (!raw) throw new HttpError(400, 'Vui lòng nhập nội dung cần đọc.');

  if (raw.length > config.tts.maxTextChars) {
    throw new HttpError(
      413,
      `Nội dung dài ${raw.length} ký tự, vượt giới hạn ${config.tts.maxTextChars}. Hãy chia thành câu ngắn hơn.`
    );
  }
  return raw;
}

const CLONE_REJECTIONS = {
  not_found: [404, 'Không tìm thấy bản ghi nguồn.'],
  not_approved: [409, 'Bản ghi chưa được duyệt nên chưa dùng làm giọng mẫu được.'],
  no_consent: [403, 'Người đóng góp bản ghi này chưa đồng ý cho phép nhân bản giọng.'],
  no_audio_file: [409, 'Bản ghi này không có tệp âm thanh để làm mẫu.']
};

async function handle(req, res, ctx) {
  const { pathname, method, ip } = ctx;

  if (!pathname.startsWith('/api/tts/')) return false;

  // --- GET /api/tts/status -----------------------------------------
  if (method === 'GET' && pathname === '/api/tts/status') {
    sendJson(res, 200, {
      success: true,
      enabled: tts.isEnabled(),
      corpusCloningAllowed: config.tts.allowCorpusCloning,
      maxTextChars: config.tts.maxTextChars,
      service: await tts.health()
    });
    return true;
  }

  // --- GET /api/tts/voices -----------------------------------------
  if (method === 'GET' && pathname === '/api/tts/voices') {
    rateLimit.guard(res, 'read', ip);

    const [presets, cloneable] = await Promise.all([
      tts.listPresetVoices(),
      config.tts.allowCorpusCloning ? store.listCloneableAudio() : Promise.resolve([])
    ]);

    sendJson(res, 200, {
      success: true,
      presets,
      // Chi lo ra thong tin toi thieu de chon giong, khong kem transcript
      cloneable: cloneable.map((item) => ({
        id: item.id,
        title: item.title,
        speaker: item.speaker,
        province: item.province,
        dialectGroup: item.dialectGroup
      }))
    });
    return true;
  }

  // --- POST /api/tts/speak: doc bang giong dung san -----------------
  if (method === 'POST' && pathname === '/api/tts/speak') {
    assertSameOrigin(req);
    if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập để dùng giọng nói AI.');
    rateLimit.guard(res, 'tts', ip);

    const body = await readJsonBody(req);
    const text = readText(body);
    const voice = str(body.voice, 190);

    if (!voice) throw new HttpError(400, 'Vui lòng chọn giọng đọc.');

    const result = await tts.synthesize(text, { voice });

    await store.logTtsUsage({
      userId: ctx.user.id, username: ctx.user.username, mode: 'preset',
      voice, text, outputFile: path.basename(result.url), seconds: result.seconds, ip
    });

    sendJson(res, 200, { success: true, ...result });
    return true;
  }

  // --- POST /api/tts/clone: doc bang giong nhan ban tu kho ----------
  if (method === 'POST' && pathname === '/api/tts/clone') {
    assertSameOrigin(req);
    if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập để dùng tính năng này.');

    if (!config.tts.allowCorpusCloning) {
      throw new HttpError(403, 'Tính năng nhân bản giọng từ kho đóng góp đang tắt.');
    }
    rateLimit.guard(res, 'ttsClone', ip);

    const body = await readJsonBody(req);
    const text = readText(body);
    const sourceId = str(body.sourceAudioId || body.source_audio_id, 64);

    if (!sourceId) throw new HttpError(400, 'Vui lòng chọn bản ghi làm giọng mẫu.');

    // Cua kiem soat dong y: chan o day, khong o tang giao dien
    const { record, reason } = await store.getCloneableAudio(sourceId);
    if (reason) {
      const [status, message] = CLONE_REJECTIONS[reason];
      throw new HttpError(status, message);
    }

    const refAudio = path.basename(record.audioUrl);
    const result = await tts.synthesize(text, { refAudio, denoise: true });

    // Ghi ca hai noi: tts_log de truy nguoc, audit_log de admin thay ngay
    await store.logTtsUsage({
      userId: ctx.user.id, username: ctx.user.username, mode: 'clone',
      voice: null, sourceAudio: sourceId, text,
      outputFile: path.basename(result.url), seconds: result.seconds, ip
    });
    await store.writeAuditLog({
      userId: ctx.user.id, username: ctx.user.username,
      action: 'tts.clone', targetId: sourceId,
      detail: `"${text.slice(0, 80)}" (giọng: ${record.speaker})`, ip
    });

    sendJson(res, 200, {
      success: true,
      ...result,
      source: { id: record.id, title: record.title, speaker: record.speaker }
    });
    return true;
  }

  throw new HttpError(404, 'Không tìm thấy API giọng nói này.');
}

module.exports = { handle };
