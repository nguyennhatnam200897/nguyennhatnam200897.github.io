# Interleaved Mastery Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay luồng qua bài tuyến tính bằng vòng luyện xen kẽ trong từng cụm/câu, để một đơn vị chỉ được qua khi đạt tiêu chí thành thạo đã chốt.

**Architecture:** Thêm `js/mastery.mjs` làm scheduler thuần: tạo nhóm luyện, theo dõi thống kê thành thạo, chọn nhiệm vụ kế tiếp và tính tiến độ. `app.mjs` dùng scheduler để quyết định khi nào hiện hướng dẫn, khi nào hiện thẳng bài tập, và khi nào mở nhóm i+1 tiếp theo. `lesson-flow.mjs` chỉ giữ trạng thái hiển thị hướng dẫn/bài tập.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Web Speech API, Node.js built-in test runner.

**Trạng thái:** Đã triển khai và kiểm tra tự động ngày 2026-06-08.

---

### Task 1: Scheduler thành thạo

**Files:**
- Create: `js/mastery.mjs`
- Create: `tests/mastery.test.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Write failing tests**

Kiểm thử cần chứng minh:

```js
const groups = buildPracticeGroups(tasks);
assert.deepEqual(groups[0].taskIds, ["S1-01", "S1-04"]);
assert.ok(groups.every((group) => group.taskIds.length >= 2 && group.taskIds.length <= 4));
```

Và:

```js
let session = createMasterySession(groups);
assert.equal(getCurrentTaskId(session, groups), "S1-01");
session = recordMasteryAttempt(session, groups, "S1-01", true);
assert.equal(getCurrentTaskId(session, groups), "S1-04");
session = recordMasteryAttempt(session, groups, "S1-04", true);
assert.equal(getCurrentTaskId(session, groups), "S1-01");
assert.equal(session.groupIndex, 0);
```

Sau một lần đúng mỗi đơn vị, nhóm vẫn chưa được qua.

- [ ] **Step 2: Run RED**

Run:

```powershell
node --test .\tests\mastery.test.mjs .\tests\static-site.test.mjs
```

Expected: FAIL vì `js/mastery.mjs` chưa tồn tại và `app.mjs` chưa nhập scheduler.

- [ ] **Step 3: Implement scheduler**

`mastery.mjs` xuất:

```js
MASTERY_RULE
buildPracticeGroups(tasks)
createMasterySession(groups)
restoreMasterySession(value, groups)
serializeMasterySession(session)
getCurrentGroup(session, groups)
getCurrentTaskId(session, groups)
isTaskIntroduced(session, taskId)
recordMasteryAttempt(session, groups, taskId, correct)
calculateMasteryProgress(session, groups)
```

Quy tắc:

- nhóm đầu câu 1 là `city + life`;
- mỗi nhóm có 2 đến 4 đơn vị;
- một đơn vị đạt khi đúng 3 lần, có streak 2, và có đúng sau khi bị xen;
- sai reset thống kê của đơn vị đó trong nhóm hiện tại;
- khi cả nhóm đạt, tăng `groupIndex` và mở nhóm tiếp theo.

- [ ] **Step 4: Run GREEN**

Run:

```powershell
node --test .\tests\mastery.test.mjs
```

Expected: scheduler tests pass.

### Task 2: Tích hợp vào webapp

**Files:**
- Modify: `js/app.mjs`
- Modify: `js/lesson-flow.mjs`
- Modify: `tests/lesson-flow.test.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Adapt flow tests**

Cho phép `createLessonFlow(activeIndex, { phase: "exercise" })` để app mở thẳng bài tập khi task đã được giới thiệu trong vòng luyện.

- [ ] **Step 2: Run RED/GREEN for flow**

Run:

```powershell
node --test .\tests\lesson-flow.test.mjs
```

Expected: tests pass after update.

- [ ] **Step 3: Integrate scheduler**

`app.mjs` phải:

- lưu session bằng `article-mastery-session-v1`;
- tính active task từ scheduler;
- task mới hoặc task vừa sai thì hiện hướng dẫn;
- task đã giới thiệu trong vòng luyện thì hiện thẳng bài nhập;
- câu đúng ghi thống kê vào scheduler, chờ âm thanh, rồi chọn task tiếp theo;
- câu sai phát đáp án, Enter quay lại hướng dẫn cùng task và reset thống kê task đó;
- tiến độ lấy từ `calculateMasteryProgress`.

- [ ] **Step 4: Run all tests**

Run:

```powershell
node --test .\tests\learning.test.mjs .\tests\lesson-flow.test.mjs .\tests\speech.test.mjs .\tests\mastery.test.mjs .\tests\static-site.test.mjs
```

Expected: all tests pass.

### Task 3: Tài liệu và kiểm tra trình duyệt

**Files:**
- Modify: `docs/superpowers/specs/2026-06-08-interleaved-mastery-loop-design.md`
- Modify: `docs/superpowers/specs/2026-06-08-guided-introduction-design.md`
- Modify: `docs/superpowers/specs/2026-06-08-b2-i-plus-one-curriculum.md`

- [ ] **Step 1: Mark implementation status**

Ghi rằng vòng luyện xen kẽ đã được tích hợp vào webapp.

- [ ] **Step 2: Browser QA**

Kiểm tra:

```text
city guide -> city exercise -> correct
life guide -> life exercise -> correct
city exercise appears again, not cities
```

Sau đó luyện đủ nhóm đầu để xác nhận mới mở nhóm tiếp theo.

- [ ] **Step 3: Final verification**

Chạy lại toàn bộ test, kiểm tra HTTP 200 cho các module mới và kiểm tra console không lỗi.
