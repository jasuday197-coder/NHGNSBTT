const fs = require('fs');
const path = require('path');
const vm = require('vm');

let dialectLexicon = [];
const dataFilePath = path.join(__dirname, '../data.js');
if (fs.existsSync(dataFilePath)) {
  let content = fs.readFileSync(dataFilePath, 'utf-8');
  content = content.replace(/\bconst\s+(DIALECT_LEXICON|AUDIO_CORPUS|CHATBOT_RAG_DATABASE)\b/g, 'var $1');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  dialectLexicon = sandbox.DIALECT_LEXICON || [];
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

function testTranslate(text, direction) {
  let outText = text;

  const sortedPairs = [...CORE_DIALECT_PAIRS].sort((a, b) => {
    const lenA = direction === 'standard-to-dialect' ? a.standard.length : a.dialect.length;
    const lenB = direction === 'standard-to-dialect' ? b.standard.length : b.dialect.length;
    return lenB - lenA;
  });

  sortedPairs.forEach(pair => {
    const srcTerm = direction === 'standard-to-dialect' ? pair.standard : pair.dialect;
    const tgtTerm = direction === 'standard-to-dialect' ? pair.dialect : pair.standard;

    const escaped = srcTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped})([^\\p{L}\\p{M}]|$)`, 'giu');

    outText = outText.replace(regex, (match, p1, p2, p3) => {
      let replacement = tgtTerm;
      if (p2.charAt(0) === p2.charAt(0).toUpperCase()) {
        replacement = tgtTerm.charAt(0).toUpperCase() + tgtTerm.slice(1);
      }
      return p1 + replacement + p3;
    });
  });

  return outText.charAt(0).toUpperCase() + outText.slice(1);
}

console.log("=== TEST RESULTS ===");
console.log("1. 'bạn đi đâu thế' (Standard -> Dialect):", testTranslate("bạn đi đâu thế", "standard-to-dialect"));
console.log("2. 'Sao hôm nay bạn đi học muộn thế?' (Standard -> Dialect):", testTranslate("Sao hôm nay bạn đi học muộn thế?", "standard-to-dialect"));
console.log("3. 'Bà đi đâu thế bà ơi' (Standard -> Dialect):", testTranslate("Bà đi đâu thế bà ơi", "standard-to-dialect"));
console.log("4. 'Răng bữa ni mi đi mần trễ rứa?' (Dialect -> Standard):", testTranslate("Răng bữa ni mi đi mần trễ rứa?", "dialect-to-standard"));
console.log("5. 'Con tru tê đang ăn cỏ ngoài cươi' (Dialect -> Standard):", testTranslate("Con tru tê đang ăn cỏ ngoài cươi", "dialect-to-standard"));
