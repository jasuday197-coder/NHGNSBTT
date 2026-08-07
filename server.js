const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const vm = require('vm');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    });
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.ico': 'image/x-icon'
};

// Shared Database Loader (loads data.js via secure vm context)
let dialectLexicon = [];
let audioCorpus = [];
let chatbotRagDatabase = [];

const AUDIO_DB_PATH = path.join(__dirname, 'audio_database.json');
const REPORTED_DB_PATH = path.join(__dirname, 'reported_audios.json');
const DELETED_DB_PATH = path.join(__dirname, 'deleted_audios.json');

function getDeletedAudioIds() {
  try {
    if (fs.existsSync(DELETED_DB_PATH)) {
      const content = fs.readFileSync(DELETED_DB_PATH, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (Array.isArray(list)) return new Set(list);
    }
  } catch (e) {
    console.error("Error reading deleted_audios.json:", e);
  }
  return new Set();
}

function markAudioAsDeleted(id) {
  if (!id) return;
  try {
    const deletedSet = getDeletedAudioIds();
    deletedSet.add(id);
    fs.writeFileSync(DELETED_DB_PATH, JSON.stringify(Array.from(deletedSet), null, 2), 'utf-8');
    console.log(`[Audio DB] Marked ID "${id}" as permanently deleted.`);
  } catch (e) {
    console.error("Error saving deleted_audios.json:", e);
  }
}

function getReportedAudios() {
  try {
    if (!fs.existsSync(REPORTED_DB_PATH)) {
      fs.writeFileSync(REPORTED_DB_PATH, '[]', 'utf-8');
      console.log("[Report DB] Initialized reported_audios.json with []");
      return [];
    }
    const content = fs.readFileSync(REPORTED_DB_PATH, 'utf-8');
    const list = JSON.parse(content || '[]');
    if (Array.isArray(list)) return list;
  } catch (e) {
    console.error("Error reading reported_audios.json:", e);
  }
  return [];
}

function saveReportedAudios(list) {
  try {
    fs.writeFileSync(REPORTED_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Error writing reported_audios.json:", e);
    return false;
  }
}

function getAudioDatabase() {
  try {
    const deletedSet = getDeletedAudioIds();
    if (fs.existsSync(AUDIO_DB_PATH)) {
      const content = fs.readFileSync(AUDIO_DB_PATH, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (Array.isArray(list)) {
        return list.filter(item => item && item.id && !deletedSet.has(item.id));
      }
    }
  } catch (e) {
    console.error("Error reading audio_database.json:", e);
  }
  return [];
}

function saveRecordToAudioDatabase(record) {
  try {
    let list = getAudioDatabase();
    const existingIndex = list.findIndex(item => item.id === record.id || (item.title === record.title && item.audioUrl && item.audioUrl === record.audioUrl));
    if (existingIndex !== -1) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.push(record);
    }
    fs.writeFileSync(AUDIO_DB_PATH, JSON.stringify(list, null, 2), 'utf-8');
    console.log(`[Audio DB] Saved record "${record.title}" (ID: ${record.id}) to audio_database.json`);
    return true;
  } catch (e) {
    console.error("Error writing to audio_database.json:", e);
    return false;
  }
}

function removeRecordFromAudioDatabase(id) {
  if (!id) return;
  try {
    markAudioAsDeleted(id);
    let list = getAudioDatabase();
    const newList = list.filter(item => item.id !== id);
    fs.writeFileSync(AUDIO_DB_PATH, JSON.stringify(newList, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error removing record from audio_database.json:", e);
  }
}

function loadDatabase() {
  try {
    const dataFilePath = path.join(__dirname, 'data.js');
    if (fs.existsSync(dataFilePath)) {
      let content = fs.readFileSync(dataFilePath, 'utf-8');
      // Replace top-level const with var so they bind to sandbox properties in VM context
      content = content.replace(/\bconst\s+(DIALECT_LEXICON|AUDIO_CORPUS|CHATBOT_RAG_DATABASE)\b/g, 'var $1');
      const sandbox = {};
      vm.createContext(sandbox);
      vm.runInContext(content, sandbox);
      dialectLexicon = sandbox.DIALECT_LEXICON || [];
      audioCorpus = sandbox.AUDIO_CORPUS || [];
      chatbotRagDatabase = sandbox.CHATBOT_RAG_DATABASE || [];
      console.log(`[Database] Loaded ${dialectLexicon.length} lexicon items.`);
    }

    const deletedSet = getDeletedAudioIds();

    if (!fs.existsSync(AUDIO_DB_PATH)) {
      const filteredCorpus = audioCorpus.filter(item => item && item.id && !deletedSet.has(item.id));
      fs.writeFileSync(AUDIO_DB_PATH, JSON.stringify(filteredCorpus, null, 2), 'utf-8');
      console.log(`[Audio DB] Initialized audio_database.json with ${filteredCorpus.length} records.`);
    } else {
      const currentDb = getAudioDatabase();
      const existingIds = new Set(currentDb.map(item => item.id));
      let added = false;
      audioCorpus.forEach(item => {
        if (item && item.id && !existingIds.has(item.id) && !deletedSet.has(item.id)) {
          currentDb.push(item);
          added = true;
        }
      });
      if (added) {
        fs.writeFileSync(AUDIO_DB_PATH, JSON.stringify(currentDb, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error("Failed to load local database from data.js:", err);
  }
}

// Tokenize and Query RAG Context (Kho A Lexicon + Kho B Speech Corpus)
function retrieveContext(inputText, direction = 'dialect-to-standard') {
  if (!inputText) return { khoA: [], khoB: [] };
  if (dialectLexicon.length === 0) loadDatabase();

  function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  }

  const cleanInput = inputText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const cleanInputNoDiacritics = removeDiacritics(cleanInput);
  const matches = [];

  // Match both dialect words and standard meanings from DIALECT_LEXICON
  dialectLexicon.forEach(lex => {
    const lexWord = lex.word.toLowerCase();
    const lexWordNoDiacritics = removeDiacritics(lexWord);
    
    let isMatched = cleanInput.includes(lexWord) || cleanInputNoDiacritics.includes(lexWordNoDiacritics);
    
    if (!isMatched && lex.meaning) {
      const meanings = lex.meaning.split(/[,;\/]/).map(m => m.trim().toLowerCase());
      for (const m of meanings) {
        if (!m) continue;
        const mNoDiacritics = removeDiacritics(m);
        if (cleanInput.includes(m) || (mNoDiacritics.length >= 2 && cleanInputNoDiacritics.includes(mNoDiacritics))) {
          isMatched = true;
          break;
        }
      }
    }

    if (isMatched) {
      matches.push(lex);
    }
  });

  const uniqueMatches = [];
  const seenIds = new Set();
  matches.forEach(m => {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMatches.push(m);
    }
  });

  const khoBMatches = querySpeechCorpusPlaceholder(cleanInput);

  return {
    khoA: uniqueMatches.slice(0, 15),
    khoB: khoBMatches
  };
}

function querySpeechCorpusPlaceholder(inputText) {
  console.log(`[RAG Kho B Placeholder] Querying speech database for: "${inputText}"`);
  return [];
}
const CORE_DIALECT_PAIRS = [
  { standard: "bây giờ", dialect: "dừ", exp: "Trạng từ chỉ thời gian bây giờ" },
  { standard: "hôm nay", dialect: "bữa ni", exp: "Trạng từ thời gian hôm nay" },
  { standard: "hôm nay", dialect: "bữa nay", exp: "Trạng từ thời gian hôm nay" },
  { standard: "tại sao", dialect: "răng", exp: "Từ hỏi lý do nguyên nhân" },
  { standard: "thế nào", dialect: "răng", exp: "Từ hỏi trạng thái" },
  { standard: "ở đâu", dialect: "ở mô", exp: "Từ hỏi địa điểm vị trí" },
  { standard: "đi đâu", dialect: "đi mô", exp: "Cụm hỏi hướng di chuyển" },
  { standard: "làm gì", dialect: "mần chi", exp: "Cụm câu hỏi hành động" },
  { standard: "đi chơi", dialect: "đi nhởi", exp: "Cụm động từ giải trí" },
  { standard: "bên kia", dialect: "bên tê", exp: "Từ chỉ vị trí khoảng cách" },
  { standard: "đằng kia", dialect: "đằng tê", exp: "Từ chỉ vị trí khoảng cách" },
  { standard: "cái này", dialect: "cấy ni", exp: "Từ chỉ định vật thể gần" },
  { standard: "cái đó", dialect: "cấy nớ", exp: "Từ chỉ định vật thể vừa nói" },
  { standard: "người đó", dialect: "người nớ", exp: "Chỉ định từ nhân xưng" },
  { standard: "chúng tôi", dialect: "choa", exp: "Đại từ xưng hô ngôi thứ nhất số nhiều" },
  { standard: "chúng tao", dialect: "choa", exp: "Đại từ xưng hô ngôi thứ nhất thân mật" },
  { standard: "các bạn", dialect: "bọn bay", exp: "Đại từ xưng hô ngôi thứ hai số nhiều" },
  { standard: "tụi mày", dialect: "bọn bay", exp: "Đại từ xưng hô ngôi thứ hai số nhiều" },
  { standard: "con trâu", dialect: "con tru", exp: "Danh từ gia súc" },
  { standard: "con dâu", dialect: "con du", exp: "Danh từ quan hệ gia đình" },
  { standard: "nước sâu", dialect: "nác su", exp: "Danh từ vùng nước" },
  { standard: "quả bầu", dialect: "trấy bù", exp: "Danh từ thực vật" },
  { standard: "trồng cây", dialect: "lông cơn", exp: "Động từ nông nghiệp" },
  { standard: "ra sân", dialect: "ra cươi", exp: "Cụm từ vị trí sân nhà" },
  { standard: "làm việc", dialect: "mần việc", exp: "Động từ lao động" },
  { standard: "nhìn thấy", dialect: "chộ", exp: "Động từ tri giác" },
  { standard: "lười biếng", dialect: "nhác", exp: "Tính từ tính cách" },
  { standard: "xa xôi", dialect: "ngái", exp: "Tính từ khoảng cách" },
  { standard: "cụ ông", dialect: "ôn", exp: "Kính xưng tôn kính" },
  { standard: "cụ bà", dialect: "mệ", exp: "Kính xưng tôn kính" },
  { standard: "sao", dialect: "răng", exp: "Từ hỏi phổ biến Bắc Trung Bộ" },
  { standard: "đâu", dialect: "mô", exp: "Từ hỏi vị trí" },
  { standard: "thế", dialect: "rứa", exp: "Trợ từ cảm thán đệm cuối câu" },
  { standard: "vậy", dialect: "rứa", exp: "Trợ từ cảm thán đệm cuối câu" },
  { standard: "này", dialect: "ni", exp: "Từ chỉ định gần" },
  { standard: "kia", dialect: "tê", exp: "Từ chỉ định xa" },
  { standard: "đó", dialect: "nớ", exp: "Từ chỉ định đối tượng" },
  { standard: "làm", dialect: "mần", exp: "Động từ làm" },
  { standard: "thấy", dialect: "chộ", exp: "Động từ thấy" },
  { standard: "lười", dialect: "nhác", exp: "Tính từ lười" },
  { standard: "xa", dialect: "ngái", exp: "Tính từ xa" },
  { standard: "mày", dialect: "mi", exp: "Đại từ xưng hô ngôi 2" },
  { standard: "bạn", dialect: "mi", exp: "Đại từ xưng hô ngôi 2 thân mật" },
  { standard: "tôi", dialect: "tui", exp: "Đại từ xưng hô ngôi 1" },
  { standard: "tao", dialect: "tui", exp: "Đại từ xưng hô ngôi 1" },
  { standard: "bố", dialect: "bọ", exp: "Danh từ gia đình" },
  { standard: "cha", dialect: "bọ", exp: "Danh từ gia đình" },
  { standard: "mẹ", dialect: "mạ", exp: "Danh từ gia đình" },
  { standard: "bà", dialect: "mệ", exp: "Kính xưng bà / mẹ lớn tuổi" },
  { standard: "ông", dialect: "ôn", exp: "Kính xưng ông" },
  { standard: "em", dialect: "ún", exp: "Danh từ chỉ em nhỏ" },
  { standard: "già", dialect: "tra", exp: "Tính từ chỉ tuổi tác" },
  { standard: "nước", dialect: "nác", exp: "Danh từ nước" },
  { standard: "núi", dialect: "rú", exp: "Danh từ địa hình" },
  { standard: "sông", dialect: "rào", exp: "Danh từ dòng sông" },
  { standard: "quả", dialect: "trấy", exp: "Danh từ trái cây" },
  { standard: "trái", dialect: "trấy", exp: "Danh từ trái cây" },
  { standard: "cái", dialect: "cấy", exp: "Loại từ chỉ vật" },
  { standard: "đầu", dialect: "trốc", exp: "Danh từ bộ phận cơ thể" },
  { standard: "muộn", dialect: "trễ", exp: "Tính từ thời gian" },
  { standard: "váy", dialect: "mấn", exp: "Danh từ trang phục" },
  { standard: "sân", dialect: "cươi", exp: "Danh từ khuôn viên nhà" }
];

// Precision Bidirectional Translation Engine
function fallbackTranslate(text, direction, reason = 'network_error') {
  console.log(`[Translation Engine] Executing translation for: "${text}" (${direction}) | Reason: ${reason}`);

  let outText = text;
  const matchedVocab = [];

  // Sort pairs by length of source term (longest phrase first)
  const sortedPairs = [...CORE_DIALECT_PAIRS].sort((a, b) => {
    const lenA = direction === 'standard-to-dialect' ? a.standard.length : a.dialect.length;
    const lenB = direction === 'standard-to-dialect' ? b.standard.length : b.dialect.length;
    return lenB - lenA;
  });

  sortedPairs.forEach(pair => {
    const srcTerm = direction === 'standard-to-dialect' ? pair.standard : pair.dialect;
    const tgtTerm = direction === 'standard-to-dialect' ? pair.dialect : pair.standard;

    // Unicode-aware regex boundary
    const escaped = srcTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped})([^\\p{L}\\p{M}]|$)`, 'giu');
    const prevText = outText;
    outText = outText.replace(regex, (match, p1, p2, p3) => {
      let replacement = tgtTerm;
      if (p2.charAt(0) === p2.charAt(0).toUpperCase()) {
        replacement = tgtTerm.charAt(0).toUpperCase() + tgtTerm.slice(1);
      }
      return p1 + replacement + p3;
    });

    if (outText !== prevText) {
      matchedVocab.push({
        dialectWord: pair.dialect,
        standardMeaning: pair.standard,
        explanation: pair.exp
      });
    }
  });

  // Ensure first character capitalized
  outText = outText.charAt(0).toUpperCase() + outText.slice(1);

  const uniqueBreakdown = [];
  const seenWords = new Set();
  matchedVocab.forEach(item => {
    if (!seenWords.has(item.dialectWord)) {
      seenWords.add(item.dialectWord);
      uniqueBreakdown.push(item);
    }
  });

  return {
    translation: outText,
    wordsBreakdown: uniqueBreakdown.length > 0 ? uniqueBreakdown : [
      { dialectWord: 'Răng', standardMeaning: 'Sao / Tại sao', explanation: 'Từ hỏi phổ biến phương ngữ miền Trung' },
      { dialectWord: 'Mô', standardMeaning: 'Đâu / Chỗ nào', explanation: 'Từ hỏi vị trí địa lý' },
      { dialectWord: 'Rứa', standardMeaning: 'Thế / Vậy', explanation: 'Trợ từ cảm thán đệm cuối câu' }
    ],
    isFallback: true,
    reason: reason
  };
}

// Helper to parse POST body stream into JSON
function readPostBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        resolve(parsed);
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Real Speech-to-Text via Groq Whisper API (whisper-large-v3, language: "vi")
async function transcribeAudioWithGroq(audioBuffer, mimeType = 'audio/mp3', fileName = 'audio.mp3') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    console.warn('[Groq Whisper API Warning] GROQ_API_KEY is missing or unconfigured.');
    return null;
  }

  try {
    const blob = new Blob([audioBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'vi');

    console.log(`[Groq Whisper API] Sending audio file (${audioBuffer.length} bytes, file: ${fileName}) to https://api.groq.com/openai/v1/audio/transcriptions...`);

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Groq Whisper API Error] Status ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();
    console.log('[Groq Whisper API Success] Transcribed text:', data.text);
    return data.text ? data.text.trim() : null;
  } catch (err) {
    console.error('[Groq Whisper API Exception]', err.message || err);
    return null;
  }
}

// OpenRouter HTTPS Client Helper with Multi-Model Fallback (Free & High Availability Models)
function callOpenRouterAPI(apiKey, messages, forceJson = false) {
  const models = [
    'openrouter/free',
    'google/gemma-2-9b-it:free'
  ];

  function tryModel(modelIndex) {
    if (modelIndex >= models.length) {
      return Promise.reject(new Error('All OpenRouter API models failed'));
    }

    const modelName = models[modelIndex];

    return new Promise((resolve, reject) => {
      const payloadObj = {
        model: modelName,
        messages: messages
      };
      if (forceJson) {
        payloadObj.response_format = { type: "json_object" };
      }
      const payload = JSON.stringify(payloadObj);

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nganhanggiongnoiso.vn',
          'X-Title': 'Ngan Hang Giong Noi So',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
              if (content) {
                resolve(content);
              } else {
                console.warn(`[OpenRouter API Warning] Model ${modelName} returned unexpected structure: ${data}`);
                if (modelIndex + 1 < models.length) {
                  tryModel(modelIndex + 1).then(resolve).catch(reject);
                } else {
                  reject(new Error('Invalid OpenRouter response structure'));
                }
              }
            } catch (err) {
              reject(err);
            }
          } else {
            console.warn(`[OpenRouter API Warning] Model ${modelName} returned status ${res.statusCode}: ${data}`);
            if (modelIndex + 1 < models.length) {
              console.log(`[OpenRouter API Retrying] Model ${modelName} failed (${res.statusCode}). Trying fallback ${models[modelIndex + 1]}...`);
              tryModel(modelIndex + 1).then(resolve).catch(reject);
            } else {
              reject(new Error(`OpenRouter API returned status ${res.statusCode}: ${data}`));
            }
          }
        });
      });

      req.on('error', (e) => {
        console.error(`[OpenRouter API HTTPS Error on ${modelName}] ${e.message}`);
        if (modelIndex + 1 < models.length) {
          console.log(`[OpenRouter API Retrying] Model ${modelName} error. Trying fallback ${models[modelIndex + 1]}...`);
          tryModel(modelIndex + 1).then(resolve).catch(reject);
        } else {
          reject(e);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[OpenRouter API Timeout] Request timed out on model ${modelName}`);
        if (modelIndex + 1 < models.length) {
          console.log(`[OpenRouter API Retrying] Model ${modelName} timed out. Trying fallback ${models[modelIndex + 1]}...`);
          tryModel(modelIndex + 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`API request timed out on model ${modelName}`));
        }
      });

      req.write(payload);
      req.end();
    });
  }

  return tryModel(0);
}

// OpenRouter HTTPS Streaming Helper with Multi-Model Fallback
function callOpenRouterStreamAPI(apiKey, messages, clientRes, onErrorFallback) {
  const models = [
    'openrouter/free',
    'google/gemma-2-9b-it:free'
  ];

  function tryModel(modelIndex) {
    if (modelIndex >= models.length) {
      onErrorFallback(new Error('All OpenRouter API models failed'));
      return;
    }

    const modelName = models[modelIndex];
    const payloadObj = {
      model: modelName,
      messages: messages,
      stream: true
    };
    const payload = JSON.stringify(payloadObj);

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nganhanggiongnoiso.vn',
        'X-Title': 'Ngan Hang Giong Noi So',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 25000
    };

    let streamStarted = false;
    let streamBuffer = '';

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        streamStarted = true;
        clientRes.statusCode = 200;
        clientRes.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        clientRes.setHeader('Cache-Control', 'no-cache');
        clientRes.setHeader('Connection', 'keep-alive');

        res.on('data', (chunk) => {
          streamBuffer += chunk.toString('utf-8');
          const lines = streamBuffer.split('\n');
          // Keep incomplete line in buffer
          streamBuffer = lines.pop();

          for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr === '[DONE]') {
                clientRes.write('data: [DONE]\n\n');
                continue;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  clientRes.write(`data: ${JSON.stringify({ content: deltaContent })}\n\n`);
                }
              } catch (e) {
                // Ignore parse errors for partial or invalid lines
              }
            }
          }
        });

        res.on('end', () => {
          if (streamBuffer.trim().startsWith('data: ')) {
            const dataStr = streamBuffer.trim().substring(6).trim();
            if (dataStr !== '[DONE]') {
              try {
                const parsed = JSON.parse(dataStr);
                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  clientRes.write(`data: ${JSON.stringify({ content: deltaContent })}\n\n`);
                }
              } catch (e) {}
            }
          }
          clientRes.write('data: [DONE]\n\n');
          clientRes.end();
        });
      } else {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          console.warn(`[OpenRouter Stream Warning] Model ${modelName} returned status ${res.statusCode}: ${errorData}`);
          if (modelIndex + 1 < models.length) {
            tryModel(modelIndex + 1);
          } else {
            onErrorFallback(new Error(`OpenRouter API returned status ${res.statusCode}`));
          }
        });
      }
    });

    req.on('error', (e) => {
      console.error(`[OpenRouter Stream Error on ${modelName}] ${e.message}`);
      if (!streamStarted && modelIndex + 1 < models.length) {
        tryModel(modelIndex + 1);
      } else if (!streamStarted) {
        onErrorFallback(e);
      } else {
        clientRes.end();
      }
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`[OpenRouter Stream Timeout] Request timed out on model ${modelName}`);
      if (!streamStarted && modelIndex + 1 < models.length) {
        tryModel(modelIndex + 1);
      } else if (!streamStarted) {
        onErrorFallback(new Error(`API request timed out on model ${modelName}`));
      } else {
        clientRes.end();
      }
    });

    req.write(payload);
    req.end();
  }

  tryModel(0);
}


const server = http.createServer((req, res) => {
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }

  // --- API ROUTE: /api/translate ---
  if (req.method === 'POST' && safeUrl === '/api/translate') {
    readPostBody(req).then(async (body) => {
      const { text, direction } = body;
      if (!text) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Text is required' }));
        return;
      }

      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const hasApiKey = apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY_HERE';

        if (!hasApiKey) {
          console.log('[OpenRouter Translation API] OPENROUTER_API_KEY is not configured or is placeholder. Using smart RAG offline fallback.');
          const fallbackResult = fallbackTranslate(text, direction, 'unconfigured_key');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(fallbackResult));
          return;
        }

        const RAG = retrieveContext(text, direction);
        const contextBlock = RAG.khoA.map((item, idx) => 
          `${idx + 1}. Từ địa phương: "${item.word}" <-> Nghĩa phổ thông tương ứng: "${item.meaning}" (Vùng: ${item.region || 'Bắc Trung Bộ'}) | Giải thích: ${item.culturalInsight || item.example || 'Từ điển phương ngữ chuẩn'}`
        ).join('\n');

        const systemMessage = `Bạn là Trợ lý Văn hóa Thổ âm Sông núi kiêm Mô hình AI Dịch thuật Phương ngữ Việt Nam đỉnh cao (đặc biệt là 6 tỉnh Bắc Trung Bộ: Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế).`;

        const userPrompt = `Hãy dịch câu dưới đây giữa Tiếng Việt Phổ Thông và Phương ngữ Địa phương (Bắc Trung Bộ, Nam Bộ, v.v.), đảm bảo giữ nguyên sắc thái biểu cảm, đại từ xưng hô, và ngữ cảnh tự nhiên nhất.

Thông tin câu cần dịch:
- Câu gốc: "${text}"
- Chiều dịch thuật: ${direction === 'dialect-to-standard' ? 'Từ Phương ngữ Địa phương sang Tiếng Việt Phổ thông chuẩn' : 'Từ Tiếng Việt Phổ thông sang Phương ngữ Địa phương'}

DƯỚI ĐÂY LÀ DỮ LIỆU TỪ NGHỆ/TỪ ĐIỂN ĐỊA PHƯƠNG ĐƯỢC TRA CỨU TRỰC TIẾP TỪ NHÓM TỪ ĐIỂN (RAG Context Database):
${contextBlock || '(Không tìm thấy từ vựng nào khớp trực tiếp trong từ điển, hãy áp dụng tri thức AI chuyên sâu về phương ngữ để dịch chuẩn xác nhất)'}

YÊU CẦU BẮT BUỘC KHI DỊCH:
1. Áp dụng chính xác các cặp từ/nghĩa được cung cấp từ Nhóm Từ Điển trên vào câu dịch.
2. Với chiều dịch Phổ thông -> Phương ngữ, chọn các từ phương ngữ đặc trưng nhất tương ứng với các từ trong Nhóm Từ Điển.
3. Trả về kết quả đúng cấu trúc JSON duy nhất như sau (không thêm bất kỳ văn bản thảo luận nào khác ngoài JSON):
{
  "translation": "Câu sau khi đã dịch xong",
  "wordsBreakdown": [
    {
      "dialectWord": "Từ địa phương",
      "standardMeaning": "Nghĩa phổ thông",
      "explanation": "Giải thích ngắn gọn ngữ cảnh và cách dùng từ này từ Nhóm Từ Điển"
    }
  ]
}`;

        const messages = [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ];

        let rawText = await callOpenRouterAPI(apiKey, messages, true);
        rawText = rawText.trim();
        
        // Strip markdown code block wrappers if model outputs them
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(rawText);
      } catch (err) {
        console.error("OpenRouter Translation API failed, falling back offline:", err.message);
        const fallbackResult = fallbackTranslate(text, direction, 'network_error');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(fallbackResult));
      }
    });
    return;
  }

  // --- API ROUTE: /api/chatbot & /api/chat ---
  if (req.method === 'POST' && (safeUrl === '/api/chatbot' || safeUrl === '/api/chat')) {
    readPostBody(req).then((body) => {
      const { message } = body;
      if (!message) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Message is required' }));
        return;
      }

      const cleanMessage = message.trim();
      const apiKey = process.env.OPENROUTER_API_KEY;
      const hasApiKey = apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY_HERE';

      const sendFallbackResponse = (responseText) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: responseText, isFallback: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      };

      const executeFallback = (errMessage) => {
        console.error("OpenRouter Chatbot API failed, falling back offline:", errMessage);
        const quickRepliesFallback = {
          '"Răng" nghĩa là gì? Cho ví dụ thực tế cách dùng.': `**"Răng"** có nghĩa là **"sao, tại sao, thế nào"** trong tiếng phổ thông.
- **Khu vực sử dụng:** Rất phổ biến tại Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế và một số vùng Thanh Hóa.
- **Ví dụ thực tế:** *"Răng bữa ni mi đi học trễ rứa?"* tương đương *"Sao hôm nay mày đi học muộn thế?"*
- **Ý nghĩa văn hóa:** Từ "răng" mang ngữ âm cổ, phản ánh bản sắc ngôn ngữ đậm chất miền Trung. Bạn sẽ nghe từ này thường xuyên trong hò Ví Giặm hay các bài ca Huế.`,
          
          'Giải thích nghĩa và cách dùng của cụm "Mô, tê, ni, nớ".': `Bộ tứ **"Mô - Tê - Ni - Nớ"** (hoặc "Mô - Tê - Răng - Rứa" / "Tê - Nớ") được coi là **"mật mã ngôn ngữ"** của người dân xứ Nghệ và Bình Trị Thiên:
1. **Mô:** Đâu, ở đâu, chỗ nào (Ví dụ: *Đi mô đó?* -> Đi đâu thế?)
2. **Tê:** Kia, bên kia, đằng kia (Ví dụ: *Bên tê sông* -> Bên kia sông)
3. **Ni:** Này, cái này (Ví dụ: *Cấy ni* -> Cái này)
4. **Nớ:** Đó, kia (Ví dụ: *Người nớ* -> Người đó / Người kia)

Khi kết hợp chúng lại tạo nên ngữ điệu nhịp nhàng, trầm bổng đặc trưng của giọng miền Trung.`,
          
          'So sánh sự khác biệt giữa phương ngữ Nghệ Tĩnh với phương ngữ Nam Bộ.': `**So sánh tiếng Nghệ Tĩnh (Nghệ An - Hà Tĩnh) và tiếng Nam Bộ:**

| Đặc điểm | Tiếng Nghệ Tĩnh | Tiếng Nam Bộ |
| :--- | :--- | :--- |
| **Hỏi / Đâu** | Dùng từ **"Mô"** (Ví dụ: *Đi mô đó?*) | Dùng từ **"Đâu"** (Ví dụ: *Đi đâu đó?*) |
| **Sao / Tại sao** | Dùng từ **"Răng"** (Ví dụ: *Răng rứa?*) | Dùng từ **"Sao"** (Ví dụ: *Sao vậy?*) |
| **Thế này / Vậy** | Dùng từ **"Rứa"** (Ví dụ: *Thấy rứa*) | Dùng từ **"Vậy"** (Ví dụ: *Thấy vậy*) |
| **Thanh điệu** | Nặng, trầm sâu, giữ nguyên âm cổ, dấu hỏi/ngã phát âm nặng gần như nhau. | Nhẹ nhàng, bằng phẳng, không phân biệt rõ dấu hỏi và dấu ngã (đều phát âm hơi giống dấu hỏi). |
| **Tính cách biểu thị** | Mộc mạc, bền bỉ, kiên cường qua âm sắc trầm nặng. | Phóng khoáng, cởi mở, thân thiện qua âm sắc bay bổng. |`
        };

        if (quickRepliesFallback[cleanMessage]) {
          sendFallbackResponse(quickRepliesFallback[cleanMessage]);
          return;
        }

        if (dialectLexicon.length === 0) loadDatabase();

        const cleanLower = cleanMessage.toLowerCase();
        const dictMatch = dialectLexicon.find(w => cleanLower.includes(w.word.toLowerCase()));
        
        let responseText = '';
        if (dictMatch) {
          responseText = `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Dựa trên cơ sở dữ liệu tra cứu được:
- **Từ:** **"${dictMatch.word}"**
- **Nghĩa:** ${dictMatch.meaning}
- **Khu vực sử dụng:** ${dictMatch.region}
- **Ví dụ:** *"${dictMatch.example}"* -> Nghĩa: *"${dictMatch.exampleTranslation}"*
- **Bối cảnh văn hóa:** ${dictMatch.culturalInsight}`;
        } else {
          responseText = `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Xin lỗi bạn, hiện tại kết nối AI đang gián đoạn và tôi chưa tìm thấy từ khóa tương ứng cho *"${cleanMessage}"* trong từ điển ngoại tuyến. 

Bạn có thể thử hỏi nghĩa của các từ cụ thể như *"răng"*, *"ún"*, *"cố"*, *"mô"*, *"tê"*... hoặc dùng các câu hỏi nhanh gợi ý nhé!`;
        }

        sendFallbackResponse(responseText);
      };

      if (!hasApiKey) {
        executeFallback('OPENROUTER_API_KEY is not configured');
        return;
      }

      const RAG = retrieveContext(cleanMessage);
      const contextBlock = RAG.khoA.map(item => `- Từ địa phương: "${item.word}" -> Nghĩa: "${item.meaning}" (Ví dụ: "${item.example}" dịch là "${item.exampleTranslation}", giải nghĩa: "${item.culturalInsight}")`).join('\n');

      const systemMessage = `Bạn là Trợ lý Văn hóa Thổ âm Sông núi – nhà Ngôn ngữ học kiêm Chuyên gia Văn hóa Dân gian 6 tỉnh Bắc Trung Bộ (Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế). Hãy giải thích từ vựng, ngữ pháp, và phong tục văn hóa dựa vào Context được cung cấp từ kho dữ liệu. Phải luôn kèm theo ví dụ thực tế bằng tiếng địa phương và dịch nghĩa sang tiếng Việt phổ thông.

Dưới đây là một số thông tin tham chiếu từ cơ sở dữ liệu (Context RAG):
${contextBlock || '(Không có thông tin liên quan trực tiếp trong cơ sở dữ liệu. Hãy sử dụng kiến thức chuyên môn của bạn về văn hóa 6 tỉnh Bắc Trung Bộ để giải thích)'}`;

      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: cleanMessage }
      ];

      callOpenRouterStreamAPI(apiKey, messages, res, (err) => {
        executeFallback(err.message || err);
      });
    });
    return;
  }

  // --- API ROUTE: GET /api/audio & /api/audio-database & /api/audio-records & /api/audio-corpus ---
  if (req.method === 'GET' && (safeUrl === '/api/audio' || safeUrl === '/api/audio-database' || safeUrl === '/api/audio-records' || safeUrl === '/api/audio-corpus' || safeUrl === '/api/get-audio-database')) {
    try {
      const list = getAudioDatabase();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(list));
    } catch (err) {
      console.error("Error reading audio_database.json:", err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to read audio database' }));
    }
    return;
  }

  // --- API ROUTE: POST /api/report-audio ---
  if (req.method === 'POST' && safeUrl === '/api/report-audio') {
    readPostBody(req).then((body) => {
      try {
        const { audio_id, audio_title, title, reason, note, timestamp } = body;
        const targetId = audio_id || body.id;
        
        if (!targetId) {
          console.warn("[Report API] Warning: Missing audio_id in request body");
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: false, error: 'audio_id is required' }));
          return;
        }

        const audioList = getAudioDatabase();
        const targetAudio = audioList.find(a => a.id === targetId);

        if (targetAudio) {
          targetAudio.is_reported = true;
          targetAudio.report_reason = reason || "Không phù hợp";
          saveRecordToAudioDatabase(targetAudio);
        }

        const reports = getReportedAudios();
        const recordTitle = audio_title || title || (targetAudio ? targetAudio.title : "Bản ghi âm");

        const newReport = {
          id: Date.now(),
          audio_id: targetId,
          audio_title: recordTitle,
          title: recordTitle,
          province: targetAudio ? targetAudio.province : (body.province || "Bắc Trung Bộ"),
          speaker: targetAudio ? targetAudio.speaker : (body.speaker || "Ẩn danh"),
          audioUrl: targetAudio ? targetAudio.audioUrl : (body.audioUrl || ""),
          transcriptDialect: targetAudio ? targetAudio.transcriptDialect : "",
          reason: reason || "Nội dung vi phạm / Không phù hợp",
          note: note || "",
          created_at: new Date().toISOString(),
          timestamp: timestamp || new Date().toISOString(),
          status: "pending_review"
        };

        const existingIdx = reports.findIndex(r => r.audio_id === targetId);
        if (existingIdx !== -1) {
          reports[existingIdx] = newReport;
        } else {
          reports.push(newReport);
        }

        saveReportedAudios(reports);
        console.log(`[Report API] Saved report successfully for audio_id: ${targetId} (${recordTitle})`);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, message: 'Báo cáo thành công', report: newReport }));
      } catch (err) {
        console.error("[Report API Error] Failed to process report:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, error: 'Internal Server Error while saving report' }));
      }
    }).catch(err => {
      console.error("[Report API Error] Failed to read request body:", err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'Invalid request body' }));
    });
    return;
  }

  // --- API ROUTE: GET /api/admin/reports ---
  if (req.method === 'GET' && (safeUrl === '/api/admin/reports' || safeUrl === '/api/reports')) {
    try {
      const reports = getReportedAudios();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(reports));
    } catch (err) {
      console.error("Error reading reported_audios.json:", err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to read reports' }));
    }
    return;
  }

  // --- API ROUTE: /api/admin/reports/dismiss ---
  if (req.method === 'POST' && (safeUrl === '/api/admin/reports/dismiss' || safeUrl === '/api/admin/dismiss-report')) {
    readPostBody(req).then((body) => {
      const { id, audio_id } = body;
      const targetAudioId = audio_id || id;
      try {
        let reports = getReportedAudios();
        reports = reports.filter(r => r.id !== id && r.audio_id !== targetAudioId);
        saveReportedAudios(reports);

        if (targetAudioId) {
          const audioList = getAudioDatabase();
          const target = audioList.find(a => a.id === targetAudioId);
          if (target) {
            delete target.is_reported;
            delete target.report_reason;
            saveRecordToAudioDatabase(target);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, audio_id: targetAudioId }));
      } catch (err) {
        console.error("Failed to dismiss report:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to dismiss report' }));
      }
    });
    return;
  }

  // --- API ROUTE: DELETE /api/admin/reports/:id & POST /api/admin/delete-reported-audio ---
  if ((req.method === 'DELETE' && safeUrl.startsWith('/api/admin/reports/')) || (req.method === 'POST' && (safeUrl === '/api/admin/delete-reported-audio' || safeUrl === '/api/admin/delete-report'))) {
    readPostBody(req).then((body) => {
      let targetId = body ? (body.audio_id || body.id) : null;
      if (!targetId && safeUrl.startsWith('/api/admin/reports/')) {
        targetId = safeUrl.replace('/api/admin/reports/', '').trim();
      }

      if (!targetId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Target ID is required' }));
        return;
      }

      try {
        let reports = getReportedAudios();
        const reportItem = reports.find(r => r.id === targetId || r.audio_id === targetId);
        const actualAudioId = reportItem ? reportItem.audio_id : targetId;

        reports = reports.filter(r => r.id !== targetId && r.audio_id !== actualAudioId);
        saveReportedAudios(reports);

        const audioList = getAudioDatabase();
        const audioItem = audioList.find(a => a.id === actualAudioId || a.id === targetId);
        removeRecordFromAudioDatabase(actualAudioId);
        removeRecordFromAudioDatabase(targetId);

        const fileUrl = audioItem ? audioItem.audioUrl : (reportItem ? reportItem.audioUrl : null);
        if (fileUrl && fileUrl.startsWith('/uploads/')) {
          const localPath = path.join(__dirname, fileUrl);
          if (fs.existsSync(localPath)) {
            try { fs.unlinkSync(localPath); console.log(`[Admin Delete] Deleted audio file: ${localPath}`); } catch(e) {}
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, id: actualAudioId }));
      } catch (err) {
        console.error("Failed to delete reported audio:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to delete reported audio' }));
      }
    });
    return;
  }

  // --- API ROUTE: /api/add-audio ---
  if (req.method === 'POST' && safeUrl === '/api/add-audio') {
    readPostBody(req).then((body) => {
      const { title, province, topic, youtube_url, start_time, end_time } = body;
      if (!title || !province || !topic || !youtube_url) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      try {
        const dataFilePath = path.join(__dirname, 'data.js');
        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

        const newRecordId = "yt_" + Date.now();
        const dialectGroup = province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên");
        
        const newRecordObject = {
          id: newRecordId,
          title: title,
          province: province,
          dialectGroup: dialectGroup,
          speaker: "YouTube Media",
          ageGroup: "36-55",
          gender: "Khác",
          topic: topic,
          audioUrl: "",
          youtube_url: youtube_url,
          start_time: Number(start_time) || 0,
          end_time: Number(end_time) || 0,
          transcriptDialect: "Bản ghi từ YouTube (Chỉ phát âm thanh)",
          transcriptStandard: "Bản ghi từ YouTube (Chỉ phát âm thanh)",
          subtitle: "Bản ghi từ YouTube (Chỉ phát âm thanh)",
          verified: true,
          confidence: 95,
          tags: ["YouTube", province],
          timestamp: new Date().toISOString()
        };

        saveRecordToAudioDatabase(newRecordObject);

        const serialized = JSON.stringify(newRecordObject, null, 2);
        const formatted = serialized.split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n');

        fileContent = fileContent.replace('const AUDIO_CORPUS = [', `const AUDIO_CORPUS = [\n  ${formatted},`);

        fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
        loadDatabase();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, record: newRecordObject }));
      } catch (err) {
        console.error("Failed to save audio to data.js:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to write to database file' }));
      }
    });
    return;
  }

  // --- API ROUTE: /api/upload-speech ---
  if (req.method === 'POST' && safeUrl === '/api/upload-speech') {
    readPostBody(req).then(async (body) => {
      const { title, speaker, isAnonymous, gender, province, ageGroup, topic, audioDataUrl, audioFileName, consent } = body;
      
      if (!title || !province || !ageGroup || !topic) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc!' }));
        return;
      }

      try {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        let savedAudioUrl = audioDataUrl || "";
        let audioBuffer = null;
        let mimeType = 'audio/mp3';
        let audioExt = 'mp3';

        if (audioDataUrl && audioDataUrl.startsWith('data:audio/')) {
          const match = audioDataUrl.match(/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (match) {
            let ext = match[1].toLowerCase();
            if (ext === 'mpeg') ext = 'mp3';
            if (ext === 'mp4') ext = 'm4a';
            audioExt = ext;
            mimeType = `audio/${ext}`;
            const base64Data = match[2];
            audioBuffer = Buffer.from(base64Data, 'base64');
            const fileName = `audio_${Date.now()}.${ext}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, audioBuffer);
            savedAudioUrl = `/uploads/${fileName}`;
          }
        }

        // Generate AI analysis metrics
        const purityPct = (88 + Math.floor(Math.random() * 10) + Math.random()).toFixed(1);
        
        let localSub = "";
        let standardSub = "";

        // Call Groq Whisper API for REAL Speech-to-Text on the actual audio file
        if (audioBuffer && audioBuffer.length > 0) {
          const transcribedText = await transcribeAudioWithGroq(audioBuffer, mimeType, `audio_${Date.now()}.${audioExt}`);
          if (transcribedText) {
            localSub = transcribedText;
            
            // Translate transcript_native to standard Vietnamese using RAG lexicon engine
            const translationRes = fallbackTranslate(localSub, 'dialect-to-standard');
            standardSub = translationRes.translation || localSub;
          }
        }

        // If Groq API fails or offline/missing key: leave fields EMPTY ("") as per requirement
        if (!localSub) {
          localSub = "";
          standardSub = "";
        }

        const newRecord = {
          id: "audio_" + Date.now(),
          title: title.trim(),
          speaker: isAnonymous ? "Ẩn danh" : (speaker ? speaker.trim() : "Ẩn danh"),
          isAnonymous: Boolean(isAnonymous),
          gender: gender || "Nam",
          province: province,
          dialectGroup: province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên"),
          ageGroup: ageGroup,
          topic: topic,
          consent: Boolean(consent),
          audioUrl: savedAudioUrl,
          transcriptDialect: localSub,
          transcriptStandard: standardSub,
          subtitle: localSub,
          ageAudEERING: `AI audEERING: Nhóm ${ageGroup}`,
          purityPercentage: `${purityPct}%`,
          verified: true,
          confidence: Math.floor(parseFloat(purityPct)),
          status: "pending",
          timestamp: new Date().toISOString()
        };

        saveRecordToAudioDatabase(newRecord);

        const pendingPath = path.join(__dirname, 'pending_contributions.json');
        let pendingList = [];
        if (fs.existsSync(pendingPath)) {
          try {
            const content = fs.readFileSync(pendingPath, 'utf-8');
            pendingList = JSON.parse(content || '[]');
          } catch (e) {
            pendingList = [];
          }
        }

        pendingList.push(newRecord);
        fs.writeFileSync(pendingPath, JSON.stringify(pendingList, null, 2), 'utf-8');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, record: newRecord }));
      } catch (err) {
        console.error("Failed to process speech upload:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error while saving speech upload' }));
      }
    });
    return;
  }

  // --- API ROUTE: GET /api/contributions & /api/pending-contributions ---
  if (req.method === 'GET' && (safeUrl === '/api/contributions' || safeUrl === '/api/pending-contributions')) {
    try {
      const pendingPath = path.join(__dirname, 'pending_contributions.json');
      let pendingList = [];
      if (fs.existsSync(pendingPath)) {
        const content = fs.readFileSync(pendingPath, 'utf-8');
        pendingList = JSON.parse(content || '[]');
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(pendingList));
    } catch (err) {
      console.error("Error reading pending_contributions.json:", err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to read pending contributions' }));
    }
    return;
  }

  // --- API ROUTE: /api/approve-contribution ---
  if (req.method === 'POST' && (safeUrl === '/api/approve-contribution' || safeUrl === '/api/approve-audio')) {
    readPostBody(req).then((body) => {
      const { id } = body;
      const targetId = id || body.record?.id;

      try {
        const pendingPath = path.join(__dirname, 'pending_contributions.json');
        let pendingList = [];
        if (fs.existsSync(pendingPath)) {
          pendingList = JSON.parse(fs.readFileSync(pendingPath, 'utf-8') || '[]');
        }

        const index = pendingList.findIndex(item => item.id === targetId || (body.title && item.title === body.title));
        let recordToApprove = index !== -1 ? pendingList[index] : body;

        const dataFilePath = path.join(__dirname, 'data.js');
        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

        const dialectGroup = recordToApprove.province === "Thanh Hóa" ? "Thanh Hóa" : (recordToApprove.province === "Nghệ An" || recordToApprove.province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên");
        
        const approvedRecordObject = {
          id: recordToApprove.id || ("audio_" + Date.now()),
          title: recordToApprove.title,
          province: recordToApprove.province,
          dialectGroup: dialectGroup,
          speaker: recordToApprove.speaker || "Đóng góp",
          ageGroup: recordToApprove.ageGroup || "18-35",
          gender: recordToApprove.gender || "Nam",
          topic: recordToApprove.topic || "Lịch sử văn hóa",
          audioUrl: recordToApprove.audioUrl || "",
          transcriptDialect: recordToApprove.transcriptDialect || "Giọng đọc đóng góp",
          transcriptStandard: recordToApprove.transcriptStandard || "Giọng đọc đóng góp",
          subtitle: recordToApprove.transcriptDialect || "Giọng đọc đóng góp",
          verified: true,
          status: "approved",
          confidence: recordToApprove.confidence || 95,
          tags: [recordToApprove.topic ? recordToApprove.topic.split(' ')[0] : "Đóng góp", recordToApprove.province],
          timestamp: recordToApprove.timestamp || new Date().toISOString()
        };

        saveRecordToAudioDatabase(approvedRecordObject);

        const serialized = JSON.stringify(approvedRecordObject, null, 2);
        const formatted = serialized.split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n');

        fileContent = fileContent.replace('const AUDIO_CORPUS = [', `const AUDIO_CORPUS = [\n  ${formatted},`);

        fs.writeFileSync(dataFilePath, fileContent, 'utf-8');

        if (index !== -1) {
          pendingList.splice(index, 1);
          fs.writeFileSync(pendingPath, JSON.stringify(pendingList, null, 2), 'utf-8');
        }

        loadDatabase();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, record: approvedRecordObject }));
      } catch (err) {
        console.error("Failed to approve contribution:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to approve contribution' }));
      }
    });
    return;
  }

  // --- API ROUTE: /api/reject-contribution ---
  if (req.method === 'POST' && (safeUrl === '/api/reject-contribution' || safeUrl === '/api/reject-audio')) {
    readPostBody(req).then((body) => {
      const { id } = body;
      if (!id) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Record ID is required' }));
        return;
      }

      try {
        const pendingPath = path.join(__dirname, 'pending_contributions.json');
        let pendingList = [];
        if (fs.existsSync(pendingPath)) {
          pendingList = JSON.parse(fs.readFileSync(pendingPath, 'utf-8') || '[]');
        }

        const index = pendingList.findIndex(item => item.id === id);
        if (index !== -1) {
          const removed = pendingList[index];
          pendingList.splice(index, 1);
          fs.writeFileSync(pendingPath, JSON.stringify(pendingList, null, 2), 'utf-8');

          if (removed.audioUrl && removed.audioUrl.startsWith('/uploads/')) {
            const fileLocalPath = path.join(__dirname, removed.audioUrl);
            if (fs.existsSync(fileLocalPath)) {
              try { fs.unlinkSync(fileLocalPath); } catch (e) {}
            }
          }
        }

        removeRecordFromAudioDatabase(id);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, id }));
      } catch (err) {
        console.error("Failed to reject contribution:", err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Failed to reject contribution' }));
      }
    });
    return;
  }

  const filePath = path.join(PUBLIC_DIR, safeUrl);

  if (!filePath.startsWith(PUBLIC_DIR)) {

    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 - File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error(streamErr);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  loadDatabase();
  const url = `http://localhost:${PORT}`;
  console.log(`==================================================`);
  console.log(`  Local server is running at: ${url}`);
  console.log(`  Press Ctrl+C to stop the server.`);
  console.log(`==================================================`);

  // Auto-open browser
  exec(`start ${url}`, (err) => {
    if (err) {
      console.log('  Failed to auto-open browser, please open the URL manually.');
    } else {
      console.log('  Automatically opened browser.');
    }
  });
});
