const fs = require('fs');
const path = require('path');

const wordsToDelete = [
  'fỏng', 'phỏng',
  'fàm tính', 'phàm tính',
  'áo fông', 'áo phông'
];

function cleanDataFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) return;

  const lexicon = JSON.parse(match[2]);
  const initial = lexicon.length;
  const cleaned = lexicon.filter(item => {
    const w = item.word.trim().toLowerCase();
    return !wordsToDelete.includes(w);
  });

  console.log(`[${path.basename(filePath)}] Initial count: ${initial} | Cleaned count: ${cleaned.length}`);
  const updatedContent = content.replace(match[0], match[1] + JSON.stringify(cleaned, null, 2) + match[3]);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

cleanDataFile(path.join(__dirname, '..', 'data.js'));
cleanDataFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
