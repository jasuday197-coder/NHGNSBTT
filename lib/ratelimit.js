'use strict';

const { HttpError } = require('./http');

/**
 * Rate limit cua so truot, luu trong RAM.
 * Du cho mot tien trinh don sau nginx. Neu sau nay chay nhieu instance
 * thi chuyen sang Redis.
 */
const buckets = new Map();

// Don rac dinh ky de Map khong phinh vo han
const SWEEP_INTERVAL_MS = 60_000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const alive = hits.filter((ts) => ts > now - 3_600_000);
    if (alive.length) buckets.set(key, alive);
    else buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS);
sweeper.unref();

/**
 * @param {string} key    dinh danh (thuong la "ten-luat:ip")
 * @param {number} limit  so luot toi da
 * @param {number} windowMs do dai cua so tinh bang ms
 */
function hit(key, limit, windowMs) {
  const now = Date.now();
  const since = now - windowMs;

  const hits = (buckets.get(key) || []).filter((ts) => ts > since);
  hits.push(now);
  buckets.set(key, hits);

  if (hits.length > limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }
  return { allowed: true, retryAfter: 0 };
}

/** Nem HttpError 429 khi vuot nguong. */
function enforce(res, name, ip, limit, windowMs) {
  const result = hit(`${name}:${ip}`, limit, windowMs);
  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfter));
    throw new HttpError(429, `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${result.retryAfter} giây.`);
  }
}

/** Xoa bo dem cho mot key, dung sau khi dang nhap thanh cong. */
function reset(name, ip) {
  buckets.delete(`${name}:${ip}`);
}

const RULES = {
  login:     { limit: 8,   windowMs: 10 * 60_000 },
  register:  { limit: 5,   windowMs: 60 * 60_000 },
  ai:        { limit: 30,  windowMs: 60_000 },
  upload:    { limit: 10,  windowMs: 60 * 60_000 },
  report:    { limit: 20,  windowMs: 60 * 60_000 },
  admin:     { limit: 120, windowMs: 60_000 },
  read:      { limit: 300, windowMs: 60_000 },
  // Tong hop giong tren CPU rat ton tai nguyen -> siet chat hon han
  tts:       { limit: 20,  windowMs: 10 * 60_000 },
  // Nhan ban giong nguoi khac: siet chat nhat, va moi luot deu vao nhat ky
  ttsClone:  { limit: 10,  windowMs: 60 * 60_000 }
};

/** Ap dung luat co san theo ten. */
function guard(res, ruleName, ip) {
  const rule = RULES[ruleName];
  if (!rule) return;
  enforce(res, ruleName, ip, rule.limit, rule.windowMs);
}

module.exports = { hit, enforce, guard, reset, RULES };
