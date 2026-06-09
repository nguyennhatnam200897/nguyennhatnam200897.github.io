# Kế hoạch triển khai bài nghe mẫu theo phương pháp i+1

Ngày cập nhật: 2026-06-10

**Mục tiêu:** Thay bản thử nghiệm 8 câu/16 task bằng một giáo án hoàn chỉnh
đưa người học từ danh từ neo đến từng câu gốc và cuối cùng tái tạo toàn bộ
Exercise 1.

**Kiến trúc:** Giữ nguyên webapp tĩnh và schema course JSON. Học liệu được biên
soạn thủ công trong course data; `course-model.mjs` tiếp tục sinh task hội thoại
cộng dồn. Một manifest audio riêng ghi nội dung, loại nguồn và timestamp của
mỗi file. Tooling local sinh WAV giọng Mỹ cho task sư phạm, cắt WAV từ MP3 cho
câu gốc và ghép WAV cho hội thoại cộng dồn.

**Công nghệ:** Vanilla ES modules, JSON, Node `node:test`, PowerShell
`System.Speech`, Python, FFmpeg qua `imageio-ffmpeg`, static GitHub Pages.

---

### Task 1: Khóa contract phương pháp bằng test

**Files:**
- Modify: `tests/course-catalog.test.mjs`
- Create: `tests/listening-course.test.mjs`

- [ ] Kiểm tra course có 8 câu, dùng WAV và bật `paragraphTaskMode: cumulative`.
- [ ] Kiểm tra mỗi nhóm có đường học nhiều tầng và kết thúc bằng đúng câu gốc.
- [ ] Kiểm tra task `object` là danh từ một từ; bridge word không bị dùng làm
  object.
- [ ] Kiểm tra các chuỗi số ít -> số nhiều và các mốc clause bắt buộc xuất hiện
  theo đúng thứ tự.
- [ ] Kiểm tra task id/prompt không mơ hồ và toàn bộ task có guide hoàn chỉnh.
- [ ] Kiểm tra manifest bao phủ đúng mọi `audioId`, nội dung manifest trùng
  `answer`, loại nguồn đúng với stage và file WAV hợp lệ.
- [ ] Chạy test để xác nhận RED với dữ liệu 16 task hiện tại.

### Task 2: Biên soạn lại dữ liệu Exercise 1

**Files:**
- Modify: `data/courses/listening-song-ngu-sample.json`

- [ ] Kiểm âm transcript và giữ tên riêng ở trạng thái đã xác nhận.
- [ ] Viết lại 8 `taskGroups` theo chuỗi object -> inflection -> phrase ->
  clause -> sentence.
- [ ] Chỉ giới thiệu bridge word trong cụm/mệnh đề có nghĩa.
- [ ] Tái sử dụng `television`, `wall`, `tomorrow`, `office` giữa các câu thay
  vì dạy lại như từ mới.
- [ ] Viết guide theo ngữ cảnh cho `the`, số nhiều, `that`, `would like to`,
  `it looks like`, `have to`, `before`, `to make sure`, `however`.
- [ ] Bật `paragraphTaskMode: cumulative`, dùng WAV và giữ mỗi nhóm kết thúc
  bằng transcript gốc.

### Task 3: Mở rộng dữ liệu IPA cho bài nghe

**Files:**
- Modify: `js/pronunciation.mjs`
- Modify: `tests/listening-course.test.mjs`

- [ ] Liệt kê mọi word form mới trong các task của course nghe.
- [ ] Bổ sung IPA Anh-Mỹ đơn giản cho các word form còn thiếu.
- [ ] Kiểm tra không còn mục IPA rỗng trong guide của các đơn vị ngắn.

### Task 4: Chuẩn hóa pipeline và manifest audio

**Files:**
- Modify: `tools/export-audio-tasks.mjs`
- Modify: `tools/generate-american-audio.ps1`
- Modify: `tools/build-listening-sample-assets.py`
- Modify: `tools/listening-sample-clips.json`
- Create: `data/audio/listening-song-ngu-sample.json`

- [ ] Cho exporter nhận đường dẫn course và chỉ xuất task sư phạm.
- [ ] Cho script giọng Mỹ nhận course/manifest/output, sinh một WAV cho mỗi
  task sư phạm và xác nhận voice `en-US`.
- [ ] Đổi công cụ cắt clip gốc sang WAV PCM và dùng `audioId` riêng cho task
  sentence.
- [ ] Ghép clip câu gốc thành `G2` đến `G8`.
- [ ] Sinh manifest có `audioId`, `answer`, `sourceType`, source clip/timestamp
  hoặc danh sách clip thành phần.
- [ ] Chỉ cho phép chia sẻ `audioId` khi các answer giống hệt nhau.

### Task 5: Sinh và xác thực tài sản audio

**Files:**
- Replace: `assets/audio/listening-song-ngu-sample/*.mp3`
- Create: `assets/audio/listening-song-ngu-sample/*.wav`

- [ ] Sinh WAV giọng Mỹ cho object, inflection, phrase và clause.
- [ ] Cắt 8 câu hoàn chỉnh từ MP3 gốc sang WAV.
- [ ] Ghép 7 file hội thoại cộng dồn.
- [ ] Kiểm tra mọi WAV có header RIFF/WAVE, dung lượng khác rỗng và được
  manifest tham chiếu đúng một cách hợp lệ.

### Task 6: Kiểm thử tích hợp

**Files:**
- Modify only when a failing test exposes a real issue.

- [ ] Chạy `node --test tests/listening-course.test.mjs
  tests/course-catalog.test.mjs`.
- [ ] Chạy toàn bộ `node --test`.
- [ ] Kiểm tra `git diff --check` và không còn MP3 runtime cũ.

### Task 7: Kiểm tra trải nghiệm trên trình duyệt

**Files:**
- Modify only when browser verification exposes a real issue.

- [ ] Mở course picker trên local server và xác nhận thẻ bài nghe hiển thị đúng
  8 câu cùng tổng task mới.
- [ ] Mở task đầu, kiểm tra guide, IPA, audio và chuyển sang exercise.
- [ ] Kiểm tra một task ở giữa có guide theo ngữ cảnh và audio đúng answer.
- [ ] Kiểm tra desktop và mobile không có nội dung chồng lấn hoặc lỗi console.

### Task 8: Hoàn tất

- [ ] Commit học liệu, tooling, audio và test thành một mốc triển khai.
- [ ] Báo số task/audio cuối cùng, kết quả test và những điểm cần kiểm âm thêm
  nếu còn.
