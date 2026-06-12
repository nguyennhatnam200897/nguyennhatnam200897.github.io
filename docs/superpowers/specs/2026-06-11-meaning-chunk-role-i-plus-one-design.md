# Hướng đi mới: i+1 theo cụm nghĩa và vai trò cụm

Ngày tạo: 2026-06-11

## Trạng thái

Đây là hướng thiết kế mới của dự án để tiếp tục thảo luận trước khi triển khai.
Tài liệu này ghi lại quyết định sản phẩm đã thống nhất trong phiên thảo luận:
người học không học bằng nhiều dạng bài tập khác nhau, mà học bằng một hành vi
cốt lõi duy nhất: nhìn ý tiếng Việt và tự viết hoặc tự nói đáp án tiếng Anh.

Hướng này thay thế cách nghĩ "tăng độ khó task" bằng cách nghĩ "làm chủ từng
cụm nghĩa, hiểu vai trò của cụm, rồi ghép các cụm đã làm chủ thành ý dài hơn".

## Mục tiêu

Mục tiêu của app không chỉ là giúp người học chép lại đúng câu tiếng Anh trong
bài báo. App phải giúp người học nhìn câu tiếng Anh như một dòng ý nghĩa được
xây từ các đơn vị nhỏ có vai trò rõ ràng.

Người học cần cảm thấy rằng mỗi ngày mình đang:

- sở hữu thêm một vài cụm có nghĩa;
- hiểu cụm đó dùng để trả lời câu hỏi nào trong câu;
- biết ghép cụm đó với các cụm khác để diễn đạt một ý lớn hơn;
- tiến gần hơn tới việc tự viết hoặc tự nói lại đúng câu gốc.

## Nguyên tắc không đổi

- Chỉ có một dạng bài cốt lõi: tiếng Việt -> người học tự viết hoặc tự nói tiếng Anh độc lập.
- Không thêm dạng điền khuyết, chọn đáp án, kéo thả, ghép thẻ, hoặc gợi ý trực tiếp trong ô trả lời.
- Speech-to-text nếu có chỉ là cách nhập nháp; người học vẫn được sửa trước khi nộp và app không chấm phát âm.
- Kết quả cuối vẫn phải bám sát văn bản tiếng Anh gốc của khóa học, không chấm theo ý tự do.
- IPA, audio và giải thích chỉ là lớp hỗ trợ, không biến thành bài chấm điểm riêng.

## Đơn vị học trung tâm: cụm nghĩa

Cụm nghĩa không phải chỉ là một đoạn chữ cắt ra cho ngắn. Cụm nghĩa là một đơn
vị chuẩn của ý. Mỗi cụm phải có nghĩa rõ và đại diện cho một vai trò nào đó
trong câu.

Mỗi cụm nghĩa cần có ít nhất các thuộc tính sau:

- `english`: cụm tiếng Anh cần sở hữu.
- `vietnamese`: ý tiếng Việt tương ứng.
- `whenNeeded`: giải thích thực tế về lúc nào người học cần dùng cụm này.
- `roleQuestion`: câu hỏi tóm gọn mục đích của cụm, ví dụ `Ai?`, `Đang làm gì?`, `Kết quả gì?`.
- `roleMeaning`: giải thích ngắn về vai trò của cụm trong dòng ý.
- `chunkType`: loại cụm nội bộ, ví dụ `entity`, `action-frame`, `action-object`, `result`, `linker`, `description`.
- `prerequisites`: các bước nhỏ cần học trước để đi tới cụm này.
- `compositionTargets`: các cụm hoặc ý dài hơn mà cụm này sẽ tham gia ghép vào.

## Vai trò cụm

App cần phân loại và gắn vai trò cho cụm bằng ngôn ngữ gần với người mới học,
không cần gọi tên ngữ pháp khó. Vai trò là cầu nối giữa từ vựng và ngữ pháp.

Bộ vai trò nên bắt đầu bằng các nhãn gần với ý nghĩa:

- `Ai? / Cái gì?`: chủ thể, đối tượng, hoặc cái đang được nói tới.
- `Đang làm gì?`: hành động đang diễn ra, ý định, hoặc khung hành động.
- `Làm gì?`: hành động chính.
- `Làm với cái gì?`: đối tượng bị tác động hoặc phần hành động hướng tới.
- `Kết quả gì? / Trở nên thế nào?`: kết quả, mục tiêu, hoặc trạng thái đạt tới.
- `Là gì? / Có đặc điểm gì?`: nhận định, định danh, hoặc đặc điểm.
- `Khi nào? / Ở đâu? / Bằng cách nào? / Vì sao?`: hoàn cảnh bổ sung cho ý chính.
- `Quan hệ giữa hai ý?`: từ nối, đối lập, bổ sung, nguyên nhân, kết quả.

Trong UI, app có thể hiện ngắn gọn vai trò của cụm trên màn hướng dẫn. Tuy nhiên
màn bài tập vẫn giữ nguyên: người học nhìn tiếng Việt và tự viết/nói tiếng Anh.

## Cách giải thích vai trò cho người học

Vai trò cụm không phải là nhãn ngữ pháp để học thuộc. Vai trò cụm là câu hỏi
giúp người học tự tạo câu khi muốn diễn đạt một ý trong đời thật.

Mỗi cụm chỉ cần hai phần giải thích chính:

1. `Khi nào cần?`
   Phần này nói rõ tình huống diễn đạt mà người học cần cụm đó. Đây là lý do
   tồn tại của cụm.
2. `Mục đích là gì?`
   Phần này tóm gọn vai trò của cụm thành một câu hỏi đơn giản, có thể dùng để
   xây câu như `Ai?`, `Đang cố làm gì?`, `Tác động vào cái gì?`, `Kết quả gì?`.

App không nên đặt thuật ngữ như `chủ ngữ`, `vị ngữ`, `bổ ngữ` làm lời giải thích
chính cho người mới học. Nếu cần lưu thông tin ngữ pháp trong dữ liệu nội bộ,
thông tin đó chỉ nên hỗ trợ hệ thống; phần người học nhìn thấy phải ưu tiên nhu
cầu diễn đạt và câu hỏi vai trò.

Ví dụ:

`many cities`

- Khi nào cần? Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.
- Mục đích là gì? `Ai? / Cái gì?`

`are trying to`

- Khi nào cần? Khi muốn nói ai đó đang cố gắng làm một việc, nhưng việc đó chưa chắc đã xong.
- Mục đích là gì? `Đang cố làm gì?`

`make daily life`

- Khi nào cần? Khi muốn nói hành động đang tác động vào đời sống hằng ngày.
- Mục đích là gì? `Tác động vào cái gì?`

`more sustainable`

- Khi nào cần? Khi muốn nói kết quả mong muốn là một điều gì đó trở nên bền vững hơn.
- Mục đích là gì? `Kết quả gì?`

Khi ghép câu, app có thể cho người học nhìn dòng vai trò:

- `Ai?` -> `many cities`
- `Đang cố làm gì?` -> `are trying to`
- `Tác động vào cái gì?` -> `make daily life`
- `Kết quả gì?` -> `more sustainable`

Mục tiêu là để người học rút ra một bộ câu hỏi có thể dùng lại trong tình huống
mới, không chỉ nhớ riêng câu trong bài. Khi muốn tự diễn đạt, người học có thể
tự hỏi: mình đang nói về ai, người đó đang làm gì, hành động tác động vào cái
gì, và mình muốn kết quả gì.

## Hai tầng i+1

Hướng mới dùng hai tầng i+1 lồng vào nhau.

### Tầng 1: i+1 bên trong từng cụm

Mỗi cụm có một quá trình riêng để người học đi từ thành phần nhỏ lên cụm nghĩa
hoàn chỉnh. Mỗi bước vẫn là một lần viết/nói độc lập.

Ví dụ `many cities`:

- `thành phố` -> `city`
- `các thành phố` -> `cities`
- `nhiều thành phố` -> `many cities`

Vai trò của cụm hoàn chỉnh:

- `many cities`
- Nghĩa: nhiều thành phố
- Vai trò: `Ai? / Chủ thể của hành động`

Ví dụ `are trying to`:

- `cố gắng` -> `try`
- `đang cố gắng` -> `are trying`
- `đang cố gắng làm` -> `are trying to`

Vai trò của cụm hoàn chỉnh:

- `are trying to`
- Nghĩa: đang cố gắng làm
- Vai trò: `Đang làm gì? / Khung ý định hành động`

Ví dụ `more sustainable`:

- `bền vững` -> `sustainable`
- `bền vững hơn` -> `more sustainable`

Vai trò của cụm hoàn chỉnh:

- `more sustainable`
- Nghĩa: bền vững hơn
- Vai trò: `Kết quả gì? / Trở nên thế nào?`

### Tầng 2: i+1 giữa các cụm

Sau khi từng cụm đã được làm chủ, app bắt đầu ghép các cụm theo vai trò để tạo
thành ý dài hơn. Mỗi bước ghép vẫn là một prompt tiếng Việt và một đáp án tiếng
Anh độc lập.

Ví dụ:

- `nhiều thành phố` -> `many cities`
- `đang cố gắng làm` -> `are trying to`
- `nhiều thành phố đang cố gắng làm` -> `many cities are trying to`

Tiếp theo:

- `làm cho đời sống hằng ngày` -> `make daily life`
- `bền vững hơn` -> `more sustainable`
- `làm cho đời sống hằng ngày bền vững hơn` -> `make daily life more sustainable`

Sau đó ghép thành ý lớn:

- `nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn`
- `many cities are trying to make daily life more sustainable`

## Ví dụ câu đầu bài 1

Câu đích:

`Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.`

### Cụm của vế 1

`many cities`

- Nghĩa: nhiều thành phố
- Vai trò: `Ai? / Chủ thể`
- Quá trình cụm: `city` -> `cities` -> `many cities`

`are trying to`

- Nghĩa: đang cố gắng làm
- Vai trò: `Đang làm gì? / Khung ý định hành động`
- Quá trình cụm: `try` -> `are trying` -> `are trying to`

`make daily life`

- Nghĩa: làm cho đời sống hằng ngày
- Vai trò: `Làm gì với cái gì? / Hành động + đối tượng bị tác động`
- Quá trình cụm: `life` -> `daily life` -> `make daily life`

`more sustainable`

- Nghĩa: bền vững hơn
- Vai trò: `Kết quả gì? / Trạng thái muốn đạt tới`
- Quá trình cụm: `sustainable` -> `more sustainable`

Ghép vế 1:

- `many cities` + `are trying to`
- `many cities are trying to`
- `make daily life` + `more sustainable`
- `make daily life more sustainable`
- `many cities are trying to make daily life more sustainable`

### Cụm của vế 2

`the most effective changes`

- Nghĩa: những thay đổi hiệu quả nhất
- Vai trò: `Cái gì? / Chủ thể của nhận định`
- Quá trình cụm: `change` -> `changes` -> `effective changes` -> `the most effective changes`

`are often`

- Nghĩa: thường là
- Vai trò: `Nhận định thường xảy ra`
- Quá trình cụm: `are` -> `are often`, nếu cần; hoặc giới thiệu trực tiếp trong ý có nghĩa khi học câu.

`the least dramatic`

- Nghĩa: ít gây ấn tượng mạnh nhất
- Vai trò: `Có đặc điểm gì? / Đặc điểm của chủ thể`
- Quá trình cụm: `dramatic` -> `less dramatic` hoặc `least dramatic` -> `the least dramatic`, tùy mức độ cần thiết.

Ghép vế 2:

- `the most effective changes`
- `the most effective changes are often`
- `the most effective changes are often the least dramatic`

### Quan hệ giữa hai vế

`but`

- Nghĩa: nhưng
- Vai trò: `Quan hệ trái chiều / Đổi hướng ý`

Ghép câu hoàn chỉnh:

- Vế 1: `many cities are trying to make daily life more sustainable`
- Quan hệ: `but`
- Vế 2: `the most effective changes are often the least dramatic`
- Câu cuối: `Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.`

## Quy tắc thành thạo

Quy tắc trong phần này đã được thay thế bởi đặc tả
`2026-06-12-sequential-meaning-chunk-mastery-design.md`.

Quy tắc hiện hành:

- hoàn thành trọn chuỗi i+1 của một cụm trước khi sang cụm khác;
- cụm hoàn chỉnh phải đúng 2 lần liên tiếp;
- không xen kẽ các cụm trong giai đoạn luyện riêng;
- phần `Khi nào cần?`, `Mục đích là gì?`, `Vai trò trong câu` chỉ hiện ở cụm
  hoàn chỉnh, không hiện ở từ đơn hoặc mảnh chưa tạo thành cụm;
- cụm đã vững chỉ quay lại khi lỗi trong ý dài chứng minh chính cụm đó đang hỏng.

Khi người học đã sở hữu một cụm, app không hỏi lại cụm đó riêng lẻ nếu không cần.
Cụm đó được đưa vào câu dài hơn và được củng cố âm thầm khi người học viết/nói
đúng ý dài hơn.

Nếu người học sai trong một ý dài, app cần xác định cụm nào đang hỏng. App chỉ
đưa cụm đó quay lại vòng luyện nội bộ bằng cùng một dạng viết/nói độc lập, sau
đó trả người học về ý dài đang học.

Ví dụ:

- Prompt: `nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn`
- Người học viết: `many city are trying to make daily life more sustainable`
- Cụm hỏng: `many cities`
- Repair prompt: `nhiều thành phố` -> `many cities`
- Sau khi đúng, quay lại prompt dài.

## Cảm giác học mong muốn

Người học không nên cảm thấy app đang tăng độ khó đột ngột. Họ nên cảm thấy mình
đang làm chủ từng cụm, hiểu vai trò của nó, và dùng cụm đó để xây ý lớn hơn.

Tiến trình nên tạo cảm giác:

- hôm nay mình sở hữu thêm một cụm;
- mình biết cụm này trả lời câu hỏi nào trong câu;
- mình ghép được cụm mới vào cụm cũ;
- câu của mình dài hơn, rõ ý hơn, và gần câu gốc hơn.

## Các điểm cần tiếp tục bàn

Những điểm sau là nội dung cần tiếp tục thảo luận trước khi triển khai:

- Bộ vai trò cụm nên gọn tới mức nào để người mới học không bị ngợp.
- UI nên hiện vai trò cụm ở màn hướng dẫn trước bài tập, sau khi trả lời, hay cả hai.
- Một số cụm chưa đóng nghĩa hoàn toàn, như `are trying to`, nên được gọi là `cụm chức năng` hay vẫn gọi chung là `cụm nghĩa`.
- Cách chọn ranh giới cụm sao cho mỗi cụm vừa có nghĩa, vừa đủ nhỏ để học êm ái.
- Các quy tắc repair khi một lỗi trong câu dài có thể thuộc nhiều cụm cùng lúc.
- Cách áp dụng hướng này trước tiên cho course thử nghiệm Gentle i+1 mà không làm thay đổi các bài hiện tại.
