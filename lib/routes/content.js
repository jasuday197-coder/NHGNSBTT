'use strict';

const crypto = require('crypto');
const ai = require('../ai');
const rag = require('../rag');
const store = require('../store');
const uploads = require('../uploads');
const rateLimit = require('../ratelimit');
const { config } = require('../config');
const { HttpError, sendJson, readJsonBody, assertSameOrigin, str } = require('../http');

// Danh muc lay tu mot nguon duy nhat, xem lib/constants.js
const constants = require('../constants');
const { PROVINCE_VALUES: PROVINCES, AGE_VALUES, GENDER_VALUES } = constants;

const AUDIO_LIST_ALIASES = new Set([
  '/api/audio-database', '/api/audio-records',
  '/api/audio-corpus', '/api/get-audio-database'
]);

const SITE_NAME = 'Ngân hàng Giọng nói Số Bắc Trung Bộ';

/** Chuoi trich dan hoc thuat cho mot ban ghi. */
function buildCitation(record, ctx) {
  const host = ctx.host || 'giongnoiso.com';
  const url = `https://${host}/ban-ghi/${record.citationSlug}`;
  const year = (record.recordedAt || record.timestamp || '').slice(0, 4) || '';
  const speaker = record.isAnonymous ? 'Người nói ẩn danh' : (record.speaker || 'Không rõ');
  const place = [record.locality, record.province].filter(Boolean).join(', ');

  return {
    url,
    text: `${speaker} (${year}). "${record.title}" [bản ghi âm]. ${place}. ${SITE_NAME}. ${url}`,
    bibtex: `@misc{${record.citationSlug || record.id},
  author       = {${speaker}},
  title        = {${record.title}},
  year         = {${year}},
  howpublished = {${SITE_NAME}},
  address      = {${place}},
  note         = {Bản ghi âm phương ngữ. Giấy phép: ${record.license}},
  url          = {${url}}
}`
  };
}

/** Chi nhan ngay dang YYYY-MM-DD va khong o tuong lai. */
function parseDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const d = new Date(`${value.trim()}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d > new Date()) return null;
  return value.trim();
}

function buildTranslatePrompt(text, direction, contextBlock) {
  const directionLabel = direction === 'dialect-to-standard'
    ? 'Từ Phương ngữ Địa phương sang Tiếng Việt Phổ thông chuẩn'
    : 'Từ Tiếng Việt Phổ thông sang Phương ngữ Địa phương';

  return `Hãy dịch câu dưới đây giữa Tiếng Việt Phổ Thông và Phương ngữ Bắc Trung Bộ, giữ nguyên sắc thái biểu cảm, đại từ xưng hô và ngữ cảnh tự nhiên nhất.

Thông tin câu cần dịch:
- Câu gốc: "${text}"
- Chiều dịch thuật: ${directionLabel}

DỮ LIỆU TỪ ĐIỂN ĐỊA PHƯƠNG TRA CỨU ĐƯỢC (RAG Context):
${contextBlock || '(Không tìm thấy từ vựng khớp trực tiếp, hãy dùng tri thức chuyên sâu về phương ngữ để dịch)'}

YÊU CẦU BẮT BUỘC:
1. Áp dụng chính xác các cặp từ/nghĩa từ Nhóm Từ Điển trên vào câu dịch.
2. Toàn bộ nội dung trả về PHẢI bằng tiếng Việt. Tuyệt đối không dùng ngôn ngữ khác.
3. Trả về DUY NHẤT một object JSON đúng cấu trúc sau, không kèm bất kỳ văn bản nào khác:
{
  "translation": "Câu sau khi đã dịch xong",
  "wordsBreakdown": [
    { "dialectWord": "Từ địa phương", "standardMeaning": "Nghĩa phổ thông", "explanation": "Giải thích ngắn gọn" }
  ]
}`;
}

async function handle(req, res, ctx) {
  const { pathname, method, ip } = ctx;

  // --- POST /api/translate -----------------------------------------
  if (method === 'POST' && pathname === '/api/translate') {
    assertSameOrigin(req);
    rateLimit.guard(res, 'ai', ip);

    const body = await readJsonBody(req);
    const text = str(body.text, 2000);
    if (!text) throw new HttpError(400, 'Vui lòng nhập nội dung cần dịch.');

    const direction = body.direction === 'standard-to-dialect' ? 'standard-to-dialect' : 'dialect-to-standard';

    if (!(await ai.hasOpenRouterKey())) {
      sendJson(res, 200, rag.fallbackTranslate(text, direction, 'unconfigured_key'));
      return true;
    }

    const context = await rag.retrieveContext(text);
    const contextBlock = context.khoA
      .map((item, idx) => `${idx + 1}. "${item.word}" <-> "${item.meaning}" (Vùng: ${item.region || 'Bắc Trung Bộ'}) | ${item.culturalInsight || item.example || ''}`)
      .join('\n');

    try {
      const raw = await ai.chat([
        { role: 'system', content: 'Bạn là chuyên gia ngôn ngữ học phương ngữ 6 tỉnh Bắc Trung Bộ (Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế). Bạn chỉ trả lời bằng tiếng Việt.' },
        { role: 'user', content: buildTranslatePrompt(text, direction, contextBlock) }
      ], { forceJson: true });

      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.translation !== 'string' || !parsed.translation.trim()) {
        throw new Error('Model trả về cấu trúc không dùng được');
      }

      sendJson(res, 200, {
        translation: parsed.translation,
        wordsBreakdown: Array.isArray(parsed.wordsBreakdown) ? parsed.wordsBreakdown : [],
        isFallback: false
      });
    } catch (err) {
      console.error('[translate] Chuyển sang bộ dịch ngoại tuyến:', err.message);
      sendJson(res, 200, rag.fallbackTranslate(text, direction, 'network_error'));
    }
    return true;
  }

  // --- POST /api/chatbot | /api/chat -------------------------------
  if (method === 'POST' && (pathname === '/api/chatbot' || pathname === '/api/chat')) {
    assertSameOrigin(req);
    rateLimit.guard(res, 'ai', ip);

    const body = await readJsonBody(req);
    const message = str(body.message, 2000);
    if (!message) throw new HttpError(400, 'Vui lòng nhập câu hỏi.');

    const sendOffline = async (reason) => {
      if (reason) console.error('[chatbot] Chuyển sang chế độ ngoại tuyến:', reason);
      const reply = await rag.offlineChatbotReply(message);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
      res.write(`data: ${JSON.stringify({ content: reply, isFallback: true })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    };

    if (!(await ai.hasOpenRouterKey())) {
      await sendOffline(null);
      return true;
    }

    const context = await rag.retrieveContext(message);
    const contextBlock = context.khoA
      .map((item) => `- "${item.word}" -> "${item.meaning}" (Ví dụ: "${item.example}" = "${item.exampleTranslation}")`)
      .join('\n');

    const systemMessage = `Bạn là Trợ lý Văn hóa Thổ âm Sông núi – nhà ngôn ngữ học kiêm chuyên gia văn hóa dân gian 6 tỉnh Bắc Trung Bộ. Giải thích từ vựng, ngữ pháp và phong tục dựa vào Context bên dưới, luôn kèm ví dụ tiếng địa phương và bản dịch phổ thông. Chỉ trả lời bằng tiếng Việt.

Context từ cơ sở dữ liệu:
${contextBlock || '(Không có dữ liệu khớp trực tiếp, hãy dùng kiến thức chuyên môn của bạn)'}`;

    // chatStream giờ là async: bắt cả lỗi đồng bộ lẫn promise bị reject
    ai.chatStream(
      [{ role: 'system', content: systemMessage }, { role: 'user', content: message }],
      res,
      (err) => { sendOffline(err.message || err).catch(() => res.end()); }
    ).catch((err) => { sendOffline(err.message || err).catch(() => res.end()); });
    return true;
  }

  // --- GET danh sach day du (ban do can toan bo diem) ---------------
  if (method === 'GET' && AUDIO_LIST_ALIASES.has(pathname)) {
    rateLimit.guard(res, 'read', ip);
    sendJson(res, 200, await store.listApprovedAudio());
    return true;
  }

  // --- GET /api/audio: tim kiem + loc + phan trang -------------------
  if (method === 'GET' && pathname === '/api/audio') {
    rateLimit.guard(res, 'read', ip);
    const p = ctx.query;
    const result = await store.searchAudio({
      q: p.get('q'),
      province: p.get('province'),
      topic: p.get('topic'),
      ageGroup: p.get('ageGroup'),
      gender: p.get('gender'),
      dialectGroup: p.get('dialectGroup'),
      license: p.get('license'),
      hasAudio: p.get('hasAudio') === '1',
      sort: p.get('sort') || 'newest',
      page: p.get('page'),
      limit: p.get('limit')
    });
    sendJson(res, 200, { success: true, ...result });
    return true;
  }

  // --- GET /api/audio/:citationSlug: chi tiet mot ban ghi ------------
  if (method === 'GET' && pathname.startsWith('/api/audio/')) {
    rateLimit.guard(res, 'read', ip);
    const slug = str(decodeURIComponent(pathname.slice('/api/audio/'.length)), 64);
    if (!slug) throw new HttpError(400, 'Thiếu mã bản ghi.');

    const record = await store.getAudioByCitation(slug);
    if (!record) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    sendJson(res, 200, {
      success: true,
      record,
      license: store.LICENSES[record.license] || null,
      citation: buildCitation(record, ctx)
    });
    return true;
  }

  // --- GET /api/filters ----------------------------------------------
  // Tra ve CA hai: gia tri dang co trong kho (de loc) va danh muc duoc
  // phep chon (de dung form). Giao dien dung cai thu hai nen khong con
  // canh <option> trong HTML lech voi kiem tra o server.
  if (method === 'GET' && pathname === '/api/filters') {
    rateLimit.guard(res, 'read', ip);
    sendJson(res, 200, {
      success: true,
      ...(await store.getFilterOptions()),
      licenseLabels: store.LICENSES,
      allowed: {
        provinces: constants.PROVINCES,
        ageGroups: constants.AGE_GROUPS,
        genders: constants.GENDERS,
        topics: constants.TOPICS
      }
    });
    return true;
  }

  // --- GET /api/coverage: cho nao con thieu du lieu -----------------
  if (method === 'GET' && pathname === '/api/coverage') {
    rateLimit.guard(res, 'read', ip);
    sendJson(res, 200, { success: true, provinces: await store.getCoverage() });
    return true;
  }

  // --- GET /api/gaps: phan tich chi tiet cho trang "Cần đóng góp" ----
  if (method === 'GET' && pathname === '/api/gaps') {
    rateLimit.guard(res, 'read', ip);
    sendJson(res, 200, { success: true, ...(await store.getContributionGaps()) });
    return true;
  }

  // --- GET /api/lexicon --------------------------------------------
  if (method === 'GET' && pathname === '/api/lexicon') {
    rateLimit.guard(res, 'read', ip);
    sendJson(res, 200, await rag.getLexicon());
    return true;
  }

  // --- POST /api/upload-speech (yeu cau dang nhap) -----------------
  if (method === 'POST' && pathname === '/api/upload-speech') {
    assertSameOrigin(req);
    if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập để đóng góp bản ghi âm.');
    rateLimit.guard(res, 'upload', ip);

    const body = await readJsonBody(req, config.limits.uploadBody);

    const title = str(body.title, 255);
    const province = str(body.province, 64);
    const ageGroup = str(body.ageGroup, 32);
    const topic = str(body.topic, 128);

    if (!title || !province || !ageGroup || !topic) {
      throw new HttpError(400, 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
    }
    if (!PROVINCES.has(province)) throw new HttpError(400, 'Tỉnh/thành không hợp lệ.');
    if (!AGE_VALUES.has(ageGroup)) throw new HttpError(400, 'Nhóm tuổi không hợp lệ.');

    const saved = await uploads.saveAudioDataUrl(body.audioDataUrl);

    // Nhan dang giong noi; that bai thi de trong de admin tu dien
    let transcriptDialect = '';
    let transcriptStandard = '';
    let sttConfidence = null;
    let sttDuration = null;

    const transcribed = await ai.transcribe(saved.buffer, saved.mimeType, `audio.${saved.extension}`);
    if (transcribed && transcribed.text) {
      transcriptDialect = transcribed.text;
      transcriptStandard = rag.fallbackTranslate(transcribed.text, 'dialect-to-standard').translation || transcribed.text;
      sttConfidence = transcribed.confidence;
      sttDuration = transcribed.duration;
    }

    const gender = GENDER_VALUES.has(str(body.gender, 32)) ? body.gender : 'Khác';
    const isAnonymous = Boolean(body.isAnonymous);

    // Thoi luong: uu tien so trinh duyet do duoc, khong co thi lay tu Whisper
    const clientDuration = Number(body.durationSeconds);
    const durationSeconds = Number.isFinite(clientDuration) && clientDuration > 0
      ? Math.round(clientDuration * 100) / 100
      : sttDuration;

    const record = await store.insertAudio({
      id: `audio_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      title,
      speaker: isAnonymous ? 'Ẩn danh' : (str(body.speaker, 190) || ctx.user.username),
      isAnonymous,
      gender,
      province,
      dialectGroup: store.dialectGroupOf(province),
      ageGroup,
      topic,
      consent: Boolean(body.consent),
      audioUrl: saved.url,
      transcriptDialect,
      transcriptStandard,
      subtitle: transcriptDialect,
      sttConfidence,
      verified: false,
      tags: [topic.split(' ')[0], province],
      status: 'pending',
      allowVoiceClone: Boolean(body.consentVoiceClone),
      submittedBy: ctx.user.id,

      // Sieu du lieu hoc thuat
      durationSeconds,
      sampleRate: Number(body.sampleRate) || null,
      channels: Number(body.channels) || null,
      recordedAt: parseDateOnly(body.recordedAt),
      locality: str(body.locality, 190),
      collector: str(body.collector, 190),
      device: str(body.device, 190),
      license: store.LICENSES[body.license] ? body.license : store.DEFAULT_LICENSE
    });

    await store.writeAuditLog({
      userId: ctx.user.id, username: ctx.user.username,
      action: 'audio.submit', targetId: record.id, detail: title, ip
    });

    sendJson(res, 201, {
      success: true,
      record,
      message: 'Đã gửi bản ghi. Nội dung sẽ hiển thị sau khi quản trị viên duyệt.'
    });
    return true;
  }

  // --- POST /api/report-audio (yeu cau dang nhap) ------------------
  if (method === 'POST' && pathname === '/api/report-audio') {
    assertSameOrigin(req);
    if (!ctx.user) throw new HttpError(401, 'Bạn cần đăng nhập để báo cáo nội dung.');
    rateLimit.guard(res, 'report', ip);

    const body = await readJsonBody(req);
    const audioId = str(body.audio_id || body.id, 64);
    if (!audioId) throw new HttpError(400, 'Thiếu mã bản ghi cần báo cáo.');

    const target = await store.getAudio(audioId);
    if (!target) throw new HttpError(404, 'Không tìm thấy bản ghi.');

    const report = await store.upsertReport({
      audioId,
      reason: str(body.reason, 255) || 'Nội dung vi phạm / Không phù hợp',
      note: str(body.note, 2000),
      reporterId: ctx.user.id,
      reporterIp: ip
    });

    await store.writeAuditLog({
      userId: ctx.user.id, username: ctx.user.username,
      action: 'audio.report', targetId: audioId, detail: report.reason, ip
    });

    sendJson(res, 200, { success: true, message: 'Đã gửi báo cáo tới quản trị viên.', report });
    return true;
  }

  return false;
}

module.exports = { handle, PROVINCES };
