// Kho A: Từ điển Phương ngữ Bắc Trung Bộ (Lexicon)
const DIALECT_LEXICON = [
  {
    "id": "l_1783852737379_w207w",
    "word": "con tru",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "con trâu",
    "example": "Con tru đang ăn cỏ ngoài đàng tê tề.",
    "exampleTranslation": "Con trâu đang ăn cỏ ngoài đường kia kìa.",
    "culturalInsight": "Từ địa phương \"con tru\" nghĩa là \"con trâu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737379_2f4s9",
    "word": "con du",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "con dâu",
    "example": "Con du nhà bác Nam ngoan hiền rành.",
    "exampleTranslation": "Con dâu nhà bác Nam ngoan hiền lắm.",
    "culturalInsight": "Từ địa phương \"con du\" nghĩa là \"con dâu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737379_2suk6",
    "word": "mấn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "váy",
    "example": "Mạ mới mua cho cấy mấn đẹp rành.",
    "exampleTranslation": "Mẹ mới mua cho cái váy đẹp lắm.",
    "culturalInsight": "Từ địa phương \"mấn\" nghĩa là \"váy\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737379_rvvcq",
    "word": "ngái",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xa",
    "example": "Nhà o ở ngái lắm, đi bộ nỏ tới được đâu.",
    "exampleTranslation": "Nhà cô ở xa lắm, đi bộ không tới được đâu.",
    "culturalInsight": "Từ địa phương \"ngái\" nghĩa là \"xa\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737379_2gfq8",
    "word": "đi mô?",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đi đâu?",
    "example": "Mạ đi mô rứa mạ?",
    "exampleTranslation": "Mẹ đi đâu thế mẹ?",
    "culturalInsight": "Từ địa phương \"đi mô?\" nghĩa là \"đi đâu?\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_6j8ug",
    "word": "nác su",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nước sâu",
    "example": "Đừng có lội xuống rào, nác su lắm.",
    "exampleTranslation": "Đừng có lội xuống sông, nước sâu lắm.",
    "culturalInsight": "Từ địa phương \"nác su\" nghĩa là \"nước sâu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_lc7cm",
    "word": "trấy bù",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "quả bầu",
    "example": "Dàn bù sau nương ra nhiều trấy rành.",
    "exampleTranslation": "Giàn bầu sau vườn ra nhiều quả lắm.",
    "culturalInsight": "Từ địa phương \"trấy bù\" nghĩa là \"quả bầu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_5az49",
    "word": "tra",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gác bếp / già",
    "example": "Cơn xoài ni tra rồi, nỏ ra trấy nữa.",
    "exampleTranslation": "Cây xoài này già rồi, không ra trái nữa.",
    "culturalInsight": "Từ địa phương \"tra\" nghĩa là \"gác bếp / già\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_4s9p4",
    "word": "lông cơn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trồng cây",
    "example": "Bọ ra sau nương lông cơn xoài mới mua.",
    "exampleTranslation": "Bố ra sau vườn trồng cây xoài mới mua.",
    "culturalInsight": "Từ địa phương \"lông cơn\" nghĩa là \"trồng cây\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_c2ztb",
    "word": "ra cươi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ra sân",
    "example": "Bắt cấy ghế ra cươi ngồi hóng mát.",
    "exampleTranslation": "Lấy cái ghế ra sân ngồi hóng mát.",
    "culturalInsight": "Từ địa phương \"ra cươi\" nghĩa là \"ra sân\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_8bqcz",
    "word": "đi nhởi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đi chơi",
    "example": "Tối ni mi có đi nhởi với choa nỏ?",
    "exampleTranslation": "Tối nay mày có đi chơi với chúng tao không?",
    "culturalInsight": "Từ địa phương \"đi nhởi\" nghĩa là \"đi chơi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_qasb4",
    "word": "choa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chúng tao / chúng tôi",
    "example": "Choa đi mần nương từ sớm mai.",
    "exampleTranslation": "Chúng tôi đi làm vườn từ sáng sớm.",
    "culturalInsight": "Từ địa phương \"choa\" nghĩa là \"chúng tao / chúng tôi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_du73t",
    "word": "bọn bay",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "các bạn / tụi mày",
    "example": "Bọn bay đi mô về rứa?",
    "exampleTranslation": "Các bạn đi đâu về thế?",
    "culturalInsight": "Từ địa phương \"bọn bay\" nghĩa là \"các bạn / tụi mày\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_5niio",
    "word": "tê",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "kia",
    "example": "Cấy xe để ở đàng tê kìa.",
    "exampleTranslation": "Cái xe để ở đằng kia kìa.",
    "culturalInsight": "Từ địa phương \"tê\" nghĩa là \"kia\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737380_qvk6a",
    "word": "ni",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "này",
    "example": "Cấy áo ni đẹp rành luôn.",
    "exampleTranslation": "Cái áo này đẹp lắm luôn.",
    "culturalInsight": "Từ địa phương \"ni\" nghĩa là \"này\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_fai22",
    "word": "mi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mày",
    "example": "Mi mần chi rứa mi?",
    "exampleTranslation": "Mày làm gì thế mày?",
    "culturalInsight": "Từ địa phương \"mi\" nghĩa là \"mày\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_slzn6",
    "word": "mần",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "làm",
    "example": "Mấy đứa đang mần chi rứa?",
    "exampleTranslation": "Mấy đứa đang làm gì thế?",
    "culturalInsight": "Từ địa phương \"mần\" nghĩa là \"làm\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_fq2jz",
    "word": "chộ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thấy",
    "example": "Tau nỏ chộ cấy chìa khóa để mô cả.",
    "exampleTranslation": "Tao không thấy cái chìa khóa để đâu cả.",
    "culturalInsight": "Từ địa phương \"chộ\" nghĩa là \"thấy\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_5bj22",
    "word": "nhác",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lười",
    "example": "Hấn nhác lắm, nỏ chịu học hành chi.",
    "exampleTranslation": "Nó lười lắm, không chịu học hành gì.",
    "culturalInsight": "Từ địa phương \"nhác\" nghĩa là \"lười\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_u87fz",
    "word": "ruốc bôi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mắm tôm",
    "example": "Mạ mua ruốc bôi về chấm rau muống.",
    "exampleTranslation": "Mẹ mua mắm tôm về chấm rau muống.",
    "culturalInsight": "Từ địa phương \"ruốc bôi\" nghĩa là \"mắm tôm\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_jpfvb",
    "word": "đọi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bát",
    "example": "Mạ bới cho con đọi cơm đầy.",
    "exampleTranslation": "Mẹ xới cho con bát cơm đầy.",
    "culturalInsight": "Từ địa phương \"đọi\" nghĩa là \"bát\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_wdumi",
    "word": "nôốc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thuyền",
    "example": "Mấy bác chèo nôốc ra rào đánh cá.",
    "exampleTranslation": "Mấy bác chèo thuyền ra sông đánh cá.",
    "culturalInsight": "Từ địa phương \"nôốc\" nghĩa là \"thuyền\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_rabzf",
    "word": "lặc lè",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "khủy chân",
    "example": "Đau cấy lặc lè nỏ đi bước mô được.",
    "exampleTranslation": "Đau cái khuỷu chân không đi bước nào được.",
    "culturalInsight": "Từ địa phương \"lặc lè\" nghĩa là \"khủy chân\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737381_7eegf",
    "word": "đàng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đường",
    "example": "Đi đàng nhớ chú ý xe cộ hấy.",
    "exampleTranslation": "Đi đường nhớ chú ý xe cộ nhé.",
    "culturalInsight": "Từ địa phương \"đàng\" nghĩa là \"đường\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_yg32v",
    "word": "rứa hè",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thế thôi / thế à",
    "example": "Rứa hè, rứa mà tau nỏ biết chi cả.",
    "exampleTranslation": "Thế à, thế mà tao không biết gì cả.",
    "culturalInsight": "Từ địa phương \"rứa hè\" nghĩa là \"thế thôi / thế à\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_8ttvd",
    "word": "rú",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rừng / núi",
    "example": "Chiều chiều dân làng lên rú đốn củi.",
    "exampleTranslation": "Chiều chiều dân làng lên núi đốn củi.",
    "culturalInsight": "Từ địa phương \"rú\" nghĩa là \"rừng / núi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_9c2w5",
    "word": "rào",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sông",
    "example": "Mấy đứa nhỏ ra rào tắm mát.",
    "exampleTranslation": "Mấy đứa nhỏ ra sông tắm mát.",
    "culturalInsight": "Từ địa phương \"rào\" nghĩa là \"sông\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_3ia62",
    "word": "mơ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mớ",
    "example": "Tối qua nằm ngủ mơ thấy ông bà.",
    "exampleTranslation": "Tối qua nằm ngủ mớ thấy ông bà.",
    "culturalInsight": "Từ địa phương \"mơ\" nghĩa là \"mớ\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_4o0h8",
    "word": "thúi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hôi, thối",
    "example": "Đống rác bên đàng thúi quá.",
    "exampleTranslation": "Đống rác bên đường hôi quá.",
    "culturalInsight": "Từ địa phương \"thúi\" nghĩa là \"hôi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_qqyio",
    "word": "nỏ nhởi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "không chơi",
    "example": "Hấn giận rồi, nỏ nhởi với choa nữa.",
    "exampleTranslation": "Nó giận rồi, không chơi với chúng tao nữa.",
    "culturalInsight": "Từ địa phương \"nỏ nhởi\" nghĩa là \"không chơi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_muvan",
    "word": "tề",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "kìa",
    "example": "Ngồi xuống cấy ghế đàng tề kìa.",
    "exampleTranslation": "Ngồi xuống cái ghế đằng kia kìa.",
    "culturalInsight": "Từ địa phương \"tề\" nghĩa là \"kìa\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_geo8o",
    "word": "cái môi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái thìa, cái muôi",
    "example": "Múc canh thì lấy cấy môi ni nè.",
    "exampleTranslation": "Múc canh thì lấy cái muôi này này.",
    "culturalInsight": "Từ địa phương \"cái môi\" nghĩa là \"cái thìa\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737382_svgat",
    "word": "đập chắc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh nhau",
    "example": "Mấy đứa nhỏ đừng có đập chắc nữa.",
    "exampleTranslation": "Mấy đứa nhỏ đừng có đánh nhau nữa.",
    "culturalInsight": "Từ địa phương \"đập chắc\" nghĩa là \"đánh nhau\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_wl5ep",
    "word": "ra răng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thế nào",
    "example": "Chuyện ni rốt cuộc ra răng rứa?",
    "exampleTranslation": "Chuyện này rốt cuộc thế nào thế?",
    "culturalInsight": "Từ địa phương \"ra răng\" nghĩa là \"thế nào\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_9lx7b",
    "word": "ả",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chị, mụ \"dùng để nói về ng` đàn bà ko mấy thện cảm\"",
    "example": "Ả ni nói chuyện khó nghe rành.",
    "exampleTranslation": "Chị này nói chuyện khó nghe thật.",
    "culturalInsight": "Từ địa phương \"ả\" nghĩa là \"chị\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_94sue",
    "word": "tau",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tao",
    "example": "Tau đi nhởi đây hấy.",
    "exampleTranslation": "Tao đi chơi đây nhé.",
    "culturalInsight": "Từ địa phương \"tau\" nghĩa là \"tao\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_kpq1k",
    "word": "rứa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thế / vậy",
    "example": "Mần rứa là được rồi đó.",
    "exampleTranslation": "Làm thế là được rồi đấy.",
    "culturalInsight": "Từ địa phương \"rứa\" nghĩa là \"thế / vậy\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_n2wb1",
    "word": "răng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sao / tại sao",
    "example": "Răng mi nỏ ăn cơm?",
    "exampleTranslation": "Sao mày không ăn cơm?",
    "culturalInsight": "Từ địa phương \"răng\" nghĩa là \"sao / tại sao\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_zzyfh",
    "word": "bổ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngã",
    "example": "Đi đứng cẩn thận kẻo bổ đó.",
    "exampleTranslation": "Đi đứng cẩn thận kẻo ngã đấy.",
    "culturalInsight": "Từ địa phương \"bổ\" nghĩa là \"ngã\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737383_9pn5i",
    "word": "mả",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mồ / mộ",
    "example": "Tới ngày lễ cả nhà ra mả thắp hương.",
    "exampleTranslation": "Tới ngày lễ cả nhà ra mộ thắp hương.",
    "culturalInsight": "Từ địa phương \"mả\" nghĩa là \"mồ / mộ\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_mhj1j",
    "word": "lọi cẳng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "duỗi chân / gãy chân",
    "example": "Đá bóng mạnh quá ngã lọi cẳng luôn.",
    "exampleTranslation": "Đá bóng mạnh quá ngã gãy chân luôn.",
    "culturalInsight": "Từ địa phương \"lọi cẳng\" nghĩa là \"duỗi chân / gãy chân\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_4yhzb",
    "word": "vải thâm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vải đen",
    "example": "Mạ may cho cấy áo bằng vải thâm.",
    "exampleTranslation": "Mẹ may cho cái áo bằng vải đen.",
    "culturalInsight": "Từ địa phương \"vải thâm\" nghĩa là \"vải đen\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_jax68",
    "word": "trụt quỳn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tụt quần",
    "example": "Chạy nhanh quá trụt quỳn luôn.",
    "exampleTranslation": "Chạy nhanh quá tụt quần luôn.",
    "culturalInsight": "Từ địa phương \"trụt quỳn\" nghĩa là \"tụt quần\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_xbe98",
    "word": "trôộc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dốc / đồi",
    "example": "Đi lên cấy trôộc ni mệt rành.",
    "exampleTranslation": "Đi lên cái dốc này mệt lắm.",
    "culturalInsight": "Từ địa phương \"trôộc\" nghĩa là \"dốc / đồi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_yk2u0",
    "word": "đôộng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đồi",
    "example": "Nhà o ở trên đôộng cao tê.",
    "exampleTranslation": "Nhà cô ở trên đồi cao kia.",
    "culturalInsight": "Từ địa phương \"đôộng\" nghĩa là \"đồi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_dx7ob",
    "word": "mui",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "môi",
    "example": "Mùa đông lạnh quá khô hết cả mui.",
    "exampleTranslation": "Mùa đông lạnh quá khô hết cả môi.",
    "culturalInsight": "Từ địa phương \"mui\" nghĩa là \"môi\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_3y2pl",
    "word": "trôốc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đầu",
    "example": "Đau cấy trôốc quá, nỏ học được chi.",
    "exampleTranslation": "Đau cái đầu quá, không học được gì.",
    "culturalInsight": "Từ địa phương \"trôốc\" nghĩa là \"đầu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_kov06",
    "word": "hun",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hôn",
    "example": "Lại đây o hun cho cấy mần kỷ niệm.",
    "exampleTranslation": "Lại đây cô hôn cho cái làm kỷ niệm.",
    "culturalInsight": "Từ địa phương \"hun\" nghĩa là \"hôn\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_6l7po",
    "word": "ló",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lúa",
    "example": "Năm nay gặt ló được mùa lắm.",
    "exampleTranslation": "Năm nay gặt lúa được mùa lắm.",
    "culturalInsight": "Từ địa phương \"ló\" nghĩa là \"lúa\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_269m5",
    "word": "rầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngượng / xấu hổ, Sinh rầy",
    "example": "Mần rứa rầy chết đi được.",
    "exampleTranslation": "Làm thế xấu hổ chết đi được.",
    "culturalInsight": "Từ địa phương \"rầy\" nghĩa là \"ngượng / xấu hổ\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_cp5q5",
    "word": "sèm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thích / thèm",
    "example": "Sèm ăn đọi bánh canh quá.",
    "exampleTranslation": "Thèm ăn bát bánh canh quá.",
    "culturalInsight": "Từ địa phương \"sèm\" nghĩa là \"thích / thèm\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737384_htctx",
    "word": "lả",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lửa",
    "example": "Nhóm lả lên chụm cơm mạ ơi.",
    "exampleTranslation": "Nhóm lửa lên đun cơm mẹ ơi.",
    "culturalInsight": "Từ địa phương \"lả\" nghĩa là \"lửa\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_2ryty",
    "word": "nỏ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "không",
    "example": "Tau nỏ biết chi đâu hấy.",
    "exampleTranslation": "Tao không biết gì đâu nhé.",
    "culturalInsight": "Từ địa phương \"nỏ\" nghĩa là \"không\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_ywje1",
    "word": "lá trù",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lá trầu",
    "example": "Mệ ngồi tem lá trù ăn trầu.",
    "exampleTranslation": "Bà ngồi tiêm lá trầu ăn trầu.",
    "culturalInsight": "Từ địa phương \"lá trù\" nghĩa là \"lá trầu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_lxlwv",
    "word": "mắc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bận",
    "example": "Chiều nay tau mắc đi mần nương rồi.",
    "exampleTranslation": "Chiều nay tao bận đi làm vườn rồi.",
    "culturalInsight": "Từ địa phương \"mắc\" nghĩa là \"bận\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_e3xyo",
    "word": "mô",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đâu",
    "example": "Cấy kéo để ở mô rứa?",
    "exampleTranslation": "Cái kéo để ở đâu thế?",
    "culturalInsight": "Từ địa phương \"mô\" nghĩa là \"đâu\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_eygc6",
    "word": "bọ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cha / bố",
    "example": "Bọ tui đi mần đồng chưa về.",
    "exampleTranslation": "Bố tôi đi làm đồng chưa về.",
    "culturalInsight": "Từ địa phương \"bọ\" nghĩa là \"cha / bố\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_y9jwp",
    "word": "nương",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vườn",
    "example": "Ra nương hái ít rau về nấu canh.",
    "exampleTranslation": "Ra vườn hái ít rau về nấu canh.",
    "culturalInsight": "Từ địa phương \"nương\" nghĩa là \"vườn\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_dlmio",
    "word": "rẫy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nương",
    "example": "Bọ lên rẫy trồng ngô từ sáng.",
    "exampleTranslation": "Bố lên nương trồng ngô từ sáng.",
    "culturalInsight": "Từ địa phương \"rẫy\" nghĩa là \"nương\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_zyjbq",
    "word": "bù rợ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bí đỏ",
    "example": "Mạ nấu nồi canh bù rợ ngọt rành.",
    "exampleTranslation": "Mẹ nấu nồi canh bí đỏ ngọt lắm.",
    "culturalInsight": "Từ địa phương \"bù rợ\" nghĩa là \"bí đỏ\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_8y0gf",
    "word": "nác chè",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nước chè",
    "example": "Mời bác uống đọi nác chè xanh.",
    "exampleTranslation": "Mời bác uống bát nước chè xanh.",
    "culturalInsight": "Từ địa phương \"nác chè\" nghĩa là \"nước chè\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_gahb7",
    "word": "náng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nướng",
    "example": "Bọ đem khoai ra náng trên bếp than.",
    "exampleTranslation": "Bố đem khoai ra nướng trên bếp than.",
    "culturalInsight": "Từ địa phương \"náng\" nghĩa là \"nướng\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737385_9rlss",
    "word": "mói",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "muối",
    "example": "Cho thêm chút mói vô canh cho đậm đà.",
    "exampleTranslation": "Cho thêm chút muối vào canh cho đậm đà.",
    "culturalInsight": "Từ địa phương \"mói\" nghĩa là \"muối\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737386_622s0",
    "word": "trốc cúi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đầu gối",
    "example": "Ngã bổ đau cấy trốc cúi quá.",
    "exampleTranslation": "Ngã đau cái đầu gối quá.",
    "culturalInsight": "Từ địa phương \"trốc cúi\" nghĩa là \"đầu gối\". Nguồn tham khảo: Tài liệu Studocu Ngoại Ngữ."
  },
  {
    "id": "l_1783852737388_2jgks",
    "word": "tao",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tau",
    "example": "Tau đi nhởi đây hấy.",
    "exampleTranslation": "Tao đi chơi đây nhé.",
    "culturalInsight": "Từ địa phương \"tao\" nghĩa là \"tau\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737388_jkdax",
    "word": "tôi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tui",
    "example": "Tui nỏ biết chuyện ni đâu.",
    "exampleTranslation": "Tôi không biết chuyện này đâu.",
    "culturalInsight": "Từ địa phương \"tôi\" nghĩa là \"tui\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737388_2qgjf",
    "word": "bọn mình",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ta",
    "example": "Ta cùng đi nhởi thôi.",
    "exampleTranslation": "Chúng mình cùng đi chơi thôi.",
    "culturalInsight": "Từ địa phương \"bọn mình\" nghĩa là \"ta\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737389_uup3e",
    "word": "mày",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mi",
    "example": "Mi mần chi rứa mi?",
    "exampleTranslation": "Mày làm gì thế mày?",
    "culturalInsight": "Từ địa phương \"mày\" nghĩa là \"mi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737389_gdyah",
    "word": "nó",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hắn, hấn",
    "example": "Hấn mới đi học về đó.",
    "exampleTranslation": "Nó mới đi học về đấy.",
    "culturalInsight": "Từ địa phương \"nó\" nghĩa là \"hắn, hấn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737389_oa362",
    "word": "đâu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mô",
    "example": "Cấy kéo để ở mô rứa?",
    "exampleTranslation": "Cái kéo để ở đâu thế?",
    "culturalInsight": "Từ địa phương \"đâu\" nghĩa là \"mô\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737389_akrmo",
    "word": "nào",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mồ",
    "example": "Đưa đọi cơm lại đây mồ.",
    "exampleTranslation": "Đưa bát cơm lại đây nào.",
    "culturalInsight": "Từ địa phương \"nào\" nghĩa là \"mồ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737389_uztwh",
    "word": "đâu nào",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mô mồ",
    "example": "Mi cất cấy chìa khóa ở mô mồ?",
    "exampleTranslation": "Mày cất cái chìa khóa ở đâu nào?",
    "culturalInsight": "Từ địa phương \"đâu nào\" nghĩa là \"mô mồ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_rrv8e",
    "word": "“ở đâu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ở mô; đi đâu thế",
    "example": "Người xứ Nghệ dùng từ \"“ở đâu\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"“ở đâu\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"“ở đâu\" nghĩa là \"ở mô; đi đâu thế\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_sxbka",
    "word": "kia",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tê ; kìa",
    "example": "Cấy xe để ở đàng tê kìa.",
    "exampleTranslation": "Cái xe để ở đằng kia kìa.",
    "culturalInsight": "Từ địa phương \"kia\" nghĩa là \"tê ; kìa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_dq873",
    "word": "gì",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chi",
    "example": "Mi đang tìm cấy chi rứa?",
    "exampleTranslation": "Mày đang tìm cái gì thế?",
    "culturalInsight": "Từ địa phương \"gì\" nghĩa là \"chi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_qpsqi",
    "word": "sao",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "răng",
    "example": "Răng mi nỏ ăn cơm?",
    "exampleTranslation": "Sao mày không ăn cơm?",
    "culturalInsight": "Từ địa phương \"sao\" nghĩa là \"răng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_6m2jd",
    "word": "thế, vậy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rứa",
    "example": "Người xứ Nghệ dùng từ \"thế, vậy\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"thế, vậy\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"thế, vậy\" nghĩa là \"rứa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737390_07myh",
    "word": "nớ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "( nghĩa của nó cũng dùng",
    "example": "Hồi nớ tau còn nhỏ lắm.",
    "exampleTranslation": "Hồi đó tao còn nhỏ lắm.",
    "culturalInsight": "Từ địa phương \"nớ\" nghĩa là \"( nghĩa của nó cũng dùng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737391_fwqjn",
    "word": "hồi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thời ( hồi nớ",
    "example": "Hồi nớ nhà choa nghèo lắm.",
    "exampleTranslation": "Thời đó nhà chúng tôi nghèo lắm.",
    "culturalInsight": "Từ địa phương \"hồi\" nghĩa là \"thời ( hồi nớ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737391_h1nw7",
    "word": "a ri nầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thế này này",
    "example": "Mần a ri nầy mới đúng ni.",
    "exampleTranslation": "Làm thế này này mới đúng này.",
    "culturalInsight": "Từ địa phương \"a ri nầy\" nghĩa là \"thế này này\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737391_7bv0c",
    "word": "chẳng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chả",
    "example": "Hấn chả chịu nghe lời chi cả.",
    "exampleTranslation": "Nó chẳng chịu nghe lời gì cả.",
    "culturalInsight": "Từ địa phương \"chẳng\" nghĩa là \"chả\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737391_94wik",
    "word": "ci ( ki, kí ), cấy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái. VD: đóng ci cựa lại",
    "example": "Người xứ Nghệ dùng từ \"ci ( ki, kí ), cấy\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"ci ( ki, kí ), cấy\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"ci ( ki, kí ), cấy\" nghĩa là \"cái. VD: đóng ci cựa lại\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737392_mwcmc",
    "word": "hấy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nhé",
    "example": "Tối ni đi nhởi hấy!",
    "exampleTranslation": "Tối nay đi chơi nhé!",
    "culturalInsight": "Từ địa phương \"hấy\" nghĩa là \"nhé\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737392_2k4sg",
    "word": "coi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xem",
    "example": "Ra coi ai đang gọi ngoài cươi tề.",
    "exampleTranslation": "Ra xem ai đang gọi ngoài sân kìa.",
    "culturalInsight": "Từ địa phương \"coi\" nghĩa là \"xem\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_8dl25",
    "word": "vô",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vào",
    "example": "Vô nhà uống đọi nác chè đã.",
    "exampleTranslation": "Vào nhà uống bát nước chè đã.",
    "culturalInsight": "Từ địa phương \"vô\" nghĩa là \"vào\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_b1cyw",
    "word": "đít lác",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đói tiền",
    "example": "Dạo ni đít lác quá, nỏ có đồng mô.",
    "exampleTranslation": "Dạo này đói tiền quá, không có đồng nào.",
    "culturalInsight": "Từ địa phương \"đít lác\" nghĩa là \"đói tiền\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_eyylu",
    "word": "quày",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rẽ",
    "example": "Đi tới ngã ba rồi quày sang trái hấy.",
    "exampleTranslation": "Đi tới ngã ba rồi rẽ sang trái nhé.",
    "culturalInsight": "Từ địa phương \"quày\" nghĩa là \"rẽ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_3my6g",
    "word": "lè",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bắp chân",
    "example": "Đau cấy lè nỏ đi nhanh được.",
    "exampleTranslation": "Đau cái bắp chân không đi nhanh được.",
    "culturalInsight": "Từ địa phương \"lè\" nghĩa là \"bắp chân\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_ygx9s",
    "word": "bảo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "biểu",
    "example": "Bọ biểu mi ra cươi quét nhà tề.",
    "exampleTranslation": "Bố bảo mày ra sân quét nhà kìa.",
    "culturalInsight": "Từ địa phương \"bảo\" nghĩa là \"biểu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737393_sir2g",
    "word": "kêu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nói",
    "example": "Hấn kêu mi vô nhà ăn cơm tề.",
    "exampleTranslation": "Nó nói mày vào nhà ăn cơm kìa.",
    "culturalInsight": "Từ địa phương \"kêu\" nghĩa là \"nói\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737394_2vc1h",
    "word": "su",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sâu",
    "example": "Rào ni su lắm, đừng có xuống tắm.",
    "exampleTranslation": "Sông này sâu lắm, đừng có xuống tắm.",
    "culturalInsight": "Từ địa phương \"su\" nghĩa là \"sâu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737394_hmkc3",
    "word": "ót",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gáy",
    "example": "Bị đánh trúng cấy ót đau rành.",
    "exampleTranslation": "Bị đánh trúng cái gáy đau lắm.",
    "culturalInsight": "Từ địa phương \"ót\" nghĩa là \"gáy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737394_y5xtk",
    "word": "tán tỉnh",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cưa cẩm",
    "example": "Hấn đang cưa cẩm con du nhà bác Nam.",
    "exampleTranslation": "Nó đang tán tỉnh con dâu nhà bác Nam.",
    "culturalInsight": "Từ địa phương \"tán tỉnh\" nghĩa là \"cưa cẩm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737395_0nays",
    "word": "tẹo, tí",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xíu, lát",
    "example": "Người xứ Nghệ dùng từ \"tẹo, tí\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tẹo, tí\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tẹo, tí\" nghĩa là \"xíu, lát\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737395_e27aq",
    "word": "ở đầu tê",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ở đằng kia",
    "example": "Cấy ốt nằm ở đầu tê tề.",
    "exampleTranslation": "Cửa tiệm nằm ở đằng kia kìa.",
    "culturalInsight": "Từ địa phương \"ở đầu tê\" nghĩa là \"ở đằng kia\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737395_t6qx1",
    "word": "trợn mắt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trừng mắt",
    "example": "Hấn trợn mắt nhìn tau ghê quá.",
    "exampleTranslation": "Nó trừng mắt nhìn tao ghê quá.",
    "culturalInsight": "Từ địa phương \"trợn mắt\" nghĩa là \"trừng mắt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737395_nbew7",
    "word": "nguýt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lườm",
    "example": "Đi qua hấn nguýt tau một cái.",
    "exampleTranslation": "Đi qua nó lườm tao một cái.",
    "culturalInsight": "Từ địa phương \"nguýt\" nghĩa là \"lườm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737395_5sp6w",
    "word": "mọi bựa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đợt rồi",
    "example": "Mọi bựa tau chộ mi ở chợ tề.",
    "exampleTranslation": "Đợt rồi tao thấy mày ở chợ kìa.",
    "culturalInsight": "Từ địa phương \"mọi bựa\" nghĩa là \"đợt rồi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737396_iyku5",
    "word": "mọi hồi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngày trước",
    "example": "Mọi hồi vùng ni toàn là rú rừng.",
    "exampleTranslation": "Ngày trước vùng này toàn là núi rừng.",
    "culturalInsight": "Từ địa phương \"mọi hồi\" nghĩa là \"ngày trước\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737396_wgoc5",
    "word": "vả",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tát",
    "example": "Người xứ Nghệ dùng từ \"vả\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"vả\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"vả\" nghĩa là \"tát\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737396_erjkz",
    "word": "bơ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bạt tai",
    "example": "Người xứ Nghệ dùng từ \"bơ\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"bơ\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"bơ\" nghĩa là \"bạt tai\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737396_mnljt",
    "word": "bộng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lỗ",
    "example": "Cơn gỗ ni có cấy bộng to rành.",
    "exampleTranslation": "Cây gỗ này có cái lỗ to lắm.",
    "culturalInsight": "Từ địa phương \"bộng\" nghĩa là \"lỗ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737397_9rrkp",
    "word": "tương",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh VD: tương cho 1 phát bây giừ",
    "example": "Người xứ Nghệ dùng từ \"tương\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tương\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tương\" nghĩa là \"đánh VD: tương cho 1 phát bây giừ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737397_v9usx",
    "word": "tẩn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh VD: tẩn cho 1 trận bây giừ",
    "example": "Người xứ Nghệ dùng từ \"tẩn\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tẩn\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tẩn\" nghĩa là \"đánh VD: tẩn cho 1 trận bây giừ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737397_x1yha",
    "word": "nện",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh",
    "example": "Người xứ Nghệ dùng từ \"nện\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"nện\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"nện\" nghĩa là \"đánh\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737397_98t96",
    "word": "vạng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "phang",
    "example": "Người xứ Nghệ dùng từ \"vạng\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"vạng\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"vạng\" nghĩa là \"phang\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737397_hq81h",
    "word": "cả bầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cả lũ",
    "example": "Cả bầy rủ nhau đi nhởi ngoài rào.",
    "exampleTranslation": "Cả lũ rủ nhau đi chơi ngoài sông.",
    "culturalInsight": "Từ địa phương \"cả bầy\" nghĩa là \"cả lũ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737398_ik3vc",
    "word": "xòe",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngã",
    "example": "Chạy nhanh quá ngã xòe một cái.",
    "exampleTranslation": "Chạy nhanh quá ngã xoè một cái.",
    "culturalInsight": "Từ địa phương \"xòe\" nghĩa là \"ngã\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737398_gbca1",
    "word": "con me",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "con bê ( con bò con)",
    "example": "Con me đang theo bò mẹ ra đồng.",
    "exampleTranslation": "Con bê đang theo bò mẹ ra đồng.",
    "culturalInsight": "Từ địa phương \"con me\" nghĩa là \"con bê ( con bò con)\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737398_zpu9c",
    "word": "rang",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nướng",
    "example": "Bọ đem khoai ra rang ăn cho nóng.",
    "exampleTranslation": "Bố đem khoai ra nướng ăn cho nóng.",
    "culturalInsight": "Từ địa phương \"rang\" nghĩa là \"nướng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737398_p3uk8",
    "word": "huề",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hòa, hòa “huề vốn",
    "example": "Đá bóng hai đội huề nhau rồi.",
    "exampleTranslation": "Đá bóng hai đội hòa nhau rồi.",
    "culturalInsight": "Từ địa phương \"huề\" nghĩa là \"hòa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737399_xvb9u",
    "word": "cảy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sưng (tương tự như tiếng Quảng Trị), sưng. VD: cảy 1 cục",
    "example": "Ngã bổ cảy một cục trên trốc cúi.",
    "exampleTranslation": "Ngã đau sưng một cục trên đầu gối.",
    "culturalInsight": "Từ địa phương \"cảy\" nghĩa là \"sưng (tương tự như tiếng Quảng Trị)\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737399_xijkr",
    "word": "sẹo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thẹo",
    "example": "Té ngã để lại cấy sẹo trên cẳng.",
    "exampleTranslation": "Té ngã để lại cái thẹo trên chân.",
    "culturalInsight": "Từ địa phương \"sẹo\" nghĩa là \"thẹo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737399_4cpl9",
    "word": "mần vầy đi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "làm bừa đi",
    "example": "Cứ mần vầy đi cho kịp giờ hấy.",
    "exampleTranslation": "Cứ làm bừa đi cho kịp giờ nhé.",
    "culturalInsight": "Từ địa phương \"mần vầy đi\" nghĩa là \"làm bừa đi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737399_832k0",
    "word": "ba hoa, ba láp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bốc phét",
    "example": "Người xứ Nghệ dùng từ \"ba hoa, ba láp\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"ba hoa, ba láp\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"ba hoa, ba láp\" nghĩa là \"bốc phét\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_gttgs",
    "word": "đèo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chở",
    "example": "Cho tau đèo mi đi nhởi hấy.",
    "exampleTranslation": "Để tao chở mày đi chơi nhé.",
    "culturalInsight": "Từ địa phương \"đèo\" nghĩa là \"chở\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_c4hcf",
    "word": "quán nét",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hàng nét",
    "example": "Mấy đứa lại chui vô quán nét rồi.",
    "exampleTranslation": "Mấy đứa lại chui vào hàng nét rồi.",
    "culturalInsight": "Từ địa phương \"quán nét\" nghĩa là \"hàng nét\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_kgfue",
    "word": "ốt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "quán - tiệm",
    "example": "Ra cấy ốt đầu đàng mua đọi nác.",
    "exampleTranslation": "Ra cái quán đầu đường mua bát nước.",
    "culturalInsight": "Từ địa phương \"ốt\" nghĩa là \"quán - tiệm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_s2pxz",
    "word": "nghìn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngàn (xem thêm ngàn hay nghìn)",
    "example": "Cho tau xin năm ngàn mua cấy bánh.",
    "exampleTranslation": "Cho tao xin năm nghìn mua cái bánh.",
    "culturalInsight": "Từ địa phương \"nghìn\" nghĩa là \"ngàn (xem thêm ngàn hay nghìn)\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_1fxwe",
    "word": "nấp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "núp",
    "example": "Trốn nấp sau cơn xoài kẻo bị chộ.",
    "exampleTranslation": "Trốn núp sau cây xoài kẻo bị thấy.",
    "culturalInsight": "Từ địa phương \"nấp\" nghĩa là \"núp\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737400_j7sxo",
    "word": "rình",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rình mò",
    "example": "Mấy con mèo rình chuột ngoài cươi.",
    "exampleTranslation": "Mấy con mèo rình chuột ngoài sân.",
    "culturalInsight": "Từ địa phương \"rình\" nghĩa là \"rình mò\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_gux2j",
    "word": "trật",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trượt - hụt",
    "example": "Chạy trượt chân té trật luôn.",
    "exampleTranslation": "Chạy trượt chân té trượt luôn.",
    "culturalInsight": "Từ địa phương \"trật\" nghĩa là \"trượt - hụt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_uqcbs",
    "word": "giựt thột",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "giật mình",
    "example": "Nghe tiếng nổ làm tau giựt thột.",
    "exampleTranslation": "Nghe tiếng nổ làm tao giật mình.",
    "culturalInsight": "Từ địa phương \"giựt thột\" nghĩa là \"giật mình\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_sjm9d",
    "word": "to",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lớn",
    "example": "Cấy nhà ni to rành luôn.",
    "exampleTranslation": "Cái nhà này lớn lắm luôn.",
    "culturalInsight": "Từ địa phương \"to\" nghĩa là \"lớn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_h1lk7",
    "word": "rèo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nài nỉ",
    "example": "Hấn rèo tau đi nhởi cùng hấn.",
    "exampleTranslation": "Nó nài nỉ tao đi chơi cùng nó.",
    "culturalInsight": "Từ địa phương \"rèo\" nghĩa là \"nài nỉ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_kcn39",
    "word": "kíu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cứu. VD: kiú tui với",
    "example": "Kiú tui với, trượt chân rồi!",
    "exampleTranslation": "Cứu tôi với, trượt chân rồi!",
    "culturalInsight": "Từ địa phương \"kíu\" nghĩa là \"cứu. VD: kiú tui với\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737401_2ddni",
    "word": "đậu pha",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tào phớ",
    "example": "Mạ mua đọi đậu pha ăn mát rành.",
    "exampleTranslation": "Mẹ mua bát tào phớ ăn mát lắm.",
    "culturalInsight": "Từ địa phương \"đậu pha\" nghĩa là \"tào phớ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737402_6br4u",
    "word": "nhỏ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bé",
    "example": "Con chó ni nhỏ xíu à.",
    "exampleTranslation": "Con chó này bé xíu à.",
    "culturalInsight": "Từ địa phương \"nhỏ\" nghĩa là \"bé\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737402_o6x0h",
    "word": "lạc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đậu phộng",
    "example": "Bọ rang đĩa lạc nhắm rượu.",
    "exampleTranslation": "Bố rang đĩa đậu phộng nhắm rượu.",
    "culturalInsight": "Từ địa phương \"lạc\" nghĩa là \"đậu phộng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737402_nixoc",
    "word": "véo, chít",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nhéo",
    "example": "Người xứ Nghệ dùng từ \"véo, chít\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"véo, chít\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"véo, chít\" nghĩa là \"nhéo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737402_13tj0",
    "word": "xoa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thoa",
    "example": "Xoa ít dầu vô trốc cúi cho bớt đau.",
    "exampleTranslation": "Thoa ít dầu vào đầu gối cho bớt đau.",
    "culturalInsight": "Từ địa phương \"xoa\" nghĩa là \"thoa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737403_sykcf",
    "word": "đành hanh",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bắt bẻ",
    "example": "Hấn đành hanh lắm, nỏ ai ưa.",
    "exampleTranslation": "Nó bắt bẻ lắm, không ai ưa.",
    "culturalInsight": "Từ địa phương \"đành hanh\" nghĩa là \"bắt bẻ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737403_gpwr6",
    "word": "chót",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bét",
    "example": "Hấn học đứng chót lớp rồi.",
    "exampleTranslation": "Nó học đứng bét lớp rồi.",
    "culturalInsight": "Từ địa phương \"chót\" nghĩa là \"bét\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737403_z3vyb",
    "word": "na",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mang theo",
    "example": "Na cấy nón đi kẻo nắng hấy.",
    "exampleTranslation": "Mang theo cái nón đi kẻo nắng nhé.",
    "culturalInsight": "Từ địa phương \"na\" nghĩa là \"mang theo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737403_dp7wj",
    "word": "nhọc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mệt",
    "example": "Đi mần nương về nhọc quá.",
    "exampleTranslation": "Đi làm vườn về mệt quá.",
    "culturalInsight": "Từ địa phương \"nhọc\" nghĩa là \"mệt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737403_sny7a",
    "word": "đậu phụ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tàu hũ",
    "example": "Mạ rán đĩa đậu phụ ăn cơm.",
    "exampleTranslation": "Mẹ chiên đĩa tàu hũ ăn cơm.",
    "culturalInsight": "Từ địa phương \"đậu phụ\" nghĩa là \"tàu hũ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_sgev3",
    "word": "riệu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rượu",
    "example": "Bọ ngồi uống đọi riệu với bác.",
    "exampleTranslation": "Bố ngồi uống bát rượu với bác.",
    "culturalInsight": "Từ địa phương \"riệu\" nghĩa là \"rượu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_41e25",
    "word": "rờ rờ rận rận",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vớ va vớ vẩn",
    "example": "Toàn nói chuyện rờ rờ rận rận nỏ ra chi.",
    "exampleTranslation": "Toàn nói chuyện vớ va vớ vẩn không ra gì.",
    "culturalInsight": "Từ địa phương \"rờ rờ rận rận\" nghĩa là \"vớ va vớ vẩn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_3z0uf",
    "word": "thu mua đồng nhôm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thu mua ve chai",
    "example": "Mấy bà thu mua đồng nhôm đi qua đàng kìa.",
    "exampleTranslation": "Mấy bà thu mua ve chai đi qua đường kìa.",
    "culturalInsight": "Từ địa phương \"thu mua đồng nhôm\" nghĩa là \"thu mua ve chai\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_f1phb",
    "word": "đệm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nệm",
    "example": "Mùa đông nằm đệm cho ấm.",
    "exampleTranslation": "Mùa đông nằm nệm cho ấm.",
    "culturalInsight": "Từ địa phương \"đệm\" nghĩa là \"nệm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_xtqsb",
    "word": "trét",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bôi, bôi\"trét lên tường",
    "example": "Trét ít sơn lên bức tường ni.",
    "exampleTranslation": "Bôi ít sơn lên bức tường này.",
    "culturalInsight": "Từ địa phương \"trét\" nghĩa là \"bôi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737404_xylpl",
    "word": "trửa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "giữa",
    "example": "Nằm trửa nhà cho mát.",
    "exampleTranslation": "Nằm giữa nhà cho mát.",
    "culturalInsight": "Từ địa phương \"trửa\" nghĩa là \"giữa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737405_x5xh6",
    "word": "hu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thảy",
    "example": "Hu cấy bóng lại đây tau bắt mồ.",
    "exampleTranslation": "Thảy cái bóng lại đây tao bắt nào.",
    "culturalInsight": "Từ địa phương \"hu\" nghĩa là \"thảy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737405_afm7p",
    "word": "bớp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chụp, cave",
    "example": "Hu bóng lên tau bớp cho hấy.",
    "exampleTranslation": "Tung bóng lên tao chụp cho nhé.",
    "culturalInsight": "Từ địa phương \"bớp\" nghĩa là \"chụp\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737405_g4lf8",
    "word": "hu và bớp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tung và hứng",
    "example": "Hai đứa chơi trò hu và bớp bóng.",
    "exampleTranslation": "Hai đứa chơi trò tung và hứng bóng.",
    "culturalInsight": "Từ địa phương \"hu và bớp\" nghĩa là \"tung và hứng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737405_rhmys",
    "word": "trèo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "leo, leo “ trèo cây",
    "example": "Đừng có trèo cơn xoài kẻo bổ đó.",
    "exampleTranslation": "Đừng có leo cây xoài kẻo ngã đấy.",
    "culturalInsight": "Từ địa phương \"trèo\" nghĩa là \"leo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737405_dczog",
    "word": "bứt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bẻ, ngắt “ bứt hoa",
    "example": "Bứt cho mạ mấy lá trù vô đây.",
    "exampleTranslation": "Ngắt cho mẹ mấy lá trầu vào đây.",
    "culturalInsight": "Từ địa phương \"bứt\" nghĩa là \"bẻ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737406_4c93i",
    "word": "xán",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ném \" xán viên đá",
    "example": "Đừng xán đá ra đàng nguy hiểm lắm.",
    "exampleTranslation": "Đừng ném đá ra đường nguy hiểm lắm.",
    "culturalInsight": "Từ địa phương \"xán\" nghĩa là \"ném \" xán viên đá\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737406_l3g92",
    "word": "rờ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sờ",
    "example": "Rờ vô xem nác ấm chưa mồ.",
    "exampleTranslation": "Sờ vào xem nước ấm chưa nào.",
    "culturalInsight": "Từ địa phương \"rờ\" nghĩa là \"sờ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737406_fgtzi",
    "word": "vọc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nghịch",
    "example": "Đừng có vọc nác dơ hết áo quần.",
    "exampleTranslation": "Đừng có nghịch nước bẩn hết quần áo.",
    "culturalInsight": "Từ địa phương \"vọc\" nghĩa là \"nghịch\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737406_o1n37",
    "word": "khi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lúc",
    "example": "Khi nại tau chộ mi ngoài chợ tề.",
    "exampleTranslation": "Lúc nãy tao thấy mày ngoài chợ kìa.",
    "culturalInsight": "Từ địa phương \"khi\" nghĩa là \"lúc\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737406_c3zh7",
    "word": "rệt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rượt",
    "example": "Con chó đang rệt con mèo ngoài cươi.",
    "exampleTranslation": "Con chó đang rượt con mèo ngoài sân.",
    "culturalInsight": "Từ địa phương \"rệt\" nghĩa là \"rượt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737407_3prcw",
    "word": "chộ mô rứa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chỗ nào đấy",
    "example": "Mi đang ở chộ mô rứa?",
    "exampleTranslation": "Mày đang ở chỗ nào đấy?",
    "culturalInsight": "Từ địa phương \"chộ mô rứa\" nghĩa là \"chỗ nào đấy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737407_zevmv",
    "word": "bẩy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bẫy",
    "example": "Đặt cấy bẩy bắt chuột ngoài nương.",
    "exampleTranslation": "Đặt cái bẫy bắt chuột ngoài vườn.",
    "culturalInsight": "Từ địa phương \"bẩy\" nghĩa là \"bẫy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737407_28s29",
    "word": "lạt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nhạt",
    "example": "Canh ni nấu hơi lạt rồi mạ ơi.",
    "exampleTranslation": "Canh này nấu hơi nhạt rồi mẹ ơi.",
    "culturalInsight": "Từ địa phương \"lạt\" nghĩa là \"nhạt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737407_cdre4",
    "word": "giúp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "giùm",
    "example": "Mần giúp tau cấy ni với mồ.",
    "exampleTranslation": "Làm giùm tao cái này với nào.",
    "culturalInsight": "Từ địa phương \"giúp\" nghĩa là \"giùm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737408_0h8xa",
    "word": "bị troẹo cổ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bị ngáo cô",
    "example": "Ngủ sai tư thế nên bị troẹo cổ rồi.",
    "exampleTranslation": "Ngủ sai tư thế nên bị ngáo cổ rồi.",
    "culturalInsight": "Từ địa phương \"bị troẹo cổ\" nghĩa là \"bị ngáo cô\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737408_1blvg",
    "word": "ống xả",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bô \" của xe máy\"",
    "example": "Cấy ống xả xe máy nổ to rành.",
    "exampleTranslation": "Cái bô xe máy nổ to lắm.",
    "culturalInsight": "Từ địa phương \"ống xả\" nghĩa là \"bô \" của xe máy\"\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737408_ohcyf",
    "word": "nhoi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nhìn trộm",
    "example": "Đừng có nhoi vô phòng người khác rứa.",
    "exampleTranslation": "Đừng có nhìn trộm vào phòng người khác thế.",
    "culturalInsight": "Từ địa phương \"nhoi\" nghĩa là \"nhìn trộm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737408_kkeq4",
    "word": "súp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bột canh",
    "example": "Cho ít súp vô canh cho vừa ăn.",
    "exampleTranslation": "Cho ít bột canh vào canh cho vừa ăn.",
    "culturalInsight": "Từ địa phương \"súp\" nghĩa là \"bột canh\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737408_83c19",
    "word": "đị",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "điệu",
    "example": "Con gái mà đị rành luôn.",
    "exampleTranslation": "Con gái mà điệu lắm luôn.",
    "culturalInsight": "Từ địa phương \"đị\" nghĩa là \"điệu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737409_euo6p",
    "word": "loong bia",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lon bia",
    "example": "Bọ uống hết một loong bia rồi.",
    "exampleTranslation": "Bố uống hết một lon bia rồi.",
    "culturalInsight": "Từ địa phương \"loong bia\" nghĩa là \"lon bia\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737409_227hq",
    "word": "cẳng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chân",
    "example": "Đau cấy cẳng nỏ đi đâu được.",
    "exampleTranslation": "Đau cái chân không đi đâu được.",
    "culturalInsight": "Từ địa phương \"cẳng\" nghĩa là \"chân\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737409_hml8m",
    "word": "rọt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ruột",
    "example": "Đau cấy rọt quá nỏ ăn được chi.",
    "exampleTranslation": "Đau cái ruột quá không ăn được gì.",
    "culturalInsight": "Từ địa phương \"rọt\" nghĩa là \"ruột\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737410_yragj",
    "word": "bằng tày",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bằng không",
    "example": "Mần nãy giờ kết quả cụng bằng tày.",
    "exampleTranslation": "Làm nãy giờ kết quả cũng bằng không.",
    "culturalInsight": "Từ địa phương \"bằng tày\" nghĩa là \"bằng không\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737410_vyjoo",
    "word": "chốc nữa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chút nữa",
    "example": "Chốc nữa tau sang nhà mi nhởi hấy.",
    "exampleTranslation": "Chút nữa tao sang nhà mày chơi nhé.",
    "culturalInsight": "Từ địa phương \"chốc nữa\" nghĩa là \"chút nữa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737410_xe5lm",
    "word": "bể",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vỡ",
    "example": "Cấy đọi bị rơi bể mất rồi.",
    "exampleTranslation": "Cái bát bị rơi vỡ mất rồi.",
    "culturalInsight": "Từ địa phương \"bể\" nghĩa là \"vỡ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_lry4f",
    "word": "đút lót",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hối lộ",
    "example": "Mần việc sai trái rồi đút lót cho người ta.",
    "exampleTranslation": "Làm việc sai trái rồi hối lộ cho người ta.",
    "culturalInsight": "Từ địa phương \"đút lót\" nghĩa là \"hối lộ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_keupc",
    "word": "bàn là",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bàn ủi",
    "example": "Lấy cấy bàn là ra là cấy áo cho thẳng.",
    "exampleTranslation": "Lấy cái bàn ủi ra ủi cái áo cho thẳng.",
    "culturalInsight": "Từ địa phương \"bàn là\" nghĩa là \"bàn ủi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_sd08z",
    "word": "cấy chạc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái dây",
    "example": "Cột cấy chạc ni chặt lại hấy.",
    "exampleTranslation": "Buộc cái dây này chặt lại nhé.",
    "culturalInsight": "Từ địa phương \"cấy chạc\" nghĩa là \"cái dây\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_byd33",
    "word": "nạm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nắm",
    "example": "Lấy một nạm gạo bỏ vô nồi.",
    "exampleTranslation": "Lấy một nắm gạo bỏ vào nồi.",
    "culturalInsight": "Từ địa phương \"nạm\" nghĩa là \"nắm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_xdz01",
    "word": "đại",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "khá",
    "example": "Hấn học cụng đại rành luôn.",
    "exampleTranslation": "Nó học cũng khá lắm luôn.",
    "culturalInsight": "Từ địa phương \"đại\" nghĩa là \"khá\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737411_nmgrr",
    "word": "rành",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rất, rất. VD: hắn học rành giỏi",
    "example": "Hấn học rành giỏi luôn đó.",
    "exampleTranslation": "Nó học rất giỏi luôn đấy.",
    "culturalInsight": "Từ địa phương \"rành\" nghĩa là \"rất\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737412_krdkt",
    "word": "một chắc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "một mình",
    "example": "Tau ở nhà một chắc nỏ có ai.",
    "exampleTranslation": "Tao ở nhà một mình không có ai.",
    "culturalInsight": "Từ địa phương \"một chắc\" nghĩa là \"một mình\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737412_wxlq0",
    "word": "cột chạc lại",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "buộc dây lại",
    "example": "Cột chạc lại kẻo tuột đó hấy.",
    "exampleTranslation": "Buộc dây lại kẻo tuột đấy nhé.",
    "culturalInsight": "Từ địa phương \"cột chạc lại\" nghĩa là \"buộc dây lại\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737412_006cy",
    "word": "rứa tê mà",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thế cơ mà",
    "example": "Rứa tê mà tau nỏ biết chi cả.",
    "exampleTranslation": "Thế cơ mà tao không biết gì cả.",
    "culturalInsight": "Từ địa phương \"rứa tê mà\" nghĩa là \"thế cơ mà\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737413_c1z23",
    "word": "rớt tiền tề",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rơi tiền kìa",
    "example": "Mi bị rớt tiền tề mi ơi!",
    "exampleTranslation": "Mày bị rơi tiền kìa mày ơi!",
    "culturalInsight": "Từ địa phương \"rớt tiền tề\" nghĩa là \"rơi tiền kìa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737413_0yf86",
    "word": "cấy bị",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái túi lớn",
    "example": "Bỏ ló vô cấy bị ni mang về.",
    "exampleTranslation": "Bỏ lúa vào cái túi lớn này mang về.",
    "culturalInsight": "Từ địa phương \"cấy bị\" nghĩa là \"cái túi lớn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737413_1tvjz",
    "word": "tẩn cho 1 trận",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh cho 1 tận",
    "example": "Người xứ Nghệ dùng từ \"tẩn cho 1 trận\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tẩn cho 1 trận\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tẩn cho 1 trận\" nghĩa là \"đánh cho 1 tận\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737413_cde09",
    "word": "choảng nhau",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh nhau",
    "example": "Người xứ Nghệ dùng từ \"choảng nhau\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"choảng nhau\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"choảng nhau\" nghĩa là \"đánh nhau\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737414_32p09",
    "word": "bâu sâu, thoi boi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xen hoặc xía vào chuyện người khác",
    "example": "Người xứ Nghệ dùng từ \"bâu sâu, thoi boi\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"bâu sâu, thoi boi\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"bâu sâu, thoi boi\" nghĩa là \"xen hoặc xía vào chuyện người khác\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_3gf5q",
    "word": "giảm xóc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "phuộc \" của xe máy\"",
    "example": "Thay cấy giảm xóc xe máy đi cho êm.",
    "exampleTranslation": "Thay cái phuộc xe máy đi cho êm.",
    "culturalInsight": "Từ địa phương \"giảm xóc\" nghĩa là \"phuộc \" của xe máy\"\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_fu87f",
    "word": "cân",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ký \"mi nặng mấy cân",
    "example": "Mi dạo ni nặng mấy cân rồi?",
    "exampleTranslation": "Mày dạo này nặng mấy ký rồi?",
    "culturalInsight": "Từ địa phương \"cân\" nghĩa là \"ký \"mi nặng mấy cân\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_85lxn",
    "word": "mấy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bao nhiêu",
    "example": "Cấy ni giá mấy tiền rứa?",
    "exampleTranslation": "Cái này giá bao nhiêu tiền thế?",
    "culturalInsight": "Từ địa phương \"mấy\" nghĩa là \"bao nhiêu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_7pdyr",
    "word": "chạm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đụng",
    "example": "Đừng chạm vô đọi nác nóng đó.",
    "exampleTranslation": "Đừng đụng vào bát nước nóng đó.",
    "culturalInsight": "Từ địa phương \"chạm\" nghĩa là \"đụng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_6qg88",
    "word": "thúc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "húc",
    "example": "Con tru đang thúc vô cơn xoài.",
    "exampleTranslation": "Con trâu đang húc vào cây xoài.",
    "culturalInsight": "Từ địa phương \"thúc\" nghĩa là \"húc\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737415_5vskm",
    "word": "ngậm miệng đi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "câm mồm đi",
    "example": "Người xứ Nghệ dùng từ \"ngậm miệng đi\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"ngậm miệng đi\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"ngậm miệng đi\" nghĩa là \"câm mồm đi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737416_el7us",
    "word": "cây",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "km",
    "example": "Từ nhà ra chợ còn hai cây nữa.",
    "exampleTranslation": "Từ nhà ra chợ còn hai km nữa.",
    "culturalInsight": "Từ địa phương \"cây\" nghĩa là \"km\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737416_v72jb",
    "word": "khiếp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "kinh",
    "example": "Nhìn cấy đàng dơ khiếp rành.",
    "exampleTranslation": "Nhìn cái đường bẩn kinh thật.",
    "culturalInsight": "Từ địa phương \"khiếp\" nghĩa là \"kinh\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737416_aifjj",
    "word": "so bì",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sánh bằng",
    "example": "Đừng có so bì hơn thua mần chi.",
    "exampleTranslation": "Đừng có so bì hơn thua làm gì.",
    "culturalInsight": "Từ địa phương \"so bì\" nghĩa là \"sánh bằng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737416_d9rwj",
    "word": "út",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chót",
    "example": "Hấn là con út trong nhà.",
    "exampleTranslation": "Nó là con chót trong nhà.",
    "culturalInsight": "Từ địa phương \"út\" nghĩa là \"chót\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737416_7h1rw",
    "word": "chém mồm chém miệng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trộm vía",
    "example": "Chém mồm chém miệng em bé dạo ni ngoan rành.",
    "exampleTranslation": "Trộm vía em bé dạo này ngoan lắm.",
    "culturalInsight": "Từ địa phương \"chém mồm chém miệng\" nghĩa là \"trộm vía\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737417_00efo",
    "word": "nói như thật",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nói như đúng rồi",
    "example": "Hấn nói như thật mần tau tin sái cổ.",
    "exampleTranslation": "Nó nói như đúng rồi làm tao tin sái cổ.",
    "culturalInsight": "Từ địa phương \"nói như thật\" nghĩa là \"nói như đúng rồi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737417_l01y9",
    "word": "quăng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vứt",
    "example": "Quăng cấy rác ni ra thùng rác mồ.",
    "exampleTranslation": "Vứt cái rác này ra thùng rác nào.",
    "culturalInsight": "Từ địa phương \"quăng\" nghĩa là \"vứt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737417_hh73w",
    "word": "ở một chắc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ở một mình",
    "example": "Đêm ni tau ở một chắc ở nhà.",
    "exampleTranslation": "Đêm nay tao ở một mình ở nhà.",
    "culturalInsight": "Từ địa phương \"ở một chắc\" nghĩa là \"ở một mình\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737417_mgx94",
    "word": "vừng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mè",
    "example": "Bánh đa rắc nhiều vừng thơm rành.",
    "exampleTranslation": "Bánh đa rắc nhiều mè thơm lắm.",
    "culturalInsight": "Từ địa phương \"vừng\" nghĩa là \"mè\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737418_p4hc6",
    "word": "rớt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "rơi",
    "example": "Rớt cấy kéo xuống đất rồi tề.",
    "exampleTranslation": "Rơi cái kéo xuống đất rồi kìa.",
    "culturalInsight": "Từ địa phương \"rớt\" nghĩa là \"rơi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737418_oc7w3",
    "word": "liệt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "phê hoặc quá mệt",
    "example": "Đi mần về mệt liệt cả người.",
    "exampleTranslation": "Đi làm về mệt quá mệt cả người.",
    "culturalInsight": "Từ địa phương \"liệt\" nghĩa là \"phê hoặc quá mệt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737418_4371r",
    "word": "rán",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chiên",
    "example": "Mạ rán cá thơm phức cả nhà.",
    "exampleTranslation": "Mẹ chiên cá thơm phức cả nhà.",
    "culturalInsight": "Từ địa phương \"rán\" nghĩa là \"chiên\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737418_ye8g7",
    "word": "tợn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bặm trợn",
    "example": "Nhìn mặt hấn tợn rành luôn.",
    "exampleTranslation": "Nhìn mặt nó bặm trợn lắm luôn.",
    "culturalInsight": "Từ địa phương \"tợn\" nghĩa là \"bặm trợn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737419_mo08f",
    "word": "cứ a răng á",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cứ thế nào ấy",
    "example": "Nhìn cấy nhà ni cứ a răng á.",
    "exampleTranslation": "Nhìn cái nhà này cứ thế nào ấy.",
    "culturalInsight": "Từ địa phương \"cứ a răng á\" nghĩa là \"cứ thế nào ấy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737419_t77d3",
    "word": "đáng ghét",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "kỳ cục",
    "example": "Cấy tính hấn đáng ghét rành.",
    "exampleTranslation": "Cái tính nó kỳ cục lắm.",
    "culturalInsight": "Từ địa phương \"đáng ghét\" nghĩa là \"kỳ cục\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737419_p2jon",
    "word": "kưng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chiều chuộng",
    "example": "Bọ kưng đứa con út nhất nhà.",
    "exampleTranslation": "Bố chiều chuộng đứa con chót nhất nhà.",
    "culturalInsight": "Từ địa phương \"kưng\" nghĩa là \"chiều chuộng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737420_2ok4y",
    "word": "mến",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "quý",
    "example": "Tau mến cấy nết ngoan ngoãn của mi.",
    "exampleTranslation": "Tao quý cái nết ngoan ngoãn của mày.",
    "culturalInsight": "Từ địa phương \"mến\" nghĩa là \"quý\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737420_8sryj",
    "word": "ăn cắp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ăn trộm",
    "example": "Kẻ gian vô nương ăn cắp bù rợ.",
    "exampleTranslation": "Kẻ gian vào vườn ăn trộm bí đỏ.",
    "culturalInsight": "Từ địa phương \"ăn cắp\" nghĩa là \"ăn trộm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737420_actcf",
    "word": "ghẹo",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trêu",
    "example": "Đừng có ghẹo con chó kẻo hấn cắn.",
    "exampleTranslation": "Đừng có trêu con chó kẻo nó cắn.",
    "culturalInsight": "Từ địa phương \"ghẹo\" nghĩa là \"trêu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737420_7koku",
    "word": "lòi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hở",
    "example": "Áo bị rách lòi cả lưng rồi tề.",
    "exampleTranslation": "Áo bị rách hở cả lưng rồi kìa.",
    "culturalInsight": "Từ địa phương \"lòi\" nghĩa là \"hở\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737420_sdz46",
    "word": "cá tràu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cá quả",
    "example": "Mạ nấu nồi canh cá tràu ngọt rành.",
    "exampleTranslation": "Mẹ nấu nồi canh cá quả ngọt lắm.",
    "culturalInsight": "Từ địa phương \"cá tràu\" nghĩa là \"cá quả\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737421_f447u",
    "word": "khái",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "hổ",
    "example": "Ngày xưa trên rú ni nhiều khái lắm.",
    "exampleTranslation": "Ngày xưa trên núi này nhiều hổ lắm.",
    "culturalInsight": "Từ địa phương \"khái\" nghĩa là \"hổ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737421_ipa1z",
    "word": "cầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chó",
    "example": "Con cầy nhà tau khun rành luôn.",
    "exampleTranslation": "Con chó nhà tao khôn lắm luôn.",
    "culturalInsight": "Từ địa phương \"cầy\" nghĩa là \"chó\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737421_fnzzp",
    "word": "cấy chủi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái chổi",
    "example": "Lấy cấy chủi quét cấy cươi cho sạch.",
    "exampleTranslation": "Lấy cái chổi quét cái sân cho sạch.",
    "culturalInsight": "Từ địa phương \"cấy chủi\" nghĩa là \"cái chổi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737421_eakq2",
    "word": "khải",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gãi” khải lưng",
    "example": "Khải cho tau cấy lưng mồ, ngứa quá.",
    "exampleTranslation": "Gãi cho tao cái lưng nào, ngứa quá.",
    "culturalInsight": "Từ địa phương \"khải\" nghĩa là \"gãi” khải lưng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737422_6kxqk",
    "word": "ngoắc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "móc “móc quần áo",
    "example": "Ngoắc cấy áo lên cấy đinh tê kìa.",
    "exampleTranslation": "Móc cái áo lên cái đinh kia kìa.",
    "culturalInsight": "Từ địa phương \"ngoắc\" nghĩa là \"móc “móc quần áo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737422_nlz0e",
    "word": "1 nạm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "1 nắm “vd: 1 nạm gạo",
    "example": "Bỏ 1 nạm gạo vô nồi nấu cháo.",
    "exampleTranslation": "Bỏ 1 nắm gạo vào nồi nấu cháo.",
    "culturalInsight": "Từ địa phương \"1 nạm\" nghĩa là \"1 nắm “vd: 1 nạm gạo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737422_ph7qy",
    "word": "ngọ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngõ",
    "example": "Đi ra ngọ coi xe cộ hấy.",
    "exampleTranslation": "Đi ra ngõ xem xe cộ nhé.",
    "culturalInsight": "Từ địa phương \"ngọ\" nghĩa là \"ngõ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737422_7pmw2",
    "word": "nước sôi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nước lọc “ là nước lã đã nấu chín”",
    "example": "Uống đọi nước sôi cho sạch hấy.",
    "exampleTranslation": "Uống bát nước lọc cho sạch nhé.",
    "culturalInsight": "Từ địa phương \"nước sôi\" nghĩa là \"nước lọc “ là nước lã đã nấu chín”\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737423_w3op6",
    "word": "chín chắn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chững chạc",
    "example": "Dạo ni trông hấn chín chắn hẳn ra.",
    "exampleTranslation": "Dạo này trông nó chững chạc hẳn ra.",
    "culturalInsight": "Từ địa phương \"chín chắn\" nghĩa là \"chững chạc\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737423_4jil0",
    "word": "trọi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chọi",
    "example": "Mấy đứa nhỏ đang chơi trọi dế ngoài cươi.",
    "exampleTranslation": "Mấy đứa nhỏ đang chơi chọi dế ngoài sân.",
    "culturalInsight": "Từ địa phương \"trọi\" nghĩa là \"chọi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737423_gz85e",
    "word": "khỏ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gõ",
    "example": "Khỏ cựa ba cái cho người ta biết.",
    "exampleTranslation": "Gõ cửa ba cái cho người ta biết.",
    "culturalInsight": "Từ địa phương \"khỏ\" nghĩa là \"gõ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737423_n94f1",
    "word": "cù chuầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lầy, cù nhầy",
    "example": "Hấn cù chuầy lắm, nỏ chịu trả tiền.",
    "exampleTranslation": "Nó cù nhầy lắm, không chịu trả tiền.",
    "culturalInsight": "Từ địa phương \"cù chuầy\" nghĩa là \"lầy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_twq9o",
    "word": "phể mui",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nứt môi",
    "example": "Mùa đông trời lạnh nứt phể mui hết rồi.",
    "exampleTranslation": "Mùa đông trời lạnh nứt môi hết rồi.",
    "culturalInsight": "Từ địa phương \"phể mui\" nghĩa là \"nứt môi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_zxs7v",
    "word": "nhể",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nát, bựa",
    "example": "Đừng mần nhể cấy bánh ra rứa.",
    "exampleTranslation": "Đừng làm nát cái bánh ra thế.",
    "culturalInsight": "Từ địa phương \"nhể\" nghĩa là \"nát\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_ic12b",
    "word": "lặt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lượm, nhặt",
    "example": "Lặt mấy lá rau sâu bỏ đi hấy.",
    "exampleTranslation": "Nhặt mấy lá rau sâu bỏ đi nhé.",
    "culturalInsight": "Từ địa phương \"lặt\" nghĩa là \"lượm, nhặt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_0okzf",
    "word": "mưa lang",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mưa phùn",
    "example": "Trời đang mưa lang, đi nhớ mang ô hấy.",
    "exampleTranslation": "Trời đang mưa phùn, đi nhớ mang dù nhé.",
    "culturalInsight": "Từ địa phương \"mưa lang\" nghĩa là \"mưa phùn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_cdc6m",
    "word": "mũ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nón",
    "example": "Đội cấy mũ vô kẻo nắng trốc.",
    "exampleTranslation": "Đội cái nón vào kẻo nắng đầu.",
    "culturalInsight": "Từ địa phương \"mũ\" nghĩa là \"nón\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737424_pbor8",
    "word": "ô",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dù",
    "example": "Che cấy ô đi kẻo ướt áo.",
    "exampleTranslation": "Che cái dù đi kẻo ướt áo.",
    "culturalInsight": "Từ địa phương \"ô\" nghĩa là \"dù\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737425_di8cu",
    "word": "lai",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đèo",
    "example": "Để tau lai mi sang nhà o nhởi.",
    "exampleTranslation": "Để tao đèo mày sang nhà cô chơi.",
    "culturalInsight": "Từ địa phương \"lai\" nghĩa là \"đèo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737425_oj2lw",
    "word": "bấu víu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đeo bám",
    "example": "Đừng bấu víu mần chi cho mệt.",
    "exampleTranslation": "Đừng đeo bám làm gì cho mệt.",
    "culturalInsight": "Từ địa phương \"bấu víu\" nghĩa là \"đeo bám\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737425_tc14u",
    "word": "cấu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cào",
    "example": "Con mèo cấu rách cấy mấn rồi.",
    "exampleTranslation": "Con mèo cào rách cái váy rồi.",
    "culturalInsight": "Từ địa phương \"cấu\" nghĩa là \"cào\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737425_tve2v",
    "word": "thế nên",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bởi vậy",
    "example": "Hấn nhác lắm, thế nên mới học kém.",
    "exampleTranslation": "Nó lười lắm, bởi vậy mới học kém.",
    "culturalInsight": "Từ địa phương \"thế nên\" nghĩa là \"bởi vậy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737425_5xme3",
    "word": "khi nại",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lúc nãy",
    "example": "Khi nại tau mới chộ hấn ngoài chợ.",
    "exampleTranslation": "Lúc nãy tao mới thấy nó ngoài chợ.",
    "culturalInsight": "Từ địa phương \"khi nại\" nghĩa là \"lúc nãy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737426_86qzl",
    "word": "xỏ lá",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dối trá",
    "example": "Đừng có chơi trò xỏ lá gạt người ta.",
    "exampleTranslation": "Đừng có chơi trò dối trá gạt người ta.",
    "culturalInsight": "Từ địa phương \"xỏ lá\" nghĩa là \"dối trá\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737426_r8q4e",
    "word": "xé vé",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dìm hàng",
    "example": "Hấn toàn xé vé tau trước mặt bạn bè.",
    "exampleTranslation": "Nó toàn dìm hàng tao trước mặt bạn bè.",
    "culturalInsight": "Từ địa phương \"xé vé\" nghĩa là \"dìm hàng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737426_7hwle",
    "word": "trách chi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chả trách",
    "example": "Trách chi hấn nỏ chịu đi nhởi.",
    "exampleTranslation": "Chả trách nó không chịu đi chơi.",
    "culturalInsight": "Từ địa phương \"trách chi\" nghĩa là \"chả trách\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737427_izz3h",
    "word": "giựt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "giật”cướp giựt",
    "example": "Đi đàng nhớ cẩn thận kẻo bị giựt túi.",
    "exampleTranslation": "Đi đường nhớ cẩn thận kẻo bị giật túi.",
    "culturalInsight": "Từ địa phương \"giựt\" nghĩa là \"giật”cướp giựt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737427_2it69",
    "word": "mỏ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mồm",
    "example": "Người xứ Nghệ dùng từ \"mỏ\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"mỏ\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"mỏ\" nghĩa là \"mồm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737428_wimy5",
    "word": "cái đém",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cái bớt",
    "example": "Trên tay hấn có cấy đém đen to rành.",
    "exampleTranslation": "Trên tay nó có cái bớt đen to lắm.",
    "culturalInsight": "Từ địa phương \"cái đém\" nghĩa là \"cái bớt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737428_3yyk6",
    "word": "chén",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ly nhỏ",
    "example": "Rót đọi chén trà mời khách hấy.",
    "exampleTranslation": "Rót ly nhỏ trà mời khách nhé.",
    "culturalInsight": "Từ địa phương \"chén\" nghĩa là \"ly nhỏ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737428_3ml6v",
    "word": "cốc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ly",
    "example": "Cho tau xin cốc nác lạnh mồ.",
    "exampleTranslation": "Cho tao xin ly nước lạnh nào.",
    "culturalInsight": "Từ địa phương \"cốc\" nghĩa là \"ly\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737428_r5c3c",
    "word": "thìa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "muỗng",
    "example": "Lấy cấy thìa ra ăn cháo hấy.",
    "exampleTranslation": "Lấy cái muỗng ra ăn cháo nhé.",
    "culturalInsight": "Từ địa phương \"thìa\" nghĩa là \"muỗng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737429_jsyk0",
    "word": "nỉa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dĩa",
    "example": "Dùng cấy nỉa xiên miếng dưa hấu.",
    "exampleTranslation": "Dùng cái dĩa xiên miếng dưa hấu.",
    "culturalInsight": "Từ địa phương \"nỉa\" nghĩa là \"dĩa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737429_bxtub",
    "word": "tô",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bát to",
    "example": "Mạ múc cho tô canh to rành.",
    "exampleTranslation": "Mẹ múc cho bát to canh lớn lắm.",
    "culturalInsight": "Từ địa phương \"tô\" nghĩa là \"bát to\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737429_6pzpp",
    "word": "chưởi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chửi",
    "example": "Đừng chưởi nhau mần chi mệt người.",
    "exampleTranslation": "Đừng chửi nhau làm gì mệt người.",
    "culturalInsight": "Từ địa phương \"chưởi\" nghĩa là \"chửi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737429_2sutw",
    "word": "nhởi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chơi” đi nhởi",
    "example": "Chiều ni đi nhởi bóng đá nỏ?",
    "exampleTranslation": "Chiều nay đi chơi bóng đá không?",
    "culturalInsight": "Từ địa phương \"nhởi\" nghĩa là \"chơi” đi nhởi\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737429_om7pl",
    "word": "đập",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đánh. VD: chúng đang đập chắc",
    "example": "Đừng có đập con chó, tội nó.",
    "exampleTranslation": "Đừng có đánh con chó, tội nó.",
    "culturalInsight": "Từ địa phương \"đập\" nghĩa là \"đánh. VD: chúng đang đập chắc\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737430_8hm53",
    "word": "tróc,trợt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chầy xước",
    "example": "Người xứ Nghệ dùng từ \"tróc,trợt\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tróc,trợt\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tróc,trợt\" nghĩa là \"chầy xước\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737430_0bef6",
    "word": "bóc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mở “bóc gói bim bim",
    "example": "Bóc cấy gói bánh ni ra ăn hấy.",
    "exampleTranslation": "Mở cái gói bánh này ra ăn nhé.",
    "culturalInsight": "Từ địa phương \"bóc\" nghĩa là \"mở “bóc gói bim bim\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737430_s9ibi",
    "word": "chạc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dây",
    "example": "Buộc cấy chạc ni vô cọc hấy.",
    "exampleTranslation": "Buộc cái dây này vào cọc nhé.",
    "culturalInsight": "Từ địa phương \"chạc\" nghĩa là \"dây\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737431_nwepk",
    "word": "nót",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nuốt",
    "example": "Ăn chậm thôi kẻo nghẹn nỏ nót được.",
    "exampleTranslation": "Ăn chậm thôi kẻo nghẹn không nuốt được.",
    "culturalInsight": "Từ địa phương \"nót\" nghĩa là \"nuốt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737431_c63f7",
    "word": "giừ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "giờ “ giừ đi mô đây hả bây",
    "example": "Giừ đi mô đây hả bây?",
    "exampleTranslation": "Bây giờ đi đâu đây hả tụi mày?",
    "culturalInsight": "Từ địa phương \"giừ\" nghĩa là \"giờ “ giừ đi mô đây hả bây\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737431_pomo0",
    "word": "hè hoặc hầy",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nhỉ hoặc nhở",
    "example": "Hôm nay trời đẹp hè!",
    "exampleTranslation": "Hôm nay trời đẹp nhỉ!",
    "culturalInsight": "Từ địa phương \"hè hoặc hầy\" nghĩa là \"nhỉ hoặc nhở\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737432_0f3sn",
    "word": "chơ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chứ vd:”chơ răng nựa",
    "example": "Chơ răng nựa, đúng rồi đó!",
    "exampleTranslation": "Chứ sao nữa, đúng rồi đấy!",
    "culturalInsight": "Từ địa phương \"chơ\" nghĩa là \"chứ vd:”chơ răng nựa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737432_yxpup",
    "word": "bới cơm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xới cơm",
    "example": "Mạ bới cho đọi cơm đầy.",
    "exampleTranslation": "Mẹ xới cho bát cơm đầy.",
    "culturalInsight": "Từ địa phương \"bới cơm\" nghĩa là \"xới cơm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737432_yefau",
    "word": "đen đủi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xui xẻo",
    "example": "Hôm nay gặp toàn chuyện đen đủi.",
    "exampleTranslation": "Hôm nay gặp toàn chuyện xui xẻo.",
    "culturalInsight": "Từ địa phương \"đen đủi\" nghĩa là \"xui xẻo\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737432_9uoca",
    "word": "xon",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đỏ",
    "example": "Dạo ni gặp xon rành luôn.",
    "exampleTranslation": "Dạo này gặp đỏ lắm luôn.",
    "culturalInsight": "Từ địa phương \"xon\" nghĩa là \"đỏ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737432_6vg9t",
    "word": "nhác trượn rọt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "lười chảy thây",
    "example": "Người xứ Nghệ dùng từ \"nhác trượn rọt\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"nhác trượn rọt\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"nhác trượn rọt\" nghĩa là \"lười chảy thây\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_2ys9y",
    "word": "đùm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gói",
    "example": "Đùm cấy bánh ni mang đi học.",
    "exampleTranslation": "Gói cái bánh này mang đi học.",
    "culturalInsight": "Từ địa phương \"đùm\" nghĩa là \"gói\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_ssg96",
    "word": "quân nớ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bọn nó",
    "example": "Người xứ Nghệ dùng từ \"quân nớ\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"quân nớ\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"quân nớ\" nghĩa là \"bọn nó\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_mhtze",
    "word": "bày",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chỉ",
    "example": "Bày tau mần bài toán ni với mồ.",
    "exampleTranslation": "Chỉ tao làm bài toán này với nào.",
    "culturalInsight": "Từ địa phương \"bày\" nghĩa là \"chỉ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_t68la",
    "word": "phụ tiền thừa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "thối tiền thừa",
    "example": "Người ta phụ tiền thừa cho mi chưa?",
    "exampleTranslation": "Người ta thối tiền thừa cho mày chưa?",
    "culturalInsight": "Từ địa phương \"phụ tiền thừa\" nghĩa là \"thối tiền thừa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_xwhoy",
    "word": "đến",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tới",
    "example": "Đi đến nhà o nhởi mau lên.",
    "exampleTranslation": "Đi tới nhà cô chơi mau lên.",
    "culturalInsight": "Từ địa phương \"đến\" nghĩa là \"tới\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737433_v0h2y",
    "word": "đậu",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đỗ",
    "example": "Con xe đậu ngoài cươi tề.",
    "exampleTranslation": "Chiếc xe đỗ ngoài sân kìa.",
    "culturalInsight": "Từ địa phương \"đậu\" nghĩa là \"đỗ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737434_nnpro",
    "word": "nói tục",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "nói bậy",
    "example": "Đừng có nói tục mần xấu hổ hấy.",
    "exampleTranslation": "Đừng có nói bậy làm xấu hổ nhé.",
    "culturalInsight": "Từ địa phương \"nói tục\" nghĩa là \"nói bậy\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737434_n177m",
    "word": "buổi túi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "buổi tối",
    "example": "Buổi túi trời lạnh rành luôn.",
    "exampleTranslation": "Buổi tối trời lạnh lắm luôn.",
    "culturalInsight": "Từ địa phương \"buổi túi\" nghĩa là \"buổi tối\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737434_wqbur",
    "word": "tru",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "trâu",
    "example": "Người xứ Nghệ dùng từ \"tru\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"tru\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"tru\" nghĩa là \"trâu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737434_oi825",
    "word": "trốc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đầu",
    "example": "Đi nắng nhiều quá nên đau cái trốc.",
    "exampleTranslation": "Đi nắng nhiều quá nên đau cái đầu.",
    "culturalInsight": "Từ địa phương \"trốc\" nghĩa là \"đầu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737434_abq7s",
    "word": "bằm",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xút mạnh” bằm bóng",
    "example": "Người xứ Nghệ dùng từ \"bằm\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"bằm\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"bằm\" nghĩa là \"xút mạnh” bằm bóng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737435_9bncy",
    "word": "ê chà",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ôi giời",
    "example": "Ê chà, cấy nhà ni to rành!",
    "exampleTranslation": "Ôi giời, cái nhà này to thật!",
    "culturalInsight": "Từ địa phương \"ê chà\" nghĩa là \"ôi giời\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737435_wpyl7",
    "word": "nịt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "dây lưng",
    "example": "Thắt cấy nịt lại cho gọn gàng.",
    "exampleTranslation": "Thắt cái dây lưng lại cho gọn gàng.",
    "culturalInsight": "Từ địa phương \"nịt\" nghĩa là \"dây lưng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737435_xva3n",
    "word": "xe chiến",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xe độ",
    "example": "Mấy đứa đi con xe chiến nổ to rành.",
    "exampleTranslation": "Mấy đứa đi chiếc xe độ nổ to lắm.",
    "culturalInsight": "Từ địa phương \"xe chiến\" nghĩa là \"xe độ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737435_lxpef",
    "word": "ngày mốt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ngày kia (tức là sau ngày mai 1 ngày)",
    "example": "Ngày mốt tau mới sang nhởi được.",
    "exampleTranslation": "Ngày kia tao mới sang chơi được.",
    "culturalInsight": "Từ địa phương \"ngày mốt\" nghĩa là \"ngày kia (tức là sau ngày mai 1 ngày)\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737436_zympp",
    "word": "tày",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "huề vốn ban đầu",
    "example": "Bán hàng hôm nay huề tày thôi.",
    "exampleTranslation": "Bán hàng hôm nay huề vốn ban đầu thôi.",
    "culturalInsight": "Từ địa phương \"tày\" nghĩa là \"huề vốn ban đầu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737436_mck4u",
    "word": "cù bất cù bơ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bụi bờ lang thang",
    "example": "Đừng đi cù bất cù bơ ngoài đàng rứa.",
    "exampleTranslation": "Đừng đi bụi bờ lang thang ngoài đường thế.",
    "culturalInsight": "Từ địa phương \"cù bất cù bơ\" nghĩa là \"bụi bờ lang thang\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737436_ipjai",
    "word": "nổ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chém gió",
    "example": "Hấn toàn nổ chuyện trên trời.",
    "exampleTranslation": "Nó toàn chém gió chuyện trên trời.",
    "culturalInsight": "Từ địa phương \"nổ\" nghĩa là \"chém gió\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_ko7gx",
    "word": "sổ đị",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "điệu đà quá",
    "example": "Mặc cấy mấn ni nhìn sổ đị rành.",
    "exampleTranslation": "Mặc cái váy này nhìn điệu đà quá lắm.",
    "culturalInsight": "Từ địa phương \"sổ đị\" nghĩa là \"điệu đà quá\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_hamq0",
    "word": "bồng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bế",
    "example": "Mạ bồng em bé ra cươi nhởi.",
    "exampleTranslation": "Mẹ bế em bé ra sân chơi.",
    "culturalInsight": "Từ địa phương \"bồng\" nghĩa là \"bế\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_wtajj",
    "word": "nhớp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bẩn",
    "example": "Tay chân nhớp quá ra rửa mồ.",
    "exampleTranslation": "Tay chân bẩn quá ra rửa nào.",
    "culturalInsight": "Từ địa phương \"nhớp\" nghĩa là \"bẩn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_zwsll",
    "word": "khun",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "khôn",
    "example": "Con cầy ni khun rành luôn.",
    "exampleTranslation": "Con chó này khôn lắm luôn.",
    "culturalInsight": "Từ địa phương \"khun\" nghĩa là \"khôn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_mufr4",
    "word": "troi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ranh",
    "example": "Đứa nhỏ ni troi rành luôn.",
    "exampleTranslation": "Đứa nhỏ này ranh lắm luôn.",
    "culturalInsight": "Từ địa phương \"troi\" nghĩa là \"ranh\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737437_v38ox",
    "word": "chộ nhim",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chỗ râm",
    "example": "Ra chộ nhim ngồi cho mát mẻ.",
    "exampleTranslation": "Ra chỗ râm ngồi cho mát mẻ.",
    "culturalInsight": "Từ địa phương \"chộ nhim\" nghĩa là \"chỗ râm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737438_7fuml",
    "word": "buôn chuyện",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "tám chuyện",
    "example": "Mấy mụ ngồi buôn chuyện ngoài ngọ.",
    "exampleTranslation": "Mấy bà ngồi tám chuyện ngoài ngõ.",
    "culturalInsight": "Từ địa phương \"buôn chuyện\" nghĩa là \"tám chuyện\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737438_m38md",
    "word": "nôn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "mửa, nhột",
    "example": "Ăn đồ thiu vô bị nôn liền.",
    "exampleTranslation": "Ăn đồ thiu vào bị mửa liền.",
    "culturalInsight": "Từ địa phương \"nôn\" nghĩa là \"mửa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737438_nzz8x",
    "word": "rinh, khiêng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bưng, bê",
    "example": "Người xứ Nghệ dùng từ \"rinh, khiêng\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"rinh, khiêng\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"rinh, khiêng\" nghĩa là \"bưng, bê\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737438_l2kb5",
    "word": "sơ sơ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "sương sương",
    "example": "Tau biết làm bài ni sơ sơ thôi.",
    "exampleTranslation": "Tao biết làm bài này sương sương thôi.",
    "culturalInsight": "Từ địa phương \"sơ sơ\" nghĩa là \"sương sương\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737439_cex5k",
    "word": "xe lai",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xe ôm",
    "example": "Bắt con xe lai đi ra chợ cho nhanh.",
    "exampleTranslation": "Bắt chiếc xe ôm đi ra chợ cho nhanh.",
    "culturalInsight": "Từ địa phương \"xe lai\" nghĩa là \"xe ôm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737439_n3r7h",
    "word": "o",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cô “em gái của ba hoặc bố”",
    "example": "O tau mới mua cho cấy mấn đẹp rành.",
    "exampleTranslation": "Cô tao mới mua cho cái váy đẹp lắm.",
    "culturalInsight": "Từ địa phương \"o\" nghĩa là \"cô “em gái của ba hoặc bố”\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737439_dvhq8",
    "word": "dì",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "“em gái của mẹ”",
    "example": "Dì mới ở quê ra nhởi.",
    "exampleTranslation": "Dì mới ở quê ra chơi.",
    "culturalInsight": "Từ địa phương \"dì\" nghĩa là \"“em gái của mẹ”\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737439_z0b72",
    "word": "ba mẹ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ba má",
    "example": "Ba mẹ tau đi mần nương chưa về.",
    "exampleTranslation": "Ba má tao đi làm vườn chưa về.",
    "culturalInsight": "Từ địa phương \"ba mẹ\" nghĩa là \"ba má\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737439_otrua",
    "word": "mự",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vợ của em trai mẹ hoặc vợ em trai bố",
    "example": "Mự mới nấu nồi canh bù rợ ngon rành.",
    "exampleTranslation": "Mự mới nấu nồi canh bí đỏ ngon lắm.",
    "culturalInsight": "Từ địa phương \"mự\" nghĩa là \"vợ của em trai mẹ hoặc vợ em trai bố\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737440_k3v18",
    "word": "nạt",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "quát",
    "example": "Đừng có nạt đứa em kẻo hấn khóc.",
    "exampleTranslation": "Đừng có quát đứa em kẻo nó khóc.",
    "culturalInsight": "Từ địa phương \"nạt\" nghĩa là \"quát\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737440_433d1",
    "word": "hét",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "la",
    "example": "Đừng hét to rứa làng xóm nghe thấy.",
    "exampleTranslation": "Đừng la to thế làng xóm nghe thấy.",
    "culturalInsight": "Từ địa phương \"hét\" nghĩa là \"la\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737440_wd3qy",
    "word": "ciếc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cù léc",
    "example": "Đừng ciếc tau, tau nhột rành.",
    "exampleTranslation": "Đừng cù léc tao, tao nhột lắm.",
    "culturalInsight": "Từ địa phương \"ciếc\" nghĩa là \"cù léc\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737440_jil83",
    "word": "đài",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gàu",
    "example": "Lấy cấy đài múc nác vô giếng.",
    "exampleTranslation": "Lấy cái gàu múc nước vào giếng.",
    "culturalInsight": "Từ địa phương \"đài\" nghĩa là \"gàu\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737441_vm65l",
    "word": "ban lơn",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "đùa dai",
    "example": "Hấn toàn ban lơn mần tau bực mình.",
    "exampleTranslation": "Nó toàn đùa dai làm tao bực mình.",
    "culturalInsight": "Từ địa phương \"ban lơn\" nghĩa là \"đùa dai\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737441_7cue7",
    "word": "trêu ngươi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "chọc tức",
    "example": "Đừng có trêu ngươi hấn kẻo hấn giận.",
    "exampleTranslation": "Đừng có chọc tức nó kẻo nó giận.",
    "culturalInsight": "Từ địa phương \"trêu ngươi\" nghĩa là \"chọc tức\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737441_az2rm",
    "word": "ngất ngất",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "linh tinh",
    "example": "Nói chuyện ngất ngất nỏ ai hiểu chi.",
    "exampleTranslation": "Nói chuyện linh tinh không ai hiểu gì.",
    "culturalInsight": "Từ địa phương \"ngất ngất\" nghĩa là \"linh tinh\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737441_sspbx",
    "word": "lừa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gạt",
    "example": "Đừng có lừa người ta rứa hấy.",
    "exampleTranslation": "Đừng có gạt người ta thế nhé.",
    "culturalInsight": "Từ địa phương \"lừa\" nghĩa là \"gạt\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737441_x5kfr",
    "word": "dạ",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "vâng",
    "example": "Dạ, con mới đi học về ni.",
    "exampleTranslation": "Vâng, con mới đi học về đây.",
    "culturalInsight": "Từ địa phương \"dạ\" nghĩa là \"vâng\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737442_sw24o",
    "word": "dùng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "xài",
    "example": "Cấy kéo ni dùng rành tốt.",
    "exampleTranslation": "Cái kéo này xài rất tốt.",
    "culturalInsight": "Từ địa phương \"dùng\" nghĩa là \"xài\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737442_xdggh",
    "word": "cà trắp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cà chớn",
    "example": "Tính hấn cà trắp nỏ ai muốn nhởi chung.",
    "exampleTranslation": "Tính nó cà chớn không ai muốn chơi chung.",
    "culturalInsight": "Từ địa phương \"cà trắp\" nghĩa là \"cà chớn\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737442_xwp6l",
    "word": "xơi",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "ăn “xơi tái",
    "example": "Lại đây xơi đọi cơm với nhà choa.",
    "exampleTranslation": "Lại đây ăn bát cơm với nhà chúng tôi.",
    "culturalInsight": "Từ địa phương \"xơi\" nghĩa là \"ăn “xơi tái\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737443_gtimv",
    "word": "lóc bóc",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "khệnh khạng, bốc đồng hay láo toét",
    "example": "Đừng có lóc bóc trước mặt người lớn.",
    "exampleTranslation": "Đừng có khệnh khạng trước mặt người lớn.",
    "culturalInsight": "Từ địa phương \"lóc bóc\" nghĩa là \"khệnh khạng, bốc đồng hay láo toét\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737443_ron17",
    "word": "lớp tớp",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "láo lếu hấp tấp",
    "example": "Mần ăn lớp tớp kẻo hỏng việc đó hấy.",
    "exampleTranslation": "Làm ăn hấp tấp kẻo hỏng việc đấy nhé.",
    "culturalInsight": "Từ địa phương \"lớp tớp\" nghĩa là \"láo lếu hấp tấp\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737443_s0zxr",
    "word": "cà khịa",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "gây sự",
    "example": "Đừng có đi cà khịa người ta mần chi.",
    "exampleTranslation": "Đừng có đi gây sự người ta làm gì.",
    "culturalInsight": "Từ địa phương \"cà khịa\" nghĩa là \"gây sự\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737443_sok73",
    "word": "cù lần",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "khờ",
    "example": "Hấn hiền lành nhưng hơi cù lần.",
    "exampleTranslation": "Nó hiền lành nhưng hơi khờ.",
    "culturalInsight": "Từ địa phương \"cù lần\" nghĩa là \"khờ\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737444_6m9jh",
    "word": "dở",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "bữa \"ví dụ: ngày ăn 3 dở cơm",
    "example": "Một ngày ăn ba dở cơm đầy đủ.",
    "exampleTranslation": "Một ngày ăn ba bữa cơm đầy đủ.",
    "culturalInsight": "Từ địa phương \"dở\" nghĩa là \"bữa \"ví dụ: ngày ăn 3 dở cơm\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737444_vusfb",
    "word": "ví dụ: cụng",
    "region": "Nghệ Tĩnh",
    "provinces": [
      "Nghệ An",
      "Hà Tĩnh"
    ],
    "meaning": "cũng ; nựa",
    "example": "Người xứ Nghệ dùng từ \"ví dụ: cụng\" rất phổ biến.",
    "exampleTranslation": "Người xứ Nghệ dùng từ \"ví dụ: cụng\" rất phổ biến.",
    "culturalInsight": "Từ địa phương \"ví dụ: cụng\" nghĩa là \"cũng ; nựa\". Nguồn tham khảo: Nghệ Ngữ (nghengu.vn)."
  },
  {
    "id": "l_1783852737444_jvg0f",
    "word": "mô",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "đâu",
    "example": "Mi đi mô về rứa?",
    "exampleTranslation": "Mày đi đâu về thế?",
    "culturalInsight": "Từ địa phương \"mô\" nghĩa là \"đâu\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_vm3zp",
    "word": "tê",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "kia",
    "example": "Nhà o ở đằng tê kìa.",
    "exampleTranslation": "Nhà cô ở đằng kia kìa.",
    "culturalInsight": "Từ địa phương \"tê\" nghĩa là \"kia\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_zvr6w",
    "word": "răng",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "sao, tại sao",
    "example": "Răng mi lại làm rứa?",
    "exampleTranslation": "Sao mày lại làm thế?",
    "culturalInsight": "Từ địa phương \"răng\" nghĩa là \"sao, tại sao\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_jg6xt",
    "word": "rứa",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "thế, như vậy",
    "example": "Ăn cơm xong rồi rứa à?",
    "exampleTranslation": "Ăn cơm xong rồi thế à?",
    "culturalInsight": "Từ địa phương \"rứa\" nghĩa là \"thế, như vậy\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_yqo0m",
    "word": "bọ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "cha, bố",
    "example": "Bọ tui mới đi làm ruộng về.",
    "exampleTranslation": "Bố tôi mới đi làm ruộng về.",
    "culturalInsight": "Từ địa phương \"bọ\" nghĩa là \"cha, bố\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_bis6j",
    "word": "mạ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "mẹ",
    "example": "Mạ ơi, chừ ăn cơm chưa?",
    "exampleTranslation": "Mẹ ơi, bây giờ ăn cơm chưa?",
    "culturalInsight": "Từ địa phương \"mạ\" nghĩa là \"mẹ\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737444_b200c",
    "word": "o",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "cô, dì",
    "example": "O mới mua cho tui cái áo mới.",
    "exampleTranslation": "Cô mới mua cho tôi cái áo mới.",
    "culturalInsight": "Từ địa phương \"o\" nghĩa là \"cô, dì\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_cmesv",
    "word": "đọi",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "cái bát, cái chén",
    "example": "Mạ múc cho con đọi canh.",
    "exampleTranslation": "Mẹ múc cho con bát canh.",
    "culturalInsight": "Từ địa phương \"đọi\" nghĩa là \"cái bát, cái chén\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_lqijx",
    "word": "trốc",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "cái đầu",
    "example": "Đi nắng nhiều quá nên đau cái trốc.",
    "exampleTranslation": "Đi nắng nhiều quá nên đau cái đầu.",
    "culturalInsight": "Từ địa phương \"trốc\" nghĩa là \"cái đầu\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_xu5xo",
    "word": "cơn",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "cây",
    "example": "Ra gốc cơn xoài ngồi cho mát.",
    "exampleTranslation": "Ra gốc cây xoài ngồi cho mát.",
    "culturalInsight": "Từ địa phương \"cơn\" nghĩa là \"cây\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_1of6s",
    "word": "trấy",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "trái, quả",
    "example": "Cơn ni có nhiều trấy ngon lắm.",
    "exampleTranslation": "Cây này có nhiều trái ngon lắm.",
    "culturalInsight": "Từ địa phương \"trấy\" nghĩa là \"trái, quả\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_ml1i4",
    "word": "hun",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "hôn",
    "example": "Lại đây mệ hun một cái mần kỷ niệm.",
    "exampleTranslation": "Lại đây bà hôn một cái làm kỷ niệm.",
    "culturalInsight": "Từ địa phương \"hun\" nghĩa là \"hôn\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_6dq1a",
    "word": "chừ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "bây giờ",
    "example": "Chừ mi muốn đi mô?",
    "exampleTranslation": "Bây giờ mày muốn đi đâu?",
    "culturalInsight": "Từ địa phương \"chừ\" nghĩa là \"bây giờ\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_zrqx8",
    "word": "mệ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế"
    ],
    "meaning": "bà",
    "example": "Mệ tui năm nay già rồi.",
    "exampleTranslation": "Bà tôi năm nay già rồi.",
    "culturalInsight": "Từ địa phương \"mệ\" nghĩa là \"bà\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_dtcnx",
    "word": "mụ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Trị"
    ],
    "meaning": "người phụ nữ trung tuổi / bà",
    "example": "Mụ bán cá ở chợ nói chuyện vui lắm.",
    "exampleTranslation": "Bà bán cá ở chợ nói chuyện vui lắm.",
    "culturalInsight": "Từ địa phương \"mụ\" nghĩa là \"người phụ nữ trung tuổi / bà\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_60ldc",
    "word": "hói",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "sông nhỏ, khe nước",
    "example": "Mạ ra ngoài hói gánh nác về chụm cơm.",
    "exampleTranslation": "Mẹ ra ngoài khe nước gánh nước về đun cơm.",
    "culturalInsight": "Từ địa phương \"hói\" nghĩa là \"sông nhỏ, khe nước\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_mptal",
    "word": "toóc",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "rơm",
    "example": "Gom toóc lại đem đốt cho sạch ruộng.",
    "exampleTranslation": "Gom rơm lại đem đốt cho sạch ruộng.",
    "culturalInsight": "Từ địa phương \"toóc\" nghĩa là \"rơm\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_m4j2x",
    "word": "náng",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "nướng",
    "example": "Bọ đem cá ra náng trên bếp than.",
    "exampleTranslation": "Bố đem cá ra nướng trên bếp than.",
    "culturalInsight": "Từ địa phương \"náng\" nghĩa là \"nướng\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_y9jv2",
    "word": "chũi",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Trị"
    ],
    "meaning": "cái chổi",
    "example": "Lấy cái chũi quét cái nhà cho sạch.",
    "exampleTranslation": "Lấy cái chổi quét cái nhà cho sạch.",
    "culturalInsight": "Từ địa phương \"chũi\" nghĩa là \"cái chổi\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_hgrrp",
    "word": "cà ràng",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế"
    ],
    "meaning": "bếp kiềng đất nung ba chân",
    "example": "Mạ chụm nồi nồi canh trên cà ràng.",
    "exampleTranslation": "Mẹ đun nồi canh trên bếp kiềng đất nung.",
    "culturalInsight": "Từ địa phương \"cà ràng\" nghĩa là \"bếp kiềng đất nung ba chân\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_pvdjv",
    "word": "gương",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế"
    ],
    "meaning": "kính (đeo mắt)",
    "example": "Ông đeo cái gương vào mới đọc được sách.",
    "exampleTranslation": "Ông đeo cái kính vào mới đọc được sách.",
    "culturalInsight": "Từ địa phương \"gương\" nghĩa là \"kính (đeo mắt)\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737445_te1ie",
    "word": "chụm",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Trị"
    ],
    "meaning": "đun, nấu củi",
    "example": "Ra sau bếp chụm củi nấu nác sôi.",
    "exampleTranslation": "Ra sau bếp đun củi nấu nước sôi.",
    "culturalInsight": "Từ địa phương \"chụm\" nghĩa là \"đun, nấu củi\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_130dh",
    "word": "chụi",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế"
    ],
    "meaning": "dụi, lau sạch",
    "example": "Lấy cái khăn chụi cái bàn cho khô.",
    "exampleTranslation": "Lấy cái khăn lau cái bàn cho khô.",
    "culturalInsight": "Từ địa phương \"chụi\" nghĩa là \"dụi, lau sạch\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_i0jcg",
    "word": "can chi",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "không sao, không việc gì",
    "example": "Rớt chút nác thôi, can chi đâu!",
    "exampleTranslation": "Rơi chút nước thôi, không sao đâu!",
    "culturalInsight": "Từ địa phương \"can chi\" nghĩa là \"không sao, không việc gì\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_vzyqq",
    "word": "đập",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Trị"
    ],
    "meaning": "đánh",
    "example": "Đừng có đập con chó, tội nó.",
    "exampleTranslation": "Đừng có đánh con chó, tội nó.",
    "culturalInsight": "Từ địa phương \"đập\" nghĩa là \"đánh\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_0pe7l",
    "word": "chi",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế",
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "gì",
    "example": "Mi đang mần chi rứa?",
    "exampleTranslation": "Mày đang làm gì thế?",
    "culturalInsight": "Từ địa phương \"chi\" nghĩa là \"gì\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_s8n6h",
    "word": "tê nớ",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Thừa Thiên Huế"
    ],
    "meaning": "kia đó",
    "example": "Cái nón để ở đằng tê nớ.",
    "exampleTranslation": "Cái nón để ở đằng kia đó.",
    "culturalInsight": "Từ địa phương \"tê nớ\" nghĩa là \"kia đó\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_5fo80",
    "word": "họ học",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình"
    ],
    "meaning": "học tập",
    "example": "Mấy đứa nhỏ đang ngồi họ học trong nhà.",
    "exampleTranslation": "Mấy đứa nhỏ đang ngồi học tập trong nhà.",
    "culturalInsight": "Từ địa phương \"họ học\" nghĩa là \"học tập\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_rdjyn",
    "word": "khái",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "con hổ",
    "example": "Ngày xưa trên rú có nhiều khái lắm.",
    "exampleTranslation": "Ngày xưa trên núi có nhiều hổ lắm.",
    "culturalInsight": "Từ địa phương \"khái\" nghĩa là \"con hổ\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737446_06hd1",
    "word": "rú",
    "region": "Bình Trị Thiên",
    "provinces": [
      "Quảng Bình",
      "Quảng Trị"
    ],
    "meaning": "núi",
    "example": "Dân làng đi lên rú kiếm củi về chụm.",
    "exampleTranslation": "Dân làng đi lên núi kiếm củi về đun.",
    "culturalInsight": "Từ địa phương \"rú\" nghĩa là \"núi\". Nguồn tham khảo: Từ điển tiếng Huế (Bùi Minh Đức / Trần Ngọc Bảo) & Phương ngữ Bình Trị Thiên."
  },
  {
    "id": "l_1783852737447_th01",
    "word": "va",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "nó, hắn (ngôi thứ 3)",
    "example": "Để va mần xong cấy việc ni rồi va đi nhởi.",
    "exampleTranslation": "Để nó làm xong cái việc này rồi nó đi chơi.",
    "culturalInsight": "Từ nhân xưng đặc trưng của phương ngữ Thanh Hóa, dùng ở ngôi thứ ba. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th02",
    "word": "vá",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "nó, hắn (ngôi thứ 3) / cái môi, thìa múc canh",
    "example": "Dùng cấy vá ni múc canh ngọt từ hột sen ra đọi.",
    "exampleTranslation": "Dùng cái thìa này múc canh ngọt từ hạt sen ra bát.",
    "culturalInsight": "Từ 'vá' ở Thanh Hóa có thể mang nghĩa là ngôi thứ 3 (nó/hắn) hoặc chỉ dụng cụ thìa muôi múc canh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th03",
    "word": "nhà va",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gia đình họ, bọn họ",
    "example": "Nhà va mới đi bái về lúc kha cắn.",
    "exampleTranslation": "Gia đình họ mới đi vùng đất cao trồng màu về lúc gà gáy.",
    "culturalInsight": "Đại từ nhân xưng chỉ nhóm người hoặc gia đình của họ trong tiếng Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th04",
    "word": "nhà vá",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gia đình họ, bọn họ",
    "example": "Nhà vá mới đi bái về lúc kha cắn.",
    "exampleTranslation": "Gia đình họ mới đi vùng đất cao trồng màu về lúc gà gáy.",
    "culturalInsight": "Đại từ nhân xưng chỉ nhóm người hoặc gia đình của họ trong tiếng Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th05",
    "word": "ún",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "em",
    "example": "Ún ơi, ra lãy cho cố cấy chũn vô đây.",
    "exampleTranslation": "Em ơi, ra hái cho cụ cái chổi vào đây.",
    "culturalInsight": "Từ xưng hô thân thương trong gia đình, chỉ người em trong gia đình xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th06",
    "word": "cố",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cụ",
    "example": "Cố tui năm ni đã tra lắm rồi, tóc bạc trắng cả.",
    "exampleTranslation": "Cụ tôi năm nay đã già lắm rồi, tóc bạc trắng cả.",
    "culturalInsight": "Kính xưng dành cho cụ (ông bà của bố mẹ) ở xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th07",
    "word": "mậu",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "bà",
    "example": "Mậu đang ngồi bên chạn thổi lả nấu cơm.",
    "exampleTranslation": "Bà đang ngồi bên gác bếp nhóm lửa nấu cơm.",
    "culturalInsight": "Kính xưng dành cho bà ở một số vùng của Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th08",
    "word": "dá",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "mình, bản thân",
    "example": "Việc ni để dá tự mần, ún không phải lo mô.",
    "exampleTranslation": "Việc này để bản thân tự làm, em không phải lo đâu.",
    "culturalInsight": "Từ dùng để tự xưng, nghĩa là mình hoặc bản thân. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th09",
    "word": "lả",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "lửa",
    "example": "Thổi lả lên để chụm nồi nác mau sôi.",
    "exampleTranslation": "Nhóm lửa lên để đun nồi nước mau sôi.",
    "culturalInsight": "Biến âm từ 'lửa' thành 'lả' đặc trưng ở khu vực Thanh Hóa và Nghệ Tĩnh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th10",
    "word": "kêu",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gọi",
    "example": "Ún ra kêu bọ về ăn cơm kẻo nguội.",
    "exampleTranslation": "Em ra gọi bố về ăn cơm kẻo nguội.",
    "culturalInsight": "Động từ 'gọi' được nói là 'kêu' trong giao tiếp xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th11",
    "word": "ăn chậc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "ăn chực",
    "example": "Hắn suốt ngày sang nhà va ăn chậc cơm.",
    "exampleTranslation": "Nó suốt ngày sang nhà nó ăn chực cơm.",
    "culturalInsight": "Hành động ăn chực, được phát âm là 'ăn chậc'. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th12",
    "word": "nhọc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "ốm, mệt",
    "example": "Hôm qua mần việc ngoài bái về thấy nhọc quá.",
    "exampleTranslation": "Hôm qua làm việc ngoài vùng trồng màu về thấy mệt quá.",
    "culturalInsight": "Từ 'nhọc' dùng để chỉ trạng thái mệt mỏi hoặc ốm đau. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th13",
    "word": "tra",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "già",
    "example": "Cơn mít nhà tui đã tra lắm rồi, hột to mà ngọt.",
    "exampleTranslation": "Cây mít nhà tôi đã già lắm rồi, hạt to mà ngọt.",
    "culturalInsight": "Từ cổ chỉ sự già nua, dùng cho cả người, động vật lẫn cây cối. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th14",
    "word": "trốc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "đầu",
    "example": "Đi nắng nhiều quá nên đau cái trốc.",
    "exampleTranslation": "Đi nắng nhiều quá nên đau cái đầu.",
    "culturalInsight": "Từ chỉ bộ phận đầu, dùng chung ở cả Thanh Hóa, Nghệ Tĩnh, Bình Trị Thiên. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th15",
    "word": "nhởi",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "chơi",
    "example": "Chiều ni ún có đi nhởi với dá không?",
    "exampleTranslation": "Chiều nay em có đi chơi với mình không?",
    "culturalInsight": "Động từ chỉ hoạt động vui chơi giải trí, phát âm là 'nhởi'. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th16",
    "word": "mần",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "làm",
    "example": "Bữa ni nhà va mần chi mà ồn ào rứa?",
    "exampleTranslation": "Hôm nay gia đình họ làm gì mà ồn ào thế?",
    "culturalInsight": "Động từ làm việc, mần ăn, cực kỳ phổ biến ở Trung Bộ. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th17",
    "word": "chiềng",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "mời",
    "example": "Chiềng làng chiềng chạ ra nghe thông báo mới.",
    "exampleTranslation": "Mời làng mời xã ra nghe thông báo mới.",
    "culturalInsight": "Từ cổ nghĩa là mời hoặc trình báo, phổ biến trong văn hóa làng xã xưa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th18",
    "word": "hột",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "hạt",
    "example": "Ăn quả nhớ chừa hột lại để gieo cơn mới.",
    "exampleTranslation": "Ăn quả nhớ chừa hạt lại để gieo cây mới.",
    "culturalInsight": "Từ chỉ hạt của các loại quả, dùng phổ biến ở Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th19",
    "word": "chạc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "dây",
    "example": "Lấy cấy chạc ni cột chặt củi lại mang về.",
    "exampleTranslation": "Lấy cái dây này cột chặt củi lại mang về.",
    "culturalInsight": "Từ địa phương nghĩa là dây thừng, dây buộc ở vùng Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th20",
    "word": "lãy",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "hái",
    "example": "Dá ra vườn lãy ít lá trầu cho mậu ăn trầu.",
    "exampleTranslation": "Bản thân ra vườn hái ít lá trầu cho bà ăn trầu.",
    "culturalInsight": "Hành động bẻ, hái quả hoặc lá cây bằng tay. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th21",
    "word": "chạn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gác",
    "example": "Cất cấy vá lên chạn bếp kẻo cuôn muổi bu vào.",
    "exampleTranslation": "Cất cái môi lên gác bếp kẻo con muỗi bu vào.",
    "culturalInsight": "Chỉ gác bếp hoặc kệ để đồ đạc trong nhà truyền thống. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th22",
    "word": "tắc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "tóc",
    "example": "Ún có cấy tắc dài và mượt đẹp quá.",
    "exampleTranslation": "Em có cái tóc dài và mượt đẹp quá.",
    "culturalInsight": "Biến âm đặc trưng của từ 'tóc' ở vùng Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th23",
    "word": "mủn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "mũi",
    "example": "Gió lạnh làm mủn tui đỏ ửng cả lên.",
    "exampleTranslation": "Gió lạnh làm mũi tôi đỏ ửng cả lên.",
    "culturalInsight": "Từ địa phương chỉ bộ phận mũi trên khuôn mặt. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th24",
    "word": "nanh",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "răng",
    "example": "Em bé mới mọc vài cấy nanh sữa xinh xắn.",
    "exampleTranslation": "Em bé mới mọc vài cái răng sữa xinh xắn.",
    "culturalInsight": "Từ địa phương dùng để chỉ răng nói chung hoặc răng nanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th25",
    "word": "lản",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "lưỡi",
    "example": "Ăn đồ nóng quá làm phỏng cả lản rồi.",
    "exampleTranslation": "Ăn đồ nóng quá làm bỏng cả lưỡi rồi.",
    "culturalInsight": "Cách phát âm trại đi của từ 'lưỡi' ở một số vùng Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th26",
    "word": "chò",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "chân",
    "example": "Mần việc ngoài ruộng đất bùn bám đầy chò.",
    "exampleTranslation": "Làm việc ngoài ruộng đất bùn bám đầy chân.",
    "culturalInsight": "Từ chỉ bộ phận chân của người hoặc động vật. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th27",
    "word": "cằn cấn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cày cấy",
    "example": "Đến mùa cằn cấn là cả làng ra đồng từ sáng sớm.",
    "exampleTranslation": "Đến mùa cày cấy là cả làng ra đồng từ sáng sớm.",
    "culturalInsight": "Từ ghép cổ chỉ hoạt động sản xuất nông nghiệp cày bừa gieo cấy. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th28",
    "word": "kha cắn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gà gáy",
    "example": "Mới kha cắn mà ún đã dậy mần việc rồi.",
    "exampleTranslation": "Mới gà gáy mà em đã dậy làm việc rồi.",
    "culturalInsight": "Chỉ thời điểm sáng sớm tinh mơ khi con gà cất tiếng gáy. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th29",
    "word": "trốc cún",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "đầu gối",
    "example": "Bổ một phát đau điếng cả trốc cún.",
    "exampleTranslation": "Ngã một phát đau điếng cả đầu gối.",
    "culturalInsight": "Từ chỉ bộ phận đầu gối ở xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th30",
    "word": "cái vắn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cái váy",
    "example": "Mặc cái vắn ni đi nhởi hội làng thì đẹp lắm.",
    "exampleTranslation": "Mặc cái váy này đi chơi hội làng thì đẹp lắm.",
    "culturalInsight": "Từ chỉ cái váy trang phục truyền thống của phụ nữ. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th31",
    "word": "ban",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "vai",
    "example": "Gánh đôi quang gánh nặng đau hết cả ban.",
    "exampleTranslation": "Gánh đôi quang gánh nặng đau hết cả vai.",
    "culturalInsight": "Từ địa phương chỉ bộ phận vai trên cơ thể. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th32",
    "word": "cuôn muổi",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "con muỗi",
    "example": "Tối nằm ngủ nhớ buông màn kẻo cuôn muổi cắn.",
    "exampleTranslation": "Tối nằm ngủ nhớ buông màn kẻo con muỗi đốt.",
    "culturalInsight": "Cách phát âm trại đi của cụm từ 'con muỗi' của người Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th33",
    "word": "cấy chũn",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cái chổi",
    "example": "Lấy cấy chũn quét dọn sạch sẽ nhà cươi.",
    "exampleTranslation": "Lấy cái chổi quét dọn sạch sẽ sân nhà.",
    "culturalInsight": "Từ chỉ cái chổi dùng để quét dọn nhà cửa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th34",
    "word": "ăn trấm",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "ăn trộm",
    "example": "Nhà va bị kẻ xấu lẻn vào ăn trấm mất con gà nhà tui.",
    "exampleTranslation": "Nhà họ bị kẻ xấu lẻn vào ăn trộm mất con gà nhà tôi.",
    "culturalInsight": "Hành động ăn trộm, lấy cắp tài sản của người khác. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th35",
    "word": "mê man",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "rất nhiều",
    "example": "Lúa mùa ni ngoài rộc tốt mê man luôn.",
    "exampleTranslation": "Lúa mùa này ngoài cánh đồng sâu tốt rất nhiều luôn.",
    "culturalInsight": "Tính từ chỉ số lượng hoặc trạng thái cực kỳ nhiều, bạt ngàn. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th36",
    "word": "lần khân",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "chần chừ",
    "example": "Mần chi thì mần nhanh lên, đừng lần khân nữa.",
    "exampleTranslation": "Làm gì thì làm nhanh lên, đừng chần chừ nữa.",
    "culturalInsight": "Chỉ sự do dự, chần chừ, trì hoãn không dứt khoát trong hành động. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th37",
    "word": "rú",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "núi, rừng",
    "example": "Dân làng đi lên rú kiếm củi về chụm.",
    "exampleTranslation": "Dân làng đi lên núi kiếm củi về đun.",
    "culturalInsight": "Chỉ núi rừng hoang vu, dùng phổ biến ở miền Trung. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th38",
    "word": "rọc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cánh đồng sâu",
    "example": "Đi cấy ngoài rọc sâu bùn ngập đến trốc cún.",
    "exampleTranslation": "Đi cấy ngoài cánh đồng sâu bùn ngập đến đầu gối.",
    "culturalInsight": "Chỉ những thửa ruộng trũng, sâu, khó đi lại canh tác. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th39",
    "word": "rộc",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "cánh đồng sâu",
    "example": "Lúa mùa ni ngoài rộc tốt mê man luôn.",
    "exampleTranslation": "Lúa mùa này ngoài cánh đồng sâu tốt rất nhiều luôn.",
    "culturalInsight": "Chỉ những thửa ruộng sâu, trũng nước quanh năm. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th40",
    "word": "bái",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "vùng đất cao trồng màu",
    "example": "Nhà tui trồng khoai lang ngọt lịm trên bái.",
    "exampleTranslation": "Nhà tôi trồng khoai lang ngọt lịm trên vùng đất cao trồng màu.",
    "culturalInsight": "Chỉ rẻo đất cao, khô ráo chuyên dùng trồng ngô, khoai, sắn ở xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th41",
    "word": "mó",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "giếng nước ngầm tự nhiên",
    "example": "Ún ra mó xách gàu nác mát lạnh về đây chụm nước.",
    "exampleTranslation": "Em ra giếng nước ngầm tự nhiên xách gàu nước mát lạnh về đây đun nước.",
    "culturalInsight": "Chỉ mạch nước ngầm tự nhiên chảy ra từ lòng đất. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th42",
    "word": "mỏ",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "giếng nước ngầm tự nhiên",
    "example": "Nác ở mỏ này quanh năm mát ngọt vô cùng.",
    "exampleTranslation": "Nước ở giếng nước ngầm tự nhiên này quanh năm mát ngọt vô cùng.",
    "culturalInsight": "Cách gọi khác của mó nước ngầm tự nhiên xứ Thanh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th43",
    "word": "rảy",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "rẫy",
    "example": "Bọn va lên rảy phát hoang trồng bắp.",
    "exampleTranslation": "Bọn họ lên rẫy phát hoang trồng ngô.",
    "culturalInsight": "Khu vực đất dốc trên núi rừng dùng để canh tác nương rẫy. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th44",
    "word": "rẩy",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "rẫy",
    "example": "Mấy sào ngô trên rẩy năm nay được mùa.",
    "exampleTranslation": "Mấy sào ngô trên rẫy năm nay được mùa.",
    "culturalInsight": "Biến âm của từ nương rẫy trồng ngô khoai trên đồi dốc. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th45",
    "word": "bải",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "bãi bồi ven sông",
    "example": "Chiều chiều ra bải sông thả diều lộng gió.",
    "exampleTranslation": "Chiều chiều ra bãi bồi ven sông thả diều lộng gió.",
    "culturalInsight": "Vùng đất phù sa ven các dòng sông lớn chảy qua Thanh Hóa. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th46",
    "word": "nứ",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "thật không",
    "example": "Món ni ngon nứ luôn, ún ăn thử đi.",
    "exampleTranslation": "Món này ngon thật không luôn, em ăn thử đi.",
    "culturalInsight": "Trợ từ cảm thán nhấn mạnh sắc thái của câu nói trong giao tiếp địa phương. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th47",
    "word": "đài",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "gầu múc nước",
    "example": "Múc gàu nác bằng cái đài tre đặt cạnh mó.",
    "exampleTranslation": "Múc gàu nước bằng cái gầu tre đặt cạnh giếng tự nhiên.",
    "culturalInsight": "Dụng cụ tự chế bằng tre hoặc gỗ để múc nước từ mó/giếng. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  },
  {
    "id": "l_1783852737447_th48",
    "word": "đọi",
    "region": "Thanh Hóa",
    "provinces": [
      "Thanh Hóa"
    ],
    "meaning": "bát",
    "example": "Mạ múc cho con đọi canh.",
    "exampleTranslation": "Mẹ múc cho con bát canh.",
    "culturalInsight": "Từ chỉ cái bát ăn cơm hằng ngày, dùng chung ở Thanh Hóa và Nghệ Tĩnh. Nguồn tham khảo: Phương ngữ Thanh Hóa."
  }
];

// Kho B: Corpus Audio có nhãn (Audio Database)
// Nhãn chủ đề gồm: "Lịch sử & Văn hóa", "Giọng ca đặc trưng (Ví Giặm, Ca Huế...)", "Tổng quan vùng (Địa lý, Đời sống...)"
const AUDIO_CORPUS = [
  {
    "id": "yt_1785982902246",
    "title": "Giọng nói Quảng Trị - Đinh Thanh Hải 02",
    "province": "Thanh Hóa",
    "dialectGroup": "Thanh Hóa",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=G1KB581A0gk",
    "start_time": 134,
    "end_time": 157,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Thanh Hóa"
    ]
  },
  {
    "id": "yt_1785982832919",
    "title": "Giọng nói Quảng Trị - Đinh Thanh Hải",
    "province": "Quảng Trị",
    "dialectGroup": "Bình Trị Thiên",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=G1KB581A0gk",
    "start_time": 122,
    "end_time": 133,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Quảng Trị"
    ]
  },
  {
    "id": "speech_1785982190513",
    "title": "Hà Tĩnh 01",
    "province": "Hà Tĩnh",
    "dialectGroup": "Nghệ Tĩnh",
    "speaker": "Ẩn danh",
    "ageGroup": "<18",
    "gender": "Nam",
    "topic": "Tổng quan vùng",
    "audioUrl": "/uploads/speech_1785982189722.mp3",
    "transcriptDialect": "Hà Tình Cung Bùi Hè là vương đất của dân ca Vĩ, dám nghe tình nhưng câu hát Vĩ dám mộc mạc và xấu lắm, thường nói về tình quê và đối xử lão đồng. Nghe một câu hát quê minh, tôi luôn thấy rất thân thương và gần gùi.",
    "transcriptStandard": "Hà Tình Cung Bùi Hè là vương đất của dân ca Vĩ, dám nghe tình nhưng câu hát Vĩ dám mộc mạc và xấu lắm, thường nói về tình quê và đối xử lão đồng. Nghe một câu hát quê minh, tôi luôn thấy rất thân thương và gần gùi.",
    "verified": true,
    "confidence": 95,
    "tags": [
      "Tổng",
      "Hà Tĩnh"
    ]
  },
  {
    "id": "yt_1785981814270",
    "title": "Ca Huế: Hò Mái Nhì, Nam Bình - Dạ Lê, Bến Thành Audio Video",
    "province": "Thừa Thiên Huế",
    "dialectGroup": "Bình Trị Thiên",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Giọng ca đặc trưng (Ví Giặm, Ca Huế...)",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=gpIX94R68yc",
    "start_time": 0,
    "end_time": 330,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Thừa Thiên Huế"
    ]
  },
  {
    "id": "speech_1785940166113",
    "title": "Xứ huế quê tôi",
    "province": "Thừa Thiên Huế",
    "dialectGroup": "Bình Trị Thiên",
    "speaker": "Ẩn danh",
    "ageGroup": "18-35",
    "gender": "Nam",
    "topic": "Tổng quan vùng",
    "audioUrl": "/uploads/speech_1785940165313.ogg",
    "transcriptDialect": "Huy là quê hương của tôi, nơi đấy có nhiều cảnh đẹp, có người chân chất và có dòng nổi rất riêng. Tôi muốn gọi một phân nhò để lưu giữ tình nổi của quê mình.",
    "transcriptStandard": "Huy là quê hương của tôi, nơi đấy có nhiều cảnh đẹp, có người chân chất và có dòng nổi rất riêng. Tôi muốn gọi một phân nhò để lưu giữ tình nổi của quê mình.",
    "verified": true,
    "confidence": 96,
    "tags": [
      "Tổng",
      "Thừa Thiên Huế"
    ]
  },
  {
    "id": "yt_1784202311657",
    "title": "TIẾNG NGHỆ AN",
    "province": "Thanh Hóa",
    "dialectGroup": "Thanh Hóa",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=xoYVETi1hf8&t=350s",
    "start_time": 816,
    "end_time": 839,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Thanh Hóa"
    ]
  },
  {
    "id": "yt_1784201970832",
    "title": "HÒ KHOAN NGHỆ TĨNH - Dân Ca Ví Giặm Nghệ Tĩnh (Ho khoan Nghe Tinh - Folk songs of Vi Giam Nghe Tinh),CLB Dân ca Ví, Giặm Nghệ Tĩnh phía nam",
    "province": "Thanh Hóa",
    "dialectGroup": "Thanh Hóa",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=We9PoMyOXWE",
    "start_time": 137,
    "end_time": 150,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Thanh Hóa"
    ]
  },
  {
    "id": "yt_1784201347191",
    "title": "Tiếng rao",
    "province": "Nghệ An",
    "dialectGroup": "Nghệ Tĩnh",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=0zZpPCHpH78",
    "start_time": 4,
    "end_time": 14,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Nghệ An"
    ]
  },
  {
    "id": "yt_1784119452428",
    "title": "Ngư thuyền Huế",
    "province": "Thừa Thiên Huế",
    "dialectGroup": "Bình Trị Thiên",
    "speaker": "YouTube Media",
    "ageGroup": "36-55",
    "gender": "Khác",
    "topic": "Lịch sử & Văn hóa",
    "audioUrl": "",
    "youtube_url": "https://www.youtube.com/watch?v=Xp7R6ciWOp4",
    "start_time": 150,
    "end_time": 175,
    "transcriptDialect": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "transcriptStandard": "Bản ghi từ YouTube (Chỉ phát âm thanh)",
    "verified": true,
    "confidence": 95,
    "tags": [
      "YouTube",
      "Thừa Thiên Huế"
    ]
  }
];

// Dữ liệu câu hỏi nhanh và câu trả lời RAG của Chatbot
const CHATBOT_RAG_DATABASE = [
  {
    keywords: ["răng", "rang la gi", "nghia la gi"],
    response: `**"Răng"** có nghĩa là **"sao, tại sao, thế nào"** trong tiếng phổ thông.
- **Khu vực sử dụng:** Rất phổ biến tại Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế.
- **Ví dụ thực tế:** *"Răng bữa ni mi đi học trễ rứa?"* tương đương *"Sao hôm nay mày đi học muộn thế?"*
- **Ý nghĩa văn hóa:** Từ "răng" mang ngữ âm cổ, phản ánh bản sắc ngôn ngữ đậm chất miền Trung. Bạn sẽ nghe từ này thường xuyên trong hò Ví Giặm hay các bài ca Huế.`
  },
  {
    keywords: ["mô, tê, răng, rứa", "mo te rang rua"],
    response: `Bộ tứ **"Mô - Tê - Răng - Rứa"** được coi là **"mật mã ngôn ngữ"** của người dân xứ Nghệ và Bình Trị Thiên:
1. **Mô:** Đâu, ở đâu, chỗ nào (Ví dụ: *Đi mô đó?*)
2. **Tê:** Kia, bên kia, đằng kia (Ví dụ: *Bên tê sông*)
3. **Răng:** Sao, tại sao, thế nào (Ví dụ: *Răng mà buồn rứa?*)
4. **Rứa:** Thế, thế này, vậy (Ví dụ: *Đúng rứa!*)

Khi kết hợp chúng lại tạo nên ngữ điệu nhịp nhàng, trầm bổng đặc trưng của giọng miền Trung.`
  },
  {
    keywords: ["người huế dặn", "nguoi hue dan co", "hue dan"],
    response: `Người Huế thường dùng những lời dặn dò nhẹ nhàng, ngọt ngào nhưng rất sâu sắc để răn dạy con cái. Trong đó xuất hiện nhiều từ địa phương thân thương:
- Gọi mẹ là **"Mạ"**, gọi bố là **"Ba"** hoặc **"Bọ"** (ở vùng nông thôn).
- Dặn con học hành chăm chỉ: *"Con đi học cố mần ăn học hành cho đàng hoàng nghe con."*
- Nhắc nhở giữ gìn sức khỏe: *"Đi nắng nhớ đội nón không thôi đau trốc (đau đầu) tê."*
- Răn dạy về sự lễ phép và hiền lành qua các câu nói dùng từ **"nớ"**, **"rứa"** để biểu thị sự kính trọng và nhỏ nhẹ.`
  },
  {
    keywords: ["so sánh", "nghệ tĩnh và nam bộ", "nghe tinh", "nam bo"],
    response: `**So sánh tiếng Nghệ Tĩnh (Nghệ An - Hà Tĩnh) và tiếng Nam Bộ:**

| Đặc điểm | Tiếng Nghệ Tĩnh | Tiếng Nam Bộ |
| :--- | :--- | :--- |
| **Hỏi / Đâu** | Dùng từ **"Mô"** (Ví dụ: *Đi mô đó?*) | Dùng từ **"Đâu"** (Ví dụ: *Đi đâu đó?*) |
| **Sao / Tại sao** | Dùng từ **"Răng"** (Ví dụ: *Răng rứa?*) | Dùng từ **"Sao"** (Ví dụ: *Sao vậy?*) |
| **Thế này / Vậy** | Dùng từ **"Rứa"** (Ví dụ: *Thấy rứa*) | Dùng từ **"Vậy"** (Ví dụ: *Thấy vậy*) |
| **Thanh điệu** | Nặng, trầm sâu, giữ nguyên âm cổ, dấu hỏi/ngã phát âm nặng gần như nhau. | Nhẹ nhàng, bằng phẳng, không phân biệt rõ dấu hỏi và dấu ngã (đều phát âm hơi giống dấu hỏi). |
| **Tính cách biểu thị** | Mộc mạc, bền bỉ, kiên cường qua âm sắc trầm nặng. | Phóng khoáng, cởi mở, thân thiện qua âm sắc bay bổng. |`
  }
];
