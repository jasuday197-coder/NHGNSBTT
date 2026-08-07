const fs = require('fs');
const path = require('path');

const replacements = [
  { from: 'đậu fộng', to: 'đậu phộng' },
  { from: '1 fát', to: '1 phát' },
  { from: 'áo fông', to: 'áo phông' },
  { from: 'mưa fùn', to: 'mưa phùn' },
  { from: 'fỏng', to: 'phỏng' },
  { from: 'fàm tính', to: 'phàm tính' }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let totalReplaced = 0;

  replacements.forEach(r => {
    const regex = new RegExp(r.from, 'g');
    const matches = content.match(regex);
    if (matches) {
      totalReplaced += matches.length;
      content = content.replace(regex, r.to);
      console.log(`[${path.basename(filePath)}] Replaced "${r.from}" -> "${r.to}" (${matches.length} times)`);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[${path.basename(filePath)}] Total replacements: ${totalReplaced}`);
}

fixFile(path.join(__dirname, '..', 'data.js'));
fixFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
