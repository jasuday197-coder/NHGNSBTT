'use strict';

const crypto = require('crypto');
const db = require('./db');
const { config } = require('./config');

/**
 * Cau hinh chinh sua duoc tu khu quan tri, luu trong bang app_settings.
 *
 * Cac khoa API duoc ma hoa AES-256-GCM truoc khi ghi. Khoa ma hoa dan xuat
 * tu SESSION_SECRET trong .env, nghia la ke chi lay duoc ban dump CSDL van
 * khong doc noi — muon giai ma phai co CA hai.
 *
 * Thu tu uu tien khi doc: bien moi truong > CSDL. Nho vay khi can go loi hoac
 * cuu he thong van co the dat thang trong .env de de len gia tri trong CSDL.
 */

const ALGO = 'aes-256-gcm';
let cachedKey = null;

function encryptionKey() {
  if (cachedKey) return cachedKey;
  // Salt co dinh: chi can dan xuat on dinh, khong phai bam mat khau nguoi dung
  cachedKey = crypto.scryptSync(config.session.secret, 'gns-settings-v1', 32);
  return cachedKey;
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

function decrypt(stored) {
  if (typeof stored !== 'string' || !stored.startsWith('v1:')) return null;
  try {
    const [, ivB64, tagB64, dataB64] = stored.split(':');
    const decipher = crypto.createDecipheriv(ALGO, encryptionKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final()
    ]).toString('utf8');
  } catch (_) {
    // Doi SESSION_SECRET thi cac gia tri cu khong giai ma duoc nua
    console.error('[settings] Không giải mã được giá trị — SESSION_SECRET có thể đã thay đổi.');
    return null;
  }
}

// Cac muc duoc phep sua tu giao dien
const DEFINITIONS = {
  OPENROUTER_API_KEY: {
    label: 'OpenRouter API Key',
    hint: 'Dùng cho dịch thuật và chatbot. Lấy tại openrouter.ai/keys',
    secret: true,
    envKey: 'OPENROUTER_API_KEY',
    test: 'openrouter'
  },
  GROQ_API_KEY: {
    label: 'Groq API Key',
    hint: 'Dùng cho nhận dạng giọng nói Whisper. Lấy tại console.groq.com/keys',
    secret: true,
    envKey: 'GROQ_API_KEY',
    test: 'groq'
  }
};

let cache = null;

async function loadAll() {
  if (cache) return cache;
  cache = new Map();
  try {
    const rows = await db.query('SELECT name, value, is_secret FROM app_settings');
    for (const row of rows) {
      cache.set(row.name, row.is_secret ? decrypt(row.value) : row.value);
    }
  } catch (err) {
    console.error('[settings] Không đọc được bảng app_settings:', err.message);
  }
  return cache;
}

function invalidate() { cache = null; }

/** Doc mot gia tri: uu tien bien moi truong, roi den CSDL. */
async function get(name) {
  const def = DEFINITIONS[name];
  const fromEnv = def && process.env[def.envKey];
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  const all = await loadAll();
  const value = all.get(name);
  return value && String(value).trim() ? String(value).trim() : null;
}

async function set(name, value, actorId) {
  const def = DEFINITIONS[name];
  if (!def) throw new Error(`Không có mục cấu hình "${name}"`);

  const clean = String(value || '').trim();
  if (!clean) {
    await db.execute('DELETE FROM app_settings WHERE name = ?', [name]);
    invalidate();
    return { cleared: true };
  }

  await db.execute(
    `INSERT INTO app_settings (name, value, is_secret, updated_by)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value), is_secret = VALUES(is_secret),
                             updated_by = VALUES(updated_by), updated_at = NOW()`,
    [name, def.secret ? encrypt(clean) : clean, def.secret ? 1 : 0, actorId || null]
  );
  invalidate();
  return { cleared: false };
}

/** Che gia tri bi mat: chi lo vai ky tu dau/cuoi de nhan dien. */
function mask(value) {
  if (!value) return null;
  const v = String(value);
  if (v.length <= 12) return v.slice(0, 2) + '••••';
  return `${v.slice(0, 6)}••••••${v.slice(-4)}`;
}

/**
 * Trang thai cho giao dien quan tri.
 * KHONG BAO GIO tra ve gia tri that — chi tra ban da che.
 */
async function describeAll() {
  const all = await loadAll();
  const rows = await db.query(
    `SELECT s.name, s.updated_at, u.username
       FROM app_settings s LEFT JOIN users u ON u.id = s.updated_by`
  ).catch(() => []);
  const meta = new Map(rows.map(r => [r.name, r]));

  return Object.entries(DEFINITIONS).map(([name, def]) => {
    const envValue = process.env[def.envKey];
    const fromEnv = Boolean(envValue && envValue.trim());
    const dbValue = all.get(name);
    const effective = fromEnv ? envValue.trim() : (dbValue || null);
    const info = meta.get(name);

    return {
      name,
      label: def.label,
      hint: def.hint,
      configured: Boolean(effective),
      source: fromEnv ? 'env' : (dbValue ? 'db' : null),
      masked: mask(effective),
      updatedAt: info ? info.updated_at : null,
      updatedBy: info ? info.username : null,
      canTest: Boolean(def.test)
    };
  });
}

/** Goi thu nha cung cap de biet khoa con song khong. */
async function testKey(name) {
  const def = DEFINITIONS[name];
  if (!def || !def.test) throw new Error('Mục này không kiểm tra được.');

  const key = await get(name);
  if (!key) return { ok: false, message: 'Chưa cấu hình khoá.' };

  const endpoints = {
    openrouter: 'https://openrouter.ai/api/v1/key',
    groq: 'https://api.groq.com/openai/v1/models'
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(endpoints[def.test], {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal
    });
    if (res.ok) return { ok: true, message: 'Khoá hoạt động bình thường.' };
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: `Khoá bị từ chối (${res.status}) — có thể đã bị thu hồi.` };
    }
    return { ok: false, message: `Nhà cung cấp trả về mã ${res.status}.` };
  } catch (err) {
    return { ok: false, message: err.name === 'AbortError' ? 'Quá thời gian chờ.' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { get, set, describeAll, testKey, invalidate, DEFINITIONS };
