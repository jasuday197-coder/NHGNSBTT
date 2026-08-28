'use strict';

const https = require('https');
const { config } = require('./config');
const settings = require('./settings');
const guardrails = require('./guardrails');

const OPENROUTER_MODELS = ['openrouter/free', 'google/gemma-2-9b-it:free'];
const REQUEST_TIMEOUT_MS = 25_000;

/** Khoa lay tu settings (env truoc, roi den CSDL). */
async function openRouterKey() {
  const key = await settings.get('OPENROUTER_API_KEY');
  return key && !key.startsWith('YOUR_') ? key : null;
}

async function groqKey() {
  const key = await settings.get('GROQ_API_KEY');
  return key && !key.startsWith('YOUR_') ? key : null;
}

const hasOpenRouterKey = async () => Boolean(await openRouterKey());
const hasGroqKey = async () => Boolean(await groqKey());

function openRouterOptions(payloadLength, apiKey) {
  return {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://giongnoiso.com',
      'X-Title': 'Ngan Hang Giong Noi So',
      'Content-Length': payloadLength
    },
    timeout: REQUEST_TIMEOUT_MS
  };
}

/** Goi OpenRouter, tu dong chuyen model du phong khi model dau that bai. */
async function chat(messages, { forceJson = false } = {}) {
  const apiKey = await openRouterKey();
  if (!apiKey) throw new Error('Chưa cấu hình OpenRouter API key');

  function tryModel(index) {
    if (index >= OPENROUTER_MODELS.length) {
      return Promise.reject(new Error('Tất cả model OpenRouter đều thất bại'));
    }

    const model = OPENROUTER_MODELS[index];
    const next = () => tryModel(index + 1);

    return new Promise((resolve, reject) => {
      const body = { model, messages };
      if (forceJson) body.response_format = { type: 'json_object' };
      const payload = JSON.stringify(body);

      const req = https.request(openRouterOptions(Buffer.byteLength(payload), apiKey), (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.warn(`[OpenRouter] ${model} trả về ${res.statusCode}`);
            return next().then(resolve, reject);
          }
          try {
            const content = JSON.parse(data)?.choices?.[0]?.message?.content;
            if (content) return resolve(forceJson ? content : guardrails.sanitizeOutput(content));
            return next().then(resolve, reject);
          } catch (err) {
            return next().then(resolve, reject);
          }
        });
      });

      req.on('error', (err) => {
        console.error(`[OpenRouter] Lỗi mạng trên ${model}: ${err.message}`);
        next().then(resolve, reject);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[OpenRouter] ${model} quá thời gian chờ`);
        next().then(resolve, reject);
      });

      req.write(payload);
      req.end();
    });
  }

  return tryModel(0);
}

/**
 * Goi OpenRouter o che do streaming va chuyen tiep tung doan ve client
 * duoi dang SSE. Goi onFailure neu chua kip phat byte nao.
 */
async function chatStream(messages, clientRes, onFailure) {
  const apiKey = await openRouterKey();
  if (!apiKey) return onFailure(new Error('Chưa cấu hình OpenRouter API key'));

  function tryModel(index) {
    if (index >= OPENROUTER_MODELS.length) {
      onFailure(new Error('Tất cả model OpenRouter đều thất bại'));
      return;
    }

    const model = OPENROUTER_MODELS[index];
    const payload = JSON.stringify({ model, messages, stream: true });
    let streamStarted = false;
    let buffer = '';

    const streamSanitizer = guardrails.createStreamSanitizer((safeDelta) => {
      clientRes.write(`data: ${JSON.stringify({ content: safeDelta })}\n\n`);
    });

    const forwardLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) return;

      const dataStr = trimmed.slice(6).trim();
      if (dataStr === '[DONE]') return;

      try {
        const delta = JSON.parse(dataStr)?.choices?.[0]?.delta?.content;
        if (delta) streamSanitizer.processChunk(delta);
      } catch (_) {
        // Dong khong hoan chinh hoac keep-alive comment -> bo qua
      }
    };

    const req = https.request(openRouterOptions(Buffer.byteLength(payload), apiKey), (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        res.on('end', () => {
          console.warn(`[OpenRouter stream] ${model} trả về ${res.statusCode}`);
          tryModel(index + 1);
        });
        return;
      }

      streamStarted = true;
      clientRes.statusCode = 200;
      clientRes.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      clientRes.setHeader('Cache-Control', 'no-cache, no-transform');
      clientRes.setHeader('Connection', 'keep-alive');
      clientRes.setHeader('X-Accel-Buffering', 'no');

      res.on('data', (chunk) => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop();
        lines.forEach(forwardLine);
      });

      res.on('end', () => {
        if (buffer.trim()) forwardLine(buffer);
        streamSanitizer.flush();
        clientRes.write('data: [DONE]\n\n');
        clientRes.end();
      });
    });

    const abort = (err) => {
      if (streamStarted) {
        clientRes.end();
      } else if (index + 1 < OPENROUTER_MODELS.length) {
        tryModel(index + 1);
      } else {
        onFailure(err);
      }
    };

    req.on('error', abort);
    req.on('timeout', () => {
      req.destroy();
      abort(new Error(`Quá thời gian chờ trên model ${model}`));
    });

    req.write(payload);
    req.end();
  }

  tryModel(0);
}

/**
 * Do tin cay THAT cua ban nhan dang, tinh tu avg_logprob cua tung doan.
 *
 * Whisper tra ve log-xac suat trung binh cho moi doan. exp() cua no la xac
 * suat, va binh quan theo do dai doan cho ra mot con so co y nghia cho ca ban
 * ghi. Tra null khi model khong tra segments — thieu so con hon bia so.
 */
function computeConfidence(segments) {
  if (!Array.isArray(segments) || !segments.length) return null;

  let weighted = 0;
  let totalDuration = 0;

  for (const seg of segments) {
    if (typeof seg.avg_logprob !== 'number') continue;
    const duration = Math.max(0.1, (seg.end || 0) - (seg.start || 0));
    // no_speech_prob cao nghia la doan do gan nhu chi co tieng on
    const speech = 1 - Math.min(1, Math.max(0, seg.no_speech_prob || 0));
    weighted += Math.exp(seg.avg_logprob) * speech * duration;
    totalDuration += duration;
  }

  if (!totalDuration) return null;
  return Math.round((weighted / totalDuration) * 10000) / 100; // phan tram, 2 chu so
}

/**
 * Chuyen giong noi thanh van ban bang Groq Whisper.
 * @returns {Promise<{text: string, confidence: number|null, duration: number|null}|null>}
 */
async function transcribe(audioBuffer, mimeType = 'audio/mp3', fileName = 'audio.mp3') {
  const apiKey = await groqKey();
  if (!apiKey) {
    console.warn('[Groq Whisper] Chưa cấu hình khoá Groq, bỏ qua bước nhận dạng.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: mimeType }), fileName);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'vi');
    // verbose_json moi co segments -> moi tinh duoc do tin cay that
    formData.append('response_format', 'verbose_json');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);

    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      console.error(`[Groq Whisper] Lỗi ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!data.text || !data.text.trim()) return null;

    const confidence = computeConfidence(data.segments);
    const duration = typeof data.duration === 'number' ? Math.round(data.duration * 100) / 100 : null;

    console.log(`[Groq Whisper] Nhận dạng xong: ${data.text.trim().length} ký tự` +
      (confidence === null ? ', không đo được độ tin cậy' : `, độ tin cậy ${confidence}%`));

    return { text: data.text.trim(), confidence, duration };
  } catch (err) {
    console.error('[Groq Whisper] Ngoại lệ:', err.message || err);
    return null;
  }
}

module.exports = { chat, chatStream, transcribe, computeConfidence, hasOpenRouterKey, hasGroqKey };
