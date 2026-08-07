const fs = require('fs');
const path = require('path');

const targetSensitiveWords = [
  'khỉ gió',
  'đập thâu cha mi giừ',
  'tè',
  'ngá khu',
  'ẻ',
  'cóc xê',
  'su lích',
  'khu mấn',
  'địt',
  'lẹo',
  'khu',
  'cức',
  'ngỏng'
];

function isMatch(item) {
  const word = item.word.trim().toLowerCase();
  const meaning = item.meaning.trim().toLowerCase();

  for (const s of targetSensitiveWords) {
    if (word === s) return true;
  }

  if (word === 'đấy' && (meaning.includes('đái') || meaning.includes('nước tiểu'))) {
    return true;
  }

  return false;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) return;

  const lexicon = JSON.parse(match[2]);
  const initial = lexicon.length;
  const cleaned = lexicon.filter(item => !isMatch(item));

  console.log(`File: ${filePath} | Initial: ${initial} | Cleaned: ${cleaned.length}`);
  const updatedContent = content.replace(match[0], match[1] + JSON.stringify(cleaned, null, 2) + match[3]);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

processFile(path.join(__dirname, '..', 'data.js'));
processFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
