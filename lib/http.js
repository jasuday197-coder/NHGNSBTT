'use strict';

const { config } = require('./config');

/** Loi co ma HTTP di kem, dung de ket thuc request som. */
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * IP that cua client. Chi tin X-Forwarded-For khi TRUST_PROXY=true,
 * neu khong ke tan cong co the gia mao de vuot rate limit.
 */
function clientIp(req) {
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
      return forwarded.split(',')[0].trim();
    }
  }
  return req.socket.remoteAddress || '0.0.0.0';
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const jar = {};
  if (!header) return jar;

  for (const chunk of header.split(';')) {
    const sep = chunk.indexOf('=');
    if (sep === -1) continue;
    const key = chunk.slice(0, sep).trim();
    if (!key) continue;
    try {
      jar[key] = decodeURIComponent(chunk.slice(sep + 1).trim());
    } catch (_) {
      jar[key] = chunk.slice(sep + 1).trim();
    }
  }
  return jar;
}

function buildCookie(name, value, { maxAgeSeconds, expires } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (config.session.cookieSecure) parts.push('Secure');
  if (typeof maxAgeSeconds === 'number') parts.push(`Max-Age=${maxAgeSeconds}`);
  if (expires) parts.push(`Expires=${new Date(expires).toUTCString()}`);
  return parts.join('; ');
}

function setSessionCookie(res, token, expiresAt) {
  const maxAgeSeconds = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  res.setHeader('Set-Cookie', buildCookie(config.session.cookieName, token, { maxAgeSeconds, expires: expiresAt }));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', buildCookie(config.session.cookieName, '', { maxAgeSeconds: 0 }));
}

const CSP = [
  "default-src 'self'",
  // app.js/MinigameEngine.js dung onclick inline trong HTML -> can unsafe-inline.
  // youtube.com + s.ytimg.com phuc vu YouTube IFrame Player API.
  "script-src 'self' 'unsafe-inline' https://unpkg.com https://www.youtube.com https://s.ytimg.com",
  // style.css @import font Outfit tu Google Fonts
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com",
  "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com https://i.ytimg.com https://*.ytimg.com",
  "media-src 'self' blob: data:",
  "connect-src 'self'",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'"
].join('; ');

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), payment=(), microphone=(self)');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (config.session.cookieSecure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { success: false, error: message });
}

/**
 * Doc body JSON voi tran dung luong cung. Ngat ket noi ngay khi vuot
 * nguong thay vi gom het vao RAM (nguyen nhan sap server truoc day).
 */
function readJsonBody(req, maxBytes = config.limits.jsonBody) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    const fail = (statusCode, message) => {
      if (settled) return;
      settled = true;
      chunks.length = 0;
      // Ngung nhan them du lieu nhung KHONG huy socket ngay: phai con
      // ket noi de gui duoc phan hoi loi ve cho client.
      req.pause();
      req.tooLarge = statusCode === 413;
      reject(new HttpError(statusCode, message));
    };

    const limitMessage = `Dữ liệu gửi lên vượt quá giới hạn ${Math.round(maxBytes / 1024 / 1024 * 10) / 10} MB.`;

    const declared = Number.parseInt(req.headers['content-length'], 10);
    if (Number.isFinite(declared) && declared > maxBytes) {
      fail(413, limitMessage);
      return;
    }

    req.on('data', (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > maxBytes) {
        fail(413, limitMessage);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw.trim()) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed && typeof parsed === 'object' ? parsed : {});
      } catch (_) {
        reject(new HttpError(400, 'Body không phải JSON hợp lệ.'));
      }
    });

    req.on('error', (err) => fail(400, err.message || 'Lỗi đọc dữ liệu.'));
  });
}

/**
 * Chan CSRF: request thay doi du lieu phai kem header X-Requested-With
 * (khong the dat tu form cross-site) va Origin phai trung host.
 */
function assertSameOrigin(req) {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    throw new HttpError(403, 'Yêu cầu thiếu header xác thực nguồn gốc.');
  }

  const origin = req.headers.origin;
  if (!origin) return; // same-origin fetch co the khong gui Origin

  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch (_) {
    throw new HttpError(403, 'Origin không hợp lệ.');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (originHost !== host) {
    throw new HttpError(403, 'Yêu cầu bị từ chối do khác nguồn gốc.');
  }
}

/** Cat chuoi ve do dai an toan truoc khi ghi DB. */
function str(value, maxLength = 255) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

module.exports = {
  HttpError,
  clientIp,
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  applySecurityHeaders,
  sendJson,
  sendError,
  readJsonBody,
  assertSameOrigin,
  str
};
