const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = dataContent.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
const lexicon = JSON.parse(match[1]);

const btt = lexicon.filter(item => item.region === 'Bình Trị Thiên');
console.log('Bình Trị Thiên items count:', btt.length);
btt.forEach(item => {
  console.log(`Word: "${item.word}" | Example: "${item.example || ''}" | Translation: "${item.exampleTranslation || ''}"`);
});
