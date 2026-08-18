'use strict';

const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const db = require('./db');
const tts = require('./tts');
const { config } = require('./config');

const execFileAsync = promisify(execFile);

/** Tong dung luong mot thu muc (khong de quy sau, du cho uploads/cache). */
async function dirSize(dir) {
  let total = 0;
  let count = 0;
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      try {
        const stats = await fsp.stat(path.join(dir, entry.name));
        total += stats.size;
        count += 1;
      } catch (_) { /* tep vua bi xoa */ }
    }
  } catch (_) { /* thu muc chua ton tai */ }
  return { bytes: total, files: count };
}

/** Dung luong con trong cua phan vung chua thu muc du an. */
async function diskFree() {
  try {
    const { stdout } = await execFileAsync('df', ['-Pk', config.rootDir], { timeout: 5000 });
    const line = stdout.trim().split('\n').pop().split(/\s+/);
    const totalKb = Number(line[1]);
    const usedKb = Number(line[2]);
    const freeKb = Number(line[3]);
    if (!Number.isFinite(totalKb)) return null;
    return {
      totalBytes: totalKb * 1024,
      usedBytes: usedKb * 1024,
      freeBytes: freeKb * 1024,
      usedPercent: Math.round((usedKb / totalKb) * 100)
    };
  } catch (_) {
    return null;
  }
}

/** Toan canh suc khoe he thong cho bang dieu khien quan tri. */
async function getSystemStatus() {
  const started = Date.now();

  let database = { ok: false, version: null, error: null, sizeBytes: null };
  try {
    const v = await db.queryOne('SELECT VERSION() AS v');
    database.version = v.v;
    database.ok = true;

    const size = await db.queryOne(
      `SELECT COALESCE(SUM(data_length + index_length), 0) AS bytes
         FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.db.database]
    );
    database.sizeBytes = Number(size.bytes) || 0;
  } catch (err) {
    database.error = err.message;
  }

  const [uploads, ttsCache, disk, ttsHealth] = await Promise.all([
    dirSize(config.uploadsDir),
    dirSize(config.tts.cacheDir),
    diskFree(),
    tts.isEnabled() ? tts.health() : Promise.resolve({ status: 'disabled' })
  ]);

  const load = os.loadavg();

  return {
    checkedInMs: Date.now() - started,
    app: {
      env: config.env,
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssBytes: process.memoryUsage().rss,
      pid: process.pid
    },
    host: {
      platform: `${os.type()} ${os.release()}`,
      cpus: os.cpus().length,
      loadAvg: load.map((n) => Math.round(n * 100) / 100),
      totalMemBytes: os.totalmem(),
      freeMemBytes: os.freemem(),
      uptimeSeconds: Math.round(os.uptime())
    },
    database,
    storage: { uploads, ttsCache, disk },
    tts: {
      enabled: tts.isEnabled(),
      corpusCloningAllowed: config.tts.allowCorpusCloning,
      baseUrl: config.tts.baseUrl,
      service: ttsHealth
    },
    limits: {
      jsonBodyBytes: config.limits.jsonBody,
      uploadBodyBytes: config.limits.uploadBody,
      audioBytes: config.limits.audioBytes,
      sessionTtlHours: config.session.ttlHours,
      allowRegistration: config.allowRegistration
    }
  };
}

/** So lieu tong quan + hoat dong gan day cho trang tong quan. */
async function getDashboard() {
  const [audio] = await db.query(
    `SELECT
       SUM(status = 'approved') AS approved,
       SUM(status = 'pending')  AS pending,
       SUM(status = 'rejected') AS rejected,
       SUM(is_reported = 1)     AS reported,
       SUM(allow_voice_clone = 1) AS cloneable,
       COUNT(*) AS total,
       COALESCE(SUM(duration_seconds), 0) AS seconds,
       COUNT(DISTINCT speaker) AS speakers
     FROM audio_records`
  );

  const [users] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(role = 'admin') AS admins,
            SUM(status = 'disabled') AS disabled,
            SUM(last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS active7d
       FROM users`
  );

  const [lexicon] = await db.query(
    'SELECT COUNT(*) AS total, SUM(ipa IS NOT NULL AND ipa <> "") AS withIpa FROM lexicon'
  );

  const [sessions] = await db.query(
    'SELECT COUNT(*) AS active FROM sessions WHERE expires_at > NOW()'
  );

  const [ttsUsage] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(mode = 'clone') AS clones,
            SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS last7d
       FROM tts_log`
  );

  // Bieu do dong gop 30 ngay gan nhat
  const daily = await db.query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS n
       FROM audio_records
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      GROUP BY DATE(created_at) ORDER BY day ASC`
  );

  const recent = await db.query(
    `SELECT username, action, target_id, detail, created_at
       FROM audit_log ORDER BY id DESC LIMIT 12`
  );

  const num = (v) => Number(v) || 0;

  return {
    audio: {
      approved: num(audio.approved), pending: num(audio.pending),
      rejected: num(audio.rejected), reported: num(audio.reported),
      cloneable: num(audio.cloneable), total: num(audio.total),
      minutes: Math.round(num(audio.seconds) / 60), speakers: num(audio.speakers)
    },
    users: {
      total: num(users.total), admins: num(users.admins),
      disabled: num(users.disabled), active7d: num(users.active7d),
      activeSessions: num(sessions.active)
    },
    lexicon: { total: num(lexicon.total), withIpa: num(lexicon.withIpa) },
    tts: { total: num(ttsUsage.total), clones: num(ttsUsage.clones), last7d: num(ttsUsage.last7d) },
    daily: daily.map((d) => ({
      day: d.day instanceof Date ? d.day.toISOString().slice(0, 10) : String(d.day),
      count: num(d.n)
    })),
    recentActivity: recent
  };
}

module.exports = { getSystemStatus, getDashboard };
