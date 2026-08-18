'use strict';

const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { config } = require('./config');
const { HttpError } = require('./http');

// Chi chap nhan cac dinh dang am thanh trinh duyet co the ghi/phat
const EXTENSION_BY_MIME = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac'
};

/**
 * Kiem tra chu ky byte dau tep. Ngan viec doi ten mot tep thuc thi
 * thanh .ogg roi tai len.
 */
function looksLikeAudio(buffer) {
  if (buffer.length < 12) return false;

  const ascii = (start, end) => buffer.subarray(start, end).toString('ascii');

  if (ascii(0, 4) === 'OggS') return true;                       // Ogg
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return true; // WAV
  if (ascii(0, 3) === 'ID3') return true;                        // MP3 co tag
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true; // MP3 tho
  if (ascii(4, 8) === 'ftyp') return true;                       // MP4 / M4A
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return true; // WebM
  if (ascii(0, 4) === 'fLaC') return true;                       // FLAC
  if (buffer[0] === 0xff && buffer[1] === 0xf1) return true;     // AAC ADTS

  return false;
}

/**
 * Giai ma data URL am thanh do trinh duyet gui len, kiem tra va ghi ra dia.
 * @returns {{url: string, buffer: Buffer, mimeType: string, extension: string}}
 */
async function saveAudioDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:audio/')) {
    throw new HttpError(400, 'Tệp âm thanh không hợp lệ.');
  }

  const match = dataUrl.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) {
    throw new HttpError(400, 'Định dạng dữ liệu âm thanh không hợp lệ.');
  }

  const mimeType = match[1].toLowerCase();
  const extension = EXTENSION_BY_MIME[mimeType];
  if (!extension) {
    throw new HttpError(415, `Định dạng ${mimeType} không được hỗ trợ. Hãy dùng mp3, wav, ogg, webm, m4a hoặc aac.`);
  }

  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');

  if (!buffer.length) {
    throw new HttpError(400, 'Tệp âm thanh rỗng.');
  }
  if (buffer.length > config.limits.audioBytes) {
    throw new HttpError(413, `Tệp âm thanh vượt quá ${Math.round(config.limits.audioBytes / 1024 / 1024)} MB.`);
  }
  if (!looksLikeAudio(buffer)) {
    throw new HttpError(415, 'Nội dung tệp không phải âm thanh hợp lệ.');
  }

  await fsp.mkdir(config.uploadsDir, { recursive: true });

  // Ten ngau nhien -> khong the doan URL cua ban ghi nguoi khac,
  // va khong the ghi de tep san co
  const fileName = `audio_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${extension}`;
  await fsp.writeFile(path.join(config.uploadsDir, fileName), buffer, { mode: 0o640 });

  return { url: `/uploads/${fileName}`, buffer, mimeType, extension };
}

/** Xoa tep am thanh. Chi chap nhan duong dan dang /uploads/<ten-tep>. */
async function removeAudioFile(audioUrl) {
  if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.startsWith('/uploads/')) return false;

  const fileName = path.basename(audioUrl);
  if (fileName !== audioUrl.slice('/uploads/'.length)) return false; // co thanh phan thu muc -> tu choi

  const target = path.join(config.uploadsDir, fileName);
  if (!target.startsWith(config.uploadsDir + path.sep)) return false;

  try {
    await fsp.unlink(target);
    return true;
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[uploads] Không xoá được tệp:', err.message);
    return false;
  }
}

function ensureUploadsDir() {
  for (const dir of [config.uploadsDir, config.tts.cacheDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o750 });
    }
  }
}

module.exports = { saveAudioDataUrl, removeAudioFile, ensureUploadsDir, looksLikeAudio };
