const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = dataContent.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not parse DIALECT_LEXICON');
  process.exit(1);
}

const lexicon = JSON.parse(match[1]);

console.log('--- ALL LEXICON WORDS ---');
lexicon.forEach((item, index) => {
  console.log(`${index + 1}. [${item.region}] "${item.word}" -> "${item.meaning}"`);
});
