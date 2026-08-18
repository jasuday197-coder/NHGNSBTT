'use strict';

const db = require('./db');
const auth = require('./auth');
const { HttpError } = require('./http');

/**
 * Quan ly tai khoan cho khu quan tri.
 *
 * Cac chot an toan o day khong phai trang tri: mot admin tu ha quyen minh
 * hoac khoa nham tai khoan admin cuoi cung se khoa chet ca he thong, phai
 * vao SSH chay CLI moi cuu duoc.
 */

async function listUsers({ q, role, status, page = 1, limit = 25 } = {}) {
  const where = [];
  const params = [];

  if (role === 'admin' || role === 'user') { where.push('u.role = ?'); params.push(role); }
  if (status === 'active' || status === 'disabled') { where.push('u.status = ?'); params.push(status); }
  if (q && q.trim()) {
    const needle = `%${q.trim()}%`;
    where.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');
    params.push(needle, needle, needle);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const totalRow = await db.queryOne(`SELECT COUNT(*) AS total FROM users u ${whereSql}`, params);
  const total = Number(totalRow.total) || 0;

  const rows = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.role, u.status,
            u.failed_logins, u.locked_until, u.last_login_at, u.created_at,
            (SELECT COUNT(*) FROM audio_records a WHERE a.submitted_by = u.id) AS contributions,
            (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > NOW()) AS active_sessions
       FROM users u ${whereSql}
      ORDER BY u.created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  const now = Date.now();
  return {
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    items: rows.map((r) => ({
      id: r.id,
      username: r.username,
      email: r.email,
      fullName: r.full_name,
      role: r.role,
      status: r.status,
      failedLogins: r.failed_logins,
      isLocked: Boolean(r.locked_until && new Date(r.locked_until).getTime() > now),
      lockedUntil: r.locked_until,
      lastLoginAt: r.last_login_at,
      createdAt: r.created_at,
      contributions: Number(r.contributions) || 0,
      activeSessions: Number(r.active_sessions) || 0
    }))
  };
}

async function countAdmins() {
  const row = await db.queryOne(
    "SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND status = 'active'"
  );
  return Number(row.n) || 0;
}

/**
 * @param {object} actor  admin dang thao tac
 * @param {number} targetId
 * @param {{role?: string, status?: string, unlock?: boolean}} patch
 */
async function updateUser(actor, targetId, patch) {
  const id = Number(targetId);
  if (!Number.isFinite(id)) throw new HttpError(400, 'Mã tài khoản không hợp lệ.');

  const target = await db.queryOne(
    'SELECT id, username, role, status FROM users WHERE id = ?', [id]
  );
  if (!target) throw new HttpError(404, 'Không tìm thấy tài khoản.');

  const isSelf = Number(actor.id) === id;
  const sets = [];
  const params = [];
  const changes = [];

  // --- Doi quyen ---
  if (patch.role && patch.role !== target.role) {
    if (patch.role !== 'admin' && patch.role !== 'user') {
      throw new HttpError(400, 'Quyền không hợp lệ.');
    }
    if (isSelf) {
      throw new HttpError(403, 'Không thể tự đổi quyền của chính mình. Hãy nhờ một quản trị viên khác.');
    }
    if (target.role === 'admin' && patch.role === 'user' && await countAdmins() <= 1) {
      throw new HttpError(409, 'Đây là quản trị viên duy nhất còn hoạt động — không thể hạ quyền.');
    }
    sets.push('role = ?');
    params.push(patch.role);
    changes.push(`quyền: ${target.role} → ${patch.role}`);
  }

  // --- Khoa / mo khoa tai khoan ---
  if (patch.status && patch.status !== target.status) {
    if (patch.status !== 'active' && patch.status !== 'disabled') {
      throw new HttpError(400, 'Trạng thái không hợp lệ.');
    }
    if (isSelf && patch.status === 'disabled') {
      throw new HttpError(403, 'Không thể tự khoá tài khoản của chính mình.');
    }
    if (target.role === 'admin' && patch.status === 'disabled' && await countAdmins() <= 1) {
      throw new HttpError(409, 'Đây là quản trị viên duy nhất còn hoạt động — không thể khoá.');
    }
    sets.push('status = ?');
    params.push(patch.status);
    changes.push(`trạng thái: ${target.status} → ${patch.status}`);
  }

  // --- Go khoa do dang nhap sai nhieu lan ---
  if (patch.unlock) {
    sets.push('failed_logins = 0', 'locked_until = NULL');
    changes.push('gỡ khoá đăng nhập sai');
  }

  if (!sets.length) throw new HttpError(400, 'Không có thay đổi nào.');

  params.push(id);
  await db.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);

  // Khoa tai khoan thi phai dai het phien dang mo, neu khong ho van dung tiep
  if (patch.status === 'disabled' || patch.role === 'user') {
    await auth.destroyAllSessionsFor(id);
    changes.push('huỷ mọi phiên đang mở');
  }

  return { username: target.username, changes };
}

/** Buoc dang xuat toan bo thiet bi cua mot tai khoan. */
async function revokeSessions(actor, targetId) {
  const id = Number(targetId);
  const target = await db.queryOne('SELECT id, username FROM users WHERE id = ?', [id]);
  if (!target) throw new HttpError(404, 'Không tìm thấy tài khoản.');

  await auth.destroyAllSessionsFor(id);
  return { username: target.username };
}

module.exports = { listUsers, updateUser, revokeSessions, countAdmins };
