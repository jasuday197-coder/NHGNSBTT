const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = dataContent.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
const lexicon = JSON.parse(match[1]);

console.log(`=== DANH SÁCH TỪ ĐIỂN THANH HÓA ĐÃ LÀM SẠCH (${lexicon.filter(i => i.region === 'Thanh Hóa').length} TỪ) ===`);
lexicon.filter(i => i.region === 'Thanh Hóa').forEach((item, index) => {
  console.log(`${index + 1}. ${item.word} : ${item.meaning}`);
});

console.log(`\n=== DỮ LIỆU JSON CHI TIẾT THANH HÓA (${lexicon.filter(i => i.region === 'Thanh Hóa').length} TỪ) ===`);
console.log(JSON.stringify(lexicon.filter(i => i.region === 'Thanh Hóa'), null, 2));
