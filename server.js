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
  '.ico': 'image/x-icon'
};

// Shared Database Loader (loads data.js via secure vm context)
let dialectLexicon = [];
let audioCorpus = [];
let chatbotRagDatabase = [];

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

// Google AI Studio (Gemini) HTTPS Client Helper with Multi-Model Fallback
function callGeminiAPI(apiKey, prompt, forceJson) {
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  function tryModel(modelIndex) {
    if (modelIndex >= models.length) {
      return Promise.reject(new Error('All Gemini API models failed'));
    }

    const modelName = models[modelIndex];

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: forceJson ? {
          responseMimeType: "application/json"
        } : undefined
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 12000
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            console.warn(`[Gemini API Warning] Model ${modelName} returned status ${res.statusCode}: ${data}`);
            if ((res.statusCode === 404 || res.statusCode === 400) && modelIndex + 1 < models.length) {
              console.log(`[Gemini API Retrying] Trying next model fallback ${models[modelIndex + 1]}...`);
              tryModel(modelIndex + 1).then(resolve).catch(reject);
            } else {
              reject(new Error(`API returned status ${res.statusCode}: ${data}`));
            }
          }
        });
      });

      req.on('error', (e) => {
        console.error(`[Gemini API HTTPS Error] ${e.message}`);
        reject(e);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`API request timed out on model ${modelName}`));
      });

      req.write(payload);
      req.end();
    });
  }

  return tryModel(0);
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
        const apiKey = process.env.GEMINI_API_KEY;
        const hasApiKey = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

        if (!hasApiKey) {
          console.log('[Gemini Translation API] GEMINI_API_KEY is not configured or is placeholder. Using smart RAG offline fallback.');
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

        const prompt = `Bạn là Chuyên gia Ngôn ngữ học kiêm Mô hình AI Dịch thuật Phương ngữ Việt Nam đỉnh cao.
Hãy dịch câu dưới đây giữa Tiếng Việt Phổ Thông và Phương ngữ Địa phương (Bắc Trung Bộ, Nam Bộ, v.v.), đảm bảo giữ nguyên sắc thái biểu cảm, đại từ xưng hô, và ngữ cảnh tự nhiên nhất.

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

        const responseText = await callGeminiAPI(apiKey, prompt, true);
        const parsedResponse = JSON.parse(responseText);
        let rawText = parsedResponse.candidates[0].content.parts[0].text.trim();
        
        // Strip markdown code block wrappers if Gemini outputs them
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(rawText);
      } catch (err) {
        console.error("Gemini Translation API failed, falling back offline:", err.message);
        const fallbackResult = fallbackTranslate(text, direction, 'network_error');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(fallbackResult));
      }
    });
    return;
  }

  // --- API ROUTE: /api/chatbot ---
  if (req.method === 'POST' && safeUrl === '/api/chatbot') {
    readPostBody(req).then(async (body) => {
      const { message } = body;
      if (!message) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Message is required' }));
        return;
      }

      const cleanMessage = message.trim();
      const apiKey = process.env.GEMINI_API_KEY;
      const hasApiKey = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

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

      try {
        if (!hasApiKey) {
          throw new Error('Gemini API key is not configured');
        }

        const RAG = retrieveContext(cleanMessage);
        const contextBlock = RAG.khoA.map(item => `- Từ địa phương: "${item.word}" -> Nghĩa: "${item.meaning}" (Ví dụ: "${item.example}" dịch là "${item.exampleTranslation}", giải nghĩa: "${item.culturalInsight}")`).join('\n');

        const systemInstruction = `Bạn là một nhà Ngôn ngữ học kiêm Chuyên gia Văn hóa Dân gian Bắc Trung Bộ. Hãy giải thích từ vựng, ngữ pháp, và phong tục văn hóa dựa vào Context được cung cấp từ kho dữ liệu. Phải luôn kèm theo ví dụ thực tế bằng tiếng địa phương và dịch nghĩa sang tiếng Việt phổ thông.

Dưới đây là một số thông tin tham chiếu từ cơ sở dữ liệu (Context RAG):
${contextBlock || '(Không có thông tin liên quan trực tiếp trong cơ sở dữ liệu. Hãy sử dụng kiến thức chuyên môn của bạn về văn hóa Bắc Trung Bộ để giải thích)'}`;

        const prompt = `${systemInstruction}\n\nCâu hỏi của người dùng: "${cleanMessage}"`;
        const responseText = await callGeminiAPI(apiKey, prompt, false);
        const parsedResponse = JSON.parse(responseText);
        const textResult = parsedResponse.candidates[0].content.parts[0].text;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ response: textResult }));
      } catch (err) {
        console.error("Gemini Chatbot API failed, falling back offline:", err);
        
        if (quickRepliesFallback[cleanMessage]) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ response: quickRepliesFallback[cleanMessage], isFallback: true }));
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

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ response: responseText, isFallback: true }));
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
          verified: true,
          confidence: 95,
          tags: ["YouTube", province]
        };

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
