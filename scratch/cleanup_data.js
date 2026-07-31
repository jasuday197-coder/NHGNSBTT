const fs = require('fs');
const path = require('path');

const targetTitles = [
  "Sự tích rú Thiên Cầm",
  "Hát Ví Giặm Đò Sa Nam",
  "Ký ức Chợ Vinh xưa",
  "Ca Huế trên sông Hương",
  "Hồi ức vĩ tuyến 17",
  "Hò hụi chèo đò Quảng Bình",
  "Phát âm cổ 'Clả trứng' Hoằng Hóa",
  "Khúc hát giã bạn"
];

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // We find AUDIO_CORPUS block in content
  const startMarker = 'const AUDIO_CORPUS = [';
  const endMarker = '];';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    console.log(`AUDIO_CORPUS not found in ${filePath}`);
    return;
  }

  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    console.log(`End of AUDIO_CORPUS not found in ${filePath}`);
    return;
  }

  const corpusCode = content.substring(startIndex, endIndex + endMarker.length);
  
  // Use eval in a clean context to parse AUDIO_CORPUS array safely
  const evalFn = new Function(corpusCode + '; return AUDIO_CORPUS;');
  const audioCorpus = evalFn();

  console.log(`Initial items in ${path.basename(filePath)}: ${audioCorpus.length}`);

  const filtered = audioCorpus.filter(item => {
    const title = item.title || '';
    const shouldRemove = targetTitles.some(t => title.includes(t));
    if (shouldRemove) {
      console.log(`  Removing: "${title}" (id: ${item.id})`);
    }
    return !shouldRemove;
  });

  console.log(`Remaining items in ${path.basename(filePath)}: ${filtered.length}`);

  const formattedCorpus = 'const AUDIO_CORPUS = ' + JSON.stringify(filtered, null, 2) + ';';
  const newContent = content.substring(0, startIndex) + formattedCorpus + content.substring(endIndex + endMarker.length);

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully updated ${filePath}\n`);
}

cleanFile(path.join(__dirname, '..', 'data.js'));
cleanFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
