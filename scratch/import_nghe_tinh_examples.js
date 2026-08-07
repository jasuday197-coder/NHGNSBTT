const fs = require('fs');
const path = require('path');

const rawText = `
con tru (con trâu)
Phương ngữ: Con tru đang ăn cỏ ngoài đàng tê tề.
Phổ thông: Con trâu đang ăn cỏ ngoài đường kia kìa.

con du (con dâu)
Phương ngữ: Con du nhà bác Nam ngoan hiền rành.
Phổ thông: Con dâu nhà bác Nam ngoan hiền lắm.

mấn (váy)
Phương ngữ: Mạ mới mua cho cấy mấn đẹp rành.
Phổ thông: Mẹ mới mua cho cái váy đẹp lắm.

ngái (xa)
Phương ngữ: Nhà o ở ngái lắm, đi bộ nỏ tới được đâu.
Phổ thông: Nhà cô ở xa lắm, đi bộ không tới được đâu.

đi mô? (đi đâu?)
Phương ngữ: Mạ đi mô rứa mạ?
Phổ thông: Mẹ đi đâu thế mẹ?

nác su (nước sâu)
Phương ngữ: Đừng có lội xuống rào, nác su lắm.
Phổ thông: Đừng có lội xuống sông, nước sâu lắm.

trấy bù (quả bầu)
Phương ngữ: Dàn bù sau nương ra nhiều trấy rành.
Phổ thông: Giàn bầu sau vườn ra nhiều quả lắm.

tra (gác bếp / già)
Phương ngữ: Cơn xoài ni tra rồi, nỏ ra trấy nữa.
Phổ thông: Cây xoài này già rồi, không ra trái nữa.

lông cơn (trồng cây)
Phương ngữ: Bọ ra sau nương lông cơn xoài mới mua.
Phổ thông: Bố ra sau vườn trồng cây xoài mới mua.

ra cươi (ra sân)
Phương ngữ: Bắt cấy ghế ra cươi ngồi hóng mát.
Phổ thông: Lấy cái ghế ra sân ngồi hóng mát.

đi nhởi (đi chơi)
Phương ngữ: Tối ni mi có đi nhởi với choa nỏ?
Phổ thông: Tối nay mày có đi chơi với chúng tao không?

choa (chúng tao / chúng tôi)
Phương ngữ: Choa đi mần nương từ sớm mai.
Phổ thông: Chúng tôi đi làm vườn từ sáng sớm.

bọn bay (các bạn / tụi mày)
Phương ngữ: Bọn bay đi mô về rứa?
Phổ thông: Các bạn đi đâu về thế?

tê (kia)
Phương ngữ: Cấy nón để ở đàng tê kìa.
Phổ thông: Cái nón để ở đằng kia kìa.

ni (này)
Phương ngữ: Cấy áo ni đẹp rành luôn.
Phổ thông: Cái áo này đẹp lắm luôn.

mi (mày)
Phương ngữ: Mi đang mần chi rứa mi?
Phổ thông: Mày đang làm gì thế mày?

mần (làm)
Phương ngữ: Mấy đứa đang mần chi rứa?
Phổ thông: Mấy đứa đang làm gì thế?

chộ (thấy)
Phương ngữ: Tau nỏ chộ cấy chìa khóa để mô cả.
Phổ thông: Tao không thấy cái chìa khóa để đâu cả.

nhác (lười)
Phương ngữ: Hấn nhác lắm, nỏ chịu học hành chi.
Phổ thông: Nó lười lắm, không chịu học hành gì.

ruốc bôi (mắm tôm)
Phương ngữ: Mạ mua ruốc bôi về chấm rau muống.
Phổ thông: Mẹ mua mắm tôm về chấm rau muống.

đọi (bát)
Phương ngữ: Mạ bới cho con đọi cơm đầy.
Phổ thông: Mẹ xới cho con bát cơm đầy.

nôốc (thuyền)
Phương ngữ: Mấy bác chèo nôốc ra rào đánh cá.
Phổ thông: Mấy bác chèo thuyền ra sông đánh cá.

lặc lè (khuỷu chân)
Phương ngữ: Đau cấy lặc lè nỏ đi bước mô được.
Phổ thông: Đau cái khuỷu chân không đi bước nào được.

đàng (đường)
Phương ngữ: Đi đàng nhớ chú ý xe cộ hấy.
Phổ thông: Đi đường nhớ chú ý xe cộ nhé.

rứa hè (thế thôi / thế à)
Phương ngữ: Rứa hè, rứa mà tau nỏ biết chi cả.
Phổ thông: Thế à, thế mà tao không biết gì cả.

rú (rừng / núi)
Phương ngữ: Chiều chiều dân làng lên rú đốn củi.
Phổ thông: Chiều chiều dân làng lên núi đốn củi.

rào (sông)
Phương ngữ: Mấy đứa nhỏ ra rào tắm mát.
Phổ thông: Mấy đứa nhỏ ra sông tắm mát.

mơ (mớ)
Phương ngữ: Tối qua nằm ngủ mơ thấy ông bà.
Phổ thông: Tối qua nằm ngủ mớ thấy ông bà.

thúi (hôi, thối)
Phương ngữ: Đống rác bên đàng thúi quá.
Phổ thông: Đống rác bên đường hôi quá.

nỏ nhởi (không chơi)
Phương ngữ: Hấn giận rồi, nỏ nhởi với choa nữa.
Phổ thông: Nó giận rồi, không chơi với chúng tao nữa.

tề (kìa)
Phương ngữ: Ngồi xuống cấy ghế đàng tề kìa.
Phổ thông: Ngồi xuống cái ghế đằng kia kìa.

cái môi (cái thìa, cái muôi)
Phương ngữ: Múc canh thì lấy cấy môi ni nè.
Phổ thông: Múc canh thì lấy cái muôi này này.

đập chắc (đánh nhau)
Phương ngữ: Mấy đứa nhỏ đừng có đập chắc nữa.
Phổ thông: Mấy đứa nhỏ đừng có đánh nhau nữa.

ra răng (thế nào)
Phương ngữ: Chuyện ni rốt cuộc ra răng rứa?
Phổ thông: Chuyện này rốt cuộc thế nào thế?

ả (chị / người phụ nữ)
Phương ngữ: Ả ni nói chuyện khó nghe rành.
Phổ thông: Chị này nói chuyện khó nghe thật.

tau (tao)
Phương ngữ: Tau mới đi chợ về ni.
Phổ thông: Tao mới đi chợ về đây.

rứa (thế / vậy)
Phương ngữ: Răng mi lại mần rứa?
Phổ thông: Sao mày lại làm thế?

răng (sao / tại sao)
Phương ngữ: Răng mi nỏ đi học?
Phổ thông: Sao mày không đi học?

bổ (ngã)
Phương ngữ: Đi đứng cẩn thận kẻo bổ đó.
Phổ thông: Đi đứng cẩn thận kẻo ngã đấy.

mả (mồ / mộ)
Phương ngữ: Tới ngày lễ cả nhà ra mả thắp hương.
Phổ thông: Tới ngày lễ cả nhà ra mộ thắp hương.

lọi cẳng (duỗi chân / gãy chân)
Phương ngữ: Đá bóng mạnh quá ngã lọi cẳng luôn.
Phổ thông: Đá bóng mạnh quá ngã gãy chân luôn.

vải thâm (vải đen)
Phương ngữ: Mạ may cho cấy áo bằng vải thâm.
Phổ thông: Mẹ may cho cái áo bằng vải đen.

trụt quỳn (tụt quần)
Phương ngữ: Chạy nhanh quá trụt quỳn luôn.
Phổ thông: Chạy nhanh quá tụt quần luôn.

trôộc (dốc / đồi)
Phương ngữ: Đi lên cấy trôộc ni mệt rành.
Phổ thông: Đi lên cái dốc này mệt lắm.

đôộng (đồi)
Phương ngữ: Nhà o ở trên đôộng cao tê.
Phổ thông: Nhà cô ở trên đồi cao kia.

mui (môi)
Phương ngữ: Mùa đông lạnh quá khô hết cả mui.
Phổ thông: Mùa đông lạnh quá khô hết cả môi.

trôốc (đầu)
Phương ngữ: Đau cấy trôốc quá, nỏ học được chi.
Phổ thông: Đau cái đầu quá, không học được gì.

hun (hôn)
Phương ngữ: Lại đây o hun cho cấy mần kỷ niệm.
Phổ thông: Lại đây cô hôn cho cái làm kỷ niệm.

ló (lúa)
Phương ngữ: Năm nay gặt ló được mùa lắm.
Phổ thông: Năm nay gặt lúa được mùa lắm.

rầy (ngượng / xấu hổ)
Phương ngữ: Mần rứa rầy chết đi được.
Phổ thông: Làm thế xấu hổ chết đi được.

sèm (thích / thèm)
Phương ngữ: Sèm ăn đọi bánh canh quá.
Phổ thông: Thèm ăn bát bánh canh quá.

lả (lửa)
Phương ngữ: Nhóm lả lên chụm cơm mạ ơi.
Phổ thông: Nhóm lửa lên đun cơm mẹ ơi.

nỏ (không)
Phương ngữ: Tau nỏ biết chi đâu hấy.
Phổ thông: Tao không biết gì đâu nhé.

lá trù (lá trầu)
Phương ngữ: Mệ ngồi tem lá trù ăn trầu.
Phổ thông: Bà ngồi tiêm lá trầu ăn trầu.

mắc (bận)
Phương ngữ: Chiều nay tau mắc đi mần nương rồi.
Phổ thông: Chiều nay tao bận đi làm vườn rồi.

mô (đâu)
Phương ngữ: Mi đi mô rứa mi?
Phổ thông: Mày đi đâu thế mày?

bọ (cha / bố)
Phương ngữ: Bọ tui đi mần đồng chưa về.
Phổ thông: Bố tôi đi làm đồng chưa về.

nương (vườn)
Phương ngữ: Ra nương hái ít rau về nấu canh.
Phổ thông: Ra vườn hái ít rau về nấu canh.

rẫy (nương)
Phương ngữ: Bọ lên rẫy trồng ngô từ sáng.
Phổ thông: Bố lên nương trồng ngô từ sáng.

bù rợ (bí đỏ)
Phương ngữ: Mạ nấu nồi canh bù rợ ngọt rành.
Phổ thông: Mẹ nấu nồi canh bí đỏ ngọt lắm.

nác chè (nước chè)
Phương ngữ: Mời bác uống đọi nác chè xanh.
Phổ thông: Mời bác uống bát nước chè xanh.

náng (nướng)
Phương ngữ: Bọ đem khoai ra náng trên bếp than.
Phổ thông: Bố đem khoai ra nướng trên bếp than.

mói (muối)
Phương ngữ: Cho thêm chút mói vô canh cho đậm đà.
Phổ thông: Cho thêm chút muối vào canh cho đậm đà.

trốc cúi (đầu gối)
Phương ngữ: Ngã bổ đau cấy trốc cúi quá.
Phổ thông: Ngã đau cái đầu gối quá.

tao / tau (tao)
Phương ngữ: Tau đi nhởi đây hấy.
Phổ thông: Tao đi chơi đây nhé.

tôi / tui (tôi)
Phương ngữ: Tui nỏ biết chuyện ni đâu.
Phổ thông: Tôi không biết chuyện này đâu.

bọn mình / ta (chúng mình)
Phương ngữ: Ta cùng đi nhởi thôi.
Phổ thông: Chúng mình cùng đi chơi thôi.

mày / mi (mày)
Phương ngữ: Mi mần chi rứa mi?
Phổ thông: Mày làm gì thế mày?

nó / hắn, hấn (nó)
Phương ngữ: Hấn mới đi học về đó.
Phổ thông: Nó mới đi học về đấy.

đâu / mô (đâu)
Phương ngữ: Cấy kéo để ở mô rứa?
Phổ thông: Cái kéo để ở đâu thế?

nào / mồ (nào)
Phương ngữ: Đưa đọi cơm lại đây mồ.
Phổ thông: Đưa bát cơm lại đây nào.

đâu nào / mô mồ (đâu nào)
Phương ngữ: Mi cất cấy chìa khóa ở mô mồ?
Phổ thông: Mày cất cái chìa khóa ở đâu nào?

ở đâu / ở mô (ở đâu / đi đâu thế)
Phương ngữ: Mi đang ở mô rứa?
Phổ thông: Mày đang ở đâu thế?

kia / tê ; kìa (đằng kia)
Phương ngữ: Cấy xe để ở đàng tê kìa.
Phổ thông: Cái xe để ở đằng kia kìa.

gì / chi (gì)
Phương ngữ: Mi đang tìm cấy chi rứa?
Phổ thông: Mày đang tìm cái gì thế?

sao / răng (sao)
Phương ngữ: Răng mi nỏ ăn cơm?
Phổ thông: Sao mày không ăn cơm?

thế, vậy / rứa (thế)
Phương ngữ: Mần rứa là được rồi đó.
Phổ thông: Làm thế là được rồi đấy.

nớ (đó / đấy)
Phương ngữ: Hồi nớ tau còn nhỏ lắm.
Phổ thông: Hồi đó tao còn nhỏ lắm.

hồi (thời)
Phương ngữ: Hồi nớ nhà choa nghèo lắm.
Phổ thông: Thời đó nhà chúng tôi nghèo lắm.

a ri nầy (thế này này)
Phương ngữ: Mần a ri nầy mới đúng ni.
Phổ thông: Làm thế này này mới đúng này.

chẳng / chả (chẳng)
Phương ngữ: Hấn chả chịu nghe lời chi cả.
Phổ thông: Nó chẳng chịu nghe lời gì cả.

ci, cấy (cái)
Phương ngữ: Đóng cấy cựa lại cho đỡ lạnh.
Phổ thông: Đóng cái cửa lại cho đỡ lạnh.

hấy (nhé)
Phương ngữ: Tối ni đi nhởi hấy!
Phổ thông: Tối nay đi chơi nhé!

coi (xem)
Phương ngữ: Ra coi ai đang gọi ngoài cươi tề.
Phổ thông: Ra xem ai đang gọi ngoài sân kìa.

vô (vào)
Phương ngữ: Vô nhà uống đọi nác chè đã.
Phổ thông: Vào nhà uống bát nước chè đã.

đít lác (đói tiền)
Phương ngữ: Dạo ni đít lác quá, nỏ có đồng mô.
Phổ thông: Dạo này đói tiền quá, không có đồng nào.

quày (rẽ)
Phương ngữ: Đi tới ngã ba rồi quày sang trái hấy.
Phổ thông: Đi tới ngã ba rồi rẽ sang trái nhé.

lè (bắp chân)
Phương ngữ: Đau cấy lè nỏ đi nhanh được.
Phổ thông: Đau cái bắp chân không đi nhanh được.

bảo / biểu (bảo)
Phương ngữ: Bọ biểu mi ra cươi quét nhà tề.
Phổ thông: Bố bảo mày ra sân quét nhà kìa.

kêu (nói)
Phương ngữ: Hấn kêu mi vô nhà ăn cơm tề.
Phổ thông: Nó nói mày vào nhà ăn cơm kìa.

su (sâu)
Phương ngữ: Rào ni su lắm, đừng có xuống tắm.
Phổ thông: Sông này sâu lắm, đừng có xuống tắm.

ót (gáy)
Phương ngữ: Bị đánh trúng cấy ót đau rành.
Phổ thông: Bị đánh trúng cái gáy đau lắm.

tán tỉnh / cưa cẩm (cưa cẩm)
Phương ngữ: Hấn đang cưa cẩm con du nhà bác Nam.
Phổ thông: Nó đang tán tỉnh con dâu nhà bác Nam.

tẹo, tí (xíu, lát)
Phương ngữ: Đợi tau một tẹo tau ra liền.
Phổ thông: Đợi tao một chút tao ra liền.

ở đầu tê (ở đằng kia)
Phương ngữ: Cấy ốt nằm ở đầu tê tề.
Phổ thông: Cửa tiệm nằm ở đằng kia kìa.

trợn mắt (trừng mắt)
Phương ngữ: Hấn trợn mắt nhìn tau ghê quá.
Phổ thông: Nó trừng mắt nhìn tao ghê quá.

nguýt (lườm)
Phương ngữ: Đi qua hấn nguýt tau một cái.
Phổ thông: Đi qua nó lườm tao một cái.

mọi bựa (đợt rồi)
Phương ngữ: Mọi bựa tau chộ mi ở chợ tề.
Phổ thông: Đợt rồi tao thấy mày ở chợ kìa.

mọi hồi (ngày trước)
Phương ngữ: Mọi hồi vùng ni toàn là rú rừng.
Phổ thông: Ngày trước vùng này toàn là núi rừng.

bộng (lỗ)
Phương ngữ: Cơn gỗ ni có cấy bộng to rành.
Phổ thông: Cây gỗ này có cái lỗ to lắm.

cả bầy (cả lũ)
Phương ngữ: Cả bầy rủ nhau đi nhởi ngoài rào.
Phổ thông: Cả lũ rủ nhau đi chơi ngoài sông.

xòe (ngã)
Phương ngữ: Chạy nhanh quá ngã xòe một cái.
Phổ thông: Chạy nhanh quá ngã xoè một cái.

con me (con bê)
Phương ngữ: Con me đang theo bò mẹ ra đồng.
Phổ thông: Con bê đang theo bò mẹ ra đồng.

rang (nướng)
Phương ngữ: Bọ đem khoai ra rang ăn cho nóng.
Phổ thông: Bố đem khoai ra nướng ăn cho nóng.

huề (hòa)
Phương ngữ: Đá bóng hai đội huề nhau rồi.
Phổ thông: Đá bóng hai đội hòa nhau rồi.

cảy (sưng)
Phương ngữ: Ngã bổ cảy một cục trên trốc cúi.
Phổ thông: Ngã đau sưng một cục trên đầu gối.

sẹo (thẹo)
Phương ngữ: Té ngã để lại cấy sẹo trên cẳng.
Phổ thông: Té ngã để lại cái thẹo trên chân.

mần vầy đi (làm bừa đi)
Phương ngữ: Cứ mần vầy đi cho kịp giờ hấy.
Phổ thông: Cứ làm bừa đi cho kịp giờ nhé.

ba hoa, ba láp (bốc phét)
Phương ngữ: Hấn toàn ba hoa ba láp nỏ ai tin.
Phổ thông: Nó toàn bốc phét không ai tin.

đèo (chở)
Phương ngữ: Cho tau đèo mi đi nhởi hấy.
Phổ thông: Để tao chở mày đi chơi nhé.

quán nét (hàng nét)
Phương ngữ: Mấy đứa lại chui vô quán nét rồi.
Phổ thông: Mấy đứa lại chui vào hàng nét rồi.

ốt (quán - tiệm)
Phương ngữ: Ra cấy ốt đầu đàng mua đọi nác.
Phổ thông: Ra cái quán đầu đường mua bát nước.

nghìn / ngàn (ngàn)
Phương ngữ: Cho tau xin năm ngàn mua cấy bánh.
Phổ thông: Cho tao xin năm nghìn mua cái bánh.

nấp (núp)
Phương ngữ: Trốn nấp sau cơn xoài kẻo bị chộ.
Phổ thông: Trốn núp sau cây xoài kẻo bị thấy.

rình (rình mò)
Phương ngữ: Mấy con mèo rình chuột ngoài cươi.
Phổ thông: Mấy con mèo rình chuột ngoài sân.

trật (trượt - hụt)
Phương ngữ: Chạy trượt chân té trật luôn.
Phổ thông: Chạy trượt chân té trượt luôn.

giựt thột (giật mình)
Phương ngữ: Nghe tiếng nổ làm tau giựt thột.
Phổ thông: Nghe tiếng nổ làm tao giật mình.

to (lớn)
Phương ngữ: Cấy nhà ni to rành luôn.
Phổ thông: Cái nhà này lớn lắm luôn.

rèo (nài nỉ)
Phương ngữ: Hấn rèo tau đi nhởi cùng hấn.
Phổ thông: Nó nài nỉ tao đi chơi cùng nó.

kíu (cứu)
Phương ngữ: Kiú tui với, trượt chân rồi!
Phổ thông: Cứu tôi với, trượt chân rồi!

đậu pha (tào phớ)
Phương ngữ: Mạ mua đọi đậu pha ăn mát rành.
Phổ thông: Mẹ mua bát tào phớ ăn mát lắm.

nhỏ (bé)
Phương ngữ: Con chó ni nhỏ xíu à.
Phổ thông: Con chó này bé xíu à.

lạc (đậu phộng)
Phương ngữ: Bọ rang đĩa lạc nhắm rượu.
Phổ thông: Bố rang đĩa đậu phộng nhắm rượu.

véo, chít (nhéo)
Phương ngữ: Đừng có véo tay tau đau quá.
Phổ thông: Đừng có nhéo tay tao đau quá.

xoa (thoa)
Phương ngữ: Xoa ít dầu vô trốc cúi cho bớt đau.
Phổ thông: Thoa ít dầu vào đầu gối cho bớt đau.

đành hanh (bắt bẻ)
Phương ngữ: Hấn đành hanh lắm, nỏ ai ưa.
Phổ thông: Nó bắt bẻ lắm, không ai ưa.

chót (bét)
Phương ngữ: Hấn học đứng chót lớp rồi.
Phổ thông: Nó học đứng bét lớp rồi.

na (mang theo)
Phương ngữ: Na cấy nón đi kẻo nắng hấy.
Phổ thông: Mang theo cái nón đi kẻo nắng nhé.

nhọc (mệt)
Phương ngữ: Đi mần nương về nhọc quá.
Phổ thông: Đi làm vườn về mệt quá.

đậu phụ (tàu hũ)
Phương ngữ: Mạ rán đĩa đậu phụ ăn cơm.
Phổ thông: Mẹ chiên đĩa tàu hũ ăn cơm.

riệu (rượu)
Phương ngữ: Bọ ngồi uống đọi riệu với bác.
Phổ thông: Bố ngồi uống bát rượu với bác.

rờ rờ rận rận (vớ va vớ vẩn)
Phương ngữ: Toàn nói chuyện rờ rờ rận rận nỏ ra chi.
Phổ thông: Toàn nói chuyện vớ va vớ vẩn không ra gì.

thu mua đồng nhôm (thu mua ve chai)
Phương ngữ: Mấy bà thu mua đồng nhôm đi qua đàng kìa.
Phổ thông: Mấy bà thu mua ve chai đi qua đường kìa.

đệm (nệm)
Phương ngữ: Mùa đông nằm đệm cho ấm.
Phổ thông: Mùa đông nằm nệm cho ấm.

trét (bôi)
Phương ngữ: Trét ít sơn lên bức tường ni.
Phổ thông: Bôi ít sơn lên bức tường này.

trửa (giữa)
Phương ngữ: Nằm trửa nhà cho mát.
Phổ thông: Nằm giữa nhà cho mát.

hu (thảy)
Phương ngữ: Hu cấy bóng lại đây tau bắt mồ.
Phổ thông: Thảy cái bóng lại đây tao bắt nào.

bớp (chụp)
Phương ngữ: Hu bóng lên tau bớp cho hấy.
Phổ thông: Tung bóng lên tao chụp cho nhé.

hu và bớp (tung và hứng)
Phương ngữ: Hai đứa chơi trò hu và bớp bóng.
Phổ thông: Hai đứa chơi trò tung và hứng bóng.

trèo (leo)
Phương ngữ: Đừng có trèo cơn xoài kẻo bổ đó.
Phổ thông: Đừng có leo cây xoài kẻo ngã đấy.

bứt (bẻ, ngắt)
Phương ngữ: Bứt cho mạ mấy lá trù vô đây.
Phổ thông: Ngắt cho mẹ mấy lá trầu vào đây.

xán (ném)
Phương ngữ: Đừng xán đá ra đàng nguy hiểm lắm.
Phổ thông: Đừng ném đá ra đường nguy hiểm lắm.

rờ (sờ)
Phương ngữ: Rờ vô xem nác ấm chưa mồ.
Phổ thông: Sờ vào xem nước ấm chưa nào.

vọc (nghịch)
Phương ngữ: Đừng có vọc nác dơ hết áo quần.
Phổ thông: Đừng có nghịch nước bẩn hết quần áo.

khi (lúc)
Phương ngữ: Khi nại tau chộ mi ngoài chợ tề.
Phổ thông: Lúc nãy tao thấy mày ngoài chợ kìa.

rệt (rượt)
Phương ngữ: Con chó đang rệt con mèo ngoài cươi.
Phổ thông: Con chó đang rượt con mèo ngoài sân.

chộ mô rứa (chỗ nào đấy)
Phương ngữ: Mi đang ở chộ mô rứa?
Phổ thông: Mày đang ở chỗ nào đấy?

bẩy (bẫy)
Phương ngữ: Đặt cấy bẩy bắt chuột ngoài nương.
Phổ thông: Đặt cái bẫy bắt chuột ngoài vườn.

lạt (nhạt)
Phương ngữ: Canh ni nấu hơi lạt rồi mạ ơi.
Phổ thông: Canh này nấu hơi nhạt rồi mẹ ơi.

giúp (giùm)
Phương ngữ: Mần giúp tau cấy ni với mồ.
Phổ thông: Làm giùm tao cái này với nào.

bị troẹo cổ (bị ngáo cổ)
Phương ngữ: Ngủ sai tư thế nên bị troẹo cổ rồi.
Phổ thông: Ngủ sai tư thế nên bị ngáo cổ rồi.

ống xả (bô xe máy)
Phương ngữ: Cấy ống xả xe máy nổ to rành.
Phổ thông: Cái bô xe máy nổ to lắm.

nhoi (nhìn trộm)
Phương ngữ: Đừng có nhoi vô phòng người khác rứa.
Phổ thông: Đừng có nhìn trộm vào phòng người khác thế.

súp (bột canh)
Phương ngữ: Cho ít súp vô canh cho vừa ăn.
Phổ thông: Cho ít bột canh vào canh cho vừa ăn.

đị (điệu)
Phương ngữ: Con gái mà đị rành luôn.
Phổ thông: Con gái mà điệu lắm luôn.

loong bia (lon bia)
Phương ngữ: Bọ uống hết một loong bia rồi.
Phổ thông: Bố uống hết một lon bia rồi.

cẳng (chân)
Phương ngữ: Đau cấy cẳng nỏ đi đâu được.
Phổ thông: Đau cái chân không đi đâu được.

rọt (ruột)
Phương ngữ: Đau cấy rọt quá nỏ ăn được chi.
Phổ thông: Đau cái ruột quá không ăn được gì.

bằng tày (bằng không)
Phương ngữ: Mần nãy giờ kết quả cụng bằng tày.
Phổ thông: Làm nãy giờ kết quả cũng bằng không.

chốc nữa (chút nữa)
Phương ngữ: Chốc nữa tau sang nhà mi nhởi hấy.
Phổ thông: Chút nữa tao sang nhà mày chơi nhé.

bể (vỡ)
Phương ngữ: Cấy đọi bị rơi bể mất rồi.
Phổ thông: Cái bát bị rơi vỡ mất rồi.

đút lót (hối lộ)
Phương ngữ: Mần việc sai trái rồi đút lót cho người ta.
Phổ thông: Làm việc sai trái rồi hối lộ cho người ta.

bàn là (bàn ủi)
Phương ngữ: Lấy cấy bàn là ra là cấy áo cho thẳng.
Phổ thông: Lấy cái bàn ủi ra ủi cái áo cho thẳng.

cấy chạc (cái dây)
Phương ngữ: Cột cấy chạc ni chặt lại hấy.
Phổ thông: Buộc cái dây này chặt lại nhé.

nạm (nắm)
Phương ngữ: Lấy một nạm gạo bỏ vô nồi.
Phổ thông: Lấy một nắm gạo bỏ vào nồi.

đại (khá)
Phương ngữ: Hấn học cụng đại rành luôn.
Phổ thông: Nó học cũng khá lắm luôn.

rành (rất)
Phương ngữ: Hấn học rành giỏi luôn đó.
Phổ thông: Nó học rất giỏi luôn đấy.

một chắc (một mình)
Phương ngữ: Tau ở nhà một chắc nỏ có ai.
Phổ thông: Tao ở nhà một mình không có ai.

cột chạc lại (buộc dây lại)
Phương ngữ: Cột chạc lại kẻo tuột đó hấy.
Phổ thông: Buộc dây lại kẻo tuột đấy nhé.

rứa tê mà (thế cơ mà)
Phương ngữ: Rứa tê mà tau nỏ biết chi cả.
Phổ thông: Thế cơ mà tao không biết gì cả.

rớt tiền tề (rơi tiền kìa)
Phương ngữ: Mi bị rớt tiền tề mi ơi!
Phổ thông: Mày bị rơi tiền kìa mày ơi!

cấy bị (cái túi lớn)
Phương ngữ: Bỏ ló vô cấy bị ni mang về.
Phổ thông: Bỏ lúa vào cái túi lớn này mang về.

phỏng (bỏng)
Phương ngữ: Cẩn thận kẻo nác sôi làm phỏng tay.
Phổ thông: Cẩn thận kẻo nước sôi làm bỏng tay.

bâu sâu, thoi boi (xía vào chuyện người khác)
Phương ngữ: Đừng có bâu sâu vô chuyện người ta rứa.
Phổ thông: Đừng có xía vào chuyện người ta thế.

giảm xóc (phuộc xe máy)
Phương ngữ: Thay cấy giảm xóc xe máy đi cho êm.
Phổ thông: Thay cái phuộc xe máy đi cho êm.

cân (ký)
Phương ngữ: Mi dạo ni nặng mấy cân rồi?
Phổ thông: Mày dạo này nặng mấy ký rồi?

mấy (bao nhiêu)
Phương ngữ: Cấy ni giá mấy tiền rứa?
Phổ thông: Cái này giá bao nhiêu tiền thế?

chạm (đụng)
Phương ngữ: Đừng chạm vô đọi nác nóng đó.
Phổ thông: Đừng đụng vào bát nước nóng đó.

thúc (húc)
Phương ngữ: Con tru đang thúc vô cơn xoài.
Phổ thông: Con trâu đang húc vào cây xoài.

cây (km)
Phương ngữ: Từ nhà ra chợ còn hai cây nữa.
Phổ thông: Từ nhà ra chợ còn hai km nữa.

khiếp (kinh)
Phương ngữ: Nhìn cấy đàng dơ khiếp rành.
Phổ thông: Nhìn cái đường bẩn kinh thật.

so bì (sánh bằng)
Phương ngữ: Đừng có so bì hơn thua mần chi.
Phổ thông: Đừng có so bì hơn thua làm gì.

út (chót)
Phương ngữ: Hấn là con út trong nhà.
Phổ thông: Nó là con chót trong nhà.

chém mồm chém miệng (trộm vía)
Phương ngữ: Chém mồm chém miệng em bé dạo ni ngoan rành.
Phổ thông: Trộm vía em bé dạo này ngoan lắm.

nói như thật (nói như đúng rồi)
Phương ngữ: Hấn nói như thật mần tau tin sái cổ.
Phổ thông: Nó nói như đúng rồi làm tao tin sái cổ.

quăng (vứt)
Phương ngữ: Quăng cấy rác ni ra thùng rác mồ.
Phổ thông: Vứt cái rác này ra thùng rác nào.

ở một chắc (ở một mình)
Phương ngữ: Đêm ni tau ở một chắc ở nhà.
Phổ thông: Đêm nay tao ở một mình ở nhà.

vừng (mè)
Phương ngữ: Bánh đa rắc nhiều vừng thơm rành.
Phổ thông: Bánh đa rắc nhiều mè thơm lắm.

rớt (rơi)
Phương ngữ: Rớt cấy kéo xuống đất rồi tề.
Phổ thông: Rơi cái kéo xuống đất rồi kìa.

liệt (quá mệt)
Phương ngữ: Đi mần về mệt liệt cả người.
Phổ thông: Đi làm về mệt quá mệt cả người.

rán (chiên)
Phương ngữ: Mạ rán cá thơm phức cả nhà.
Phổ thông: Mẹ chiên cá thơm phức cả nhà.

tợn (bặm trợn)
Phương ngữ: Nhìn mặt hấn tợn rành luôn.
Phổ thông: Nhìn mặt nó bặm trợn lắm luôn.

cứ a răng á (cứ thế nào ấy)
Phương ngữ: Nhìn cấy nhà ni cứ a răng á.
Phổ thông: Nhìn cái nhà này cứ thế nào ấy.

đáng ghét (kỳ cục)
Phương ngữ: Cấy tính hấn đáng ghét rành.
Phổ thông: Cái tính nó kỳ cục lắm.

kưng (chiều chuộng)
Phương ngữ: Bọ kưng đứa con út nhất nhà.
Phổ thông: Bố chiều chuộng đứa con chót nhất nhà.

mến (quý)
Phương ngữ: Tau mến cấy nết ngoan ngoãn của mi.
Phổ thông: Tao quý cái nết ngoan ngoãn của mày.

ăn cắp (ăn trộm)
Phương ngữ: Kẻ gian vô nương ăn cắp bù rợ.
Phổ thông: Kẻ gian vào vườn ăn trộm bí đỏ.

ghẹo (trêu)
Phương ngữ: Đừng có ghẹo con chó kẻo hấn cắn.
Phổ thông: Đừng có trêu con chó kẻo nó cắn.

lòi (hở)
Phương ngữ: Áo bị rách lòi cả lưng rồi tề.
Phổ thông: Áo bị rách hở cả lưng rồi kìa.

cá tràu (cá quả)
Phương ngữ: Mạ nấu nồi canh cá tràu ngọt rành.
Phổ thông: Mẹ nấu nồi canh cá quả ngọt lắm.

phàm tính (cục tính, nóng tính)
Phương ngữ: Hấn phàm tính lắm, đừng có chọc hấn.
Phổ thông: Nó cục tính lắm, đừng có chọc nó.

khái (hổ)
Phương ngữ: Ngày xưa trên rú ni nhiều khái lắm.
Phổ thông: Ngày xưa trên núi này nhiều hổ lắm.

cầy (chó)
Phương ngữ: Con cầy nhà tau khun rành luôn.
Phổ thông: Con chó nhà tao khôn lắm luôn.

cấy chủi (cái chổi)
Phương ngữ: Lấy cấy chủi quét cấy cươi cho sạch.
Phổ thông: Lấy cái chổi quét cái sân cho sạch.

khải (gãi)
Phương ngữ: Khải cho tau cấy lưng mồ, ngứa quá.
Phổ thông: Gãi cho tao cái lưng nào, ngứa quá.

ngoắc (móc)
Phương ngữ: Ngoắc cấy áo lên cấy đinh tê kìa.
Phổ thông: Móc cái áo lên cái đinh kia kìa.

1 nạm (1 nắm)
Phương ngữ: Bỏ 1 nạm gạo vô nồi nấu cháo.
Phổ thông: Bỏ 1 nắm gạo vào nồi nấu cháo.

ngọ (ngõ)
Phương ngữ: Đi ra ngọ coi xe cộ hấy.
Phổ thông: Đi ra ngõ xem xe cộ nhé.

nước sôi (nước lọc)
Phương ngữ: Uống đọi nước sôi cho sạch hấy.
Phổ thông: Uống bát nước lọc cho sạch nhé.

chín chắn (chững chạc)
Phương ngữ: Dạo ni trông hấn chín chắn hẳn ra.
Phổ thông: Dạo này trông nó chững chạc hẳn ra.

trọi (chọi)
Phương ngữ: Mấy đứa nhỏ đang chơi trọi dế ngoài cươi.
Phổ thông: Mấy đứa nhỏ đang chơi chọi dế ngoài sân.

khỏ (gõ)
Phương ngữ: Khỏ cựa ba cái cho người ta biết.
Phổ thông: Gõ cửa ba cái cho người ta biết.

cù chuầy (cù nhầy)
Phương ngữ: Hấn cù chuầy lắm, nỏ chịu trả tiền.
Phổ thông: Nó cù nhầy lắm, không chịu trả tiền.

phể mui (nứt môi)
Phương ngữ: Mùa đông trời lạnh nứt phể mui hết rồi.
Phổ thông: Mùa đông trời lạnh nứt môi hết rồi.

nhể (nát, bựa)
Phương ngữ: Đừng mần nhể cấy bánh ra rứa.
Phổ thông: Đừng làm nát cái bánh ra thế.

lặt (lượm, nhặt)
Phương ngữ: Lặt mấy lá rau sâu bỏ đi hấy.
Phổ thông: Nhặt mấy lá rau sâu bỏ đi nhé.

mưa lang (mưa phùn)
Phương ngữ: Trời đang mưa lang, đi nhớ mang ô hấy.
Phổ thông: Trời đang mưa phùn, đi nhớ mang dù nhé.

áo phông (áo thun)
Phương ngữ: Mặc cấy áo phông cho mát mẻ.
Phổ thông: Mặc cái áo thun cho mát mẻ.

mũ (nón)
Phương ngữ: Đội cấy mũ vô kẻo nắng trốc.
Phổ thông: Đội cái nón vào kẻo nắng đầu.

ô (dù)
Phương ngữ: Che cấy ô đi kẻo ướt áo.
Phổ thông: Che cái dù đi kẻo ướt áo.

lai (đèo)
Phương ngữ: Để tau lai mi sang nhà o nhởi.
Phổ thông: Để tao đèo mày sang nhà cô chơi.

bấu víu (đeo bám)
Phương ngữ: Đừng bấu víu mần chi cho mệt.
Phổ thông: Đừng đeo bám làm gì cho mệt.

cấu (cào)
Phương ngữ: Con mèo cấu rách cấy mấn rồi.
Phổ thông: Con mèo cào rách cái váy rồi.

thế nên (bởi vậy)
Phương ngữ: Hấn nhác lắm, thế nên mới học kém.
Phổ thông: Nó lười lắm, bởi vậy mới học kém.

khi nại (lúc nãy)
Phương ngữ: Khi nại tau mới chộ hấn ngoài chợ.
Phổ thông: Lúc nãy tao mới thấy nó ngoài chợ.

xỏ lá (dối trá)
Phương ngữ: Đừng có chơi trò xỏ lá gạt người ta.
Phổ thông: Đừng có chơi trò dối trá gạt người ta.

xé vé (dìm hàng)
Phương ngữ: Hấn toàn xé vé tau trước mặt bạn bè.
Phổ thông: Nó toàn dìm hàng tao trước mặt bạn bè.

trách chi (chả trách)
Phương ngữ: Trách chi hấn nỏ chịu đi nhởi.
Phổ thông: Chả trách nó không chịu đi chơi.

giựt (giật)
Phương ngữ: Đi đàng nhớ cẩn thận kẻo bị giựt túi.
Phổ thông: Đi đường nhớ cẩn thận kẻo bị giật túi.

cái đém (cái bớt)
Phương ngữ: Trên tay hấn có cấy đém đen to rành.
Phổ thông: Trên tay nó có cái bớt đen to lắm.

chén (ly nhỏ)
Phương ngữ: Rót đọi chén trà mời khách hấy.
Phổ thông: Rót ly nhỏ trà mời khách nhé.

cốc (ly)
Phương ngữ: Cho tau xin cốc nác lạnh mồ.
Phổ thông: Cho tao xin ly nước lạnh nào.

thìa (muỗng)
Phương ngữ: Lấy cấy thìa ra ăn cháo hấy.
Phổ thông: Lấy cái muỗng ra ăn cháo nhé.

nỉa (dĩa)
Phương ngữ: Dùng cấy nỉa xiên miếng dưa hấu.
Phổ thông: Dùng cái dĩa xiên miếng dưa hấu.

tô (bát to)
Phương ngữ: Mạ múc cho tô canh to rành.
Phổ thông: Mẹ múc cho bát to canh lớn lắm.

chưởi (chửi)
Phương ngữ: Đừng chưởi nhau mần chi mệt người.
Phổ thông: Đừng chửi nhau làm gì mệt người.

nhởi (chơi)
Phương ngữ: Chiều ni đi nhởi bóng đá nỏ?
Phổ thông: Chiều nay đi chơi bóng đá không?

tróc,trợt (chầy xước)
Phương ngữ: Té ngã làm tróc trợt cấy trốc cúi.
Phổ thông: Té ngã làm trầy xước cái đầu gối.

bóc (mở)
Phương ngữ: Bóc cấy gói bánh ni ra ăn hấy.
Phổ thông: Mở cái gói bánh này ra ăn nhé.

chạc (dây)
Phương ngữ: Buộc cấy chạc ni vô cọc hấy.
Phổ thông: Buộc cái dây này vào cọc nhé.

nót (nuốt)
Phương ngữ: Ăn chậm thôi kẻo nghẹn nỏ nót được.
Phổ thông: Ăn chậm thôi kẻo nghẹn không nuốt được.

giừ (giờ)
Phương ngữ: Giừ đi mô đây hả bây?
Phổ thông: Bây giờ đi đâu đây hả tụi mày?

hè hoặc hầy (nhỉ hoặc nhở)
Phương ngữ: Hôm nay trời đẹp hè!
Phổ thông: Hôm nay trời đẹp nhỉ!

chơ (chứ)
Phương ngữ: Chơ răng nựa, đúng rồi đó!
Phổ thông: Chứ sao nữa, đúng rồi đấy!

bới cơm (xới cơm)
Phương ngữ: Mạ bới cho đọi cơm đầy.
Phổ thông: Mẹ xới cho bát cơm đầy.

đen đủi (xui xẻo)
Phương ngữ: Hôm nay gặp toàn chuyện đen đủi.
Phổ thông: Hôm nay gặp toàn chuyện xui xẻo.

xon (đỏ)
Phương ngữ: Dạo ni gặp xon rành luôn.
Phổ thông: Dạo này gặp đỏ lắm luôn.

đùm (gói)
Phương ngữ: Đùm cấy bánh ni mang đi học.
Phổ thông: Gói cái bánh này mang đi học.

bày (chỉ)
Phương ngữ: Bày tau mần bài toán ni với mồ.
Phổ thông: Chỉ tao làm bài toán này với nào.

phụ tiền thừa (thối tiền thừa)
Phương ngữ: Người ta phụ tiền thừa cho mi chưa?
Phổ thông: Người ta thối tiền thừa cho mày chưa?

đến (tới)
Phương ngữ: Đi đến nhà o nhởi mau lên.
Phổ thông: Đi tới nhà cô chơi mau lên.

đậu (đỗ)
Phương ngữ: Con xe đậu ngoài cươi tề.
Phổ thông: Chiếc xe đỗ ngoài sân kìa.

nói tục (nói bậy)
Phương ngữ: Đừng có nói tục mần xấu hổ hấy.
Phổ thông: Đừng có nói bậy làm xấu hổ nhé.

buổi túi (buổi tối)
Phương ngữ: Buổi túi trời lạnh rành luôn.
Phổ thông: Buổi tối trời lạnh lắm luôn.

ê chà (ôi giời)
Phương ngữ: Ê chà, cấy nhà ni to rành!
Phổ thông: Ôi giời, cái nhà này to thật!

nịt (dây lưng)
Phương ngữ: Thắt cấy nịt lại cho gọn gàng.
Phổ thông: Thắt cái dây lưng lại cho gọn gàng.

xe chiến (xe độ)
Phương ngữ: Mấy đứa đi con xe chiến nổ to rành.
Phổ thông: Mấy đứa đi chiếc xe độ nổ to lắm.

ngày mốt (ngày kia)
Phương ngữ: Ngày mốt tau mới sang nhởi được.
Phổ thông: Ngày kia tao mới sang chơi được.

tày (huề vốn ban đầu)
Phương ngữ: Bán hàng hôm nay huề tày thôi.
Phổ thông: Bán hàng hôm nay huề vốn ban đầu thôi.

cù bất cù bơ (bụi bờ lang thang)
Phương ngữ: Đừng đi cù bất cù bơ ngoài đàng rứa.
Phổ thông: Đừng đi bụi bờ lang thang ngoài đường thế.

nổ (chém gió)
Phương ngữ: Hấn toàn nổ chuyện trên trời.
Phổ thông: Nó toàn chém gió chuyện trên trời.

sổ đị (điệu đà quá)
Phương ngữ: Mặc cấy mấn ni nhìn sổ đị rành.
Phổ thông: Mặc cái váy này nhìn điệu đà quá lắm.

bồng (bế)
Phương ngữ: Mạ bồng em bé ra cươi nhởi.
Phổ thông: Mẹ bế em bé ra sân chơi.

nhớp (bẩn)
Phương ngữ: Tay chân nhớp quá ra rửa mồ.
Phổ thông: Tay chân bẩn quá ra rửa nào.

khun (khôn)
Phương ngữ: Con cầy ni khun rành luôn.
Phổ thông: Con chó này khôn lắm luôn.

troi (ranh)
Phương ngữ: Đứa nhỏ ni troi rành luôn.
Phổ thông: Đứa nhỏ này ranh lắm luôn.

chộ nhim (chỗ râm)
Phương ngữ: Ra chộ nhim ngồi cho mát mẻ.
Phổ thông: Ra chỗ râm ngồi cho mát mẻ.

buôn chuyện (tám chuyện)
Phương ngữ: Mấy mụ ngồi buôn chuyện ngoài ngọ.
Phổ thông: Mấy bà ngồi tám chuyện ngoài ngõ.

nôn (mửa)
Phương ngữ: Ăn đồ thiu vô bị nôn liền.
Phổ thông: Ăn đồ thiu vào bị mửa liền.

rinh, khiêng (bưng, bê)
Phương ngữ: Rinh cấy bàn ni ra cươi mồ.
Phổ thông: Bưng cái bàn này ra sân nào.

sơ sơ (sương sương)
Phương ngữ: Tau biết làm bài ni sơ sơ thôi.
Phổ thông: Tao biết làm bài này sương sương thôi.

xe lai (xe ôm)
Phương ngữ: Bắt con xe lai đi ra chợ cho nhanh.
Phổ thông: Bắt chiếc xe ôm đi ra chợ cho nhanh.

o (cô)
Phương ngữ: O tau mới mua cho cấy mấn đẹp rành.
Phổ thông: Cô tao mới mua cho cái váy đẹp lắm.

dì (dì)
Phương ngữ: Dì mới ở quê ra nhởi.
Phổ thông: Dì mới ở quê ra chơi.

ba mẹ (ba má)
Phương ngữ: Ba mẹ tau đi mần nương chưa về.
Phổ thông: Ba má tao đi làm vườn chưa về.

mự (vợ của em trai mẹ hoặc bố)
Phương ngữ: Mự mới nấu nồi canh bù rợ ngon rành.
Phổ thông: Mự mới nấu nồi canh bí đỏ ngon lắm.

nạt (quát)
Phương ngữ: Đừng có nạt đứa em kẻo hấn khóc.
Phổ thông: Đừng có quát đứa em kẻo nó khóc.

hét (la)
Phương ngữ: Đừng hét to rứa làng xóm nghe thấy.
Phổ thông: Đừng la to thế làng xóm nghe thấy.

ciếc (cù léc)
Phương ngữ: Đừng ciếc tau, tau nhột rành.
Phổ thông: Đừng cù léc tao, tao nhột lắm.

đài (gàu)
Phương ngữ: Lấy cấy đài múc nác vô giếng.
Phổ thông: Lấy cái gàu múc nước vào giếng.

ban lơn (đùa dai)
Phương ngữ: Hấn toàn ban lơn mần tau bực mình.
Phổ thông: Nó toàn đùa dai làm tao bực mình.

trêu ngươi (chọc tức)
Phương ngữ: Đừng có trêu ngươi hấn kẻo hấn giận.
Phổ thông: Đừng có chọc tức nó kẻo nó giận.

ngất ngất (linh tinh)
Phương ngữ: Nói chuyện ngất ngất nỏ ai hiểu chi.
Phổ thông: Nói chuyện linh tinh không ai hiểu gì.

lừa (gạt)
Phương ngữ: Đừng có lừa người ta rứa hấy.
Phổ thông: Đừng có gạt người ta thế nhé.

dạ (vâng)
Phương ngữ: Dạ, con mới đi học về ni.
Phổ thông: Vâng, con mới đi học về đây.

dùng (xài)
Phương ngữ: Cấy kéo ni dùng rành tốt.
Phổ thông: Cái kéo này xài rất tốt.

cà trắp (cà chớn)
Phương ngữ: Tính hấn cà trắp nỏ ai muốn nhởi chung.
Phổ thông: Tính nó cà chớn không ai muốn chơi chung.

xơi (ăn)
Phương ngữ: Lại đây xơi đọi cơm với nhà choa.
Phổ thông: Lại đây ăn bát cơm với nhà chúng tôi.

lóc bóc (khệnh khạng, bốc đồng)
Phương ngữ: Đừng có lóc bóc trước mặt người lớn.
Phổ thông: Đừng có khệnh khạng trước mặt người lớn.

lớp tớp (láo lếu, hấp tấp)
Phương ngữ: Mần ăn lớp tớp kẻo hỏng việc đó hấy.
Phổ thông: Làm ăn hấp tấp kẻo hỏng việc đấy nhé.

cà khịa (gây sự)
Phương ngữ: Đừng có đi cà khịa người ta mần chi.
Phổ thông: Đừng có đi gây sự người ta làm gì.

cù lần (khờ)
Phương ngữ: Hấn hiền lành nhưng hơi cù lần.
Phổ thông: Nó hiền lành nhưng hơi khờ.

dở (bữa)
Phương ngữ: Một ngày ăn ba dở cơm đầy đủ.
Phổ thông: Một ngày ăn ba bữa cơm đầy đủ.

cụng (cũng)
Phương ngữ: Tau cụng muốn đi nhởi nựa.
Phổ thông: Tao cũng muốn đi chơi nữa.
`;

function parseExamples(text) {
  const map = new Map();
  const blocks = text.trim().split('\n\n');
  
  blocks.forEach(b => {
    const lines = b.trim().split('\n');
    if (lines.length >= 3) {
      let header = lines[0].trim();
      // Clean header like "con tru (con trâu)" -> "con tru"
      // or "tao / tau (tao)" -> matches "tao", "tau"
      // or "nó / hắn, hấn (nó)" -> matches "nó", "hắn", "hấn"
      let wordPart = header.replace(/\s*\([\s\S]*?\)$/, '').trim();
      let pnLine = lines[1].replace(/^Phương ngữ:\s*/, '').trim();
      let ptLine = lines[2].replace(/^Phổ thông:\s*/, '').trim();

      // Split aliases like "tao / tau" or "hắn, hấn"
      const aliases = wordPart.split(/[/;,]/).map(w => w.trim().toLowerCase());
      aliases.forEach(a => {
        if (a) {
          map.set(a, { example: pnLine, translation: ptLine });
        }
      });
    }
  });

  return map;
}

const exampleMap = parseExamples(rawText);
console.log('Parsed example map size:', exampleMap.size);

function updateLexiconFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/(const DIALECT_LEXICON = )(\[[\s\S]*?\])(;)/);
  if (!match) {
    console.error('Could not parse DIALECT_LEXICON in', filePath);
    return;
  }

  const lexicon = JSON.parse(match[2]);
  let updatedCount = 0;

  lexicon.forEach(item => {
    if (item.region === 'Nghệ Tĩnh') {
      const wLower = item.word.trim().toLowerCase();
      if (exampleMap.has(wLower)) {
        const ex = exampleMap.get(wLower);
        item.example = ex.example;
        item.exampleTranslation = ex.translation;
        updatedCount++;
      }
    }
  });

  console.log(`[${path.basename(filePath)}] Updated ${updatedCount} Nghệ Tĩnh entries.`);
  const updatedContent = content.replace(match[0], match[1] + JSON.stringify(lexicon, null, 2) + match[3]);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

updateLexiconFile(path.join(__dirname, '..', 'data.js'));
updateLexiconFile(path.join(__dirname, '..', 'NHGNSBTT', 'data.js'));
