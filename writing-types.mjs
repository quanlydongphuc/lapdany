export const writingGroups = [
  {
    id: 'storytelling',
    label: 'Kể chuyện và sự việc',
    types: [
      { id: 'retell-story', label: 'Kể lại một câu chuyện', structure: 'Mở bài – Thân bài – Kết bài', guide: 'Mở bài giới thiệu tên truyện, lí do biết hoặc ấn tượng. Thân bài sắp xếp các sự việc theo trình tự hợp lí, nêu nhân vật, bối cảnh, nguyên nhân, diễn biến và kết quả khi có trong lời kể. Kết bài nêu cảm nghĩ, bài học hoặc mong muốn. Gợi ý cách mở bài trực tiếp/gián tiếp và kết bài phù hợp nếu có ích.', essayGuide: 'Viết theo bố cục mở bài, thân bài kể lần lượt các sự việc, kết bài nêu cảm nghĩ hoặc bài học. Không làm sai cốt truyện đã kể.' },
      { id: 'historical-story', label: 'Kể chuyện về nhân vật lịch sử', structure: 'Mở bài – Thân bài – Kết bài', guide: 'Giới thiệu câu chuyện và nhân vật lịch sử. Thân bài kể các sự việc theo diễn biến, làm rõ hành động, suy nghĩ và đóng góp của nhân vật theo lời kể. Kết bài nêu sự khâm phục, tự hào hoặc bài học. Không tự thêm ngày tháng, chiến công hay dữ kiện lịch sử chưa được cung cấp.', essayGuide: 'Kể theo diễn biến câu chuyện, làm rõ hành động và phẩm chất của nhân vật. Không bịa thêm sự kiện hoặc dữ kiện lịch sử.' },
      { id: 'recount-event', label: 'Thuật lại một sự việc hoặc hoạt động', structure: 'Mở bài – Diễn biến – Kết bài', guide: 'Mở bài nêu sự việc, thời gian, địa điểm và người tham gia nếu có. Thân bài thuật lại việc làm theo trình tự thời gian hoặc không gian bằng các từ nối như đầu tiên, tiếp theo, cuối cùng. Kết bài nêu kết quả, suy nghĩ và cảm xúc. Chỉ dùng điều học sinh đã kể.', essayGuide: 'Thuật lại sự việc theo trình tự rõ ràng; kết hợp kết quả và cảm xúc của người kể.' },
      { id: 'imaginative-story', label: 'Viết đoạn văn tưởng tượng từ câu chuyện', structure: 'Mở đầu – Chi tiết tưởng tượng – Kết thúc', guide: 'Dựa trên truyện đã nghe/đọc, chọn một cách sáng tạo: đổi mở đầu, thêm lời thoại hoặc chi tiết miêu tả, phát triển một sự việc, viết tiếp hoặc thay kết thúc. Phân biệt chi tiết tưởng tượng với sự việc gốc; không làm nhân vật lệch tính cách một cách vô cớ.', essayGuide: 'Viết đoạn văn tưởng tượng dựa trên truyện, bổ sung chi tiết hoặc lời thoại phù hợp. Giữ tính cách nhân vật và làm rõ đây là phần tưởng tượng.' },
      { id: 'roleplay-character', label: 'Đóng vai nhân vật để kể chuyện', structure: 'Giới thiệu nhân vật – Kể sự việc – Cảm nghĩ', guide: 'Kể ở ngôi phù hợp với nhân vật (ta, tôi, em…). Nêu hoàn cảnh, suy nghĩ, lời nói và hành động của nhân vật theo truyện. Có thể thêm chi tiết tưởng tượng nhỏ phù hợp; không thay đổi sự việc cốt lõi.', essayGuide: 'Kể ở ngôi thứ nhất trong vai nhân vật, thể hiện suy nghĩ và cảm xúc phù hợp với truyện. Chi tiết mới phải hợp tính cách và không đổi cốt truyện.' },
    ],
  },
  {
    id: 'description',
    label: 'Miêu tả',
    types: [
      { id: 'describe-animal', label: 'Miêu tả con vật', structure: 'Mở bài – Ngoại hình và hoạt động – Tình cảm', guide: 'Mở bài giới thiệu con vật. Thân bài tả bao quát rồi chọn các đặc điểm ngoại hình tiêu biểu, sau đó tả hoạt động hoặc thói quen; sắp xếp theo trình tự rõ ràng và gợi ý dùng giác quan, so sánh vừa sức. Kết bài nêu tình cảm hoặc điều mong muốn. Không tự khẳng định đặc điểm riêng chưa được kể.', essayGuide: 'Miêu tả con vật từ bao quát đến đặc điểm nổi bật, hoạt động/thói quen và kết thúc bằng tình cảm. Dùng từ ngữ cụ thể, phù hợp lớp 4.' },
      { id: 'describe-plant', label: 'Miêu tả cây cối', structure: 'Mở bài – Đặc điểm của cây – Tình cảm', guide: 'Mở bài giới thiệu cây. Thân bài chọn tả từng bộ phận hoặc sự phát triển theo thời gian; ưu tiên đặc điểm nổi bật của thân, cành, lá, hoa, quả và cảnh vật/hoạt động liên quan nếu có. Kết bài nêu ấn tượng hoặc tình cảm. Không bịa mùa hoa/quả hay việc chăm sóc.', essayGuide: 'Miêu tả cây theo trình tự từng bộ phận hoặc thời gian; chọn chi tiết tiêu biểu và kết hợp cảm xúc tự nhiên.' },
    ],
  },
  {
    id: 'opinions',
    label: 'Nêu ý kiến và cảm xúc',
    types: [
      { id: 'opinion-story', label: 'Nêu lí do yêu thích một câu chuyện', structure: 'Mở đầu – Lí do và dẫn chứng – Khẳng định ý kiến', guide: 'Mở đầu giới thiệu tên truyện/tác giả nếu đã biết và nêu ý kiến. Phần triển khai chọn các lí do nổi bật như nhân vật, chi tiết, cách kể hoặc bài học, kèm dẫn chứng cụ thể từ lời kể. Kết thúc khẳng định lại ý kiến/cảm xúc. Không tự bịa tên tác giả hoặc chi tiết truyện.', essayGuide: 'Viết đoạn nêu ý kiến rõ ràng, chọn một vài lí do nổi bật kèm dẫn chứng, cuối đoạn khẳng định cảm nhận.' },
      { id: 'opinion-kindness', label: 'Nêu ý kiến về truyện tình yêu thương/lòng biết ơn', structure: 'Mở đầu – Lí do và dẫn chứng – Cảm nghĩ', guide: 'Nêu tên truyện và ý kiến chung. Chọn hành động/chi tiết thể hiện yêu thương hoặc biết ơn, giải thích vì sao em thích và bài học rút ra. Kết thúc khẳng định cảm xúc. Không biến suy đoán thành sự thật của truyện.', essayGuide: 'Nêu ý kiến về câu chuyện tình yêu thương/lòng biết ơn bằng chi tiết cụ thể, giải thích cảm xúc và bài học.' },
      { id: 'opinion-general', label: 'Nêu ý kiến', structure: 'Nêu ý kiến – Lí do và dẫn chứng – Khẳng định', guide: 'Nêu rõ ý kiến về sự việc hoặc vấn đề. Trình bày một vài lí do và dẫn chứng gần gũi để giải thích vì sao em nghĩ như vậy. Kết thúc bằng cách khẳng định ý kiến. Phân biệt điều em biết với điều em suy đoán.', essayGuide: 'Viết đoạn văn nêu ý kiến rõ ràng, giải thích bằng lí do và ví dụ phù hợp, rồi khẳng định lại suy nghĩ.' },
      { id: 'feelings-person', label: 'Nêu tình cảm về người thân hoặc bạn bè', structure: 'Mở đầu – Kỉ niệm và tình cảm – Mong muốn', guide: 'Giới thiệu người gần gũi. Nêu một vài kỉ niệm hoặc việc làm khiến em xúc động, gọi tên tình cảm và cách em thể hiện; kết thúc bằng mong muốn/lời chúc. Không tự gán thông tin riêng chưa được kể.', essayGuide: 'Viết đoạn văn chân thành về người gần gũi, dùng kỉ niệm cụ thể để làm rõ tình cảm và kết lại bằng mong muốn.' },
      { id: 'feelings-character', label: 'Nêu cảm xúc về nhân vật trong truyện/thơ', structure: 'Mở đầu – Chi tiết gây ấn tượng – Cảm xúc/bài học', guide: 'Giới thiệu nhân vật và tác phẩm nếu có. Nêu hành động, lời nói hoặc phẩm chất gây ấn tượng kèm dẫn chứng; bày tỏ cảm xúc và bài học/mong muốn. Không gán cho nhân vật chi tiết không có trong lời kể.', essayGuide: 'Nêu cảm xúc về nhân vật qua dẫn chứng từ truyện/thơ và kết bằng bài học hoặc điều em yêu quý ở nhân vật.' },
    ],
  },
  {
    id: 'correspondence',
    label: 'Thư và đơn',
    types: [
      { id: 'letter-friend', label: 'Viết thư', structure: 'Địa điểm/ngày tháng – Lời chào – Thăm hỏi/chia sẻ – Lời chúc/kí tên', guide: 'Đầu thư có địa điểm, ngày tháng và lời chào/xưng hô phù hợp với người nhận. Phần chính thăm hỏi, chia sẻ tin tức đúng điều học sinh kể, bày tỏ tình cảm hoặc hẹn gặp. Cuối thư có lời chúc, mong hồi âm, cách kí và tên. Không tự đặt địa chỉ hay dữ kiện cá nhân.', essayGuide: 'Trình bày đúng hình thức thư: ngày tháng, lời chào, hỏi thăm, chia sẻ, lời chúc/hẹn và chữ kí. Xưng hô nhất quán.' },
      { id: 'letter-relative', label: 'Viết thư cho người thân ở xa', structure: 'Địa điểm/ngày tháng – Lời thăm hỏi – Tin tức gia đình – Lời chúc/kí tên', guide: 'Đầu thư có nơi/ngày tháng và lời thưa gửi. Phần chính hỏi thăm sức khỏe/cuộc sống, kể tin tức gia đình hoặc bản thân và bày tỏ tình cảm. Cuối thư chúc sức khỏe, hẹn gặp, kí tên với cách xưng hô phù hợp. Không bịa tình trạng sức khỏe hoặc dữ kiện cá nhân.', essayGuide: 'Viết thư thân mật đúng bố cục, xưng hô kính trọng phù hợp người thân và chỉ kể tin tức có trong lời kể.' },
      { id: 'application', label: 'Viết đơn', structure: 'Quốc hiệu/tiêu ngữ – Tên đơn – Nơi nhận – Nội dung – Ngày tháng/chữ kí', guide: 'Sắp xếp đủ mục: quốc hiệu/tiêu ngữ; tên đơn; nơi nhận; nội dung gồm giới thiệu bản thân, lí do/đề nghị, lời hứa và cảm ơn; địa điểm/ngày tháng; chữ kí và họ tên. Chỉ điền thông tin học sinh đã nói, phần chưa biết để dấu nhắc cần bổ sung, không bịa tên, lớp, trường hay ngày.', essayGuide: 'Viết theo hình thức đơn trang trọng, đủ các mục và lời xưng hô phù hợp. Đánh dấu chỗ thiếu bằng [cần điền], tuyệt đối không tự tạo thông tin cá nhân.' },
    ],
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    types: [
      { id: 'group-report', label: 'Báo cáo kết quả thảo luận nhóm', structure: 'Thông tin báo cáo – Nội dung/kết quả – Người viết', guide: 'Trình bày tiêu đề báo cáo, chủ đề, nơi nhận, thời gian/nhóm nếu đã có; tóm lược kết quả thảo luận và ý kiến thống nhất theo các mục rõ; ghi người viết/nhóm trưởng ở cuối. Không tạo tên học sinh, ngày, lớp hoặc quyết định chưa được cung cấp; nêu rõ mục cần cô bổ sung.', essayGuide: 'Viết báo cáo theo bố cục rõ ràng: tiêu đề, kính gửi, thời gian/chủ đề, nội dung thống nhất, người viết. Không bịa danh sách tên hoặc dữ kiện còn thiếu.' },
    ],
  },
  {
    id: 'instructions',
    label: 'Hướng dẫn',
    types: [
      { id: 'how-to-make', label: 'Hướng dẫn làm đồ chơi/công việc', structure: 'Tên hướng dẫn – Chuẩn bị – Các bước – Kết thúc', guide: 'Nêu tên công việc/đồ chơi. Phần chuẩn bị liệt kê vật liệu và dụng cụ. Phần thực hiện chia các bước theo thứ tự; mỗi bước mở đầu bằng động từ rõ, câu ngắn, nêu cách làm cụ thể. Thêm lưu ý an toàn nếu thật cần thiết và có căn cứ. Không tự chế vật liệu hoặc thao tác nguy hiểm.', essayGuide: 'Trình bày như bài hướng dẫn: tên, phần chuẩn bị, các bước đánh số theo trình tự, lời kết ngắn. Dùng câu ngắn và động từ rõ.' },
      { id: 'product-use', label: 'Hướng dẫn sử dụng sản phẩm', structure: 'Tên sản phẩm – Trước khi dùng – Khi dùng – Sau khi dùng', guide: 'Nêu tên sản phẩm. Chia hướng dẫn thành trước khi sử dụng, trong khi sử dụng theo thứ tự, sau khi sử dụng/bảo quản. Mỗi mục nêu việc cần làm bằng câu ngắn, dễ hiểu. Với đồ điện, chỉ đưa lưu ý an toàn phổ thông; không bịa hướng dẫn riêng cho model cụ thể.', essayGuide: 'Viết hướng dẫn theo các mục trước/trong/sau khi sử dụng. Các bước rõ thứ tự, ngắn gọn; ưu tiên an toàn, không đưa thông số kỹ thuật thiếu căn cứ.' },
    ],
  },
]

export const grade5WritingGroups = [
  { id: 'creative-story', label: 'Kể chuyện và báo cáo', types: [
    { id: 'creative-story', label: 'Kể chuyện sáng tạo', structure: 'Mở bài – Diễn biến câu chuyện – Kết bài', guide: 'Kể lại hoặc phát triển câu chuyện dựa trên đề bài, có thể thay đổi ngôi kể, thêm chi tiết tưởng tượng hợp lí hoặc viết tiếp. Giữ nhân vật và sự việc nhất quán; phân biệt chi tiết đã có với chi tiết sáng tạo.', essayGuide: 'Viết câu chuyện có mở đầu, diễn biến theo trình tự và kết thúc rõ; chi tiết sáng tạo cần phù hợp với nhân vật và tình huống.' },
    { id: 'work-report', label: 'Báo cáo công việc', structure: 'Tên báo cáo – Nội dung công việc – Kết quả/đề xuất – Người báo cáo', guide: 'Nêu tên báo cáo và công việc được giao; trình bày thời gian, việc đã làm, kết quả và khó khăn/đề xuất nếu có; ghi người hoặc nhóm báo cáo khi đã được cung cấp. Không tự tạo tên, ngày tháng hay kết quả.', essayGuide: 'Trình bày báo cáo ngắn gọn, rõ việc đã làm và kết quả. Dùng đúng thông tin đã cho; để trống hoặc nhắc bổ sung dữ kiện còn thiếu.' },
  ] },
  { id: 'description', label: 'Miêu tả', types: [
    { id: 'describe-landscape', label: 'Tả phong cảnh', structure: 'Mở bài – Miêu tả phong cảnh – Kết bài', guide: 'Giới thiệu cảnh và ấn tượng chung. Thân bài tả theo không gian, thời gian hoặc kết hợp; chọn chi tiết về địa hình, cây cối, thời tiết, ánh sáng, màu sắc, âm thanh, mùi hương và hoạt động con người khi có. Kết bài nêu cảm nghĩ. Không bịa trải nghiệm trực tiếp.', essayGuide: 'Viết đủ mở bài, thân bài, kết bài; miêu tả theo trình tự rõ, dùng hình ảnh gợi tả và đan xen cảm xúc.' },
    { id: 'describe-person', label: 'Tả người', structure: 'Mở bài – Ngoại hình và hoạt động – Tính tình/sở thích – Kết bài', guide: 'Giới thiệu người được tả và ấn tượng chung. Chọn vài nét ngoại hình tiêu biểu; tả hoạt động, cử chỉ, lời nói và tính tình/sở thích bằng dẫn chứng cụ thể. Kết bài nêu cảm nghĩ. Không tự thêm thông tin đời tư hoặc kỉ niệm chưa được kể.', essayGuide: 'Tả người qua ngoại hình, hoạt động và tính tình; chọn chi tiết cụ thể, phù hợp, thể hiện tình cảm chân thật.' },
  ] },
  { id: 'book-and-film', label: 'Nhân vật và cảm nhận', types: [
    { id: 'book-character', label: 'Giới thiệu nhân vật trong một cuốn sách', structure: 'Mở đầu – Đặc điểm và dẫn chứng – Cảm nghĩ', guide: 'Mở đầu nêu tên sách, tác giả, nhân vật và ấn tượng chung nếu biết. Triển khai đặc điểm ngoại hình, hành động, lời nói hoặc tính cách với dẫn chứng từ sách. Kết thúc nêu cảm nghĩ/bài học. Không bịa chi tiết hoặc tên tác giả.', essayGuide: 'Viết đoạn văn giới thiệu sách, tác giả, nhân vật; chọn đặc điểm nổi bật và dẫn chứng cụ thể, kết lại bằng cảm nghĩ.' },
    { id: 'story-feelings', label: 'Thể hiện cảm xúc về một câu chuyện', structure: 'Mở đầu – Tóm tắt và cảm xúc – Kết thúc', guide: 'Nêu tên truyện, tác giả nếu biết và ấn tượng chung. Tóm tắt ngắn gọn; chọn nhân vật, chi tiết, cách kể hoặc ý nghĩa khiến em yêu thích/xúc động và bày tỏ cảm xúc. Kết thúc khẳng định giá trị câu chuyện. Không tự bịa tình tiết.', essayGuide: 'Viết đoạn văn có cảm xúc rõ, tóm tắt vừa đủ, nêu chi tiết gây ấn tượng và ý nghĩa của truyện.' },
    { id: 'poem-feelings', label: 'Thể hiện cảm xúc về một bài thơ', structure: 'Mở đầu – Cái hay, ý nghĩa và cảm xúc – Kết thúc', guide: 'Nêu tên bài thơ, tác giả nếu biết và ấn tượng. Chọn từ ngữ, hình ảnh, nhịp điệu, nội dung hoặc thông điệp yêu thích; giải thích cảm xúc bằng dẫn chứng ngắn, chính xác. Kết thúc khẳng định tình cảm. Không bịa câu thơ.', essayGuide: 'Viết đoạn văn nêu cảm nhận về từ ngữ/hình ảnh/nội dung bài thơ, có dẫn chứng ngắn và cảm xúc chân thật.' },
    { id: 'animated-character', label: 'Giới thiệu nhân vật trong phim hoạt hình', structure: 'Mở đầu – Đặc điểm và chi tiết phim – Cảm nghĩ', guide: 'Nêu tên phim và nhân vật. Khái quát nội dung phim nếu cần; miêu tả ngoại hình, hoạt động, tính cách qua chi tiết hình ảnh/âm thanh cụ thể. Kết thúc nêu cảm nghĩ và ý nghĩa. Không tự bịa tình tiết.', essayGuide: 'Viết đoạn văn giới thiệu phim và nhân vật, dùng chi tiết hình ảnh/âm thanh để làm rõ đặc điểm rồi nêu cảm nghĩ.' },
    { id: 'event-feelings', label: 'Thể hiện cảm xúc về một sự việc', structure: 'Mở đầu – Chi tiết và cảm xúc – Ý nghĩa/kết thúc', guide: 'Giới thiệu sự việc và ấn tượng chung. Nêu những chi tiết nổi bật cùng tình cảm, cảm xúc; có thể dùng so sánh hoặc hình ảnh gợi cảm. Kết thúc nêu ý nghĩa và khẳng định cảm xúc. Chỉ kể điều người viết cung cấp.', essayGuide: 'Viết đoạn văn về sự việc, tập trung vào chi tiết nổi bật và cảm xúc cá nhân, kết lại bằng ý nghĩa.' },
  ] },
  { id: 'activity-and-opinions', label: 'Hoạt động và nêu ý kiến', types: [
    { id: 'activity-program', label: 'Lập chương trình hoạt động', structure: 'Tên hoạt động – Mục đích – Thời gian/địa điểm/thành phần – Chuẩn bị – Tiến trình – Phân công', guide: 'Trình bày chương trình theo các mục rõ ràng: tên, mục đích, thời gian, địa điểm, người tham gia, chuẩn bị, các việc theo thứ tự và phân công nếu có. Không bịa ngày, người phụ trách hoặc điều kiện tổ chức.', essayGuide: 'Trình bày bằng tiêu đề và các mục/đầu dòng mạch lạc; các hoạt động theo trình tự, chỉ dùng thông tin đã có.' },
    { id: 'agree-opinion', label: 'Nêu ý kiến tán thành', structure: 'Nêu ý kiến – Lí do và dẫn chứng – Khẳng định/ý nghĩa', guide: 'Giới thiệu sự việc/hiện tượng và nêu rõ ý tán thành. Nêu các lí do, kèm dẫn chứng cụ thể để giải thích tác động tích cực. Kết thúc khẳng định ý kiến hoặc ý nghĩa. Không đưa số liệu không có căn cứ.', essayGuide: 'Viết đoạn văn thể hiện rõ sự tán thành, có lí do và dẫn chứng phù hợp, kết lại bằng ý nghĩa.' },
    { id: 'disagree-opinion', label: 'Nêu ý kiến phản đối', structure: 'Nêu ý kiến – Lí do và dẫn chứng – Khẳng định/ý nghĩa', guide: 'Giới thiệu sự việc/hiện tượng và nêu rõ ý phản đối. Trình bày lí do, tác hại hoặc ảnh hưởng cùng dẫn chứng cụ thể. Kết thúc khẳng định ý kiến hoặc nêu điều nên làm. Diễn đạt tôn trọng, không công kích cá nhân; không tự tạo số liệu.', essayGuide: 'Viết đoạn văn nêu ý phản đối bằng lí do và dẫn chứng rõ ràng, tập trung phê bình hành vi/hiện tượng và đề xuất cách ứng xử.' },
  ] },
]

export const writingGroupsByGrade = {
  4: writingGroups,
  5: grade5WritingGroups,
}

export const writingTypes = [
  ...writingGroups.flatMap(group => group.types.map(type => ({ ...type, grade: 4, groupId: group.id, groupLabel: group.label }))),
  ...grade5WritingGroups.flatMap(group => group.types.map(type => ({ ...type, grade: 5, groupId: group.id, groupLabel: group.label }))),
]
export const writingTypesById = Object.fromEntries(writingTypes.map(type => [type.id, type]))
const curriculumTypeIdsByGrade = {
  4: ['opinion-general', 'group-report', 'recount-event', 'retell-story', 'imaginative-story', 'how-to-make', 'application', 'describe-animal', 'letter-friend', 'feelings-person', 'feelings-character', 'product-use', 'opinion-story', 'describe-plant'],
  5: grade5WritingGroups.flatMap(group => group.types.map(type => type.id)),
}
export const writingTypesByGrade = Object.fromEntries(Object.entries(writingGroupsByGrade).map(([grade, groups]) => {
  const allTypes = groups.flatMap(group => group.types.map(type => ({ ...type, grade: Number(grade), groupId: group.id, groupLabel: group.label })))
  const available = new Map(allTypes.map(type => [type.id, type]))
  if (Number(grade) === 4) {
    const grade4Types = writingGroups.flatMap(group => group.types.map(type => ({ ...type, grade: 4, groupId: group.id, groupLabel: group.label })))
    grade4Types.forEach(type => available.set(type.id, type))
  }
  return [grade, curriculumTypeIdsByGrade[grade].map(id => available.get(id)).filter(Boolean)]
}))
export const getWritingType = (id, grade) => {
  const type = writingTypesById[id] || null
  return type && (grade === undefined || type.grade === Number(grade)) ? type : null
}
