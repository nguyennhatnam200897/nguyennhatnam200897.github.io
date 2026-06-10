# Thiết kế bài học nghe mẫu theo phương pháp i+1

Ngày cập nhật: 2026-06-10

## Mục tiêu

Biến `Exercise 1` ở phần đầu file
`Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3` thành một khóa học hoàn chỉnh theo
đúng phương pháp đã chốt cho `A Small Public Garden`.

Bài nghe có transcript là một nguồn văn bản mới, không phải một dạng bài
`nghe rồi chép cả câu` tách biệt. Người học vẫn chinh phục một văn bản cụ thể
theo dòng:

```text
đối tượng -> biến thể -> cụm -> quan hệ/mệnh đề -> câu gốc
-> hội thoại cộng dồn
```

## Phạm vi bài mẫu

Bài mẫu dùng toàn bộ `Exercise 1`, gồm tám lượt nói:

1. Stephen giới thiệu bản thân và nơi làm việc.
2. Stephen nói mục đích đến lắp chiếc TV đã được đặt tuần trước.
3. Người trong văn phòng mời Stephen đi theo.
4. Người trong văn phòng nói vị trí muốn gắn TV.
5. Người trong văn phòng nói mục đích sử dụng TV.
6. Stephen nhận ra mình quên dụng cụ.
7. Stephen xin lỗi và hẹn quay lại sáng hôm sau.
8. Người trong văn phòng đồng ý nhưng yêu cầu Stephen gọi trước khi đến.

Bản chép tự động bằng Whisper chỉ là bản nháp. Trước khi khóa học liệu, từng
câu, tên riêng, tên tổ chức và mốc thời gian phải được kiểm âm với MP3 gốc.
Không dùng một từ do ASR đoán nếu người biên soạn chưa xác nhận nghe được.

## Nguyên tắc biên soạn

### 1. Giữ nguyên lõi phương pháp của bài 1

- Học lần lượt từng lượt nói; hoàn tất lượt hiện tại mới sang lượt tiếp theo.
- Mỗi task có màn hướng dẫn trước khi người học tự nhập.
- Bài tập chính vẫn là nhìn nghĩa tiếng Việt sư phạm và nhập tiếng Anh tự do.
- Sai ở task nào thì quay lại hướng dẫn và làm lại đúng task đó.
- Các task được luyện xen kẽ theo nhóm nhỏ từ 2 đến 4 đơn vị.
- Các nhóm dùng cửa sổ chồng lấp giống Bài 1: `[A, B]`, `[A, B, C]`,
  `[A, B, C, D]`, rồi `[B, C, D, E]`.
- Một lần trả lời đúng là đủ để mở đơn vị i+1 tiếp theo. Sau khi các đơn vị
  trong nhóm đã được giới thiệu, app tiếp tục xen kẽ đến khi đạt tiêu chí
  thành thạo chung: mỗi task đúng ít nhất hai lần, có chuỗi đúng tối thiểu một
  lần và có ít nhất một lần đúng sau khi bị xen bởi task khác.
- Không ấn định số task để chạy theo bài 1. Số task do cấu trúc nghĩa quyết
  định, nhưng mỗi câu phải có đường đi i+1 rõ ràng.

### 2. Chọn đối tượng làm neo

Tầng đầu chỉ dùng danh từ/đối tượng viết thành một từ và có nghĩa độc lập,
chẳng hạn:

- `television`;
- `week`;
- `wall`;
- `presentation`;
- `seminar`;
- `tool`;
- `morning`;
- `office`.

Nếu danh từ trong câu ở dạng số nhiều, phải học dạng gốc trước:

```text
presentation -> presentations
seminar -> seminars
tool -> tools
```

Không tạo task từ đơn cho động từ, tính từ, trạng từ, giới từ hoặc từ nối như
`install`, `mount`, `forgot`, `however`, `before`.

### 3. Không tách từ máy móc

- Chỉ tách thành phần khi nó có nghĩa độc lập, giữ nghĩa liên quan và hữu ích
  làm nền cho bước sau.
- Tên riêng và tên tổ chức không bị xé thành các token vô nghĩa.
- Công thức hội thoại như `come right this way` có thể là một đơn vị hoàn
  chỉnh nếu tách nhỏ hơn làm mất chức năng giao tiếp.
- Không tạo mảnh cụt như `I'm here to install` nếu phần đó chưa truyền đạt một
  quan hệ đủ rõ trong đường học đang xây.

### 4. Bridge word xuất hiện đúng lúc

Động từ, tính từ và từ nối chỉ được giới thiệu ngay trước khi dùng trong một
cụm hoặc mệnh đề có nghĩa:

- `install` trong quan hệ lắp một chiếc TV;
- `mount ... on ...` trong quan hệ gắn TV lên tường;
- `use ... for ...` trong quan hệ dùng TV cho thuyết trình và đào tạo;
- `forget` trong mệnh đề quên dụng cụ;
- `screw ... to ...` trong quan hệ bắt vít TV vào giá treo;
- `however` khi nối sự chấp nhận với yêu cầu gọi trước;
- `before` và `to make sure` khi xây quan hệ thời gian và mục đích.

Bridge word không trở thành flashcard rời kéo dài. Nó phải đi ngay vào đơn vị
lớn hơn dùng các đối tượng đã biết.

### 5. Mỗi bước chỉ thêm một lớp

Ví dụ với cụm TV:

```text
television
UHD television
the UHD television
```

Ví dụ với thời gian:

```text
week
last week
```

Ví dụ với mục đích sử dụng:

```text
presentation
presentations
seminar
seminars
training seminars
presentations and training seminars
use it for presentations and training seminars
we plan to use it for presentations and training seminars
```

Không gộp nhiều thay đổi vào một task nếu có thể tạo các bước tự nhiên hơn.

### 6. Xây quan hệ và mệnh đề có nghĩa

Không tạo mảnh chỉ có chủ thể và động từ nhưng thiếu đối tượng cần thiết.
Quan hệ mới phải xuất hiện trong một khung đủ nghĩa.

Ví dụ câu về lắp TV:

```text
television
the UHD television
week
last week
you ordered the UHD television last week
the UHD television that you ordered last week
I'm here to install the UHD television
I'm here to install the UHD television that you ordered last week
```

Ví dụ câu về dụng cụ:

```text
tool
tools
the tools
wall
wall mount
the wall mount
screw the television to the wall mount
I need to screw the television to the wall mount
the tools that I need to screw the television to the wall mount
I forgot the tools that I need to screw the television to the wall mount
it looks like I forgot the tools that I need to screw the television to the wall mount
câu gốc hoàn chỉnh
```

`that` chỉ được thêm sau khi mệnh đề lõi phía sau đã có nghĩa. `before` và
`to make sure` cũng chỉ được thêm sau khi các khối nghĩa liên quan đã được học.

### 7. Tái sử dụng kiến thức giữa các câu

Đối tượng đã thành thạo ở câu trước được dùng trực tiếp trong câu sau:

- `television` học ở câu 2 và được dùng lại ở câu 4, 5 và 6;
- `wall` học ở câu 4 và được dùng lại trong `wall mount` ở câu 6;
- `tomorrow` hoặc khối thời gian đã biết ở câu 7 được dùng trong câu 8.

Không tạo lại task từ đầu chỉ vì từ đó xuất hiện ở một lượt nói mới. Nếu người
học sai khi dùng lại, app sửa đúng task hiện tại.

### 8. Hoàn tất hội thoại bằng ghép cộng dồn

Sau khi tám lượt nói đã được thành thạo, app tạo task hội thoại cộng dồn:

```text
S1 + S2
S1 + S2 + S3
...
S1 + S2 + ... + S8
```

Mỗi lượt chỉ thêm một câu đã thành thạo, giống cơ chế ghép đoạn của bài 1.
Bản tiếng Việt dùng làm prompt phải tự nhiên, sát hội thoại và phân biệt rõ
người nói khi cần.

## Hướng dẫn theo ngữ cảnh

Mỗi task phải giải thích phần mới vừa được thêm, không chỉ hiển thị một câu
generic.

Các điểm cần hướng dẫn thủ công hoặc bằng rule:

- `I'm ... from ...` để giới thiệu người và tổ chức;
- `I'm here to ...` để nói mục đích có mặt;
- `the UHD television` và lý do dùng `the`;
- `that you ordered last week` là mệnh đề bổ nghĩa cho TV;
- `would like to` là cách nêu mong muốn lịch sự;
- `mount ... on ...`;
- `use ... for ...`;
- số nhiều `presentation/presentations`, `seminar/seminars`, `tool/tools`;
- `it looks like ...`;
- `have to ...`;
- `before you come ...`;
- `to make sure ...`;
- `someone is in the office to meet you`;
- `however` chuyển từ chấp nhận sang một yêu cầu bổ sung.

`guide.parts` phải chỉ ra phần đã biết và phần mới khi điều đó giúp người học
nhìn thấy bước i+1.

## Thiết kế audio

Nguyên tắc bắt buộc: âm thanh của một task phải đọc đúng `task.answer`.

### Audio sư phạm

Các task từ đơn, biến thể, cụm và mệnh đề trung gian dùng giọng Anh-Mỹ local,
giống bài 1. Mỗi task có một file riêng theo `audioId`.

### Audio gốc

Các task câu hoàn chỉnh dùng clip giọng thật cắt từ MP3 gốc. Các task hội thoại
cộng dồn dùng audio ghép từ các clip câu gốc theo đúng thứ tự.

### Định dạng

Toàn bộ tài sản app-ready của course dùng cùng một định dạng trong một thư mục
course. Để giống bài 1 và giữ app đơn giản, course mẫu dùng WAV:

```text
assets/audio/listening-song-ngu-sample/<audio-id>.wav
```

Clip MP3 nguồn chỉ dùng trong pipeline biên soạn, không phải contract runtime
của task. File MP3 tổng vẫn là nguồn gốc.

## Dữ liệu khóa học

Course tiếp tục dùng schema JSON hiện tại:

```json
{
  "id": "listening-song-ngu-sample",
  "audioBasePath": "./assets/audio/listening-song-ngu-sample",
  "paragraphTaskMode": "cumulative",
  "sentences": [],
  "taskGroups": []
}
```

Quy tắc:

- mỗi lượt nói là một `sentence`;
- mỗi `taskGroup` chứa đường học i+1 của lượt nói tương ứng;
- task id dùng prefix riêng để không xung đột với bài 1;
- `stage` dùng đúng `object`, `inflection`, `phrase`, `clause`, `sentence`;
- `audioId` mặc định bằng task id; chỉ được dùng chung file khi các task có
  `answer` giống hệt nhau;
- task câu hoàn chỉnh phải trùng transcript đã kiểm âm;
- `paragraphTaskMode: "cumulative"` tạo phần hội thoại cộng dồn;
- phải tạo đủ audio cho các task cộng dồn được sinh ra.

Pipeline phải sinh một manifest để truy vết mỗi `audioId` về:

- nội dung tiếng Anh chính xác được đọc;
- loại nguồn `pedagogical`, `original` hoặc `cumulative`;
- clip nguồn và timestamp nếu audio đến từ MP3 gốc;
- các clip thành phần nếu audio là hội thoại cộng dồn.

## Tooling biên soạn

Tool local có ba trách nhiệm tách biệt:

1. Transcribe một khoảng audio thành bản nháp có timestamp.
2. Cắt clip câu gốc sau khi transcript được kiểm âm.
3. Sinh audio Anh-Mỹ cho các task sư phạm và ghép audio hội thoại cộng dồn.

Tooling chỉ hỗ trợ biên soạn. AI/ASR không tự quyết định giáo án; task groups
phải được kiểm duyệt thủ công theo các quy tắc trong tài liệu nền.

## Kiểm thử

Test phải khóa các thuộc tính phương pháp, không chỉ kiểm tra file tồn tại:

- course có tám câu đã kiểm âm;
- mỗi nhóm kết thúc bằng đúng câu gốc;
- mỗi nhóm có object/phrase/clause cần thiết, không chỉ hai task;
- task `object` chỉ chứa một từ;
- dạng số nhiều đi sau dạng gốc;
- các cụm danh từ đi từ neo đến cụm đầy đủ;
- bridge word không xuất hiện như object;
- các bước liên tiếp chỉ thêm một lớp hợp lý;
- task id và prompt không mơ hồ;
- kiến thức đã có không bị dạy lại máy móc ở câu sau;
- mỗi task có guide hoàn chỉnh;
- mỗi task có WAV hợp lệ và manifest ghi đúng `answer`;
- task câu hoàn chỉnh dùng clip nguồn đã cắt;
- task hội thoại cộng dồn có audio hợp lệ;
- course picker hiển thị bài mới và lesson flow không đổi;
- toàn bộ `node --test` pass.

## Thay thế bản triển khai thử

Commit thử hiện tại với 8 câu/16 task không đạt tiêu chí phương pháp và phải
được thay thế, không mở rộng chắp vá.

Các phần có thể giữ:

- pipeline transcribe local;
- timestamp của tám lượt nói sau khi kiểm âm;
- course picker và hỗ trợ course data;
- test catalog nhiều course.

Các phần phải làm lại:

- toàn bộ `taskGroups` của course nghe;
- audio runtime của từng task;
- test chỉ kiểm tra MP3 tồn tại;
- spec/plan cũ mô tả mỗi task là nghe và gõ cả câu.

## Tiêu chí hoàn thành

- Exercise 1 trở thành một giáo án i+1 hoàn chỉnh, không phải bộ flashcard hay
  bộ nghe-chép.
- Người mất gốc được dẫn từ đối tượng đến đúng từng câu hội thoại.
- Mỗi task chỉ thêm một khó khăn mới và có hướng dẫn theo ngữ cảnh.
- Audio của task khớp chính xác với answer.
- Sau các câu riêng lẻ, người học tái tạo được hội thoại cộng dồn.
- Cấu trúc đủ rõ để dùng làm mẫu biên soạn Exercise 2, 3, 4 về sau.
