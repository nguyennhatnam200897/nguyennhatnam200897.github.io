# Vanilla Static Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển webapp từ React/Vite sang HTML, CSS và JavaScript thuần để chạy trực tiếp trên GitHub Pages mà không cần cài đặt hoặc build.

**Architecture:** `index.html` chứa cấu trúc màn hình học tĩnh; `styles.css` chịu trách nhiệm trình bày; `js/article.mjs` chứa học liệu và sinh nhiệm vụ; `js/learning.mjs` chấm đáp án; `js/app.mjs` quản lý DOM, tiến độ và tương tác. Các module dùng đường dẫn tương đối để website hoạt động khi repository được xuất bản trong một thư mục con của GitHub Pages.

**Tech Stack:** HTML5, CSS3, ECMAScript modules, Web Storage API, Node built-in test runner.

---

### Task 1: Khóa hành vi bằng kiểm thử Node thuần

**Files:**
- Create: `tests/learning.test.mjs`
- Create: `tests/static-site.test.mjs`

- [x] Viết kiểm thử cho chuẩn hóa câu trả lời, lỗi chặn, thứ tự nhiệm vụ và việc không sinh bài IPA.
- [x] Viết kiểm thử cấu trúc website tĩnh: chỉ dùng đường dẫn tương đối, không tham chiếu React/Vite/JSX và không cần `package.json`.
- [x] Chạy `node --test tests/learning.test.mjs tests/static-site.test.mjs`.
- [x] Xác nhận kiểm thử thất bại vì các module JavaScript thuần và cấu trúc website tĩnh chưa tồn tại.

### Task 2: Chuyển học liệu và luật chấm sang module thuần

**Files:**
- Create: `js/article.mjs`
- Create: `js/learning.mjs`
- Test: `tests/learning.test.mjs`

- [x] Chuyển học liệu đang dùng sang `js/article.mjs` và giữ nguyên ID nhiệm vụ.
- [x] Chuyển `normalizeTextAnswer()` và `evaluateAnswer()` sang `js/learning.mjs`.
- [x] Chạy kiểm thử Node và xác nhận toàn bộ kiểm thử logic vượt qua.

### Task 3: Dựng giao diện và luồng học bằng DOM API

**Files:**
- Modify: `index.html`
- Create: `styles.css`
- Create: `js/app.mjs`

- [x] Tạo cấu trúc HTML semantic gồm thanh tiến độ, prompt, textarea, nút kiểm tra, phản hồi và trạng thái hoàn thành.
- [x] Chuyển CSS hiện tại sang `styles.css` mà không thay đổi phong cách tối giản.
- [x] Cài đặt luồng học bằng DOM API: Enter để kiểm tra, sai thì hiện đáp án và giữ nguyên bài, Enter lần hai để làm lại, đúng thì tự chuyển sau 1,4 giây.
- [x] Giữ khóa tiến độ `article-mastery-progress-v3` để không làm mất tiến độ hiện có.
- [x] Tự focus textarea sau khi làm lại và sau khi chuyển bài.

### Task 4: Xác minh tương thích GitHub Pages

**Files:**
- Test: `tests/static-site.test.mjs`

- [x] Chạy website từ một đường dẫn con mô phỏng `/<repository-name>/`.
- [x] Kiểm tra trang tải không trắng và không có lỗi console.
- [x] Kiểm tra nhập sai, làm lại, nhập đúng, tự chuyển và focus.
- [x] Kiểm tra desktop và mobile không tràn hoặc chồng nội dung.

### Task 5: Gỡ toolchain cũ và hoàn tất website tĩnh

**Files:**
- Delete: `src/`
- Delete: `dist/`
- Delete: `node_modules/`
- Delete: `package.json`
- Delete: `package-lock.json`
- Delete: các log Vite cũ
- Modify: `docs/superpowers/specs/2026-06-03-article-mastery-english-app-design.md`

- [x] Gỡ React, Vite, Lucide và toàn bộ sản phẩm build cũ sau khi QA giao diện đã đạt.
- [x] Chạy lại kiểm thử bằng Node thuần để chứng minh dự án không phụ thuộc npm.
- [x] Khởi động một HTTP server tĩnh và xác nhận `index.html`, CSS cùng các module trả về HTTP 200.

Lưu ý: workspace hiện không phải Git repository nên kế hoạch không có bước commit.
