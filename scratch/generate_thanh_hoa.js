const fs = require('fs');
const path = require('path');

const rawText = "Va/Vá -> Nó/Hắn (ngôi thứ 3) | Nhà va/Nhà vá -> Gia đình họ/Bọn họ | Ún -> Em | Cố -> Cụ | Mậu -> Bà | Dá -> Mình/Bản thân | Lả -> Lửa | Kêu -> Gọi | Ăn chậc -> Ăn chực | Nhọc -> Ốm/Mệt | Tra -> Già | Trốc -> Đầu | Nhởi -> Chơi | Mần -> Làm | Chiềng -> Mời | Hột -> Hạt | Chạc -> Dây | Lãy -> Hái | Chạn -> Gác | Tắc -> Tóc | Mủn -> Mũi | Nanh -> Răng | Lản -> Lưỡi | Chò -> Chân | Cằn cấn -> Cày cấy | Kha cắn -> Gà gáy | Trốc cún -> Đầu gối | Cái vắn -> Cái váy | Ban -> Vai | Cuôn muổi -> Con muỗi | Cấy chũn -> Cái chổi | Ăn trấm -> Ăn trộm | Mê man -> Rất nhiều | Lần khân -> Chần chừ | Rú -> Núi/Rừng | Rọc/Rộc -> Cánh đồng sâu | Bái -> Vùng đất cao trồng màu | Mó/Mỏ -> Giếng nước ngầm tự nhiên | Rảy/Rẩy -> Rẫy | Bải -> Bãi bồi ven sông | Nứ -> Thật không | Đài -> Gầu múc nước | Đọi -> Bát | Vá -> Cái môi/thìa múc canh";

// Map to generate meaningful and contextual examples for each word
const wordExamples = {
  "va/vá": {
    example: "Để va mần xong cấy việc ni rồi va đi nhởi.",
    translation: "Để nó làm xong cái việc này rồi nó đi chơi.",
    insight: "Từ nhân xưng đặc trưng của phương ngữ Thanh Hóa, dùng ở ngôi thứ ba."
  },
  "nhà va/nhà vá": {
    example: "Nhà va mới đi bái về lúc kha cắn.",
    translation: "Gia đình họ mới đi vùng đất cao trồng màu về lúc gà gáy.",
    insight: "Đại từ nhân xưng chỉ nhóm người hoặc gia đình của họ trong tiếng Thanh Hóa."
  },
  "ún": {
    example: "Ún ơi, ra lãy cho cố cấy chũn vô đây.",
    translation: "Em ơi, ra hái cho cụ cái chổi vào đây.",
    insight: "Từ xưng hô thân thương trong gia đình, chỉ người em."
  },
  "cố": {
    example: "Cố tui năm ni đã tra lắm rồi, tóc bạc trắng cả.",
    translation: "Cụ tôi năm nay đã già lắm rồi, tóc bạc trắng cả.",
    insight: "Kính xưng dành cho cụ (ông bà của bố mẹ) ở xứ Thanh."
  },
  "mậu": {
    example: "Mậu đang ngồi bên chạn thổi lả nấu cơm.",
    translation: "Bà đang ngồi bên gác bếp nhóm lửa nấu cơm.",
    insight: "Kính xưng dành cho bà ở một số vùng của Thanh Hóa."
  },
  "dá": {
    example: "Việc ni để dá tự mần, ún không phải lo mô.",
    translation: "Việc này để bản thân tự làm, em không phải lo đâu.",
    insight: "Từ dùng để tự xưng, nghĩa là mình hoặc bản thân."
  },
  "lả": {
    example: "Thổi lả lên để chụm nồi nác mau sôi.",
    translation: "Nhóm lửa lên để đun nồi nước mau sôi.",
    insight: "Biến âm từ 'lửa' thành 'lả' đặc trưng ở khu vực Thanh Hóa và Nghệ Tĩnh."
  },
  "kêu": {
    example: "Ún ra kêu bọ về ăn cơm kẻo nguội.",
    translation: "Em ra gọi bố về ăn cơm kẻo nguội.",
    insight: "Động từ 'gọi' được nói là 'kêu' trong giao tiếp xứ Thanh."
  },
  "ăn chậc": {
    example: "Hắn suốt ngày sang nhà va ăn chậc cơm.",
    translation: "Nó suốt ngày sang nhà nó ăn chực cơm.",
    insight: "Hành động ăn chực, được phát âm là 'ăn chậc'."
  },
  "nhọc": {
    example: "Hôm qua mần việc ngoài bái về thấy nhọc quá.",
    translation: "Hôm qua làm việc ngoài vùng trồng màu về thấy mệt quá.",
    insight: "Từ 'nhọc' dùng để chỉ trạng thái mệt mỏi hoặc ốm đau."
  },
  "tra": {
    example: "Cơn mít nhà tui đã tra lắm rồi, hột to mà ngọt.",
    translation: "Cây mít nhà tôi đã già lắm rồi, hạt to mà ngọt.",
    insight: "Từ cổ chỉ sự già nua, dùng cho cả người, động vật lẫn cây cối."
  },
  "trốc": {
    example: "Đi nắng mà không đội nón là đau trốc tê.",
    translation: "Đi nắng mà không đội nón là đau đầu đấy.",
    insight: "Từ chỉ bộ phận đầu, dùng chung ở cả Thanh Hóa, Nghệ Tĩnh, Bình Trị Thiên."
  },
  "nhởi": {
    example: "Chiều ni ún có đi nhởi với dá không?",
    translation: "Chiều nay em có đi chơi với mình không?",
    insight: "Động từ chỉ hoạt động vui chơi giải trí, phát âm là 'nhởi'."
  },
  "mần": {
    example: "Bữa ni nhà va mần chi mà ồn ào rứa?",
    translation: "Hôm nay gia đình họ làm gì mà ồn ào thế?",
    insight: "Động từ làm việc, mần ăn, cực kỳ phổ biến ở Trung Bộ."
  },
  "chiềng": {
    example: "Chiềng làng chiềng chạ ra nghe thông báo mới.",
    translation: "Mời làng mời xã ra nghe thông báo mới.",
    insight: "Từ cổ nghĩa là mời hoặc trình báo, phổ biến trong văn hóa làng xã."
  },
  "hột": {
    example: "Ăn quả nhớ chừa hột lại để gieo cơn mới.",
    translation: "Ăn quả nhớ chừa hạt lại để gieo cây mới.",
    insight: "Từ chỉ hạt của các loại quả."
  },
  "chạc": {
    example: "Lấy cấy chạc ni cột chặt củi lại mang về.",
    translation: "Lấy cái dây này cột chặt củi lại mang về.",
    insight: "Từ địa phương nghĩa là dây thừng, dây buộc."
  },
  "lãy": {
    example: "Dá ra vườn lãy ít lá trầu cho mậu ăn trầu.",
    translation: "Bản thân ra vườn hái ít lá trầu cho bà ăn trầu.",
    insight: "Hành động bẻ, hái quả hoặc lá cây bằng tay."
  },
  "chạn": {
    example: "Cất cấy vá lên chạn bếp kẻo cuôn muổi bu vào.",
    translation: "Cất cái môi lên gác bếp kẻo con muỗi bu vào.",
    insight: "Chỉ gác bếp hoặc kệ để đồ đạc trong nhà truyền thống."
  },
  "tắc": {
    example: "Ún có cấy tắc dài và mượt đẹp quá.",
    translation: "Em có cái tóc dài và mượt đẹp quá.",
    insight: "Biến âm của từ 'tóc'."
  },
  "mủn": {
    example: "Gió lạnh làm mủn tui đỏ ửng cả lên.",
    translation: "Gió lạnh làm mũi tôi đỏ ửng cả lên.",
    insight: "Từ địa phương chỉ bộ phận mũi trên khuôn mặt."
  },
  "nanh": {
    example: "Em bé mới mọc vài cấy nanh sữa xinh xắn.",
    translation: "Em bé mới mọc vài cái răng sữa xinh xắn.",
    insight: "Từ địa phương dùng để chỉ răng nói chung hoặc răng nanh."
  },
  "lản": {
    example: "Ăn đồ nóng quá làm phỏng cả lản rồi.",
    translation: "Ăn đồ nóng quá làm bỏng cả lưỡi rồi.",
    insight: "Cách phát âm trại đi của từ 'lưỡi' ở một số vùng Thanh Hóa."
  },
  "chò": {
    example: "Mần việc ngoài ruộng đất bùn bám đầy chò.",
    translation: "Làm việc ngoài ruộng đất bùn bám đầy chân.",
    insight: "Từ chỉ bộ phận chân của người hoặc động vật."
  },
  "cằn cấn": {
    example: "Đến mùa cằn cấn là cả làng ra đồng từ sáng sớm.",
    translation: "Đến mùa cày cấy là cả làng ra đồng từ sáng sớm.",
    insight: "Từ ghép cổ chỉ hoạt động sản xuất nông nghiệp cày bừa gieo cấy."
  },
  "kha cắn": {
    example: "Mới kha cắn mà ún đã dậy mần việc rồi.",
    translation: "Mới gà gáy mà em đã dậy làm việc rồi.",
    insight: "Chỉ thời điểm sáng sớm tinh mơ khi con gà cất tiếng gáy."
  },
  "trốc cún": {
    example: "Bổ một phát đau điếng cả trốc cún.",
    translation: "Ngã một phát đau điếng cả đầu gối.",
    insight: "Từ chỉ bộ phận đầu gối."
  },
  "cái vắn": {
    example: "Mặc cái vắn ni đi nhởi hội làng thì đẹp lắm.",
    translation: "Mặc cái váy này đi chơi hội làng thì đẹp lắm.",
    insight: "Từ chỉ cái váy trang phục truyền thống."
  },
  "ban": {
    example: "Gánh đôi quang gánh nặng đau hết cả ban.",
    translation: "Gánh đôi quang gánh nặng đau hết cả vai.",
    insight: "Từ địa phương chỉ bộ phận vai."
  },
  "cuôn muổi": {
    example: "Tối nằm ngủ nhớ buông màn kẻo cuôn muổi cắn.",
    translation: "Tối nằm ngủ nhớ buông màn kẻo con muỗi đốt.",
    insight: "Cách phát âm trại đi của cụm từ 'con muỗi'."
  },
  "cấy chũn": {
    example: "Lấy cấy chũn quét dọn sạch sẽ nhà cươi.",
    translation: "Lấy cái chổi quét dọn sạch sẽ sân nhà.",
    insight: "Từ chỉ cái chổi dùng để quét dọn."
  },
  "ăn trấm": {
    example: "Nhà va bị kẻ xấu lẻn vào ăn trấm mất con gà nhà tui.",
    translation: "Nhà họ bị kẻ xấu lẻn vào ăn trộm mất con gà nhà tôi.",
    insight: "Hành động ăn trộm, lấy cắp tài sản."
  },
  "mê man": {
    example: "Lúa mùa ni ngoài rộc tốt mê man luôn.",
    translation: "Lúa mùa này ngoài cánh đồng sâu tốt rất nhiều luôn.",
    insight: "Tính từ chỉ số lượng hoặc trạng thái cực kỳ nhiều, bạt ngàn."
  },
  "lần khân": {
    example: "Mần chi thì mần nhanh lên, đừng lần khân nữa.",
    translation: "Làm gì thì làm nhanh lên, đừng chần chừ nữa.",
    insight: "Chỉ sự do dự, chần chừ, trì hoãn không dứt khoát."
  },
  "rú": {
    example: "Nhà tui ở ngay chân rú, tối nghe tiếng chim kêu dã ngoại.",
    translation: "Nhà tôi ở ngay chân núi/rừng, tối nghe tiếng chim kêu dã ngoại.",
    insight: "Chỉ núi rừng hoang vu, dùng phổ biến ở miền Trung."
  },
  "rọc/rộc": {
    example: "Đi cấy ngoài rộc sâu bùn ngập đến trốc cún.",
    translation: "Đi cấy ngoài cánh đồng sâu bùn ngập đến đầu gối.",
    insight: "Chỉ những thửa ruộng sâu, trũng, khó canh tác."
  },
  "bái": {
    example: "Nhà tui trồng khoai khoai lang ngọt lịm trên bái.",
    translation: "Nhà tôi trồng khoai khoai lang ngọt lịm trên vùng đất cao trồng màu.",
    insight: "Chỉ rẻo đất cao, khô ráo chuyên dùng trồng màu như ngô, khoai, sắn."
  },
  "mó/mỏ": {
    example: "Ún ra mó xách gàu nác mát lạnh về đây chụm nước.",
    translation: "Em ra giếng nước ngầm tự nhiên xách gàu nước mát lạnh về đây đun nước.",
    insight: "Chỉ mạch nước ngầm tự nhiên chảy ra từ lòng đất hoặc vách đá."
  },
  "rảy/rẩy": {
    example: "Bọn va lên rẩy phát hoang trồng bắp.",
    translation: "Bọn họ lên rẫy phát hoang trồng ngô.",
    insight: "Khu vực đất dốc trên núi rừng dùng để canh tác nương rẫy."
  },
  "bải": {
    example: "Mùa nước cạn, ra bải sông Hương nhặt sỏi vui lắm.",
    translation: "Mùa nước cạn, ra bãi bồi ven sông Hương nhặt sỏi vui lắm.",
    insight: "Chỉ vùng đất phù sa bồi đắp ven các dòng sông."
  },
  "nứ": {
    example: "Món ni ngon nứ luôn, ún ăn thử đi.",
    translation: "Món này ngon thật không luôn, em ăn thử đi.",
    insight: "Trợ từ cảm thán nhấn mạnh mức độ chân thật hoặc khẳng định."
  },
  "đài": {
    example: "Múc gàu nác bằng cái đài tre đặt cạnh mó.",
    translation: "Múc gàu nước bằng cái gầu tre đặt cạnh giếng tự nhiên.",
    insight: "Dụng cụ tự chế bằng tre hoặc gỗ dùng để múc nước."
  },
  "đọi": {
    example: "Xới cho cố đọi cơm nóng hổi ăn kèm cà muối.",
    translation: "Xới cho cụ bát cơm nóng hổi ăn kèm cà muối.",
    insight: "Từ chỉ cái bát ăn cơm hằng ngày."
  },
  "vá": {
    example: "Dùng cấy vá ni múc canh ngọt từ hột sen ra đọi.",
    translation: "Dùng cái thìa này múc canh ngọt từ hạt sen ra bát.",
    insight: "Dụng cụ thìa muôi múc canh của người địa phương."
  }
};

const items = rawText.split(' | ');
const lexiconJson = [];
let idCounter = 1;

for (const item of items) {
  const parts = item.split(' -> ');
  if (parts.length !== 2) continue;
  const wordRaw = parts[0].trim();
  const meaningRaw = parts[1].trim();
  
  const key = wordRaw.toLowerCase();
  
  // Format word for dictionary representation
  const wordClean = wordRaw.toLowerCase();
  
  const exampleInfo = wordExamples[key] || {
    example: `Người Thanh Hóa dùng từ "${wordClean}" trong giao tiếp hằng ngày.`,
    translation: `Người Thanh Hóa dùng từ "${wordClean}" trong giao tiếp hằng ngày.`,
    insight: `Từ địa phương "${wordClean}" nghĩa là "${meaningRaw}".`
  };
  
  const id = `l_1783852737447_th${idCounter.toString().padStart(2, '0')}`;
  idCounter++;
  
  lexiconJson.push({
    id: id,
    word: wordClean,
    region: "Thanh Hóa",
    provinces: ["Thanh Hóa"],
    meaning: meaningRaw.toLowerCase(),
    example: exampleInfo.example,
    exampleTranslation: exampleInfo.translation,
    culturalInsight: `${exampleInfo.insight} Nguồn tham khảo: Tài liệu Phương ngữ Thanh Hóa.`
  });
}

fs.writeFileSync(path.join(__dirname, 'thanh_hoa_lexicon.json'), JSON.stringify(lexiconJson, null, 2), 'utf-8');
console.log(`Successfully generated ${lexiconJson.length} entries!`);
