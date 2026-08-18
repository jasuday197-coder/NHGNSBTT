'use strict';

const store = require('../store');
const rag = require('../rag');
const rateLimit = require('../ratelimit');
const { sendJson, HttpError } = require('../http');

const SITE = 'Ngân hàng Giọng nói Số Bắc Trung Bộ';

/** Boc mot o CSV theo RFC 4180. */
function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows, columns) {
  const head = columns.map(c => csvCell(c.label)).join(',');
  const body = rows.map(row => columns.map(c => csvCell(c.get(row))).join(',')).join('\n');
  // BOM de Excel mo dung tieng Viet
  return '﻿' + head + '\n' + body + '\n';
}

function sendFile(res, filename, contentType, content) {
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end(content);
}

const AUDIO_COLUMNS = (host) => [
  { label: 'citation_slug',       get: r => r.citationSlug },
  { label: 'title',               get: r => r.title },
  { label: 'speaker',             get: r => r.isAnonymous ? 'Ẩn danh' : r.speaker },
  { label: 'is_anonymous',        get: r => r.isAnonymous ? 1 : 0 },
  { label: 'gender',              get: r => r.gender },
  { label: 'age_group',           get: r => r.ageGroup },
  { label: 'province',            get: r => r.province },
  { label: 'locality',            get: r => r.locality },
  { label: 'dialect_group',       get: r => r.dialectGroup },
  { label: 'topic',               get: r => r.topic },
  { label: 'transcript_dialect',  get: r => r.transcriptDialect },
  { label: 'transcript_standard', get: r => r.transcriptStandard },
  { label: 'ipa',                 get: r => r.ipa },
  { label: 'duration_seconds',    get: r => r.durationSeconds },
  { label: 'sample_rate',         get: r => r.sampleRate },
  { label: 'channels',            get: r => r.channels },
  { label: 'stt_confidence',      get: r => r.sttConfidence },
  { label: 'recorded_at',         get: r => r.recordedAt },
  { label: 'collector',           get: r => r.collector },
  { label: 'device',              get: r => r.device },
  { label: 'license',             get: r => r.license },
  { label: 'audio_url',           get: r => r.audioUrl ? `https://${host}${r.audioUrl}` : '' },
  { label: 'youtube_url',         get: r => r.youtube_url || '' },
  { label: 'permalink',           get: r => `https://${host}/ban-ghi/${r.citationSlug}` }
];

const LEXICON_COLUMNS = [
  { label: 'id',                  get: r => r.id },
  { label: 'word',                get: r => r.word },
  { label: 'meaning',             get: r => r.meaning },
  { label: 'ipa',                 get: r => r.ipa },
  { label: 'region',              get: r => r.region },
  { label: 'provinces',           get: r => (r.provinces || []).join('; ') },
  { label: 'example',             get: r => r.example },
  { label: 'example_translation', get: r => r.exampleTranslation },
  { label: 'cultural_insight',    get: r => r.culturalInsight }
];

/**
 * Kho ngu lieu chi co ich khi tai ve va trich dan duoc.
 * Tat ca endpoint o day deu cong khai va chi tra ve ban ghi DA DUYET.
 */
async function handle(req, res, ctx) {
  const { pathname, method, ip, host } = ctx;

  if (!pathname.startsWith('/api/export/')) return false;
  if (method !== 'GET') throw new HttpError(405, 'Chỉ hỗ trợ GET.');

  rateLimit.guard(res, 'read', ip);

  const stamp = new Date().toISOString().slice(0, 10);

  // --- Toan bo kho ban ghi, dang JSON --------------------------------
  if (pathname === '/api/export/corpus.json') {
    const records = await store.listApprovedAudio();
    sendFile(res, `giongnoiso-corpus-${stamp}.json`, 'application/json; charset=utf-8',
      JSON.stringify({
        name: SITE,
        description: 'Kho ngữ liệu giọng nói phương ngữ 6 tỉnh Bắc Trung Bộ',
        homepage: `https://${host}`,
        exported_at: new Date().toISOString(),
        record_count: records.length,
        license_note: 'Giấy phép áp dụng riêng cho từng bản ghi, xem trường "license".',
        records: records.map(r => ({
          citation_slug: r.citationSlug,
          title: r.title,
          speaker: r.isAnonymous ? 'Ẩn danh' : r.speaker,
          is_anonymous: r.isAnonymous,
          gender: r.gender,
          age_group: r.ageGroup,
          province: r.province,
          locality: r.locality,
          dialect_group: r.dialectGroup,
          topic: r.topic,
          transcript_dialect: r.transcriptDialect,
          transcript_standard: r.transcriptStandard,
          ipa: r.ipa || null,
          duration_seconds: r.durationSeconds,
          sample_rate: r.sampleRate,
          channels: r.channels,
          stt_confidence: r.sttConfidence,
          recorded_at: r.recordedAt,
          collector: r.collector,
          device: r.device,
          license: r.license,
          audio_url: r.audioUrl ? `https://${host}${r.audioUrl}` : null,
          youtube_url: r.youtube_url || null,
          permalink: `https://${host}/ban-ghi/${r.citationSlug}`
        }))
      }, null, 2));
    return true;
  }

  // --- Toan bo kho ban ghi, dang CSV ---------------------------------
  if (pathname === '/api/export/corpus.csv') {
    const records = await store.listApprovedAudio();
    sendFile(res, `giongnoiso-corpus-${stamp}.csv`, 'text/csv; charset=utf-8',
      toCsv(records, AUDIO_COLUMNS(host)));
    return true;
  }

  // --- Tu dien phuong ngu --------------------------------------------
  if (pathname === '/api/export/lexicon.json') {
    const words = await rag.getLexicon();
    sendFile(res, `giongnoiso-lexicon-${stamp}.json`, 'application/json; charset=utf-8',
      JSON.stringify({
        name: `${SITE} — Từ điển phương ngữ`,
        homepage: `https://${host}`,
        exported_at: new Date().toISOString(),
        entry_count: words.length,
        entries: words
      }, null, 2));
    return true;
  }

  if (pathname === '/api/export/lexicon.csv') {
    const words = await rag.getLexicon();
    sendFile(res, `giongnoiso-lexicon-${stamp}.csv`, 'text/csv; charset=utf-8',
      toCsv(words, LEXICON_COLUMNS));
    return true;
  }

  // --- Mo ta kho theo chuan Datapackage, de may doc duoc -------------
  if (pathname === '/api/export/datapackage.json') {
    const [records, words, coverage] = await Promise.all([
      store.listApprovedAudio(), rag.getLexicon(), store.getCoverage()
    ]);
    sendJson(res, 200, {
      profile: 'data-package',
      name: 'giongnoiso-bac-trung-bo',
      title: SITE,
      homepage: `https://${host}`,
      created: new Date().toISOString(),
      resources: [
        { name: 'corpus', path: `https://${host}/api/export/corpus.csv`, format: 'csv', count: records.length },
        { name: 'lexicon', path: `https://${host}/api/export/lexicon.csv`, format: 'csv', count: words.length }
      ],
      coverage,
      licenses: Object.entries(store.LICENSES).map(([id, meta]) => ({ id, ...meta }))
    });
    return true;
  }

  throw new HttpError(404, 'Không tìm thấy định dạng xuất này.');
}

module.exports = { handle };
