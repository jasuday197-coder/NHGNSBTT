'use strict';

const crypto = require('crypto');
const db = require('./db');
const { config } = require('./config');

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;

// ---------------------------------------------------------------
// Mat khau: scrypt tu node:crypto, khong can dependency ben ngoai
// ---------------------------------------------------------------

function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(plain, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('hex'), derived.toString('hex')].join('$');
}

function verifyPassword(plain, stored) {
  if (!stored) return false;

  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, saltHex, hashHex] = parts;
  let derived;
  try {
    derived = crypto.scryptSync(plain, Buffer.from(saltHex, 'hex'), KEY_LEN, {
      N: Number(n), r: Number(r), p: Number(p)
    });
  } catch (_) {
    return false;
  }

  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function validatePasswordStrength(plain) {
  if (typeof plain !== 'string' || plain.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự.';
  }
  if (plain.length > 200) {
    return 'Mật khẩu quá dài (tối đa 200 ký tự).';
  }
  if (!/[a-zA-Z]/.test(plain) || !/[0-9]/.test(plain)) {
    return 'Mật khẩu phải chứa cả chữ và số.';
  }
  return null;
}

function validateUsername(name) {
  if (typeof name !== 'string') return 'Tên đăng nhập không hợp lệ.';
  const trimmed = name.trim();
  if (!/^[a-zA-Z0-9_.]{3,64}$/.test(trimmed)) {
    return 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm và gạch dưới (3-64 ký tự).';
  }
  return null;
}

// ---------------------------------------------------------------
// Phien dang nhap
// ---------------------------------------------------------------

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function createSession(userId, { ip, userAgent } = {}) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.session.ttlHours * 3600 * 1000);

  await db.execute(
    'INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)',
    [sha256(token), userId, expiresAt, ip || null, (userAgent || '').slice(0, 255) || null]
  );

  return { token, expiresAt };
}

async function resolveSession(token) {
  if (!token || typeof token !== 'string' || token.length !== 64) return null;

  const row = await db.queryOne(
    `SELECT u.id, u.username, u.full_name, u.email, u.role, u.status, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > NOW()`,
    [sha256(token)]
  );

  if (!row || row.status !== 'active') return null;

  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    role: row.role
  };
}

async function destroySession(token) {
  if (!token) return;
  await db.execute('DELETE FROM sessions WHERE token_hash = ?', [sha256(token)]);
}

async function destroyAllSessionsFor(userId) {
  await db.execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

async function purgeExpiredSessions() {
  const result = await db.execute('DELETE FROM sessions WHERE expires_at <= NOW()');
  return result.affectedRows || 0;
}

// ---------------------------------------------------------------
// Dang ky / dang nhap
// ---------------------------------------------------------------

async function registerUser({ username, password, email, fullName, role = 'user' }) {
  const usernameError = validateUsername(username);
  if (usernameError) throw Object.assign(new Error(usernameError), { statusCode: 400 });

  const passwordError = validatePasswordStrength(password);
  if (passwordError) throw Object.assign(new Error(passwordError), { statusCode: 400 });

  const clean = username.trim();
  const existing = await db.queryOne('SELECT id FROM users WHERE username = ?', [clean]);
  if (existing) {
    throw Object.assign(new Error('Tên đăng nhập đã tồn tại.'), { statusCode: 409 });
  }

  const result = await db.execute(
    'INSERT INTO users (username, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [clean, email || null, fullName || null, hashPassword(password), role === 'admin' ? 'admin' : 'user']
  );

  return { id: result.insertId, username: clean, role };
}

/**
 * Xac thuc thong tin dang nhap. Luon tra ve cung mot thong bao loi cho
 * "sai ten" va "sai mat khau" de khong lo tai khoan nao ton tai.
 */
async function authenticate(username, password) {
  const generic = Object.assign(
    new Error('Tên đăng nhập hoặc mật khẩu không đúng.'),
    { statusCode: 401 }
  );

  if (typeof username !== 'string' || typeof password !== 'string') throw generic;

  const user = await db.queryOne(
    'SELECT id, username, full_name, email, password_hash, role, status, failed_logins, locked_until FROM users WHERE username = ?',
    [username.trim()]
  );

  if (!user) {
    // So sanh gia de thoi gian phan hoi khong tiet lo tai khoan co ton tai hay khong
    verifyPassword(password, hashPassword('dummy-password-for-timing'));
    throw generic;
  }

  if (user.status !== 'active') {
    throw Object.assign(new Error('Tài khoản đã bị khoá.'), { statusCode: 403 });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw Object.assign(
      new Error(`Tài khoản tạm khoá do đăng nhập sai nhiều lần. Thử lại sau ${LOCK_MINUTES} phút.`),
      { statusCode: 429 }
    );
  }

  if (!verifyPassword(password, user.password_hash)) {
    const failed = user.failed_logins + 1;
    if (failed >= MAX_FAILED_LOGINS) {
      await db.execute(
        'UPDATE users SET failed_logins = 0, locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?',
        [LOCK_MINUTES, user.id]
      );
    } else {
      await db.execute('UPDATE users SET failed_logins = ? WHERE id = ?', [failed, user.id]);
    }
    throw generic;
  }

  await db.execute(
    'UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
    [user.id]
  );

  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    role: user.role
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await db.queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    throw Object.assign(new Error('Mật khẩu hiện tại không đúng.'), { statusCode: 401 });
  }

  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) throw Object.assign(new Error(passwordError), { statusCode: 400 });

  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), userId]);
  await destroyAllSessionsFor(userId);
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  validateUsername,
  createSession,
  resolveSession,
  destroySession,
  destroyAllSessionsFor,
  purgeExpiredSessions,
  registerUser,
  authenticate,
  changePassword
};
