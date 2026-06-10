# Thiết kế speech-to-text hỗ trợ nhập nháp

Ngày chốt: 2026-06-10

Trạng thái: đã chốt thiết kế, chưa triển khai.

## Mục tiêu

Thêm khả năng người học nói câu trả lời để app điền nháp vào ô nhập hiện tại.
Tính năng này chỉ giúp nhập nhanh hơn và giúp người học bớt sợ nói. Nó không
chấm phát âm, không thay đổi luật đúng sai, không tự nộp bài và không trở thành
điều kiện qua task.

## Phương án đã chọn

Ở màn bài tập, trước khi người học nộp đáp án, app hiển thị một nút phụ như
`Nói thử` nếu trình duyệt hỗ trợ nhận diện giọng nói.

Luồng chính:

1. Người học nhìn prompt tiếng Việt như hiện tại.
2. Người học có thể gõ tay hoặc bấm `Nói thử`.
3. Khi bấm `Nói thử`, app nghe một lượt ngắn bằng tiếng Anh Mỹ.
4. Khi có transcript, app hiện dòng `Máy nghe được: ...` và tự điền transcript
   vào ô trả lời.
5. Người học được sửa transcript bằng tay.
6. Chỉ khi người học tự bấm `Kiểm tra` hoặc nhấn Enter, app mới chấm câu trả
   lời bằng `evaluateAnswer()` như hiện tại.

Vì transcript chỉ là bản nháp, mọi tiến độ và vòng luyện xen kẽ chỉ được cập
nhật sau khi người học nộp đáp án.

## Các phương án đã cân nhắc

1. **Dùng Web Speech API của trình duyệt để điền nháp**: phù hợp nhất cho bản
   đầu vì app đang là website tĩnh, không cần máy chủ và có thể bám vào ô nhập
   hiện tại. Nhược điểm là không hỗ trợ đều trên mọi trình duyệt.
2. **Gửi âm thanh lên một dịch vụ speech-to-text riêng**: ổn định hơn, nhưng cần
   backend, quản lý khóa API, chi phí và xử lý quyền riêng tư. Chưa phù hợp với
   bản GitHub Pages hiện tại.
3. **Nhận diện giọng nói cục bộ bằng mô hình chạy trong trình duyệt**: riêng tư
   hơn, nhưng nặng và phức tạp cho MVP.

Vì mục tiêu hiện tại chỉ là hỗ trợ nhập nháp, phương án 1 là lựa chọn triển
khai đầu tiên.

## Giới hạn trình duyệt và riêng tư

Triển khai dựa trên `SpeechRecognition` hoặc `webkitSpeechRecognition` nếu trình
duyệt có hỗ trợ.

Theo tài liệu MDN, `SpeechRecognition` chưa phải tính năng Baseline vì không
hoạt động trên một số trình duyệt phổ biến. MDN cũng lưu ý rằng trên một số
trình duyệt như Chrome, nhận diện giọng nói có thể dùng máy chủ nhận diện từ xa,
nghĩa là âm thanh được gửi tới dịch vụ web và không chạy offline.

Vì vậy:

- App không bắt buộc người học dùng tính năng nói.
- Nếu trình duyệt không hỗ trợ, nút nói không xuất hiện hoặc bị tắt.
- Nếu người học từ chối quyền micro, app báo nhẹ và giữ nguyên luồng gõ.
- App không tự lưu file âm thanh hoặc transcript ngoài ô trả lời hiện tại.
- Giao diện không được mô tả đây là kiểm tra phát âm chuẩn.

Nguồn kỹ thuật:

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## Giao diện

Màn bài tập vẫn giữ cấu trúc tối giản:

- prompt tiếng Việt;
- ô nhập tiếng Anh;
- nút phụ `Nói thử` nếu khả dụng;
- dòng trạng thái ngắn cho speech-to-text;
- nút chính `Kiểm tra`.

Trạng thái gợi ý:

- Chưa nghe: `Nói thử`.
- Đang nghe: `Đang nghe...` hoặc nút `Dừng nghe`.
- Có kết quả: `Máy nghe được: "<transcript>". Bạn có thể sửa trước khi kiểm tra.`
- Không nghe được: `Mình chưa nghe rõ. Bạn có thể nói lại hoặc gõ tay.`
- Không có quyền micro: `Trình duyệt chưa cho phép dùng micro. Bạn vẫn có thể gõ tay.`

Nút nói chỉ hoạt động ở màn bài tập trước khi đã nộp đáp án. Khi feedback đã
hiện, khi đang ở màn hướng dẫn, khi khóa học hoàn thành hoặc khi đang đổi/reset
khóa học, app phải dừng nhận diện nếu đang nghe.

## Kiến trúc

Tạo một module nhỏ, ví dụ `js/speech-input.mjs`, để bọc API nhận diện giọng nói
của trình duyệt. Module này chịu trách nhiệm:

- phát hiện hỗ trợ `SpeechRecognition` hoặc `webkitSpeechRecognition`;
- cấu hình `lang = "en-US"`;
- dùng một lượt nghe ngắn, `continuous = false`;
- cho phép transcript tạm thời nếu cần hiển thị trạng thái đang nghe;
- trả transcript cuối cùng cho `app.mjs`;
- dừng hoặc hủy lượt nghe khi người học chuyển màn, nộp bài, reset hoặc đổi bài;
- chuyển lỗi kỹ thuật thành thông báo thân thiện.

`app.mjs` chỉ nối module này với giao diện:

- bấm `Nói thử` thì bắt đầu nghe;
- khi có transcript, đặt `elements.answer.value = transcript`;
- focus lại ô nhập để người học sửa;
- không gọi `handleCheck()` sau khi nhận transcript;
- không ghi tiến độ và không gọi `recordMasteryAttempt()`.

Phần phát âm hiện có trong `js/speech.mjs` vẫn chỉ dùng để app đọc mẫu hoặc đọc
đáp án. Khi bắt đầu nghe micro, app nên dừng âm thanh đang phát để tránh micro
thu lại giọng mẫu của app.

## Kiểm thử

Kiểm thử cần chứng minh:

- Khi môi trường không có `SpeechRecognition`, speech input báo không khả dụng
  và app vẫn học bằng gõ tay bình thường.
- Khi nhận được transcript cuối cùng, module trả đúng text cho app.
- Transcript được điền vào ô trả lời nhưng không tự nộp đáp án.
- Nộp bài vẫn dùng `evaluateAnswer()` và luật mastery hiện tại.
- Khi người học chuyển task, quay hướng dẫn, reset hoặc đổi khóa học, lượt nghe
  đang chạy bị dừng.
- Lỗi `not-allowed`, `no-speech`, `audio-capture` và lỗi chung có thông báo mềm,
  không làm app kẹt.
- `node --test` vượt qua toàn bộ test hiện có và test mới.
- Kiểm tra thủ công trên trình duyệt hỗ trợ speech-to-text: bấm `Nói thử`, nói
  một cụm ngắn, thấy transcript điền vào ô, sửa được, rồi bấm `Kiểm tra`.

## Tiêu chí hoàn thành

- Người học có thể dùng giọng nói để điền nháp câu trả lời trên trình duyệt hỗ
  trợ.
- Speech-to-text không thay đổi điểm, tiến độ, vòng lặp, hoặc điều kiện qua bài.
- Người học luôn có thể sửa transcript trước khi nộp.
- Trình duyệt không hỗ trợ hoặc không có quyền micro vẫn dùng app bình thường.
- Spec tổng của app ghi rõ đây là tính năng hỗ trợ nhập, không phải bài kiểm tra
  nói hoặc phát âm.
