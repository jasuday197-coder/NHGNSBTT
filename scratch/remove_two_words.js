const fs = require('fs');
const path = require('path');

const targetWords = ['đập thâu cha mi giừ', 'khỉ gió'];

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) {
    console.error('Could not find DIALECT_LEXICON in', filePath);
    return;
  }

  const lexicon = JSON.parse(match[2]);
  const initialCount = lexicon.length;

  const removed = lexicon.filter(item => targetWords.includes(item.word.trim().toLowerCase()));
  const cleaned = lexicon.filter(item => !targetWords.includes(item.word.trim().toLowerCase()));

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
