# Hoàn thiện khóa A Small Public Garden - Gentle i+1

Ngày chốt: 2026-06-13

## Trạng thái

Đặc tả này chốt phạm vi hoàn thiện course thử nghiệm
`small-public-garden-gentle-i1`.

Đây là nguồn chuẩn cho lần triển khai tiếp theo. Khi có mâu thuẫn về course
thử nghiệm này, tài liệu này và
`2026-06-12-sequential-meaning-chunk-mastery-design.md` được ưu tiên hơn các
tài liệu yêu cầu xen kẽ nhiều cụm khi luyện riêng.

## Mục tiêu

Biến toàn bộ bài `A Small Public Garden - Gentle i+1` thành một khóa học hoàn
chỉnh theo i+1 dựa trên cụm nghĩa:

1. làm chủ từng cụm theo thứ tự;
2. hiểu lúc nào cần cụm và vai trò của cụm;
3. ghép các cụm thành từng ý và câu hoàn chỉnh;
4. sửa đúng cụm hỏng khi sai trong ý dài;
5. ghép bảy câu thành đoạn cộng dồn.

Người học luôn thực hiện một hành vi cốt lõi: nhìn ý tiếng Việt rồi tự viết
hoặc nói đáp án tiếng Anh độc lập.

## Phạm vi

Chỉ thay đổi course:

```text
small-public-garden-gentle-i1
```

Không thay đổi:

- course gốc `small-public-garden`;
- course nghe `listening-song-ngu-sample`;
- cơ chế nhóm chồng lấp của các course thông thường;
- speech-to-text ngoài việc tiếp tục dùng như cách nhập nháp;
- luật chấm bỏ qua khác biệt hình thức nhưng chặn lỗi nội dung.

## Nguồn học liệu

Nội dung tiếng Anh và tiếng Việt lấy từ bảy câu đã có trong course gốc.

Các task legacy trong course thử nghiệm chỉ là nguyên liệu để:

- tái sử dụng nấc i+1 phù hợp;
- tái sử dụng `audioId` khi đáp án giống hệt;
- tham khảo giải thích ngữ pháp đã được kiểm chứng.

Task legacy không còn xuất hiện xen giữa các lesson cụm nghĩa. Sau khi cả bảy
câu được chuyển đổi, course thử nghiệm chỉ dùng `meaningChunkLessons` và các
task đoạn cộng dồn.

## Dòng học tổng thể

```text
overview S1
-> cụm S1 theo thứ tự
-> composition S1
-> câu S1 hoàn chỉnh
-> overview S2
-> ...
-> câu S7 hoàn chỉnh
-> S1 + S2
-> S1 + S2 + S3
-> ...
-> S1 + ... + S7
-> hoàn thành khóa học
```

Mỗi overview chỉ xuất hiện một lần trước lesson của câu tương ứng và không được
chấm điểm.

## Nhịp thành thạo

### Bước nhỏ trong cụm

- Mỗi bước nhỏ đúng một lần thì mở bước kế tiếp.
- Sai ở bước nào thì sửa và làm lại bước đó.
- Bước đã qua không được lặp để tích điểm.
- Bước nhỏ không hiển thị `Khi nào cần?`, `Mục đích là gì?` hoặc
  `Vai trò trong câu`.

### Cụm hoàn chỉnh

- Task cuối của cụm phải đúng hai lần liên tiếp.
- Sau lần đúng đầu tiên, app giữ nguyên task để xác nhận lần hai.
- Không chèn cụm khác giữa hai lượt xác nhận.
- Sai trước khi đủ hai lần đặt chuỗi xác nhận về `0`.
- Chỉ task cuối hiển thị `Khi nào cần?`, `Mục đích là gì?` và
  `Vai trò trong câu`.
- Khi đủ hai lần, app hiển thị `successMessage` rồi chuyển sang cụm kế tiếp.

### Composition và câu hoàn chỉnh

- Chỉ mở khi mọi cụm trong `usesChunks` đã vững.
- Đúng một lần thì qua.
- `roleLine` được hiển thị ở màn hướng dẫn nhưng không xuất hiện trong ô nhập.
- Composition đúng củng cố cụm một cách tự nhiên, không làm người học phải học
  lại cụm riêng.

### Đoạn cộng dồn

- Bắt đầu bằng `S1 + S2`, sau đó mỗi lượt thêm đúng một câu.
- Mỗi lượt đúng một lần thì qua.
- Không yêu cầu hai lượt xác nhận vì các câu đã được làm chủ trước đó.
- Lượt cuối yêu cầu tái tạo đủ `S1 + ... + S7`.

## Overview

Mỗi `meaningChunkLesson` có:

```json
{
  "overview": {
    "title": "Mình sẽ xây câu này từ các cụm nghĩa",
    "summary": [
      "Câu này diễn đạt ...",
      "Mình sẽ học ...",
      "Sau đó mình sẽ ghép ..."
    ],
    "graded": false
  }
}
```

Yêu cầu:

- hai đến bốn dòng ngắn;
- mô tả dòng ý, không giảng thuật ngữ ngữ pháp;
- không hiện đáp án tiếng Anh đầy đủ;
- được lưu trạng thái đã xem để không hiện lại sau mỗi lần tải trang.

## Bản đồ cụm từng câu

Các đường có dấu `->` là i+1 bên trong một cụm. Các dòng `Ghép` là
`compositionTasks`.

### S1

Giữ nội dung cụm đã triển khai, nhưng đổi scheduler sang tuần tự.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `many cities` | Ai? | `city -> cities -> many cities` |
| `are trying to` | Đang cố làm gì? | `try -> are trying -> are trying to` |
| `make daily life` | Tác động vào cái gì? | `life -> daily life -> make daily life` |
| `more sustainable` | Kết quả gì? | `sustainable -> more sustainable` |
| `the most effective changes` | Cái gì đang được nhận định? | `change -> changes -> effective changes -> the most effective changes` |
| `are often` | Thường là gì? | `are -> are often` |
| `the least dramatic` | Có đặc điểm gì? | `dramatic -> the least dramatic` |
| `but` | Quan hệ giữa hai ý là gì? | `but` |

Ghép:

1. `many cities are trying to`;
2. `make daily life more sustainable`;
3. `many cities are trying to make daily life more sustainable`;
4. `the most effective changes are often`;
5. `the most effective changes are often the least dramatic`;
6. câu S1 hoàn chỉnh.

### S2

Ý chính: ở đâu, ai đã biến cái gì thành cái gì.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `in one neighborhood` | Ở đâu? | `neighborhood -> one neighborhood -> in one neighborhood` |
| `the local council` | Ai thực hiện thay đổi? | `council -> local council -> the local council` |
| `an empty parking lot` | Cái gì được thay đổi? | `lot -> parking lot -> a parking lot -> empty parking lot -> an empty parking lot` |
| `a small public garden` | Trở thành cái gì? | `garden -> a garden -> public garden -> small public garden -> a small public garden` |
| `turned an empty parking lot into a small public garden` | Đã biến cái gì thành cái gì? | `turned a parking lot into a garden -> turned an empty parking lot into a garden -> turned an empty parking lot into a small public garden` |

Ghép:

1. `the local council turned an empty parking lot into a small public garden`;
2. câu S2 hoàn chỉnh với `in one neighborhood`.

### S3

Ý chính: ban đầu ai phàn nàn và họ lo điều gì.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `at first` | Khi nào? | `at first` |
| `some residents` | Ai phàn nàn? | `resident -> residents -> some residents` |
| `complained that` | Họ đã làm gì? | `complained -> complained that` |
| `the project would reduce parking spaces` | Điều đáng lo thứ nhất? | `project -> the project -> space -> spaces -> parking spaces -> would reduce parking spaces -> the project would reduce parking spaces` |
| `and attract noise` | Điều đáng lo thêm? | `noise -> attract noise -> and attract noise` |

Ghép:

1. `the project would reduce parking spaces and attract noise`;
2. `some residents complained that the project would reduce parking spaces and attract noise`;
3. câu S3 hoàn chỉnh với `at first`.

### S4

Ý chính: sau vài tháng khu vườn trở thành nơi yên tĩnh cho ba nhóm người.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `however` | Quan hệ với ý trước? | `however` |
| `within a few months` | Khi nào? | `month -> months -> a few months -> within a few months` |
| `the garden became a quiet place` | Điều gì đã thay đổi thế nào? | `the garden -> place -> quiet place -> a quiet place -> the garden became a quiet place` |
| `where children could play` | Nơi đó cho trẻ em làm gì? | `child -> children -> children play -> children could play -> where children could play` |
| `older people could meet` | Người lớn tuổi có thể làm gì? | `person -> people -> older people -> older people meet -> older people could meet` |
| `office workers could rest during lunch breaks` | Nhân viên văn phòng có thể làm gì và khi nào? | `worker -> workers -> office workers -> office workers rest -> office workers could rest -> break -> breaks -> lunch breaks -> during lunch breaks -> office workers could rest during lunch breaks` |

Ghép:

1. `where children could play, older people could meet`;
2. thêm `and office workers could rest during lunch breaks`;
3. ghép với `the garden became a quiet place`;
4. thêm `within a few months`;
5. câu S4 hoàn chỉnh với `however`.

### S5

Ý chính: dự án khuyến khích các cửa hàng thực hiện hai hành động.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `the project` | Điều gì tạo ảnh hưởng? | `project -> the project` |
| `also encouraged nearby shops to` | Đã khuyến khích ai làm gì? | `shop -> shops -> nearby shops -> encouraged nearby shops -> encouraged nearby shops to -> also encouraged nearby shops to` |
| `use fewer plastic bags` | Hành động thứ nhất? | `bag -> bags -> plastic bags -> fewer plastic bags -> use fewer plastic bags` |
| `and to place recycling bins outside their doors` | Hành động thứ hai? | `bin -> bins -> recycling bins -> door -> doors -> their doors -> outside their doors -> place recycling bins -> place recycling bins outside their doors -> and to place recycling bins outside their doors` |

Ghép:

1. `also encouraged nearby shops to use fewer plastic bags`;
2. `use fewer plastic bags and to place recycling bins outside their doors`;
3. câu S5 hoàn chỉnh.

### S6

Ý chính: dù khu vườn không giải quyết mọi vấn đề, nó thay đổi cách mọi người
nghĩ.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `although` | Quan hệ nhượng bộ? | `although` |
| `the garden did not solve every environmental problem` | Điều gì không được giải quyết hết? | `problem -> environmental problem -> every environmental problem -> did not solve every environmental problem -> the garden did not solve every environmental problem` |
| `it changed` | Điều gì đã xảy ra thay vào đó? | `changed -> it changed` |
| `how people thought about shared space` | Thay đổi điều gì? | `shared space -> people thought about shared space -> how people thought about shared space` |

Ghép:

1. `it changed how people thought about shared space`;
2. câu S6 hoàn chỉnh với `although`.

### S7

Ý chính: bài học rút ra và điều kiện để dự án ảnh hưởng đến thói quen.

| Cụm | Vai trò | Đường i+1 |
| --- | --- | --- |
| `it showed that` | Điều gì được rút ra? | `showed -> showed that -> it showed that` |
| `a simple local project` | Cái gì có thể tạo ảnh hưởng? | `local project -> simple local project -> a simple local project` |
| `can influence daily habits` | Có thể ảnh hưởng điều gì? | `habit -> habits -> daily habits -> influence daily habits -> can influence daily habits` |
| `when people feel that the change belongs to them` | Khi nào ảnh hưởng đó xảy ra? | `the change -> the change belongs to them -> people feel that the change belongs to them -> when people feel that the change belongs to them` |

Ghép:

1. `a simple local project can influence daily habits`;
2. thêm điều kiện `when people feel that the change belongs to them`;
3. câu S7 hoàn chỉnh với `it showed that`.

## Hướng dẫn cụm

Mỗi cụm hoàn chỉnh bắt buộc có:

- `whenNeeded`: tình huống thực tế cần cụm;
- `roleQuestion`: câu hỏi vai trò gần gũi;
- `roleMeaning`: cụm đóng góp gì vào dòng ý;
- `successMessage`: ghi nhận cụ thể điều người học vừa sở hữu.

Mỗi bước nhỏ bắt buộc có:

- `purpose`: lớp mới vừa được thêm;
- phát âm của chính đáp án;
- nghĩa tiếng Việt;
- không có ba trường vai trò của cụm hoàn chỉnh.

Composition bắt buộc có:

- `usesChunks`;
- `roleLine`;
- `masteryCredit`;
- `successMessage`;
- `repairRules` cho các lỗi dự đoán được.

## Success message

Không tạo màn mới. Dùng vùng feedback hiện có sau câu trả lời đúng.

- Bước nhỏ: phản hồi đúng ngắn gọn như hiện tại.
- Cụm hoàn chỉnh chỉ hiện `successMessage` sau lần đúng thứ hai.
- Composition hiện `successMessage` ngay sau lần đúng.
- App vẫn chờ audio đúng kết thúc trước khi chuyển tiếp.

## Repair

### Trong chuỗi cụm

- Sai bước nhỏ: làm lại chính bước đó.
- Sai cụm hoàn chỉnh do một nền đã học bị hỏng: repair nền cụ thể một lần rồi
  quay lại cụm hoàn chỉnh.
- Các cụm khác không bị đặt lại.

### Trong composition hoặc câu

Ưu tiên theo thứ tự:

1. `commonWrongAnswers` khớp một lỗi đã biên soạn;
2. token span khớp cụm hoàn chỉnh;
3. nếu không xác định được, làm lại chính composition.

Repair đúng một lần thì quay lại task dài đang học.

Mỗi câu phải có repair rule tối thiểu cho:

- số ít/số nhiều quan trọng;
- mạo từ `a/an/the`;
- từ nối hoặc khung bắt buộc như `that`, `where`, `although`, `when`;
- modal/khung động từ như `would`, `could`, `to`;
- phép lược chủ thể hoặc danh từ có chủ ý trong câu gốc.

### Trong đoạn cộng dồn

Mỗi task đoạn có token span theo từng câu. Khi sai:

1. xác định câu chứa token lỗi;
2. mở lại task câu hoàn chỉnh đó một lần;
3. nếu câu vẫn sai, áp dụng repair cụm của câu;
4. sau khi sửa xong, quay lại task đoạn.

Không bắt học lại các câu khác trong đoạn.

## Dữ liệu đoạn cộng dồn

Course tiếp tục dùng `paragraphTaskMode: "cumulative"` và sinh sáu task:

```text
G2 = S1 + S2
G3 = S1 + S2 + S3
G4 = S1 + S2 + S3 + S4
G5 = S1 + S2 + S3 + S4 + S5
G6 = S1 + S2 + S3 + S4 + S5 + S6
G7 = S1 + S2 + S3 + S4 + S5 + S6 + S7
```

Mỗi task có:

- `sentenceIds`;
- rollback span tới task câu hoàn chỉnh tương ứng;
- audio cộng dồn;
- giải thích rằng lượt này chỉ thêm một câu đã học.

## Audio và IPA

- Mọi task mới phải có WAV hợp lệ.
- Tái sử dụng audio legacy khi `answer` giống hệt.
- Sinh audio mới cho cụm hoặc composition mới.
- Dùng giọng Anh-Mỹ hiện có của dự án.
- Mọi dạng từ mới phải có IPA Anh-Mỹ đơn giản.
- Không tạo bài tập nhập IPA.

## Thay đổi kiến trúc

### `js/meaning-chunks.mjs`

- Chỉ đưa metadata vai trò vào guide của bước cuối.
- Bảo toàn overview, success message, role line và repair metadata.
- Sinh rollback target ổn định cho bước nội bộ và composition.

### `js/mastery.mjs`

Profile `meaning-chunk-i-plus-one` dùng scheduler tuần tự:

```text
step 1 (1 lần)
-> step 2 (1 lần)
-> final chunk (2 lần liên tiếp)
-> chunk kế tiếp
-> composition (1 lần)
```

Không ghép hai final chunk vào cùng một group.

Scheduler hỗ trợ:

- final chunk `minCorrect: 2`, `minStreak: 2`,
  `requiresInterleavedCorrect: false`;
- composition và paragraph `minCorrect: 1`;
- repair rồi quay lại task dài;
- paragraph rollback theo câu.

### `js/course-model.mjs`

- Yêu cầu course thử nghiệm có đủ lesson cho `S1–S7`.
- Không trộn task legacy khi toàn bộ lesson đã được chuyển đổi.
- Sinh và chuẩn hóa paragraph rollback targets.
- Tăng `sessionVersion` để không phục hồi tiến độ theo scheduler cũ.

### `js/app.mjs` và lesson flow

- Hiển thị overview không chấm điểm trước mỗi câu.
- Chỉ dựng vai trò cho final chunk hoặc role line của composition.
- Hiển thị success message đúng thời điểm.
- Không để role line hoặc đáp án xuất hiện trong màn exercise.

## Kiểm thử bắt buộc

### Dữ liệu

- Có đúng bảy `meaningChunkLessons`, lần lượt `S1–S7`.
- Không có câu nào dùng task legacy trong course thử nghiệm.
- Mỗi lesson kết thúc bằng đúng câu gốc.
- Mỗi chunk có đủ metadata và step cuối trùng `english`.
- ID task/chunk/lesson duy nhất toàn course.
- Prompt tiếng Việt có dấu và không tiết lộ đáp án.
- Mọi audio và IPA đều tồn tại.

### Hướng dẫn

- Bước nhỏ không có metadata vai trò.
- Final chunk có đủ ba phần vai trò.
- Overview xuất hiện một lần trước câu.
- Composition có role line.
- Exercise không hiển thị role line, đáp án hoặc gợi ý trực tiếp.
- Success message chỉ hiện khi đạt đúng mốc.

### Scheduler

Chuỗi mẫu bắt buộc:

```text
city
-> cities
-> many cities
-> many cities
-> try
-> are trying
-> are trying to
-> are trying to
```

- Không có cụm khác giữa hai lượt final chunk.
- Sai lần xác nhận thứ hai đặt chuỗi về `0`.
- Composition chỉ mở sau các cụm cần thiết.
- Mỗi task đoạn đúng một lần thì qua.

### Repair

- Sai bước nhỏ quay đúng bước nhỏ.
- Sai composition quay đúng final chunk.
- Repair xong quay lại composition.
- Sai đoạn quay đúng câu, rồi đúng cụm nếu cần.
- Tiến độ các cụm và câu không liên quan không bị xóa.

### Hồi quy

- Course gốc không đổi task và scheduler.
- Course nghe không đổi task và scheduler.
- Course thông thường vẫn dùng nhóm chồng lấp.
- Toàn bộ test Node vượt qua.
- Desktop và mobile không chồng nội dung.
- Không có lỗi console.

## Tiêu chí hoàn thành

Course được xem là hoàn thiện khi:

1. cả bảy câu dùng duy nhất luồng cụm nghĩa;
2. scheduler tuân thủ thành thạo tuần tự;
3. hướng dẫn vai trò chỉ xuất hiện đúng lúc;
4. repair đưa người học về đúng cụm hỏng;
5. người học ghép được toàn bộ đoạn qua sáu bước cộng dồn;
6. audio, IPA, lưu tiến độ và giao diện hoạt động;
7. course gốc và course nghe không thay đổi hành vi.
