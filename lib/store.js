'use strict';

const crypto = require('crypto');
const db = require('./db');
const constants = require('./constants');

// ---------------------------------------------------------------
// Anh xa giua cot snake_case trong MySQL va hinh dang camelCase ma
// frontend (app.js) dang su dung, de khong phai viet lai giao dien.
// ---------------------------------------------------------------

function toJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function mapAudio(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    speaker: row.speaker,
    isAnonymous: Boolean(row.is_anonymous),
    gender: row.gender,
    province: row.province,
    dialectGroup: row.dialect_group,
    ageGroup: row.age_group,
    topic: row.topic,
    consent: Boolean(row.consent),
    audioUrl: row.audio_url || '',
    youtube_url: row.youtube_url || undefined,
    start_time: row.start_time,
    end_time: row.end_time,
    transcriptDialect: row.transcript_dialect || '',
    transcriptStandard: row.transcript_standard || '',
    subtitle: row.subtitle || '',
    ipa: row.ipa || '',
    // Chi so DO THAT tu Whisper. null = chua do, giao dien se khong hien gi.
    sttConfidence: row.stt_confidence === null || row.stt_confidence === undefined
      ? null : Number(row.stt_confidence),
    verified: Boolean(row.verified),
    tags: toJsonArray(row.tags),
    status: row.status,
    is_reported: Boolean(row.is_reported),
    report_reason: row.report_reason || undefined,
    allowVoiceClone: Boolean(row.allow_voice_clone),

    // Sieu du lieu hoc thuat
    durationSeconds: row.duration_seconds === null || row.duration_seconds === undefined
      ? null : Number(row.duration_seconds),
    sampleRate: row.sample_rate || null,
    channels: row.channels || null,
    recordedAt: row.recorded_at instanceof Date
      ? row.recorded_at.toISOString().slice(0, 10) : (row.recorded_at || null),
    locality: row.locality || null,
    collector: row.collector || null,
    device: row.device || null,
    license: row.license || 'CC-BY-NC-4.0',
    citationSlug: row.citation_slug || null,

    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

/** Giay phep cho phep chon. Mac dinh khop cam ket phi thuong mai cua du an. */
const LICENSES = {
  'CC-BY-4.0':       { label: 'CC BY 4.0 — ghi công tác giả', url: 'https://creativecommons.org/licenses/by/4.0/deed.vi' },
  'CC-BY-SA-4.0':    { label: 'CC BY-SA 4.0 — ghi công, chia sẻ tương tự', url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.vi' },
  'CC-BY-NC-4.0':    { label: 'CC BY-NC 4.0 — ghi công, phi thương mại', url: 'https://creativecommons.org/licenses/by-nc/4.0/deed.vi' },
  'CC-BY-NC-SA-4.0': { label: 'CC BY-NC-SA 4.0 — ghi công, phi thương mại, chia sẻ tương tự', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi' },
  'CC0-1.0':         { label: 'CC0 1.0 — hiến tặng cộng đồng', url: 'https://creativecommons.org/publicdomain/zero/1.0/deed.vi' },
  'ALL-RIGHTS-RESERVED': { label: 'Bảo lưu mọi quyền — chỉ tra cứu tại chỗ', url: null }
};
const DEFAULT_LICENSE = 'CC-BY-NC-4.0';

function mapLexicon(row) {
  if (!row) return null;
  return {
    id: row.id,
    word: row.word,
    region: row.region,
    provinces: toJsonArray(row.provinces),
    meaning: row.meaning,
    example: row.example,
    exampleTranslation: row.example_translation,
    culturalInsight: row.cultural_insight,
    ipa: row.ipa || ''
  };
}

function mapReport(row) {
  if (!row) return null;
  const created = row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at;
  return {
    id: row.id,
    audio_id: row.audio_id,
    audio_title: row.audio_title || 'Bản ghi âm',
    title: row.audio_title || 'Bản ghi âm',
    province: row.province || 'Bắc Trung Bộ',
    speaker: row.speaker || 'Ẩn danh',
    audioUrl: row.audio_url || '',
    transcriptDialect: row.transcript_dialect || '',
    reason: row.reason || 'Nội dung vi phạm / Không phù hợp',
    note: row.note || '',
    created_at: created,
    timestamp: created,
    status: row.status
  };
}

const AUDIO_COLUMNS = `id, title, speaker, is_anonymous, gender, province, dialect_group, age_group,
  topic, consent, audio_url, youtube_url, start_time, end_time, transcript_dialect,
  transcript_standard, subtitle, ipa, stt_confidence, verified, tags, status,
  is_reported, report_reason, allow_voice_clone, duration_seconds, sample_rate, channels,
  recorded_at, locality, collector, device, license, citation_slug, created_at`;

// ---------------------------------------------------------------
// Tu dien
// ---------------------------------------------------------------

async function listLexicon() {
  const rows = await db.query(
    'SELECT id, word, region, provinces, meaning, example, example_translation, cultural_insight, ipa FROM lexicon ORDER BY word ASC'
  );
  return rows.map(mapLexicon);
}

async function getLexiconById(id) {
  const row = await db.queryOne(
    'SELECT id, word, region, provinces, meaning, example, example_translation, cultural_insight, ipa FROM lexicon WHERE id = ?',
    [id]
  );
  return mapLexicon(row);
}

async function insertLexicon({
  id, word, region, provinces, meaning, example, exampleTranslation, culturalInsight, ipa, createdBy
}) {
  const finalId = id || `lex_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const provsJson = JSON.stringify(Array.isArray(provinces) ? provinces : [region].filter(Boolean));

  await db.execute(
    `INSERT INTO lexicon (id, word, region, provinces, meaning, example, example_translation, cultural_insight, ipa, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       word = VALUES(word),
       region = VALUES(region),
       provinces = VALUES(provinces),
       meaning = VALUES(meaning),
       example = VALUES(example),
       example_translation = VALUES(example_translation),
       cultural_insight = VALUES(cultural_insight),
       ipa = VALUES(ipa)`,
    [
      finalId,
      (word || '').trim(),
      region || 'Bắc Trung Bộ',
      provsJson,
      (meaning || '').trim(),
      example ? example.trim() : null,
      exampleTranslation ? exampleTranslation.trim() : null,
      culturalInsight ? culturalInsight.trim() : null,
      ipa ? ipa.trim() : null,
      createdBy || null
    ]
  );

  return getLexiconById(finalId);
}

async function updateLexicon(id, patch) {
  const existing = await getLexiconById(id);
  if (!existing) return null;

  const sets = [];
  const params = [];

  if (patch.word !== undefined) { sets.push('word = ?'); params.push(patch.word.trim()); }
  if (patch.region !== undefined) { sets.push('region = ?'); params.push(patch.region.trim()); }
  if (patch.provinces !== undefined) { sets.push('provinces = ?'); params.push(JSON.stringify(Array.isArray(patch.provinces) ? patch.provinces : [])); }
  if (patch.meaning !== undefined) { sets.push('meaning = ?'); params.push(patch.meaning.trim()); }
  if (patch.example !== undefined) { sets.push('example = ?'); params.push(patch.example ? patch.example.trim() : null); }
  if (patch.exampleTranslation !== undefined) { sets.push('example_translation = ?'); params.push(patch.exampleTranslation ? patch.exampleTranslation.trim() : null); }
  if (patch.culturalInsight !== undefined) { sets.push('cultural_insight = ?'); params.push(patch.culturalInsight ? patch.culturalInsight.trim() : null); }
  if (patch.ipa !== undefined) { sets.push('ipa = ?'); params.push(patch.ipa ? patch.ipa.trim() : null); }

  if (!sets.length) return existing;

  params.push(id);
  await db.execute(`UPDATE lexicon SET ${sets.join(', ')} WHERE id = ?`, params);
  return getLexiconById(id);
}

async function deleteLexicon(id) {
  await db.execute('DELETE FROM lexicon WHERE id = ?', [id]);
  return true;
}

async function searchLexicon({ q, region, page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * pageSize;

  const where = [];
  const params = [];

  if (q && q.trim()) {
    where.push('(word LIKE ? OR meaning LIKE ? OR example LIKE ?)');
    const term = `%${q.trim()}%`;
    params.push(term, term, term);
  }

  if (region && region.trim()) {
    where.push('region = ?');
    params.push(region.trim());
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRow = await db.queryOne(`SELECT COUNT(*) AS total FROM lexicon ${whereClause}`, params);
  const total = Number(countRow ? countRow.total : 0) || 0;

  const rows = await db.query(
    `SELECT id, word, region, provinces, meaning, example, example_translation, cultural_insight, ipa
       FROM lexicon ${whereClause}
      ORDER BY word ASC
      LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    items: rows.map(mapLexicon),
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize) || 1
  };
}

// ---------------------------------------------------------------
// Ban ghi am
// ---------------------------------------------------------------

/** Danh sach cong khai: chi ban ghi da duyet. Dung cho ban do va dong bo. */
async function listApprovedAudio() {
  const rows = await db.query(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records WHERE status = 'approved' ORDER BY created_at DESC`
  );
  return rows.map(mapAudio);
}

const MAX_PAGE_SIZE = 100;
const SORTS = {
  newest:   'created_at DESC',
  oldest:   'created_at ASC',
  title:    'title ASC',
  duration: 'duration_seconds DESC',
  province: 'province ASC, title ASC'
};

/**
 * Tim kiem + loc + phan trang tren kho ban ghi.
 *
 * Truoc day moi danh sach deu tra ve TOAN BO ban ghi trong mot lan goi —
 * on voi 12 ban ghi, sap voi 10.000. Moi truy van gio deu co tran.
 */
async function searchAudio({
  q, province, topic, ageGroup, gender, dialectGroup, license,
  hasAudio, page = 1, limit = 20, sort = 'newest', status = 'approved'
} = {}) {
  const where = [];
  const params = [];

  if (status !== 'all') { where.push('status = ?'); params.push(status); }
  if (province)     { where.push('province = ?');      params.push(province); }
  if (topic)        { where.push('topic = ?');         params.push(topic); }
  if (ageGroup)     { where.push('age_group = ?');     params.push(ageGroup); }
  if (gender)       { where.push('gender = ?');        params.push(gender); }
  if (dialectGroup) { where.push('dialect_group = ?'); params.push(dialectGroup); }
  if (license)      { where.push('license = ?');       params.push(license); }
  if (hasAudio)     { where.push("audio_url IS NOT NULL AND audio_url <> ''"); }

  // LIKE thay vi FULLTEXT: tu khoa tieng Viet thuong ngan va co dau,
  // FULLTEXT cua MariaDB tach tu khong tot voi tieng Viet.
  if (q && q.trim()) {
    const needle = `%${q.trim()}%`;
    where.push('(title LIKE ? OR transcript_dialect LIKE ? OR transcript_standard LIKE ? OR speaker LIKE ? OR locality LIKE ?)');
    params.push(needle, needle, needle, needle, needle);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = SORTS[sort] || SORTS.newest;

  // Gia tri am/khong phai so deu quay ve mac dinh, khong phai bi kep ve 1
  const rawLimit = Number(limit);
  const safeLimit = Number.isFinite(rawLimit) && rawLimit >= 1
    ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE) : 20;

  const rawPage = Number(page);
  const safePage = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const offset = (safePage - 1) * safeLimit;

  const totalRow = await db.queryOne(
    `SELECT COUNT(*) AS total FROM audio_records ${whereSql}`, params
  );
  const total = Number(totalRow.total) || 0;

  // LIMIT/OFFSET noi truc tiep vi da ep ve so nguyen trong khoang an toan;
  // mysql2 khong nhan placeholder cho LIMIT o che do prepared statement.
  const rows = await db.query(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records ${whereSql}
      ORDER BY ${orderSql} LIMIT ${safeLimit} OFFSET ${offset}`, params
  );

  return {
    items: rows.map(mapAudio),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit))
  };
}

/** Lay ban ghi theo ma trich dan (permalink), chi tra ve ban da duyet. */
async function getAudioByCitation(slug) {
  const row = await db.queryOne(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records WHERE citation_slug = ? AND status = 'approved'`,
    [slug]
  );
  return mapAudio(row);
}

/** Cac gia tri dang co trong kho, dung dung bo loc dong thay vi go cung. */
async function getFilterOptions() {
  const [provinces, topics, ages, genders, licenses] = await Promise.all([
    db.query("SELECT province AS v, COUNT(*) AS n FROM audio_records WHERE status='approved' AND province IS NOT NULL GROUP BY province ORDER BY n DESC"),
    db.query("SELECT topic AS v, COUNT(*) AS n FROM audio_records WHERE status='approved' AND topic IS NOT NULL GROUP BY topic ORDER BY n DESC"),
    db.query("SELECT age_group AS v, COUNT(*) AS n FROM audio_records WHERE status='approved' AND age_group IS NOT NULL GROUP BY age_group ORDER BY v ASC"),
    db.query("SELECT gender AS v, COUNT(*) AS n FROM audio_records WHERE status='approved' AND gender IS NOT NULL GROUP BY gender ORDER BY n DESC"),
    db.query("SELECT license AS v, COUNT(*) AS n FROM audio_records WHERE status='approved' GROUP BY license ORDER BY n DESC")
  ]);
  const shape = rows => rows.map(r => ({ value: r.v, count: Number(r.n) }));
  return {
    provinces: shape(provinces), topics: shape(topics), ageGroups: shape(ages),
    genders: shape(genders), licenses: shape(licenses)
  };
}

async function listPendingAudio() {
  const rows = await db.query(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records WHERE status = 'pending' ORDER BY created_at ASC`
  );
  return rows.map(mapAudio);
}

async function getAudio(id) {
  const row = await db.queryOne(`SELECT ${AUDIO_COLUMNS} FROM audio_records WHERE id = ?`, [id]);
  return mapAudio(row);
}

function dialectGroupOf(province) {
  if (province === 'Thanh Hóa') return 'Thanh Hóa';
  if (province === 'Nghệ An' || province === 'Hà Tĩnh') return 'Nghệ Tĩnh';
  return 'Bình Trị Thiên';
}

/** Bo dau tieng Viet, chuyen ve dang slug an toan cho URL. */
function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/**
 * Ma trich dan on dinh cho mot ban ghi, vi du "nghe-an-2026-a3f9c1".
 * Khong bao gio doi sau khi tao, de trich dan hoc thuat khong bi gay lien ket.
 */
function makeCitationSlug(record, year) {
  const province = slugify(record.province) || 'bac-trung-bo';
  const y = year || new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex');
  return `${province}-${y}-${rand}`.slice(0, 64);
}

/**
 * Khoa phat hien trung lap: cung tieu de (da chuan hoa) + cung tinh +
 * cung thoi luong lam tron 1 giay thi gan nhu chac chan la mot ban ghi.
 */
function makeDedupeKey(record) {
  const title = slugify(record.title);
  const province = slugify(record.province);
  const dur = record.durationSeconds ? Math.round(Number(record.durationSeconds)) : 'x';
  return `${title}|${province}|${dur}`.slice(0, 190);
}

async function insertAudio(record) {
  const license = LICENSES[record.license] ? record.license : DEFAULT_LICENSE;

  await db.execute(
    `INSERT INTO audio_records
       (id, title, speaker, is_anonymous, gender, province, dialect_group, age_group, topic,
        consent, audio_url, youtube_url, start_time, end_time, transcript_dialect,
        transcript_standard, subtitle, ipa, stt_confidence, verified, tags, status,
        allow_voice_clone, clone_consent_at, submitted_by,
        duration_seconds, sample_rate, channels, recorded_at, locality, collector, device,
        license, citation_slug, dedupe_key)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      record.id,
      record.title,
      record.speaker || 'Ẩn danh',
      record.isAnonymous ? 1 : 0,
      record.gender || 'Khác',
      record.province || null,
      record.dialectGroup || dialectGroupOf(record.province),
      record.ageGroup || null,
      record.topic || null,
      record.consent ? 1 : 0,
      record.audioUrl || null,
      record.youtubeUrl || null,
      Number(record.startTime) || 0,
      Number(record.endTime) || 0,
      record.transcriptDialect || '',
      record.transcriptStandard || '',
      record.subtitle || '',
      record.ipa || null,
      record.sttConfidence === null || record.sttConfidence === undefined ? null : Number(record.sttConfidence),
      record.verified ? 1 : 0,
      JSON.stringify(record.tags || []),
      record.status || 'pending',
      record.allowVoiceClone ? 1 : 0,
      record.allowVoiceClone ? new Date() : null,
      record.submittedBy || null,
      record.durationSeconds || null,
      record.sampleRate || null,
      record.channels || null,
      record.recordedAt || null,
      record.locality || null,
      record.collector || null,
      record.device || null,
      license,
      record.citationSlug || makeCitationSlug(record),
      makeDedupeKey(record)
    ]
  );
  return getAudio(record.id);
}

// Cac truong admin duoc phep sua sau khi ban ghi da vao kho
const EDITABLE_FIELDS = {
  title: 'title', speaker: 'speaker', province: 'province', topic: 'topic',
  ageGroup: 'age_group', gender: 'gender', locality: 'locality',
  collector: 'collector', device: 'device', recordedAt: 'recorded_at',
  license: 'license', ipa: 'ipa',
  transcriptDialect: 'transcript_dialect', transcriptStandard: 'transcript_standard'
};

async function updateAudioMetadata(id, patch, editorId) {
  const sets = [];
  const params = [];

  for (const [key, column] of Object.entries(EDITABLE_FIELDS)) {
    if (!(key in patch)) continue;
    let value = patch[key];
    if (key === 'license' && !LICENSES[value]) continue;
    if (value === '' ) value = null;
    sets.push(`\`${column}\` = ?`);
    params.push(value);
  }

  if (!sets.length) return false;

  // Doi tinh thi nhom phuong ngu phai doi theo
  if ('province' in patch && patch.province) {
    sets.push('dialect_group = ?');
    params.push(dialectGroupOf(patch.province));
  }

  sets.push('reviewed_by = ?', 'reviewed_at = NOW()');
  params.push(editorId || null, id);

  const result = await db.execute(
    `UPDATE audio_records SET ${sets.join(', ')} WHERE id = ?`, params
  );

  // Tieu de/tinh doi thi khoa phat hien trung cung phai tinh lai
  if ('title' in patch || 'province' in patch) {
    const fresh = await getAudio(id);
    if (fresh) {
      await db.execute('UPDATE audio_records SET dedupe_key = ? WHERE id = ?',
        [makeDedupeKey(fresh), id]);
    }
  }

  return result.affectedRows > 0;
}

/** Cac nhom ban ghi nghi la trung nhau, de admin gop hoac xoa bot. */
async function findDuplicates() {
  const rows = await db.query(
    `SELECT dedupe_key, COUNT(*) AS n, GROUP_CONCAT(id) AS ids, GROUP_CONCAT(title SEPARATOR ' | ') AS titles
       FROM audio_records
      WHERE dedupe_key IS NOT NULL AND status IN ('approved','pending')
      GROUP BY dedupe_key HAVING n > 1
      ORDER BY n DESC`
  );
  return rows.map(r => ({
    key: r.dedupe_key,
    count: Number(r.n),
    ids: String(r.ids).split(','),
    titles: String(r.titles).split(' | ')
  }));
}

/** Do phu du lieu theo tinh: dung de chi cho nguoi dong gop biet cho nao con thieu. */
async function getCoverage() {
  const audio = await db.query(
    `SELECT province, COUNT(*) AS records,
            COUNT(DISTINCT speaker) AS speakers,
            COALESCE(SUM(duration_seconds), 0) AS seconds
       FROM audio_records WHERE status = 'approved' GROUP BY province`
  );
  const lexicon = await db.query('SELECT region, COUNT(*) AS words FROM lexicon GROUP BY region');

  const byProvince = new Map(audio.map(r => [r.province, r]));
  const byRegion = new Map(lexicon.map(r => [r.region, Number(r.words)]));

  return constants.PROVINCES.map(province => {
    const a = byProvince.get(province);
    return {
      province,
      dialectGroup: dialectGroupOf(province),
      records: a ? Number(a.records) : 0,
      speakers: a ? Number(a.speakers) : 0,
      seconds: a ? Number(a.seconds) : 0,
      words: byRegion.get(dialectGroupOf(province)) || 0
    };
  });
}

// Muc tieu toi thieu cho moi tinh de kho co gia tri nghien cuu.
// Con so dat khiem ton, la nguong "du de bat dau phan tich", khong phai dich cuoi.
const TARGET_PER_PROVINCE = { records: 20, speakers: 8, minutes: 30 };

/**
 * Phan tich khoang trong theo tinh: thieu bao nhieu ban ghi, thieu chu de nao,
 * thieu nhom tuoi nao, gioi tinh co lech khong. Xep hang uu tien de nguoi
 * dong gop biet nen bat dau tu dau.
 */
async function getContributionGaps() {
  const rows = await db.query(
    `SELECT province, topic, age_group, gender, speaker, duration_seconds
       FROM audio_records WHERE status = 'approved' AND province IS NOT NULL`
  );

  const byProvince = new Map();
  for (const province of constants.PROVINCES) {
    byProvince.set(province, {
      records: 0, seconds: 0,
      speakers: new Set(), topics: new Set(), ages: new Set(),
      genders: { 'Nam': 0, 'Nữ': 0, 'Khác': 0 }
    });
  }

  for (const row of rows) {
    const bucket = byProvince.get(row.province);
    if (!bucket) continue;

    bucket.records += 1;
    bucket.seconds += Number(row.duration_seconds) || 0;
    if (row.speaker) bucket.speakers.add(row.speaker);
    if (row.topic) bucket.topics.add(constants.normalizeTopic(row.topic));
    if (row.age_group) bucket.ages.add(row.age_group);
    if (row.gender && bucket.genders[row.gender] !== undefined) bucket.genders[row.gender] += 1;
  }

  const allTopics = constants.TOPICS.map(t => t.value);
  const allAges = constants.AGE_GROUPS.map(a => a.value);
  const ageLabel = new Map(constants.AGE_GROUPS.map(a => [a.value, a.label]));
  const topicLabel = new Map(constants.TOPICS.map(t => [t.value, t.label]));

  const result = constants.PROVINCES.map(province => {
    const b = byProvince.get(province);
    const minutes = Math.round(b.seconds / 60);
    const speakers = b.speakers.size;

    const missingTopics = allTopics.filter(t => !b.topics.has(t));
    const missingAges = allAges.filter(a => !b.ages.has(a));

    const voiced = b.genders['Nam'] + b.genders['Nữ'];
    // Chi coi la lech khi da co it nhat 3 ban ghi, duoi do chua noi len gi
    const genderSkew = voiced >= 3
      ? Math.abs(b.genders['Nam'] - b.genders['Nữ']) / voiced
      : 0;

    const needs = [];
    if (b.records === 0) {
      needs.push({ level: 'critical', text: 'Chưa có bản ghi nào — cần bản ghi đầu tiên' });
    } else {
      if (b.records < TARGET_PER_PROVINCE.records) {
        needs.push({ level: 'high', text: `Cần thêm ${TARGET_PER_PROVINCE.records - b.records} bản ghi nữa` });
      }
      if (speakers < TARGET_PER_PROVINCE.speakers) {
        needs.push({ level: 'high', text: `Mới có ${speakers} người nói, cần thêm ${TARGET_PER_PROVINCE.speakers - speakers} giọng khác nhau` });
      }
      if (minutes < TARGET_PER_PROVINCE.minutes) {
        needs.push({ level: 'medium', text: `Mới có ${minutes} phút tiếng nói, cần đủ ${TARGET_PER_PROVINCE.minutes} phút` });
      }
      if (genderSkew > 0.6) {
        const thieu = b.genders['Nam'] > b.genders['Nữ'] ? 'nữ' : 'nam';
        needs.push({ level: 'medium', text: `Lệch giới tính — đang thiếu giọng ${thieu}` });
      }
    }
    for (const age of missingAges) {
      needs.push({ level: 'medium', text: `Chưa có giọng nhóm ${ageLabel.get(age)}` });
    }
    for (const topic of missingTopics) {
      needs.push({ level: 'low', text: `Chưa có chủ đề "${topicLabel.get(topic).split(' (')[0]}"` });
    }

    // Diem uu tien: tinh cang trong cang len dau
    const priority =
      (b.records === 0 ? 1000 : 0) +
      Math.max(0, TARGET_PER_PROVINCE.records - b.records) * 10 +
      Math.max(0, TARGET_PER_PROVINCE.speakers - speakers) * 8 +
      missingAges.length * 6 +
      missingTopics.length * 4 +
      Math.round(genderSkew * 10);

    return {
      province,
      dialectGroup: dialectGroupOf(province),
      records: b.records,
      speakers,
      minutes,
      genders: b.genders,
      missingTopics: missingTopics.map(t => ({ value: t, label: topicLabel.get(t) })),
      missingAges: missingAges.map(a => ({ value: a, label: ageLabel.get(a) })),
      needs,
      priority,
      completion: Math.min(100, Math.round(
        (Math.min(b.records / TARGET_PER_PROVINCE.records, 1) * 0.5 +
         Math.min(speakers / TARGET_PER_PROVINCE.speakers, 1) * 0.3 +
         Math.min(minutes / TARGET_PER_PROVINCE.minutes, 1) * 0.2) * 100
      ))
    };
  });

  result.sort((a, b) => b.priority - a.priority);
  return { targets: TARGET_PER_PROVINCE, provinces: result };
}

async function setAudioStatus(id, status, reviewerId) {
  const result = await db.execute(
    'UPDATE audio_records SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
    [status, reviewerId || null, id]
  );
  return result.affectedRows > 0;
}

/** Duyet ban ghi: chuyen sang approved va danh dau da xac minh. */
async function approveAudio(id, reviewerId) {
  const result = await db.execute(
    `UPDATE audio_records
        SET status = 'approved', verified = 1, reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?`,
    [reviewerId || null, id]
  );
  return result.affectedRows > 0;
}

/** Xoa han ban ghi. Tra ve duong dan file am thanh de caller don dia. */
async function deleteAudio(id) {
  const record = await getAudio(id);
  await db.execute('DELETE FROM audio_reports WHERE audio_id = ?', [id]);
  await db.execute('DELETE FROM audio_records WHERE id = ?', [id]);
  return record ? record.audioUrl : null;
}

// ---------------------------------------------------------------
// Bao cao vi pham
// ---------------------------------------------------------------

const REPORT_SELECT = `SELECT r.id, r.audio_id, r.reason, r.note, r.status, r.created_at,
         a.title AS audio_title, a.province, a.speaker, a.audio_url, a.transcript_dialect
    FROM audio_reports r
    LEFT JOIN audio_records a ON a.id = r.audio_id`;

async function listPendingReports() {
  const rows = await db.query(`${REPORT_SELECT} WHERE r.status = 'pending_review' ORDER BY r.created_at DESC`);
  return rows.map(mapReport);
}

async function getReportByAudio(audioId) {
  const row = await db.queryOne(`${REPORT_SELECT} WHERE r.audio_id = ?`, [audioId]);
  return mapReport(row);
}

/** Mot ban ghi chi co mot bao cao dang mo; bao cao sau ghi de bao cao truoc. */
async function upsertReport({ audioId, reason, note, reporterId, reporterIp }) {
  await db.execute(
    `INSERT INTO audio_reports (audio_id, reason, note, reporter_id, reporter_ip, status)
     VALUES (?, ?, ?, ?, ?, 'pending_review')
     ON DUPLICATE KEY UPDATE
       reason = VALUES(reason), note = VALUES(note),
       reporter_id = VALUES(reporter_id), reporter_ip = VALUES(reporter_ip),
       status = 'pending_review', created_at = NOW()`,
    [audioId, reason || null, note || null, reporterId || null, reporterIp || null]
  );

  await db.execute(
    'UPDATE audio_records SET is_reported = 1, report_reason = ? WHERE id = ?',
    [reason || 'Không phù hợp', audioId]
  );

  return getReportByAudio(audioId);
}

/** Bo qua bao cao: go co canh bao tren ban ghi, giu ban ghi lai. */
async function dismissReport(audioId, adminId) {
  await db.execute(
    `UPDATE audio_reports SET status = 'dismissed', handled_by = ?, handled_at = NOW() WHERE audio_id = ?`,
    [adminId || null, audioId]
  );
  const result = await db.execute(
    'UPDATE audio_records SET is_reported = 0, report_reason = NULL WHERE id = ?',
    [audioId]
  );
  return result.affectedRows > 0;
}

// ---------------------------------------------------------------
// Dong y nhan ban giong
// ---------------------------------------------------------------

/**
 * Danh sach ban ghi duoc phep dung lam giong mau.
 * Dieu kien kep: da duyet VA nguoi dong gop da dong y ro rang.
 */
async function listCloneableAudio() {
  const rows = await db.query(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records
      WHERE status = 'approved' AND allow_voice_clone = 1 AND audio_url IS NOT NULL
      ORDER BY province ASC, title ASC`
  );
  return rows.map(mapAudio);
}

/** Kiem tra truoc khi clone. Tra ve ban ghi neu hop le, nem loi neu khong. */
async function getCloneableAudio(id) {
  const row = await db.queryOne(
    `SELECT ${AUDIO_COLUMNS} FROM audio_records WHERE id = ?`,
    [id]
  );
  if (!row) return { record: null, reason: 'not_found' };
  if (row.status !== 'approved') return { record: mapAudio(row), reason: 'not_approved' };
  if (!row.allow_voice_clone) return { record: mapAudio(row), reason: 'no_consent' };
  if (!row.audio_url) return { record: mapAudio(row), reason: 'no_audio_file' };
  return { record: mapAudio(row), reason: null };
}

async function setCloneConsent(id, allowed, adminId) {
  const result = await db.execute(
    `UPDATE audio_records
        SET allow_voice_clone = ?, clone_consent_at = ?, reviewed_by = ?
      WHERE id = ?`,
    [allowed ? 1 : 0, allowed ? new Date() : null, adminId || null, id]
  );

  // Rut lai dong y thi vo hieu luon cac giong da nhan ban tu ban ghi nay
  if (!allowed) {
    await db.execute(
      `UPDATE voice_clones SET status = 'revoked', revoked_by = ?, revoked_at = NOW()
        WHERE source_audio = ? AND status = 'active'`,
      [adminId || null, id]
    );
  }

  return result.affectedRows > 0;
}

async function logTtsUsage({ userId, username, mode, voice, sourceAudio, text, outputFile, seconds, ip }) {
  try {
    await db.execute(
      `INSERT INTO tts_log
         (user_id, username, mode, voice, source_audio, text_excerpt, text_length, output_file, seconds, ip)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        userId || null, username || null, mode, voice || null, sourceAudio || null,
        (text || '').slice(0, 255), (text || '').length, outputFile || null, seconds || null, ip || null
      ]
    );
  } catch (err) {
    console.error('[tts_log] Không ghi được nhật ký:', err.message);
  }
}

// ---------------------------------------------------------------
// Chatbot RAG + nhat ky quan tri
// ---------------------------------------------------------------

async function listChatbotRag() {
  const rows = await db.query('SELECT id, keywords, response FROM chatbot_rag');
  return rows.map((row) => ({ id: row.id, keywords: toJsonArray(row.keywords), response: row.response }));
}

async function writeAuditLog({ userId, username, action, targetId, detail, ip }) {
  try {
    await db.execute(
      'INSERT INTO audit_log (user_id, username, action, target_id, detail, ip) VALUES (?,?,?,?,?,?)',
      [userId || null, username || null, action, targetId || null, detail || null, ip || null]
    );
  } catch (err) {
    // Ghi nhat ky that bai khong duoc lam hong nghiep vu chinh
    console.error('[audit_log] Không ghi được nhật ký:', err.message);
  }
}

// ---------------------------------------------------------------
// Minigame Leaderboard
// ---------------------------------------------------------------

async function insertMinigameScore({ userId, playerName, gameId, score, streak, timeSeconds, ip }) {
  const result = await db.execute(
    `INSERT INTO minigame_scores (user_id, player_name, game_id, score, streak, time_seconds, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId || null,
      (playerName || 'Người chơi').trim().slice(0, 190),
      Number(gameId) || 1,
      Number(score) || 0,
      Number(streak) || 0,
      Number(timeSeconds) || null,
      ip || null
    ]
  );
  return { id: result.insertId, score: Number(score) };
}

async function getMinigameLeaderboard({ gameId = 1, timeRange = 'all', limit = 10 } = {}) {
  let timeClause = '';
  const params = [Number(gameId) || 1];

  if (timeRange === 'today') {
    timeClause = ' AND created_at >= CURDATE()';
  } else if (timeRange === 'week') {
    timeClause = ' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
  } else if (timeRange === 'month') {
    timeClause = ' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
  }

  const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
  params.push(pageSize);

  const query = `
    SELECT id, user_id, player_name, game_id, score, streak, time_seconds, created_at
      FROM minigame_scores
     WHERE game_id = ? ${timeClause}
     ORDER BY score DESC, time_seconds ASC, created_at ASC
     LIMIT ?
  `;

  const rows = await db.query(query, params);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.player_name,
    gameId: r.game_id,
    score: r.score,
    streak: r.streak,
    time: r.time_seconds ? Number(r.time_seconds) : null,
    date: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
  }));
}

module.exports = {
  mapAudio,
  mapLexicon,
  mapReport,
  dialectGroupOf,
  slugify,
  makeCitationSlug,
  makeDedupeKey,
  LICENSES,
  DEFAULT_LICENSE,
  listLexicon,
  getLexiconById,
  insertLexicon,
  updateLexicon,
  deleteLexicon,
  searchLexicon,
  listApprovedAudio,
  searchAudio,
  getAudioByCitation,
  getFilterOptions,
  updateAudioMetadata,
  findDuplicates,
  getCoverage,
  getContributionGaps,
  listPendingAudio,
  getAudio,
  insertAudio,
  setAudioStatus,
  approveAudio,
  deleteAudio,
  listCloneableAudio,
  getCloneableAudio,
  setCloneConsent,
  logTtsUsage,
  listPendingReports,
  getReportByAudio,
  upsertReport,
  dismissReport,
  listChatbotRag,
  writeAuditLog,
  insertMinigameScore,
  getMinigameLeaderboard,
  AUDIO_COLUMNS
};

