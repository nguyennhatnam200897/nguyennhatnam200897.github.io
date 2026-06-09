# Contextual Guidance Rules Design

Ngày tạo: 2026-06-09

## Mục tiêu

Làm giàu màn hướng dẫn trước mỗi bài nhập để người học hiểu rõ hơn vì sao một cụm/câu tiếng Anh được tạo như vậy, đặc biệt ở các điểm dễ vấp: mạo từ `the`, `a/an`, số nhiều, `would`, `although`, `where`, `when`, `how`, và cấu trúc `encourage someone to do something`.

Thay đổi này giữ nguyên triết lý hiện tại của app:

- người học vẫn đi theo i+1;
- vẫn nhập tiếng Anh tự do từ nghĩa tiếng Việt;
- vẫn không dùng bài chọn đáp án hoặc điền khuyết;
- vẫn có màn hướng dẫn trước khi yêu cầu tự nhập;
- sai thì quay lại hướng dẫn của đúng đơn vị vừa sai.

## Phạm vi

Trong phạm vi:

- thêm một lớp sinh hướng dẫn theo pattern trong `js/guidance.mjs`;
- giữ các `specialGuides` thủ công hiện có cho các ngoại lệ quan trọng;
- cải thiện giải thích cho các task phù hợp trong bài `A Small Public Garden`;
- thêm test khóa các pattern guidance chính.

Ngoài phạm vi:

- không đổi giao diện;
- không đổi thuật toán mastery;
- không đổi cách chấm đáp án;
- không thêm bài học mới;
- không tách học liệu sang JSON trong bước này.

## Thiết kế nội dung

`createGuidance(task, previousTask)` sẽ thử tạo hướng dẫn theo thứ tự:

1. `specialGuides`: nội dung thủ công cho task có yêu cầu riêng.
2. Contextual rule: các rule nhận diện pattern từ `task.answer`, `task.prompt`, `task.stage`, và `previousTask`.
3. Generic fallback hiện tại.

Các rule dự kiến:

- **Inflection rule**: giải thích số nhiều từ task liền trước nếu task hiện tại là `inflection`, bao gồm cả dạng thường và bất quy tắc như `child` -> `children`.
- **Definite article rule**: với cụm bắt đầu bằng `the`, giải thích `the` dùng khi đối tượng đã xác định hoặc đã được nhắc trong ngữ cảnh bài.
- **Indefinite article rule**: với cụm bắt đầu bằng `a` hoặc `an`, giải thích đây là một đối tượng đếm được; riêng `an` được dùng trước âm mở đầu như trong `an empty parking lot`.
- **Would rule**: với mệnh đề chứa `would`, giải thích ý dự đoán/phàn nàn kiểu "sẽ/có thể sẽ" chứ không phải hành động đang xảy ra.
- **Although rule**: với câu/mệnh đề bắt đầu bằng `Although`, giải thích nhượng bộ: phần sau `although` tạo nền tương phản, còn ý chính nằm ở mệnh đề còn lại.
- **Where rule**: với cụm/mệnh đề bắt đầu bằng `where`, giải thích đây là phần bổ nghĩa cho một nơi chốn.
- **How rule**: với cụm/mệnh đề bắt đầu bằng `how`, giải thích nghĩa "cách mà...".
- **When rule**: với cụm/mệnh đề bắt đầu bằng `when`, giải thích nghĩa "khi..." để nối điều kiện/thời điểm với ý chính.
- **Encourage-to rule**: với `to use` và `to place` trong câu `encouraged nearby shops to...`, giải thích cấu trúc `encourage someone to do something`.
- **Expansion rule**: khi task hiện tại mở rộng trực tiếp từ task trước, giải thích rằng người học đang thêm một lớp nghĩa/chức năng mới vào cụm đã biết.

## Thiết kế code

`js/guidance.mjs` sẽ có các hàm nhỏ, thuần dữ liệu:

- `inflectionExplanation(task, previousTask)`;
- `articleExplanation(task)`;
- `wouldExplanation(task)`;
- `connectorExplanation(task)`;
- `encourageToExplanation(task)`;
- `expansionExplanation(task, previousTask)`;
- `contextualExplanation(task, previousTask)`.

Mỗi rule chỉ trả về chuỗi explanation hoặc `null`. `createGuidance()` vẫn trả cùng shape hiện tại:

```js
{
  term,
  meaning,
  explanation,
  parts,
  speech
}
```

Không thay contract của `attachGuidance()`, `buildLessonTasks()`, hoặc `app.mjs`.

## Data Flow

1. `buildLessonTasks()` tạo danh sách task từ `article.mjs`.
2. `attachGuidance()` duyệt từng task theo thứ tự học.
3. `createGuidance()` tạo nội dung hướng dẫn.
4. `buildPronunciation()` vẫn nhận `guide.term` để tạo IPA và new words.
5. `app.mjs` render guidance như hiện tại, không cần biết rule nào đã tạo explanation.

## Error Handling

Nếu không rule nào khớp, app dùng generic fallback hiện tại. Nếu một rule khớp nhưng không đủ dữ liệu an toàn, rule đó trả `null` để tránh tạo giải thích sai. Không có rule nào được phép làm hỏng task hoặc thay đổi đáp án.

## Testing

Thêm test trong `tests/learning.test.mjs` hoặc file test guidance riêng để kiểm tra:

- `the local council` có giải thích về `the`;
- `an empty parking lot` có giải thích về `an`;
- `children` có giải thích là dạng số nhiều của `child`;
- mệnh đề `would reduce`/`would attract` có giải thích về `would`;
- câu `Although...` có giải thích nhượng bộ;
- `where children...` có giải thích bổ nghĩa nơi chốn;
- `how people thought...` có giải thích "cách mà";
- `when people feel...` có giải thích "khi";
- các task liên quan `to use` và `to place` có giải thích cấu trúc `encourage someone to do something`;
- mọi task vẫn có đầy đủ `term`, `meaning`, `explanation`, `speech`.

Sau triển khai, chạy `node --test`.

## Tiêu chí hoàn thành

- Các pattern guidance chính có nội dung cụ thể hơn generic fallback.
- Không thay đổi thứ tự task, đáp án, mastery rule, hoặc audio path.
- Tất cả test hiện có và test mới đều pass.
- Code vẫn là vanilla JavaScript, không thêm dependency.
