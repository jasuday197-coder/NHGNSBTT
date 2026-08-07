const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const match = content.match(/const DIALECT_LEXICON = (\[[\s\S]*?\]);/);
const lexicon = JSON.parse(match[1]);

const ngheTinh = lexicon.filter(item => item.region === 'Nghệ Tĩnh');
console.log(`Nghệ Tĩnh count: ${ngheTinh.length}`);
ngheTinh.forEach((item, idx) => {
  console.log(`${idx + 1}. [Nghệ Tĩnh] ${item.word} : ${item.meaning}`);
});
