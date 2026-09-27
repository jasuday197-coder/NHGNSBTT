'use strict';

/**
 * Tao bang va nap du lieu cu (data.js + cac tep JSON) vao MySQL.
 *
 *   node scripts/migrate.js          -> chi tao bang
 *   node scripts/migrate.js --seed   -> tao bang + nap du lieu cu
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { config, assertValid } = require('../lib/config');
const db = require('../lib/db');
const store = require('../lib/store');

const ROOT = config.rootDir;
const SEED = process.argv.includes('--seed');

const log = (msg) => console.log(`  ${msg}`);

/** Tach schema.sql thanh tung lenh; bo comment de khong lam roi parser. */
function readSchemaStatements() {
  const sql = fs.readFileSync(path.join(ROOT, 'db', 'schema.sql'), 'utf-8');
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean);
}

async function createTables() {
  console.log('\n[1/3] Tạo bảng...');
  const pool = db.getPool();
  for (const statement of readSchemaStatements()) {
    await pool.query(statement);
  }
  const tables = await db.query('SHOW TABLES');
  log(`✓ ${tables.length} bảng sẵn sàng: ${tables.map((t) => Object.values(t)[0]).join(', ')}`);

  await applyColumnMigrations();
}

/**
 * Them cot vao bang da ton tai. CREATE TABLE IF NOT EXISTS khong dung
 * cho truong hop nay vi bang cu van con nguyen.
 */
const COLUMN_MIGRATIONS = [
  ['audio_records', 'allow_voice_clone', 'TINYINT(1) NOT NULL DEFAULT 0'],
  ['audio_records', 'clone_consent_at', 'DATETIME NULL'],
  ['audio_records', 'ipa', 'TEXT NULL'],
  ['audio_records', 'stt_confidence', 'DECIMAL(5,2) NULL'],
  ['audio_records', 'duration_seconds', 'DECIMAL(8,2) NULL'],
  ['audio_records', 'sample_rate', 'INT NULL'],
  ['audio_records', 'channels', 'TINYINT NULL'],
  ['audio_records', 'recorded_at', 'DATE NULL'],
  ['audio_records', 'locality', 'VARCHAR(190) NULL'],
  ['audio_records', 'collector', 'VARCHAR(190) NULL'],
  ['audio_records', 'device', 'VARCHAR(190) NULL'],
  ['audio_records', 'license', "VARCHAR(32) NOT NULL DEFAULT 'CC-BY-NC-4.0'"],
  ['audio_records', 'citation_slug', 'VARCHAR(64) NULL'],
  ['audio_records', 'dedupe_key', 'VARCHAR(190) NULL'],
  ['lexicon', 'ipa', 'VARCHAR(190) NULL']
];

const INDEX_MIGRATIONS = [
  ['audio_records', 'uq_audio_citation', 'ADD UNIQUE KEY uq_audio_citation (citation_slug)'],
  ['audio_records', 'idx_audio_dedupe', 'ADD KEY idx_audio_dedupe (dedupe_key)'],
  ['audio_records', 'idx_audio_browse', 'ADD KEY idx_audio_browse (status, province, topic)'],
  ['audio_records', 'ft_audio', 'ADD FULLTEXT KEY ft_audio (title, transcript_dialect, transcript_standard, speaker)']
];

async function applyColumnMigrations() {
  for (const [table, column, definition] of COLUMN_MIGRATIONS) {
    const exists = await db.queryOne(
      `SELECT 1 AS found FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [config.db.database, table, column]
    );
    if (exists) continue;

    await db.getPool().query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    log(`✓ Thêm cột ${table}.${column}`);
  }

  for (const [table, indexName, clause] of INDEX_MIGRATIONS) {
    const exists = await db.queryOne(
      `SELECT 1 AS found FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [config.db.database, table, indexName]
    );
    if (exists) continue;

    try {
      await db.getPool().query(`ALTER TABLE \`${table}\` ${clause}`);
      log(`✓ Thêm chỉ mục ${table}.${indexName}`);
    } catch (err) {
      console.warn(`  ! Bỏ qua chỉ mục ${indexName}: ${err.message}`);
    }
  }
}

/**
 * Xoa trang cac chi so "AI" duoc gan bang tay.
 *
 * purity_percentage va confidence trong du lieu goc khong he duoc do — chung
 * duoc go cung 90-95 trong data.js, roi giao dien con co gia tri du phong 94%
 * cho ban ghi khong co so nao. Voi mot kho ngu lieu nghien cuu, hien so lieu
 * khong co that la thu pha hoai uy tin nhanh nhat. Chi giu lai stt_confidence
 * do THAT tu Whisper.
 */
async function clearFabricatedMetrics() {
  const before = await db.queryOne(
    'SELECT COUNT(*) AS n FROM audio_records WHERE confidence <> 0 OR purity_percentage IS NOT NULL'
  );
  if (!before || !Number(before.n)) return 0;

  await db.execute('UPDATE audio_records SET confidence = 0, purity_percentage = NULL');
  return Number(before.n);
}

/** Nap data.js trong sandbox de lay 3 kho du lieu goc. */
function loadLegacyDataFile() {
  const dataPath = path.join(ROOT, 'public', 'data.js');
  if (!fs.existsSync(dataPath)) return { lexicon: [], corpus: [], rag: [] };

  const source = fs.readFileSync(dataPath, 'utf-8')
    .replace(/\bconst\s+(DIALECT_LEXICON|AUDIO_CORPUS|CHATBOT_RAG_DATABASE)\b/g, 'var $1');

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { timeout: 10_000 });

  return {
    lexicon: sandbox.DIALECT_LEXICON || [],
    corpus: sandbox.AUDIO_CORPUS || [],
    rag: sandbox.CHATBOT_RAG_DATABASE || []
  };
}

function readJsonFile(fileName) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`  ! Bỏ qua ${fileName}: ${err.message}`);
    return [];
  }
}

async function seedLexicon(items) {
  let count = 0;
  for (const item of items) {
    if (!item || !item.id || !item.word) continue;
    await db.execute(
      `INSERT INTO lexicon (id, word, region, provinces, meaning, example, example_translation, cultural_insight)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         word = VALUES(word), region = VALUES(region), provinces = VALUES(provinces),
         meaning = VALUES(meaning), example = VALUES(example),
         example_translation = VALUES(example_translation), cultural_insight = VALUES(cultural_insight)`,
      [
        item.id, item.word, item.region || null,
        JSON.stringify(item.provinces || []),
        item.meaning || null, item.example || null,
        item.exampleTranslation || null, item.culturalInsight || null
      ]
    );
    count += 1;
  }
  return count;
}

async function seedAudio(records, status) {
  let count = 0;
  for (const item of records) {
    if (!item || !item.id) continue;

    const province = item.province || null;
    await db.execute(
      `INSERT INTO audio_records
         (id, title, speaker, is_anonymous, gender, province, dialect_group, age_group, topic,
          consent, audio_url, youtube_url, start_time, end_time, transcript_dialect,
          transcript_standard, subtitle, purity_percentage, confidence, verified, tags, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      [
        item.id,
        item.title || 'Bản ghi không tên',
        item.speaker || 'Ẩn danh',
        item.isAnonymous ? 1 : 0,
        item.gender || 'Khác',
        province,
        item.dialectGroup || store.dialectGroupOf(province),
        item.ageGroup || null,
        item.topic || null,
        item.consent ? 1 : 0,
        item.audioUrl || null,
        item.youtube_url || null,
        Number(item.start_time) || 0,
        Number(item.end_time) || 0,
        item.transcriptDialect || '',
        item.transcriptStandard || '',
        item.subtitle || '',
        null,  // purity_percentage: du lieu goc gan bang tay, khong nap
        0,     // confidence: nt
        item.verified ? 1 : 0,
        JSON.stringify(item.tags || []),
        status
      ]
    );
    count += 1;
  }
  return count;
}

async function seedRag(entries) {
  const [existing] = await db.query('SELECT COUNT(*) AS total FROM chatbot_rag');
  if (Number(existing.total) > 0) return 0;

  let count = 0;
  for (const entry of entries) {
    if (!entry || !entry.response) continue;
    await db.execute(
      'INSERT INTO chatbot_rag (keywords, response) VALUES (?, ?)',
      [JSON.stringify(entry.keywords || []), entry.response]
    );
    count += 1;
  }
  return count;
}

async function seedAll() {
  console.log('\n[2/3] Nạp dữ liệu cũ...');

  const legacy = loadLegacyDataFile();
  const deletedIds = new Set(readJsonFile('deleted_audios.json'));

  const lexiconCount = await seedLexicon(legacy.lexicon);
  log(`✓ Từ điển: ${lexiconCount} mục`);

  // audio_database.json la nguon moi nhat; data.js la ban goc du phong
  const approvedSource = readJsonFile('audio_database.json');
  const approved = (approvedSource.length ? approvedSource : legacy.corpus)
    .filter((item) => item && item.id && !deletedIds.has(item.id) && item.status !== 'pending');
  const approvedCount = await seedAudio(approved, 'approved');
  log(`✓ Bản ghi đã duyệt: ${approvedCount}`);

  const pending = readJsonFile('pending_contributions.json')
    .filter((item) => item && item.id && !deletedIds.has(item.id));
  const pendingCount = await seedAudio(pending, 'pending');
  log(`✓ Bản ghi chờ duyệt: ${pendingCount}`);

  const reports = readJsonFile('reported_audios.json');
  let reportCount = 0;
  for (const report of reports) {
    if (!report || !report.audio_id) continue;
    const exists = await db.queryOne('SELECT id FROM audio_records WHERE id = ?', [report.audio_id]);
    if (!exists) continue;
    await store.upsertReport({
      audioId: report.audio_id,
      reason: report.reason,
      note: report.note,
      reporterId: null,
      reporterIp: null
    });
    reportCount += 1;
  }
  log(`✓ Báo cáo vi phạm: ${reportCount}`);

  const ragCount = await seedRag(legacy.rag);
  log(`✓ Kho trả lời chatbot: ${ragCount}`);
}

/** Sinh ma trich dan + khoa phat hien trung cho ban ghi cu chua co. */
async function backfillCitations() {
  const rows = await db.query(
    `SELECT id, title, province, duration_seconds, citation_slug, dedupe_key, created_at
       FROM audio_records WHERE citation_slug IS NULL OR dedupe_key IS NULL`
  );
  if (!rows.length) return 0;

  for (const row of rows) {
    const record = {
      title: row.title,
      province: row.province,
      durationSeconds: row.duration_seconds
    };
    const year = row.created_at ? new Date(row.created_at).getFullYear() : undefined;

    // citation_slug la UNIQUE; thu lai neu dung ma ngau nhien trung
    let slug = row.citation_slug;
    if (!slug) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = store.makeCitationSlug(record, year);
        const clash = await db.queryOne('SELECT 1 AS x FROM audio_records WHERE citation_slug = ?', [candidate]);
        if (!clash) { slug = candidate; break; }
      }
    }

    await db.execute(
      'UPDATE audio_records SET citation_slug = ?, dedupe_key = ? WHERE id = ?',
      [slug, row.dedupe_key || store.makeDedupeKey(record), row.id]
    );
  }
  return rows.length;
}

async function summarize() {
  console.log('\n[3/3] Kiểm tra kết quả...');
  const rows = await db.query(
    `SELECT 'users' AS bang, COUNT(*) AS so_dong FROM users
     UNION ALL SELECT 'lexicon', COUNT(*) FROM lexicon
     UNION ALL SELECT 'audio_records', COUNT(*) FROM audio_records
     UNION ALL SELECT 'audio_reports', COUNT(*) FROM audio_reports
     UNION ALL SELECT 'chatbot_rag', COUNT(*) FROM chatbot_rag
     UNION ALL SELECT 'minigame_scores', COUNT(*) FROM minigame_scores`
  );
  for (const row of rows) log(`${row.bang.padEnd(16)} ${row.so_dong}`);

  const admins = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
  if (Number(admins[0].total) === 0) {
    console.log('\n  ⚠ Chưa có tài khoản admin nào. Tạo bằng:');
    console.log('     npm run create-admin -- --username <ten> --password <matkhau>');
  }
}

async function main() {
  assertValid();
  console.log(`Kết nối MySQL: ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`);

  await createTables();
  if (SEED) await seedAll();
  else console.log('\n[2/3] Bỏ qua nạp dữ liệu (thêm --seed để nạp).');

  console.log('\n[2b] Dọn dữ liệu...');
  const cleared = await clearFabricatedMetrics();
  if (cleared) {
    log(`✓ Xoá chỉ số "AI" gán tay trên ${cleared} bản ghi (chưa từng được đo)`);
  }
  const filled = await backfillCitations();
  if (filled) log(`✓ Sinh mã trích dẫn cho ${filled} bản ghi`);

  await summarize();

  console.log('\n✓ Hoàn tất.\n');
}

main()
  .catch((err) => {
    console.error('\n✗ Migrate thất bại:', err.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
