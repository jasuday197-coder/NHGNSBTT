'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Nap .env vao process.env. Bien moi truong that (do systemd/panel dat)
 * luon thang gia tri trong file .env.
 */
function loadEnvFile() {
  const envPath = path.join(ROOT_DIR, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sep = trimmed.indexOf('=');
    if (sep === -1) continue;

    const key = trimmed.slice(0, sep).trim();
    if (key in process.env) continue;

    let value = trimmed.slice(sep + 1).trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) ||
                   (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);

    process.env[key] = value;
  }
}

loadEnvFile();

const bool = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  return /^(1|true|yes|on)$/i.test(raw.trim());
};

const int = (key, fallback) => {
  const parsed = Number.parseInt(process.env[key], 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const config = {
  rootDir: ROOT_DIR,
  publicDir: path.join(ROOT_DIR, 'public'),
  uploadsDir: path.join(ROOT_DIR, 'uploads'),

  env: process.env.NODE_ENV || 'development',
  port: int('PORT', 3000),
  host: process.env.HOST || '127.0.0.1',
  trustProxy: bool('TRUST_PROXY', false),

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: int('DB_PORT', 3306),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: int('DB_CONNECTION_LIMIT', 10)
  },

  session: {
    secret: process.env.SESSION_SECRET || '',
    ttlHours: int('SESSION_TTL_HOURS', 72),
    cookieName: 'gns_sid',
    cookieSecure: bool('COOKIE_SECURE', false)
  },

  allowRegistration: bool('ALLOW_REGISTRATION', true),

  limits: {
    jsonBody: int('MAX_JSON_BODY_BYTES', 1024 * 1024),
    uploadBody: int('MAX_UPLOAD_BODY_BYTES', 12 * 1024 * 1024),
    audioBytes: int('MAX_AUDIO_BYTES', 8 * 1024 * 1024)
  },

  ai: {
    openRouterKey: process.env.OPENROUTER_API_KEY || '',
    groqKey: process.env.GROQ_API_KEY || ''
  },

  tts: {
    enabled: bool('TTS_ENABLED', false),
    baseUrl: process.env.TTS_BASE_URL || 'http://127.0.0.1:7861',
    internalToken: process.env.TTS_INTERNAL_TOKEN || '',
    cacheDir: path.join(ROOT_DIR, 'tts_cache'),
    cacheMaxBytes: int('TTS_CACHE_MAX_BYTES', 512 * 1024 * 1024),
    maxTextChars: int('TTS_MAX_TEXT_CHARS', 600),
    // Clone giong tu kho dong gop: chi ap dung cho ban ghi da bat co
    // allow_voice_clone. Dat false de tat hoan toan tinh nang clone.
    allowCorpusCloning: bool('TTS_ALLOW_CORPUS_CLONING', false)
  }
};

/** Dung server ngay khi thieu cau hinh song con, thay vi chay voi mac dinh khong an toan. */
function assertValid() {
  const problems = [];

  if (!config.db.database) problems.push('DB_NAME chua duoc dat');
  if (!config.db.user) problems.push('DB_USER chua duoc dat');
  if (!config.db.password) problems.push('DB_PASSWORD chua duoc dat');
  if (config.session.secret.length < 32) {
    problems.push('SESSION_SECRET phai dai it nhat 32 ky tu (sinh bang crypto.randomBytes(48).toString("hex"))');
  }
  if (config.env === 'production' && !config.session.cookieSecure) {
    problems.push('Moi truong production bat buoc COOKIE_SECURE=true');
  }
  if (config.tts.enabled && config.tts.internalToken.length < 32) {
    problems.push('Bat TTS_ENABLED thi TTS_INTERNAL_TOKEN phai dai it nhat 32 ky tu');
  }

  if (problems.length) {
    throw new Error('Cau hinh .env khong hop le:\n  - ' + problems.join('\n  - '));
  }
}

module.exports = { config, assertValid };
