'use strict';

const http = require('http');

const { config, assertValid } = require('./lib/config');
const db = require('./lib/db');
const auth = require('./lib/auth');
const staticFiles = require('./lib/static');
const uploads = require('./lib/uploads');
const tts = require('./lib/tts');
const {
  HttpError, clientIp, parseCookies, applySecurityHeaders, sendError
} = require('./lib/http');

const authRoutes = require('./lib/routes/auth');
const contentRoutes = require('./lib/routes/content');
const adminRoutes = require('./lib/routes/admin');
const exportRoutes = require('./lib/routes/export');
const ttsRoutes = require('./lib/routes/tts');

/** Gan user hien tai (neu co) vao ngu canh request. */
async function buildContext(req) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const sessionToken = parseCookies(req)[config.session.cookieName] || null;

  let user = null;
  if (sessionToken) {
    try {
      user = await auth.resolveSession(sessionToken);
    } catch (err) {
      console.error('[session] Không đọc được phiên:', err.message);
    }
  }

  return {
    pathname: url.pathname,
    query: url.searchParams,
    method: req.method,
    host: req.headers['x-forwarded-host'] || req.headers.host || 'giongnoiso.com',
    ip: clientIp(req),
    sessionToken,
    user
  };
}

async function route(req, res) {
  const ctx = await buildContext(req);

  if (ctx.pathname === '/api/health') {
    let dbOk = false;
    try { dbOk = await db.ping(); } catch (_) { dbOk = false; }
    res.statusCode = dbOk ? 200 : 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ status: dbOk ? 'ok' : 'degraded', database: dbOk }));
    return;
  }

  if (ctx.pathname.startsWith('/api/')) {
    if (await authRoutes.handle(req, res, ctx)) return;
    if (await adminRoutes.handle(req, res, ctx)) return;
    if (await ttsRoutes.handle(req, res, ctx)) return;
    if (await exportRoutes.handle(req, res, ctx)) return;
    if (await contentRoutes.handle(req, res, ctx)) return;
    throw new HttpError(404, 'Không tìm thấy API này.');
  }

  // Permalink cua tung ban ghi -> tra ve khung SPA. Phai xet TRUOC
  // staticFiles vi duong dan nay khong co duoi tep, static se tra 404.
  // Frontend doc location.pathname roi goi /api/audio/<slug>.
  if (ctx.pathname.startsWith('/ban-ghi/')) {
    if (await staticFiles.serve(req, res, '/index.html')) return;
  }

  if (await staticFiles.serve(req, res, ctx.pathname)) return;

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 - Không tìm thấy tài nguyên');
}

const server = http.createServer((req, res) => {
  applySecurityHeaders(res);

  route(req, res).catch((err) => {
    if (res.writableEnded) return;

    const statusCode = err.statusCode || 500;

    // 5xx la loi cua he thong -> ghi log day du; 4xx la loi cua nguoi
    // dung -> khong lam nhieu log
    if (statusCode >= 500) {
      console.error(`[${req.method} ${req.url}]`, err);
    }

    if (res.headersSent) {
      res.destroy();
      return;
    }

    // Body qua lon: tra loi roi dong ket noi, vi phan con lai cua body
    // se khong bao gio duoc doc het.
    if (statusCode === 413) {
      res.setHeader('Connection', 'close');
    }

    // Khong tiet lo chi tiet loi noi bo ra ngoai
    const message = statusCode >= 500
      ? 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
      : err.message;

    sendError(res, statusCode, message);
  });
});

// Chan slowloris: dong ket noi khong gui du header trong 20 giay
server.headersTimeout = 20_000;
server.requestTimeout = 120_000;
server.keepAliveTimeout = 65_000;

async function start() {
  try {
    assertValid();
  } catch (err) {
    console.error('\n✗ ' + err.message + '\n');
    process.exit(1);
  }

  uploads.ensureUploadsDir();

  try {
    await db.ping();
    console.log(`[MySQL] Đã kết nối ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (err) {
    console.error('\n✗ Không kết nối được MySQL:', err.message);
    console.error('  Kiểm tra lại DB_HOST / DB_USER / DB_PASSWORD / DB_NAME trong .env\n');
    process.exit(1);
  }

  // Don phien het han moi gio de bang sessions khong phinh
  const purgeTimer = setInterval(() => {
    auth.purgeExpiredSessions()
      .then((count) => { if (count) console.log(`[session] Đã dọn ${count} phiên hết hạn.`); })
      .catch((err) => console.error('[session] Lỗi dọn phiên:', err.message));
  }, 3_600_000);
  purgeTimer.unref();

  if (tts.isEnabled()) {
    console.log(`[TTS] Giọng nói AI bật, dịch vụ tại ${config.tts.baseUrl}` +
      (config.tts.allowCorpusCloning ? ' — CHO PHÉP nhân bản giọng từ kho đóng góp' : ''));

    // Cache wav phinh rat nhanh; don moi 6 tieng
    const cacheTimer = setInterval(() => {
      tts.pruneCache().catch((err) => console.error('[tts] Lỗi dọn cache:', err.message));
    }, 6 * 3_600_000);
    cacheTimer.unref();
  }

  server.listen(config.port, config.host, () => {
    console.log('==================================================');
    console.log(`  Ngân hàng Giọng nói Số — môi trường ${config.env}`);
    console.log(`  Đang lắng nghe tại http://${config.host}:${config.port}`);
    console.log(`  Thư mục tĩnh: ${config.publicDir}`);
    console.log('==================================================');
  });
}

function shutdown(signal) {
  console.log(`\n[${signal}] Đang tắt server...`);
  server.close(async () => {
    try { await db.close(); } catch (_) { /* pool da dong */ }
    process.exit(0);
  });
  // Ep tat neu con ket noi treo sau 10 giay
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

start();
