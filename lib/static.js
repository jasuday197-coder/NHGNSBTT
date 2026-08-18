'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { config } = require('./config');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac'
};

// Chi nhung duoi nay duoc phuc vu. Bat ky duoi nao khac -> 404,
// nen .env / .sql / .sh / khong duoi deu khong the tai ve.
const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_TYPES));

// Chi file trong uploads/ moi duoc phat qua /uploads
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.aac']);

const IMMUTABLE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2']);

/**
 * Chuyen URL thanh duong dan tuyet doi da duoc kiem chung.
 * Tra ve null neu bi tu choi vi bat ky ly do gi.
 */
function resolveSafePath(baseDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (_) {
    return null;
  }

  // NUL byte co the cat ngan duong dan o tang he thong tep
  if (decoded.includes('\0')) return null;

  const normalized = path.posix.normalize(decoded);

  // Chan moi thanh phan an (.env, .git, .htaccess...) va moi buoc di len
  for (const segment of normalized.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..' || segment.startsWith('.')) return null;
  }

  const absolute = path.join(baseDir, normalized);
  const baseWithSep = baseDir.endsWith(path.sep) ? baseDir : baseDir + path.sep;
  if (absolute !== baseDir && !absolute.startsWith(baseWithSep)) return null;

  return absolute;
}

/** Chan symlink tro ra ngoai thu muc goc. */
async function isInsideBase(absolutePath, baseDir) {
  try {
    const real = await fsp.realpath(absolutePath);
    const realBase = await fsp.realpath(baseDir);
    const baseWithSep = realBase.endsWith(path.sep) ? realBase : realBase + path.sep;
    return real === realBase || real.startsWith(baseWithSep);
  } catch (_) {
    return false;
  }
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 - Không tìm thấy tài nguyên');
}

/**
 * Phuc vu tep tinh. Tra ve true neu da xu ly xong request.
 *
 * Nguyen tac: chi hai goc duoc phep -- public/ (ma nguon frontend) va
 * uploads/ (file am thanh nguoi dung tai len). Ma nguon backend, .env,
 * .git, file SQL... nam ngoai ca hai nen khong the truy cap qua HTTP.
 */
async function serve(req, res, urlPath) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;

  let baseDir = config.publicDir;
  let relativePath = urlPath;
  let allowedExtensions = ALLOWED_EXTENSIONS;
  let isUpload = false;

  if (urlPath === '/') {
    relativePath = '/index.html';
  } else if (urlPath === '/uploads' || urlPath.startsWith('/uploads/')) {
    baseDir = config.uploadsDir;
    relativePath = urlPath.slice('/uploads'.length) || '/';
    allowedExtensions = AUDIO_EXTENSIONS;
    isUpload = true;
  } else if (urlPath.startsWith('/tts-audio/')) {
    // Ket qua tong hop giong noi. Ten tep la hash SHA-256 nen khong doan duoc.
    baseDir = config.tts.cacheDir;
    relativePath = urlPath.slice('/tts-audio'.length);
    allowedExtensions = new Set(['.wav']);
    isUpload = true;
  }

  const absolute = resolveSafePath(baseDir, relativePath);
  if (!absolute) {
    notFound(res);
    return true;
  }

  const ext = path.extname(absolute).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    notFound(res);
    return true;
  }

  let stats;
  try {
    stats = await fsp.stat(absolute);
  } catch (_) {
    notFound(res);
    return true;
  }

  if (!stats.isFile() || !(await isInsideBase(absolute, baseDir))) {
    notFound(res);
    return true;
  }

  const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.end();
    return true;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  res.setHeader('Content-Length', String(stats.size));
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', stats.mtime.toUTCString());

  if (isUpload || IMMUTABLE_EXTENSIONS.has(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  await new Promise((resolve) => {
    const stream = fs.createReadStream(absolute);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Lỗi đọc tệp');
      } else {
        res.destroy();
      }
      resolve();
    });
    stream.on('close', resolve);
    stream.pipe(res);
  });

  return true;
}

module.exports = { serve, resolveSafePath, MIME_TYPES, AUDIO_EXTENSIONS };
