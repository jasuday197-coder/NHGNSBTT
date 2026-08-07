const fs = require('fs');
const path = require('path');

const examplesData = [
  { word: "mô", example: "Mi đi mô về rứa?", translation: "Mày đi đâu về thế?" },
  { word: "tê", example: "Nhà o ở đằng tê kìa.", translation: "Nhà cô ở đằng kia kìa." },
  { word: "răng", example: "Răng mi lại làm rứa?", translation: "Sao mày lại làm thế?" },
  { word: "rứa", example: "Ăn cơm xong rồi rứa à?", translation: "Ăn cơm xong rồi thế à?" },
  { word: "bọ", example: "Bọ tui mới đi làm ruộng về.", translation: "Bố tôi mới đi làm ruộng về." },
  { word: "mạ", example: "Mạ ơi, chừ ăn cơm chưa?", translation: "Mẹ ơi, bây giờ ăn cơm chưa?" },
  { word: "o", example: "O mới mua cho tui cái áo mới.", translation: "Cô mới mua cho tôi cái áo mới." },
  { word: "đọi", example: "Mạ múc cho con đọi canh.", translation: "Mẹ múc cho con bát canh." },
  { word: "trốc", example: "Đi nắng nhiều quá nên đau cái trốc.", translation: "Đi nắng nhiều quá nên đau cái đầu." },
  { word: "cơn", example: "Ra gốc cơn xoài ngồi cho mát.", translation: "Ra gốc cây xoài ngồi cho mát." },
  { word: "trấy", example: "Cơn ni có nhiều trấy ngon lắm.", translation: "Cây này có nhiều trái ngon lắm." },
  { word: "hun", example: "Lại đây mệ hun một cái mần kỷ niệm.", translation: "Lại đây bà hôn một cái làm kỷ niệm." },
  { word: "chừ", example: "Chừ mi muốn đi mô?", translation: "Bây giờ mày muốn đi đâu?" },
  { word: "mệ", example: "Mệ tui năm nay già rồi.", translation: "Bà tôi năm nay già rồi." },
  { word: "mụ", example: "Mụ bán cá ở chợ nói chuyện vui lắm.", translation: "Bà bán cá ở chợ nói chuyện vui lắm." },
  { word: "hói", example: "Mạ ra ngoài hói gánh nác về chụm cơm.", translation: "Mẹ ra ngoài khe nước gánh nước về đun cơm." },
  { word: "toóc", example: "Gom toóc lại đem đốt cho sạch ruộng.", translation: "Gom rơm lại đem đốt cho sạch ruộng." },
  { word: "náng", example: "Bọ đem cá ra náng trên bếp than.", translation: "Bố đem cá ra nướng trên bếp than." },
  { word: "chũi", example: "Lấy cái chũi quét cái nhà cho sạch.", translation: "Lấy cái chổi quét cái nhà cho sạch." },
  { word: "cà ràng", example: "Mạ chụm nồi nồi canh trên cà ràng.", translation: "Mẹ đun nồi canh trên bếp kiềng đất nung." },
  { word: "gương", example: "Ông đeo cái gương vào mới đọc được sách.", translation: "Ông đeo cái kính vào mới đọc được sách." },
  { word: "chụm", example: "Ra sau bếp chụm củi nấu nác sôi.", translation: "Ra sau bếp đun củi nấu nước sôi." },
  { word: "chụi", example: "Lấy cái khăn chụi cái bàn cho khô.", translation: "Lấy cái khăn lau cái bàn cho khô." },
  { word: "can chi", example: "Rớt chút nác thôi, can chi đâu!", translation: "Rơi chút nước thôi, không sao đâu!" },
  { word: "đập", example: "Đừng có đập con chó, tội nó.", translation: "Đừng có đánh con chó, tội nó." },
  { word: "chi", example: "Mi đang mần chi rứa?", translation: "Mày đang làm gì thế?" },
  { word: "tê nớ", example: "Cái nón để ở đằng tê nớ.", translation: "Cái nón để ở đằng kia đó." },
  { word: "họ học", example: "Mấy đứa nhỏ đang ngồi họ học trong nhà.", translation: "Mấy đứa nhỏ đang ngồi học tập trong nhà." },
  { word: "khái", example: "Ngày xưa trên rú có nhiều khái lắm.", translation: "Ngày xưa trên núi có nhiều hổ lắm." },
  { word: "rú", example: "Dân làng đi lên rú kiếm củi về chụm.", translation: "Dân làng đi lên núi kiếm củi về đun." }
];

const exampleMap = new Map();
examplesData.forEach(item => {
  exampleMap.set(item.word.trim().toLowerCase(), item);
});

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) {
    console.error('Could not find DIALECT_LEXICON in', filePath);
    return;
  }

  const lexicon = JSON.parse(match[2]);
  let updatedCount = 0;

  lexicon.forEach(item => {
    const key = item.word.trim().toLowerCase();
    if (exampleMap.has(key)) {
      const ex = exampleMap.get(key);
      item.example = ex.example;
      item.exampleTranslation = ex.translation;
      updatedCount++;
    }
  });

  console.log(`File: ${filePath} | Updated entries: ${updatedCount}`);
  const updatedContent = content.replace(match[0], match[1] + JSON.stringify(lexicon, null, 2) + match[3]);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

updateFile(path.join(__dirname, '..', 'data.js'));
updateFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
