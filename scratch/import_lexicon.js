const fs = require('fs');
const path = require('path');

// Target file to modify
const dataJsPath = path.join(__dirname, '..', 'data.js');

// Scraped file paths (from Gemini artifacts directory)
const stepsDir = path.join('C:', 'Users', 'Le Minh', '.gemini', 'antigravity-ide', 'brain', 'cea9be2c-565d-444a-a97d-16b0bd9b68c0', '.system_generated', 'steps');
const fileHonMat = path.join(stepsDir, '207', 'content.md');
const fileNgheNgu = path.join(stepsDir, '215', 'content.md');

// 1. Plaintext data from user's request (Nghệ Tĩnh)
// We mapped standard Vietnamese to dialect correctly here
const plaintextRaw = `Con trâu -> con tru | Con dâu -> con du | Mấn -> váy | Ngái -> xa | Đi mô? -> đi đâu? | Nác su -> nước sâu | Trấy bù -> quả bầu | Gác bếp -> tra | Lông cơn -> trồng cây | Ra sân -> ra cươi | Đi nhởi -> đi chơi | Chúng tao -> choa | Các bạn -> bọn bay | Tê -> kia | Ni -> này | Mi -> mày | Mần -> làm | Chộ -> thấy | Nhác -> lười | Mắm tôm -> ruốc bôi | Đọi -> bát | Nôốc -> thuyền | Khủy chân -> lặc lè | Đàng -> đường | Đấy -> tè | Thế thôi -> rứa hè | Rừng -> rú | Rào -> sông | Ngá khu -> ngứa mông | Mơ -> mớ | Thúi -> hôi | Nỏ nhởi -> không chơi | Tê -> kia | Tề -> kìa | Cái môi -> cái thìa | Đánh nhau -> đập chắc | Ra răng -> thế nào | Ả -> chị | Tau -> tao | Rứa -> thế | Răng -> sao | Bổ -> ngã | Mả -> mồ | Lọi cẳng -> duỗi chân | Vải đen -> vải thâm | Trụt quỳn -> tụt quần | Dốc -> trôộc | Đôộng -> đồi | Mui -> môi | Đầu -> trôốc | Hun -> hôn | Ló -> Lúa | Ngượng -> rầy | Thích -> sèm | Lả -> lửa | Nỏ -> không | Lá trù -> lá trầu | Mắc -> bận | Mô -> đâu | Bọ -> cha | Nương -> vườn | Rẫy -> nương | Bù rợ -> bí đỏ | Nước chè -> nác chè | Nướng -> náng | Mói -> muối | Trốc cúi -> đầu gối`;

// Simple mapping lookup for direction correction
const wordDirectMap = {
  "con tru": "con trâu",
  "con du": "con dâu",
  "mấn": "váy",
  "ngái": "xa",
  "đi mô?": "đi đâu?",
  "nác su": "nước sâu",
  "trấy bù": "quả bầu",
  "tra": "gác bếp / già",
  "lông cơn": "trồng cây",
  "ra cươi": "ra sân",
  "đi nhởi": "đi chơi",
  "choa": "chúng tao / chúng tôi",
  "bọn bay": "các bạn / tụi mày",
  "tê": "kia",
  "ni": "này",
  "mi": "mày",
  "mần": "làm",
  "chộ": "thấy",
  "nhác": "lười",
  "ruốc bôi": "mắm tôm",
  "đọi": "bát",
  "nôốc": "thuyền",
  "lặc lè": "khủy chân",
  "đàng": "đường",
  "tè": "đấy / đái",
  "rứa hè": "thế thôi / thế à",
  "rú": "rừng / núi",
  "rào": "sông",
  "ngá khu": "ngứa mông",
  "mơ": "mớ",
  "thúi": "hôi",
  "nỏ nhởi": "không chơi",
  "tề": "kìa",
  "cái môi": "cái thìa",
  "đập chắc": "đánh nhau",
  "ra răng": "thế nào",
  "ả": "chị",
  "tau": "tao",
  "rứa": "thế / vậy",
  "răng": "sao / tại sao",
  "bổ": "ngã",
  "mả": "mồ / mộ",
  "lọi cẳng": "duỗi chân / gãy chân",
  "vải thâm": "vải đen",
  "trụt quỳn": "tụt quần",
  "trôộc": "dốc / đồi",
  "đôộng": "đồi",
  "mui": "môi",
  "trôốc": "đầu",
  "hun": "hôn",
  "ló": "lúa",
  "rầy": "ngượng / xấu hổ",
  "sèm": "thích / thèm",
  "lả": "lửa",
  "nỏ": "không",
  "lá trù": "lá trầu",
  "mắc": "bận",
  "mô": "đâu",
  "bọ": "cha / bố",
  "nương": "vườn",
  "rẫy": "nương",
  "bù rợ": "bí đỏ",
  "nác chè": "nước chè",
  "náng": "nướng",
  "mói": "muối",
  "trốc cúi": "đầu gối"
};

const processedLexicon = [];

// Helper to clean HTML tags and entities
function cleanText(text) {
  if (!text) return '';
  let cleaned = text.replace(/<[^>]*>/g, ''); // strip HTML tags
  
  // Basic HTML entity decoding for Vietnamese
  const entities = {
    '&#7885;': 'ọ', '&#7884;': 'Ọ',
    '&#7855;': 'ắ', '&#7854;': 'Ắ',
    '&#7857;': 'ằ', '&#7856;': 'Ằ',
    '&#7859;': 'ẳ', '&#7858;': 'Ẳ',
    '&#7861;': 'ẵ', '&#7860;': 'Ẵ',
    '&#7863;': 'ặ', '&#7862;': 'Ặ',
    '&#7843;': 'ả', '&#7842;': 'Ả',
    '&#7845;': 'ấ', '&#7844;': 'Ấ',
    '&#7847;': 'ầ', '&#7846;': 'Ầ',
    '&#7849;': 'ẩ', '&#7848;': 'Ẩ',
    '&#7851;': 'ẫ', '&#7850;': 'Ẫ',
    '&#7853;': 'ậ', '&#7852;': 'Ậ',
    '&#7869;': 'ẽ', '&#7868;': 'Ẽ',
    '&#7871;': 'ế', '&#7870;': 'Ế',
    '&#7873;': 'ề', '&#7872;': 'Ề',
    '&#7875;': 'ể', '&#7874;': 'Ể',
    '&#7877;': 'ễ', '&#7876;': 'Ễ',
    '&#7879;': 'ệ', '&#7878;': 'Ệ',
    '&#7883;': 'ị', '&#7882;': 'Ị',
    '&#7887;': 'ỏ', '&#7886;': 'Ỏ',
    '&#7889;': 'ố', '&#7888;': 'Ố',
    '&#7891;': 'ồ', '&#7890;': 'Ồ',
    '&#7893;': 'ổ', '&#7892;': 'Ổ',
    '&#7895;': 'ỗ', '&#7894;': 'Ỗ',
    '&#7897;': 'ộ', '&#7896;': 'Ộ',
    '&#7899;': 'ớ', '&#7898;': 'Ớ',
    '&#7901;': 'ờ', '&#7900;': 'Ờ',
    '&#7903;': 'ở', '&#7902;': 'Ở',
    '&#7905;': 'ỡ', '&#7904;': 'Ỡ',
    '&#7907;': 'ợ', '&#7906;': 'Ợ',
    '&#7909;': 'ụ', '&#7908;': 'Ụ',
    '&#7911;': 'ủ', '&#7910;': 'Ủ',
    '&#7913;': 'ứ', '&#7912;': 'Ứ',
    '&#7915;': 'ừ', '&#7914;': 'Ừ',
    '&#7917;': 'ử', '&#7916;': 'Ử',
    '&#7919;': 'ữ', '&#7918;': 'Ữ',
    '&#7921;': 'ự', '&#7920;': 'Ự',
    '&#7923;': 'ỳ', '&#7922;': 'Ỳ',
    '&#7925;': 'ỷ', '&#7924;': 'Ỷ',
    '&#7927;': 'ỹ', '&#7926;': 'Ỹ',
    '&#7929;': 'ự', '&#7928;': 'Ự',
    '&#225;': 'á', '&#224;': 'à', '&#226;': 'â', '&#227;': 'ã', '&#233;': 'é', '&#232;': 'è', '&#234;': 'ê',
    '&#237;': 'í', '&#236;': 'ì', '&#243;': 'ó', '&#242;': 'ò', '&#244;': 'ô', '&#245;': 'õ', '&#250;': 'ú',
    '&#249;': 'ù', '&#253;': 'ý', '&#258;': 'Ă', '&#259;': 'ă', '&#272;': 'Đ', '&#273;': 'đ',
    '&#768;': '̀', '&#769;': '́', '&#771;': '̃', '&#777;': '̉', '&#780;': '̌', '&#783;': '̀',
    '&quot;': '"', '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' '
  };
  
  for (let key in entities) {
    cleaned = cleaned.split(key).join(entities[key]);
  }
  
  // Normalize double spaces/special symbols
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

// Add a word object with duplication prevention
function addWord(word, meaning, region, source, provinces = []) {
  const normWord = cleanText(word).toLowerCase();
  const normMeaning = cleanText(meaning);
  
  if (!normWord || !normMeaning) return;

  // Prevent duplicates
  const existing = processedLexicon.find(w => w.word === normWord && w.region === region);
  if (existing) {
    if (!existing.meaning.includes(normMeaning)) {
      existing.meaning += ', ' + normMeaning;
    }
    return;
  }

  // Create example sentences for games
  let example = '';
  let exampleTranslation = '';
  if (normWord === 'mô') {
    example = 'Mi đi mô về rứa?';
    exampleTranslation = 'Mày đi đâu về thế?';
  } else if (normWord === 'răng') {
    example = 'Răng mi lại mần rứa?';
    exampleTranslation = 'Sao mày lại làm thế?';
  } else if (normWord === 'mần') {
    example = 'Dừ mi đang mần chi đó?';
    exampleTranslation = 'Bây giờ mày đang làm gì đấy?';
  } else {
    example = `Người xứ Nghệ dùng từ "${normWord}" rất phổ biến.`;
    exampleTranslation = `Người xứ Nghệ dùng từ "${normWord}" rất phổ biến.`;
  }

  const newWordObj = {
    id: `l_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    word: normWord,
    region: region,
    provinces: provinces,
    meaning: normMeaning,
    example: example,
    exampleTranslation: exampleTranslation,
    culturalInsight: `Từ địa phương "${normWord}" nghĩa là "${normMeaning}". Nguồn tham khảo: ${source}.`
  };

  processedLexicon.push(newWordObj);
}

// --- PART 1: Plaintext from prompt (Nghệ Tĩnh) ---
plaintextRaw.split('|').forEach(part => {
  const tokens = part.split('->').map(t => t.trim());
  if (tokens.length !== 2) return;
  const left = tokens[0];
  const right = tokens[1];
  
  // Check if left is dialect or right is dialect based on our wordDirectMap
  if (wordDirectMap[left.toLowerCase()]) {
    // left is dialect
    addWord(left, wordDirectMap[left.toLowerCase()], 'Nghệ Tĩnh', 'Tài liệu Studocu Ngoại Ngữ', ['Nghệ An', 'Hà Tĩnh']);
  } else if (wordDirectMap[right.toLowerCase()]) {
    // right is dialect
    addWord(right, wordDirectMap[right.toLowerCase()], 'Nghệ Tĩnh', 'Tài liệu Studocu Ngoại Ngữ', ['Nghệ An', 'Hà Tĩnh']);
  } else {
    // Fallback: guess right side is dialect (standard -> dialect)
    addWord(right, left, 'Nghệ Tĩnh', 'Tài liệu Studocu Ngoại Ngữ', ['Nghệ An', 'Hà Tĩnh']);
  }
});

// --- PART 2: Scrape dulichhonmat.com (Nghệ Tĩnh) ---
if (fs.existsSync(fileHonMat)) {
  const content = fs.readFileSync(fileHonMat, 'utf8');
  // Match lines like: <strong>Word</strong> = Meaning
  const regex = /<strong>(.*?)(?:<\/strong>)?\s*=\s*(.*?)(?:<\/p>|\n|$)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawWord = cleanText(match[1]);
    const rawMeaning = cleanText(match[2]);
    if (rawWord.length < 15 && rawMeaning.length < 50) {
      addWord(rawWord, rawMeaning, 'Nghệ Tĩnh', 'Du lịch Hòn Mát (dulichhonmat.com)', ['Nghệ An', 'Hà Tĩnh']);
    }
  }
} else {
  console.log(`File not found: ${fileHonMat}`);
}

// --- PART 3: Scrape nghengu.vn (Nghệ Tĩnh) ---
if (fs.existsSync(fileNgheNgu)) {
  const content = fs.readFileSync(fileNgheNgu, 'utf8');
  // Match lines like: <li>...Word = Meaning...</li> or text containing =
  const regex = /<li>.*?Arial,Helvetica,sans-serif;">(.*?)\s*=\s*(.*?)(?:<\/span>|<\/li>)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawWord = cleanText(match[1]);
    const rawMeaning = cleanText(match[2]);
    if (rawWord && rawMeaning && rawWord.length < 20 && rawMeaning.length < 60) {
      // Split sub-words if present, like "chốc nữa = chút nữa = ..."
      const parts = rawWord.split('=').concat(rawMeaning.split('=')).map(p => cleanText(p));
      if (parts.length >= 2) {
        addWord(parts[0], parts[1], 'Nghệ Tĩnh', 'Nghệ Ngữ (nghengu.vn)', ['Nghệ An', 'Hà Tĩnh']);
      }
    }
  }
} else {
  console.log(`File not found: ${fileNgheNgu}`);
}

// --- PART 4: Public Huế / Bình Trị Thiên dialect data ---
// These are extracted from Bùi Minh Đức's "Từ điển tiếng Huế" and Triều Nguyên's work
const hueWords = [
  { word: "mô", meaning: "đâu", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "tê", meaning: "kia", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "răng", meaning: "sao, tại sao", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "rứa", meaning: "thế, như vậy", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "bọ", meaning: "cha, bố", provinces: ["Quảng Bình", "Quảng Trị"] },
  { word: "mạ", meaning: "mẹ", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "o", meaning: "cô, dì", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "đọi", meaning: "cái bát, cái chén", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "trốc", meaning: "cái đầu", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "cơn", meaning: "cây", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "trấy", meaning: "trái, quả", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "hun", meaning: "hôn", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "chừ", meaning: "bây giờ", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "mệ", meaning: "bà", provinces: ["Thừa Thiên Huế"] },
  { word: "mụ", meaning: "người phụ nữ trung tuổi / bà", provinces: ["Thừa Thiên Huế", "Quảng Trị"] },
  { word: "hói", meaning: "sông nhỏ, khe nước", provinces: ["Quảng Bình", "Quảng Trị"] },
  { word: "toóc", meaning: "rơm", provinces: ["Quảng Bình", "Quảng Trị"] },
  { word: "náng", meaning: "nướng", provinces: ["Quảng Bình", "Quảng Trị"] },
  { word: "chũi", meaning: "cái chổi", provinces: ["Thừa Thiên Huế", "Quảng Trị"] },
  { word: "cà ràng", meaning: "bếp kiềng đất nung ba chân", provinces: ["Thừa Thiên Huế"] },
  { word: "gương", meaning: "kính (đeo mắt)", provinces: ["Thừa Thiên Huế"] },
  { word: "chụm", meaning: "đun, nấu củi", provinces: ["Thừa Thiên Huế", "Quảng Trị"] },
  { word: "chụi", meaning: "dụi, lau sạch", provinces: ["Thừa Thiên Huế"] },
  { word: "can chi", meaning: "không sao, không việc gì", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "đập", meaning: "đánh", provinces: ["Thừa Thiên Huế", "Quảng Trị"] },
  { word: "chi", meaning: "gì", provinces: ["Thừa Thiên Huế", "Quảng Bình", "Quảng Trị"] },
  { word: "tê nớ", meaning: "kia đó", provinces: ["Thừa Thiên Huế"] },
  { word: "họ học", meaning: "học tập", provinces: ["Quảng Bình"] },
  { word: "khái", meaning: "con hổ", provinces: ["Quảng Bình", "Quảng Trị"] },
  { word: "rú", meaning: "núi", provinces: ["Quảng Bình", "Quảng Trị"] }
];

hueWords.forEach(w => {
  addWord(w.word, w.meaning, 'Bình Trị Thiên', 'Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên', w.provinces);
});

console.log(`Parsed total of ${processedLexicon.length} clean dialect entries.`);

// 5. Update data.js
if (fs.existsSync(dataJsPath)) {
  let dataContent = fs.readFileSync(dataJsPath, 'utf8');
  
  // Find where DIALECT_LEXICON is declared: const DIALECT_LEXICON = [];
  const targetStr = 'const DIALECT_LEXICON = [];';
  if (dataContent.includes(targetStr)) {
    const formattedData = `const DIALECT_LEXICON = ${JSON.stringify(processedLexicon, null, 2)};`;
    dataContent = dataContent.replace(targetStr, formattedData);
    fs.writeFileSync(dataJsPath, dataContent, 'utf8');
    console.log(`Successfully updated ${dataJsPath} with database records!`);
  } else {
    console.error(`Could not find "${targetStr}" in ${dataJsPath}`);
  }
} else {
  console.error(`data.js not found at ${dataJsPath}`);
}
