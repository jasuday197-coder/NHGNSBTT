'use strict';

const fsp = require('fs/promises');
const path = require('path');
const { config } = require('./config');
const { HttpError } = require('./http');

const TIMEOUT_MS = 180_000; // Tren CPU mot cau dai co the ton hon mot phut

const isEnabled = () => Boolean(config.tts.enabled && config.tts.internalToken);

function assertEnabled() {
  if (!config.tts.enabled) {
    throw new HttpError(503, 'Tính năng giọng nói AI đang tắt.');
  }
  if (!config.tts.internalToken) {
    throw new HttpError(500, 'TTS_INTERNAL_TOKEN chưa được cấu hình.');
  }
}

/** Goi dich vu Python. Loi mang duoc quy doi thanh HttpError de router xu ly chung. */
async function call(endpoint, { method = 'GET', body } = {}) {
  assertEnabled();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${config.tts.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.tts.internalToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new HttpError(504, 'Tổng hợp giọng nói quá thời gian chờ. Hãy thử câu ngắn hơn.');
    }
    console.error('[tts] Không gọi được dịch vụ:', err.message);
    throw new HttpError(503, 'Dịch vụ giọng nói AI hiện không phản hồi.');
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const detail = (payload && (payload.detail || payload.error)) || `Lỗi ${response.status}`;
    // 4xx tu dich vu la loi dau vao -> chuyen nguyen ma cho client
    const status = response.status >= 400 && response.status < 500 ? response.status : 502;
    throw new HttpError(status, String(detail));
  }

  return payload;
}

async function health() {
  if (!isEnabled()) return { status: 'disabled' };
  try {
    return await call('/health');
  } catch (err) {
    return { status: 'down', error: err.message };
  }
}

async function listPresetVoices() {
  const data = await call('/voices');
  return Array.isArray(data.voices) ? data.voices : [];
}

/**
 * @param {string} text
 * @param {{voice?: string, refAudio?: string, denoise?: boolean}} options
 *        refAudio la TEN TEP trong uploads/, khong phai duong dan day du.
 * @returns {Promise<{url: string, cached: boolean, seconds: number}>}
 */
async function synthesize(text, { voice, refAudio, denoise = true } = {}) {
  const result = await call('/synthesize', {
    method: 'POST',
    body: { text, voice: voice || null, ref_audio: refAudio || null, denoise }
  });

  return {
    url: `/tts-audio/${result.file}`,
    cached: Boolean(result.cached),
    seconds: Number(result.seconds) || 0
  };
}

/** Xoa bot tep cache cu nhat khi thu muc vuot nguong dung luong. */
async function pruneCache(maxBytes = config.tts.cacheMaxBytes) {
  let entries;
  try {
    entries = await fsp.readdir(config.tts.cacheDir);
  } catch (_) {
    return { removed: 0, bytes: 0 };
  }

  const files = [];
  let total = 0;

  for (const name of entries) {
    if (!name.endsWith('.wav')) continue;
    const full = path.join(config.tts.cacheDir, name);
    try {
      const stats = await fsp.stat(full);
      files.push({ full, size: stats.size, atime: stats.atimeMs });
      total += stats.size;
    } catch (_) { /* tep vua bi xoa */ }
  }

  if (total <= maxBytes) return { removed: 0, bytes: total };

  // Bo tep lau khong dung truoc
  files.sort((a, b) => a.atime - b.atime);

  let removed = 0;
  for (const file of files) {
    if (total <= maxBytes) break;
    try {
      await fsp.unlink(file.full);
      total -= file.size;
      removed += 1;
    } catch (_) { /* bo qua */ }
  }

  console.log(`[tts] Dọn cache: xoá ${removed} tệp, còn ${(total / 1024 / 1024).toFixed(1)} MB`);
  return { removed, bytes: total };
}

module.exports = { isEnabled, health, listPresetVoices, synthesize, pruneCache };
