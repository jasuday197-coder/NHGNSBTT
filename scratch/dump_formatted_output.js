const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = content.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
const lexicon = JSON.parse(match[1]);

const targetWords = [
  "mô", "tê", "răng", "rứa", "bọ", "mạ", "o", "đọi", "trốc", "cơn",
  "trấy", "hun", "chừ", "mệ", "mụ", "hói", "toóc", "náng", "chũi", "cà ràng",
  "gương", "chụm", "chụi", "can chi", "đập", "chi", "tê nớ", "họ học", "khái", "rú"
];

console.log("=== KẾT QUẢ ĐÃ CẬP NHẬT CHUẨN HÓA ===");
targetWords.forEach(w => {
  const item = lexicon.find(i => i.region === 'Bình Trị Thiên' && i.word.trim().toLowerCase() === w.toLowerCase()) 
            || lexicon.find(i => i.word.trim().toLowerCase() === w.toLowerCase());
  
  if (item) {
    console.log("--------------------------------------------------");
    console.log(`Từ phương ngữ: ${item.word}`);
    console.log(`Vùng miền: ${item.region}`);
    console.log(`Nghĩa phổ thông: ${item.meaning}`);
    console.log(`Ví dụ minh họa:`);
    console.log(`- Câu phương ngữ: "${item.example}"`);
    console.log(`- Dịch phổ thông: "${item.exampleTranslation}"`);
  } else {
    console.log(`NOT FOUND: ${w}`);
  }
});
console.log("--------------------------------------------------");
