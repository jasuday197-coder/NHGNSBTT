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

// Tokenize and Query RAG Context (Kho A + Kho B Placeholder)
function retrieveContext(inputText) {
  if (!inputText) return { khoA: [], khoB: [] };
  if (dialectLexicon.length === 0) loadDatabase();

  const cleanInput = inputText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const matches = [];

  // Kho A Search (Exact/Fuzzy inclusion)
  dialectLexicon.forEach(lex => {
    const lexWord = lex.word.toLowerCase();
    if (cleanInput.includes(lexWord)) {
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

  // Kho B Search Placeholder Query Hook
  const khoBMatches = querySpeechCorpusPlaceholder(cleanInput);

  return {
    khoA: uniqueMatches.slice(0, 10),
    khoB: khoBMatches
  };
}

function querySpeechCorpusPlaceholder(inputText) {
  // Kho B speech database is under development. Query hook placeholder.
  console.log(`[RAG Kho B Placeholder] Querying speech database for: "${inputText}"`);
  return [];
}

// Literal Word-by-Word Translation Fallback for Translate API
function fallbackTranslate(text, direction) {
  console.log(`[Translation Fallback] Executing offline fallback for: "${text}"`);
  if (dialectLexicon.length === 0) loadDatabase();

  const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const matchedVocab = [];
  
  dialectLexicon.forEach(lex => {
    if (cleanText.includes(lex.word.toLowerCase())) {
      matchedVocab.push({
        dialectWord: lex.word,
        standardMeaning: lex.meaning,
        explanation: lex.culturalInsight ? lex.culturalInsight.split('.')[0] + '.' : 'Từ địa phương vùng ' + lex.region
      });
    }
  });

  let translatedText = text;
  if (direction === 'dialect-to-standard') {
    const sortedVocab = [...matchedVocab].sort((a, b) => b.dialectWord.length - a.dialectWord.length);
    sortedVocab.forEach(item => {
      // Direct word replacement
      const words = item.dialectWord.split(/\s*,\s*|\s*\/\s*/);
      words.forEach(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'gi');
        translatedText = translatedText.replace(regex, item.standardMeaning.split(/\s*,\s*|\s*\/\s*/)[0].trim());
      });
    });
  } else {
    let matchedStandard = [];
    dialectLexicon.forEach(lex => {
      const meanings = lex.meaning.split(/\s*,\s*|\s*;\s*|\s*\/\s*/).map(m => m.trim().toLowerCase());
      meanings.forEach(m => {
        if (cleanText.includes(m)) {
          matchedStandard.push({
            dialectWord: lex.word,
            standardMeaning: m,
            explanation: `Biến đổi sang từ địa phương "${lex.word}" đại diện nghĩa "${m}"`
          });
          const regex = new RegExp(`\\b${m}\\b`, 'gi');
          translatedText = translatedText.replace(regex, lex.word.split(/\s*,\s*|\s*\/\s*/)[0]);
        }
      });
    });
    matchedVocab.push(...matchedStandard);
  }

  translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);

  const sampleBreakdown = [
    { dialectWord: 'Mi', standardMeaning: 'Bạn / Mày', explanation: 'Đại từ nhân xưng ngôi thứ hai thân mật đặc trưng xứ Nghệ & Bình Trị Thiên.' },
    { dialectWord: 'Mô', standardMeaning: 'Đâu / Chỗ nào', explanation: 'Từ hỏi vị trí địa lý xuất hiện phổ biến trong câu hỏi miền Trung.' },
    { dialectWord: 'Rứa', standardMeaning: 'Thế / Vậy', explanation: 'Trợ từ cảm thán đệm cuối câu nhấn mạnh ý nghĩa hoặc sắc thái cảm xúc.' }
  ];

  return {
    translation: translatedText,
    wordsBreakdown: matchedVocab.length > 0 ? matchedVocab.slice(0, 5) : sampleBreakdown,
    isFallback: true
  };
}

// Google AI Studio (Gemini) HTTPS Client Helper
function callGeminiAPI(apiKey, prompt, forceJson) {
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
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
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
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

function readPostBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

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
          throw new Error('Gemini API key is not configured');
        }

        const RAG = retrieveContext(text);
        const contextBlock = RAG.khoA.map(item => `- Từ địa phương: "${item.word}" -> Nghĩa: "${item.meaning}" (Ví dụ: "${item.example}" dịch là "${item.exampleTranslation}")`).join('\n');

        const prompt = `Bạn là chuyên gia ngôn ngữ học về phương ngữ và văn hóa Việt Nam.
Hãy dịch câu sau đây sang tiếng Việt phổ thông chuẩn mực (hoặc ngược lại nếu chiều dịch là từ phổ thông sang phương ngữ), tự nhiên nhất:
Câu gốc: "${text}"
Chiều dịch: ${direction === 'dialect-to-standard' ? 'Từ phương ngữ Bắc Trung Bộ sang tiếng phổ thông chuẩn' : 'Từ tiếng phổ thông sang phương ngữ Bắc Trung Bộ'}

Dưới đây là một số từ vựng địa phương có liên quan được tra cứu từ cơ sở dữ liệu (Context RAG) để hỗ trợ bạn dịch chuẩn xác nhất:
${contextBlock || '(Không có từ vựng liên quan trực tiếp nào trong cơ sở dữ liệu)'}

Hãy trả về cấu trúc JSON chính xác theo dạng sau:
{
  "translation": "câu tiếng Việt tương ứng sau khi dịch",
  "wordsBreakdown": [
    {
      "dialectWord": "từ địa phương",
      "standardMeaning": "nghĩa tiếng phổ thông",
      "explanation": "giải nghĩa văn cảnh ngắn gọn"
    }
  ]
}
Chỉ trả về JSON thô duy nhất, không thêm bớt từ ngữ thảo luận khác ngoài JSON này.`;

        const responseText = await callGeminiAPI(apiKey, prompt, true);
        const parsedResponse = JSON.parse(responseText);
        const rawText = parsedResponse.candidates[0].content.parts[0].text;
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(rawText.trim());
      } catch (err) {
        console.error("Gemini Translation API failed, falling back offline:", err);
        const fallbackResult = fallbackTranslate(text, direction);
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

  // --- API ROUTE: /api/approve-audio ---
  if (req.method === 'POST' && safeUrl === '/api/approve-audio') {
    readPostBody(req).then((body) => {
      const { id, title, province, speaker, ageGroup, gender, topic, audioUrl, transcriptDialect, transcriptStandard } = body;
      if (!title || !province) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      try {
        const dataFilePath = path.join(__dirname, 'data.js');
        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');

        const dialectGroup = province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên");
        
        const approvedRecordObject = {
          id: id || ("p_" + Date.now()),
          title: title,
          province: province,
          dialectGroup: dialectGroup,
          speaker: speaker || "Đóng góp",
          ageGroup: ageGroup || "18-35",
          gender: gender || "Nam",
          topic: topic || "Lịch sử & Văn hóa",
          audioUrl: audioUrl || "",
          transcriptDialect: transcriptDialect || "Giọng đọc đóng góp",
          transcriptStandard: transcriptStandard || "Giọng đọc đóng góp",
          verified: true,
          confidence: 95,
          tags: [topic ? topic.split(' ')[0] : "Đóng góp", province]
        };

        const serialized = JSON.stringify(approvedRecordObject, null, 2);
        const formatted = serialized.split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n');

        fileContent = fileContent.replace('const AUDIO_CORPUS = [', `const AUDIO_CORPUS = [\n  ${formatted},`);

        fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
        loadDatabase();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: true, record: approvedRecordObject }));
      } catch (err) {
        console.error("Failed to append approved audio to data.js:", err);
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
