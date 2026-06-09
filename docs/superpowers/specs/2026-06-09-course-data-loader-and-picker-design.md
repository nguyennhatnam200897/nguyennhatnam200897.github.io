# Course Data Loader And Picker Design

Ngày tạo: 2026-06-09

## Mục tiêu

Tách học liệu ra khỏi `js/article.mjs` để app có thể thêm bài học thứ hai, thứ ba, thứ tư mà không làm file JavaScript chính phình ra. Đồng thời thêm màn chọn bài học trước khi vào luồng học, hiện chỉ hiển thị bài `A Small Public Garden` nhưng dùng cấu trúc danh sách để sau này thêm bài mới bằng dữ liệu.

Thiết kế được chọn: **JSON data + loader mỏng**.

## Brief UI

- Màn đầu tiên là danh sách bài học.
- Hiện tại chỉ có một thẻ bài: `A Small Public Garden`.
- Không hiển thị placeholder cho bài 2, bài 3, bài 4.
- Khi sau này thêm file học liệu và thêm entry trong course index, app tự render thêm thẻ bài.
- Giao diện giữ phong cách tối giản hiện có: nền trắng, chữ rõ, border nhẹ, button đen, bán kính nhỏ.
- Thẻ bài có các thông tin tối thiểu: tiêu đề, level, topic, mô tả ngắn, số câu, số nhiệm vụ, tiến độ riêng của bài, nút `Học tiếp` hoặc `Bắt đầu`.

## Phạm vi

Trong phạm vi:

- tạo `data/courses.json` làm index khóa học;
- tạo `data/courses/small-public-garden.json` làm học liệu của bài hiện có;
- thêm module loader/model để biến JSON thành lesson tasks hiện tại;
- refactor app để load course được chọn trước khi tạo mastery session;
- thêm màn chọn bài học;
- lưu tiến độ theo từng course id;
- migration nhẹ từ storage cũ `article-mastery-session-v2` sang key mới cho bài hiện có;
- cập nhật script xuất audio task và test để đọc từ course data.

Ngoài phạm vi:

- không thêm bài học thứ hai;
- không tạo editor biên soạn học liệu;
- không đổi thuật toán mastery;
- không đổi cách chấm đáp án;
- không đổi nội dung bài học hiện có ngoài việc chuyển nơi lưu trữ;
- không chuyển toàn bộ IPA dictionary sang JSON trong bước này.

## File Structure

```text
data/
  courses.json
  courses/
    small-public-garden.json

js/
  app.mjs
  course-loader.mjs
  course-model.mjs
  guidance.mjs
  pronunciation.mjs
  ...
```

`data/courses.json` là danh sách bài học. File này nhỏ, dùng để render picker.

`data/courses/small-public-garden.json` chứa học liệu thật của bài hiện tại: metadata, câu gốc, task groups, guide overrides và cấu hình audio.

`js/course-model.mjs` chứa logic thuần dữ liệu:

- validate nhẹ course shape;
- flatten task groups;
- sinh paragraph tasks cộng dồn;
- gọi `attachGuidance()`;
- build course summary.

`js/course-loader.mjs` chứa logic browser fetch:

- load course index;
- load course data theo `dataPath`;
- build lesson course từ JSON.

`js/article.mjs` không còn là nguồn học liệu chính. Có thể bị xóa nếu không còn import nào cần, hoặc giữ làm compatibility wrapper rất mỏng nếu cần giảm blast radius trong bước chuyển đổi.

## Course Index Schema

`data/courses.json`:

```json
{
  "courses": [
    {
      "id": "small-public-garden",
      "title": "A Small Public Garden",
      "level": "B2",
      "topic": "Đời sống đô thị và dự án môi trường nhỏ",
      "description": "Chinh phục một bài đọc B2 ngắn về khu vườn công cộng trong đô thị.",
      "dataPath": "./data/courses/small-public-garden.json"
    }
  ]
}
```

Quy tắc:

- `id` là định danh bền vững, dùng cho storage key và audio/course paths;
- `dataPath` là đường dẫn tương đối từ site root, phù hợp GitHub Pages;
- thêm bài mới bằng cách thêm entry mới vào mảng `courses`.

## Course Data Schema

`data/courses/small-public-garden.json`:

```json
{
  "id": "small-public-garden",
  "title": "A Small Public Garden",
  "level": "B2",
  "topic": "Đời sống đô thị và dự án môi trường nhỏ",
  "description": "Chinh phục một bài đọc B2 ngắn về khu vườn công cộng trong đô thị.",
  "audioBasePath": "./assets/audio",
  "paragraphTaskMode": "cumulative",
  "sentences": [
    {
      "id": "S1",
      "english": "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
      "vietnamese": "Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất."
    }
  ],
  "taskGroups": [
    [
      {
        "id": "S1-01",
        "sentenceId": "S1",
        "stage": "object",
        "prompt": "thành phố",
        "answer": "city",
        "audioId": "S1-01",
        "guide": {
          "term": "city",
          "meaning": "thành phố",
          "explanation": "“City” dùng để chỉ một thành phố.",
          "parts": [],
          "speech": "city"
        }
      }
    ]
  ]
}
```

Quy tắc:

- `taskGroups` giữ nhóm task theo câu để vẫn kiểm tra được mỗi câu hoàn tất trước khi sang câu sau.
- `audioId` là optional; nếu thiếu thì dùng `task.id`.
- `guide` là optional; nếu thiếu thì `guidance.mjs` sinh hướng dẫn theo rule hiện có.
- `paragraphTaskMode: "cumulative"` tạo `G2` đến `G7` từ `sentences`, giống hành vi hiện tại.
- `audioBasePath` mặc định là `./assets/audio`; sau này có thể đổi thành `./assets/audio/<course-id>` mà không sửa app.

## App Flow

1. App khởi động và fetch `./data/courses.json`.
2. Render màn chọn bài.
3. Với mỗi course card, app có thể load course data để tính số câu, số task và progress.
4. Khi người học bấm `Học tiếp`, app load course data nếu chưa cache.
5. App tạo `tasks`, `practiceGroups`, `taskIndexById`, `masterySession` cho course được chọn.
6. App render lesson flow hiện tại.
7. Người học có thể bấm `Đổi bài` để quay lại picker.

## Storage

Storage key mới:

```text
article-mastery-session-v3:<course-id>
```

Với bài hiện có:

- nếu key mới chưa có;
- và `article-mastery-session-v2` còn tồn tại;
- app thử restore session cũ bằng practice groups của `small-public-garden`;
- sau đó lưu lại dưới key mới.

Reset course chỉ xóa tiến độ của course đang học, không xóa toàn bộ course khác trong tương lai.

## Error Handling

- Nếu load `courses.json` lỗi, app hiển thị lỗi ngắn trên màn chọn bài và cho người học thử lại bằng reload browser.
- Nếu course index rỗng, app hiển thị trạng thái chưa có bài học.
- Nếu một course data lỗi hoặc sai schema, card đó hiển thị trạng thái không thể mở.
- Nếu audio file không tồn tại, `speech.mjs` vẫn fallback sang browser speech như hiện tại.
- Nếu chạy app trực tiếp qua `file://`, browser có thể chặn fetch JSON. Mục tiêu triển khai chính vẫn là GitHub Pages; khi test local bằng browser, dùng một static server đơn giản. Không thêm bundler hoặc dependency build.

## Testing

Thêm hoặc cập nhật test để khóa các hành vi:

- `course-model` build được đúng 138 tasks từ JSON bài hiện có;
- sentence task groups vẫn có số lượng `[18, 20, 16, 35, 21, 9, 13]`;
- paragraph tasks vẫn là `G2` đến `G7`;
- task ids vẫn unique và prompt không ambiguous;
- guidance overrides từ JSON vẫn hoạt động cho `city`, `cities`, `many cities`;
- contextual guidance rules vẫn hoạt động sau khi data chuyển sang JSON;
- app import `course-loader.mjs`, không import học liệu trực tiếp từ `article.mjs`;
- static paths vẫn relative cho GitHub Pages;
- audio exporter đọc tasks từ JSON course data;
- mỗi task vẫn có WAV asset hợp lệ theo `audioBasePath` và `audioId`;
- storage key có course id và có migration test cho key cũ.

Sau triển khai chạy:

```text
node --test
```

## Tiêu chí hoàn thành

- Học liệu bài hiện tại nằm trong JSON, không còn nằm trực tiếp trong `js/article.mjs`.
- App có màn chọn bài học, hiện chỉ hiển thị bài hiện có.
- Chọn bài mở đúng lesson flow hiện tại.
- Tiến độ lưu riêng theo course id.
- Thêm bài mới về sau chỉ cần thêm JSON course data, audio tương ứng, và entry trong `data/courses.json`.
- Tất cả test pass.
- Không thêm framework, bundler hoặc dependency runtime.
