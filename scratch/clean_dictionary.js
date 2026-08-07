const fs = require('fs');
const path = require('path');

const sensitiveTerms = [
  'khu mấn',
  'địt',
  'lẹo',
  'su lích',
  'cóc xê',
  'ngỏng',
  'tè',
  'ẻ',
  'ngá khu',
  'khu',
  'cức'
];

function isSensitive(item) {
  const word = item.word.trim().toLowerCase();
  const meaning = item.meaning.trim().toLowerCase();

  // Check exact word matches or specific sensitive meaning matches
  for (const s of sensitiveTerms) {
    if (word === s) return true;
  }

  if (word === 'đấy' && (meaning.includes('đái') || meaning.includes('nước tiểu'))) {
    return true;
  }

  if (word === 'tè' && (meaning.includes('đái') || meaning.includes('đấy'))) {
    return true;
  }

  return false;
}

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) {
    console.error('Could not find DIALECT_LEXICON in', filePath);
    return;
  }

  const lexicon = JSON.parse(match[2]);
  const initialCount = lexicon.length;

  const removed = lexicon.filter(item => isSensitive(item));
  const cleaned = lexicon.filter(item => !isSensitive(item));

  console.log(`File: ${filePath}`);
  console.log(`Original count: ${initialCount}`);
  console.log(`Removed count: ${removed.length}`);
  console.log(`Cleaned count: ${cleaned.length}`);
  console.log('Removed items:', removed.map(r => `"${r.word}" (${r.meaning})`));

  const updatedContent = content.replace(match[0], match[1] + JSON.stringify(cleaned, null, 2) + match[3]);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

cleanFile(path.join(__dirname, '..', 'data.js'));
cleanFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
