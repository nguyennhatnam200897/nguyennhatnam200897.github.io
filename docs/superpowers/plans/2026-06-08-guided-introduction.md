# Guided Introduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm màn hướng dẫn có phát âm trước từng bài tập, phát đáp án khi nộp, chỉ chuyển bước đúng sau khi âm thanh kết thúc, và đưa câu sai về hướng dẫn của chính bước đó.

**Architecture:** `guidance.mjs` tạo nội dung hướng dẫn từ nhiệm vụ hiện có và ghi đè ba bước đầu bằng giải thích sư phạm cụ thể. `lesson-flow.mjs` quản lý trạng thái thuần giữa hướng dẫn, bài tập, chờ âm thanh và làm lại. `speech.mjs` bọc Web Speech API, ưu tiên giọng Anh-Anh và dùng bộ hẹn giờ dự phòng. `app.mjs` chỉ kết nối dữ liệu, giao diện, trạng thái và âm thanh.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Web Speech API, Node.js built-in test runner.

**Trạng thái:** Đã triển khai và kiểm tra ngày 2026-06-08.

---

### Task 1: Nội dung hướng dẫn

**Files:**
- Create: `js/guidance.mjs`
- Modify: `js/article.mjs`
- Test: `tests/learning.test.mjs`

- [ ] **Step 1: Write the failing tests**

Thêm kiểm thử xác nhận mọi nhiệm vụ có `guide.term`, `guide.meaning`,
`guide.explanation`, `guide.speech`; đồng thời xác nhận:

```js
assert.equal(tasks[0].guide.term, "city");
assert.match(tasks[1].guide.explanation, /số nhiều.*city/i);
assert.match(tasks[2].guide.explanation, /many.*nhiều/i);
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: FAIL vì nhiệm vụ chưa có thuộc tính `guide`.

- [ ] **Step 3: Implement guidance generation**

Tạo:

```js
export function attachGuidance(tasks) {
  return tasks.map((task, index) => ({
    ...task,
    guide: createGuidance(task, tasks[index - 1]),
  }));
}
```

Ba nhiệm vụ `S1-01`, `S1-02`, `S1-03` dùng nội dung riêng. Các nhiệm vụ còn
lại dùng nội dung theo tầng `object`, `inflection`, `phrase`, `clause`,
`sentence`, `paragraph`.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
node --test .\tests\learning.test.mjs
```

Expected: tất cả kiểm thử dữ liệu vượt qua.

### Task 2: Dòng trạng thái hướng dẫn và bài tập

**Files:**
- Create: `js/lesson-flow.mjs`
- Create: `tests/lesson-flow.test.mjs`

- [ ] **Step 1: Write the failing tests**

Kiểm thử trạng thái:

```js
const initial = createLessonFlow(0);
assert.equal(initial.phase, "guide");

const exercise = openExercise(initial);
assert.equal(exercise.phase, "exercise");

const correct = recordSubmission(exercise, { correct: true });
assert.equal(correct.waitingForSpeech, true);

const next = finishCorrectSpeech(correct, 1);
assert.deepEqual(
  { phase: next.phase, activeIndex: next.activeIndex },
  { phase: "guide", activeIndex: 1 }
);

const wrong = recordSubmission(exercise, { correct: false });
assert.equal(revisitFailedGuide(wrong).phase, "guide");
assert.equal(revisitFailedGuide(wrong).activeIndex, 0);
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
node --test .\tests\lesson-flow.test.mjs
```

Expected: FAIL vì `js/lesson-flow.mjs` chưa tồn tại.

- [ ] **Step 3: Implement minimal immutable transitions**

Các hàm xuất ra:

```js
createLessonFlow(activeIndex)
openExercise(flow)
recordSubmission(flow, feedback)
finishCorrectSpeech(flow, nextIndex)
revisitFailedGuide(flow)
```

Không đưa DOM, localStorage hoặc âm thanh vào module này.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
node --test .\tests\lesson-flow.test.mjs
```

Expected: tất cả kiểm thử trạng thái vượt qua.

### Task 3: Bộ phát âm

**Files:**
- Create: `js/speech.mjs`
- Create: `tests/speech.test.mjs`

- [ ] **Step 1: Write the failing tests**

Kiểm thử bộ phát âm:

```js
const player = createSpeechPlayer(fakeEnvironment);
player.speak("city", { onEnd });
assert.equal(fakeUtterance.lang, "en-GB");
fakeUtterance.onend();
assert.equal(endCount, 1);
```

Thêm trường hợp không có Web Speech API: `onEnd` vẫn chạy qua bộ hẹn giờ dự
phòng.

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
node --test .\tests\speech.test.mjs
```

Expected: FAIL vì `js/speech.mjs` chưa tồn tại.

- [ ] **Step 3: Implement speech player**

`createSpeechPlayer(environment)` phải:

- ưu tiên voice `en-GB`, sau đó mới dùng voice tiếng Anh khác;
- đặt `utterance.lang = "en-GB"` và tốc độ chậm vừa phải;
- hủy âm đang phát trước khi phát âm mới;
- chỉ gọi `onEnd` một lần;
- dùng timeout dự phòng nếu API không có hoặc không phát sự kiện kết thúc.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
node --test .\tests\speech.test.mjs
```

Expected: tất cả kiểm thử âm thanh vượt qua.

### Task 4: Giao diện và tích hợp

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Write the failing static tests**

Xác nhận HTML có:

```js
assert.match(html, /id="guide-content"/);
assert.match(html, /id="listen-guide"/);
assert.match(html, /id="continue-guide"/);
```

Xác nhận `app.mjs` nhập `lesson-flow.mjs` và `speech.mjs`.

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
node --test .\tests\static-site.test.mjs
```

Expected: FAIL vì giao diện hướng dẫn chưa tồn tại.

- [ ] **Step 3: Add the guide markup and styling**

Màn hướng dẫn gồm từ/cụm tiếng Anh, nghĩa tiếng Việt, giải thích, vùng ghép
thành phần khi có, nút nghe lại và nút tiếp tục. Màn bài tập hiện tại được giữ
nguyên và chỉ hiện sau khi người học tiếp tục.

- [ ] **Step 4: Integrate flow and speech**

`app.mjs` phải:

- bắt đầu nhiệm vụ chưa hoàn thành ở `phase: "guide"`;
- tự phát `guide.speech` khi màn hướng dẫn xuất hiện;
- Enter ở hướng dẫn mở bài tập;
- nộp bài luôn phát đáp án;
- câu đúng chỉ gọi chuyển bước trong callback kết thúc âm thanh;
- Enter sau câu sai gọi `revisitFailedGuide`;
- tăng phiên bản khóa localStorage để người dùng bắt đầu lại đúng luồng mới.

- [ ] **Step 5: Run all automated tests**

Run:

```powershell
node --test .\tests\learning.test.mjs .\tests\lesson-flow.test.mjs .\tests\speech.test.mjs .\tests\static-site.test.mjs
```

Expected: tất cả kiểm thử vượt qua.

### Task 5: Tài liệu và kiểm tra trình duyệt

**Files:**
- Modify: `docs/superpowers/specs/2026-06-08-b2-i-plus-one-curriculum.md`
- Modify: `docs/superpowers/specs/2026-06-08-guided-introduction-design.md`

- [ ] **Step 1: Update curriculum rules**

Ghi rõ mỗi nhiệm vụ có nhịp hướng dẫn trước bài tập, âm thanh khi nộp và quy
tắc quay lại hướng dẫn nếu sai.

- [ ] **Step 2: Verify desktop flow in Browser**

Kiểm tra:

```text
city guide -> Enter -> city exercise -> correct city
-> speech end -> cities guide
```

Sau đó kiểm tra:

```text
cities guide -> exercise -> wrong answer -> Enter
-> cities guide -> exercise again
```

- [ ] **Step 3: Verify browser health**

Xác nhận URL, tiêu đề, nội dung không trống, không có overlay lỗi, không có lỗi
console và các tệp tĩnh đều trả HTTP 200.

- [ ] **Step 4: Verify 390 x 800**

Xác nhận không cuộn ngang, nội dung không chồng lấn và hai nút sử dụng thuận
tiện trên màn hình nhỏ.

- [ ] **Step 5: Run final verification**

Chạy lại toàn bộ kiểm thử tự động và kiểm tra HTTP ngay trước khi báo hoàn tất.
