const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = content.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
const lexicon = JSON.parse(match[1]);

const ngheTinh = lexicon.filter(item => item.region === 'Nghệ Tĩnh');

console.log(`=== DANH SÁCH TỪ ĐIỂN NGHỆ TĨNH ĐÃ LÀM SẠCH HOÀN TOÀN (${ngheTinh.length} MỤC TỪ) ===\n`);

ngheTinh.forEach((item, index) => {
  console.log(`${index + 1}. Từ phương ngữ: ${item.word}`);
  console.log(`   Vùng miền: ${item.region}`);
  console.log(`   Nghĩa phổ thông: ${item.meaning}`);
  if (item.example) {
    console.log(`   Ví dụ: "${item.example}" -> "${item.exampleTranslation}"`);
  }
  console.log('');
});
