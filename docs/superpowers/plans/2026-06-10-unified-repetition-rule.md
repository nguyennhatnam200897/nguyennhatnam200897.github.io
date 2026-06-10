# Unified Repetition Rule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Áp dụng cùng cấu trúc nhóm chồng lấp và cùng ngưỡng thành thạo mới cho Bài 1, Bài 2 và mọi course tạo sau này.

**Architecture:** `buildPracticeGroups(tasks)` chỉ còn một đường tạo nhóm theo cửa sổ chồng lấp trong từng `sentenceId`; không còn danh sách task dành riêng cho Bài 1. `MASTERY_RULE` giữ nguyên contract nhưng đổi ngưỡng, còn `sessionVersion` của từng course được tăng để tách tiến độ mới khỏi dữ liệu cũ.

**Tech Stack:** Vanilla ES modules, JSON course data, Node `node:test`, browser `localStorage`.

---

### Task 1: Khóa quy tắc chung bằng kiểm thử thất bại

**Files:**
- Modify: `tests/mastery.test.mjs`
- Modify: `tests/listening-course.test.mjs`
- Modify: `tests/course-model.test.mjs`

- [ ] **Step 1: Đổi kỳ vọng nhóm đầu của Bài 1**

Thay kiểm thử nhóm thủ công bằng:

```js
test("uses the same overlapping groups for lesson one", () => {
  assert.deepEqual(
    groups.slice(0, 4).map((practiceGroup) => practiceGroup.taskIds),
    [
      ["S1-01", "S1-02"],
      ["S1-01", "S1-02", "S1-03"],
      ["S1-01", "S1-02", "S1-03", "S1-04"],
      ["S1-02", "S1-03", "S1-04", "S1-05"],
    ]
  );
});
```

- [ ] **Step 2: Khóa ngưỡng hai lần đúng**

Trong `tests/mastery.test.mjs`, thay chuỗi sáu lượt đúng bằng:

```js
[
  "S1-01",
  "S1-02",
  "S1-01",
  "S1-02",
].forEach((taskId) => {
  session = recordMasteryAttempt(session, groups, taskId, true);
});

assert.equal(MASTERY_RULE.minCorrect, 2);
assert.equal(MASTERY_RULE.minStreak, 1);
assert.equal(MASTERY_RULE.requiresInterleavedCorrect, true);
assert.equal(session.groupIndex, 1);
```

Thêm một kiểm thử chứng minh hai lần đúng liên tiếp cho cùng task nhưng chưa
được xen bởi task khác không đủ thành thạo bằng cách gọi nhóm giả lập và kiểm
tra `groupIndex` vẫn bằng `0`.

- [ ] **Step 3: Khóa phiên bản tiến độ mới**

Trong `tests/course-model.test.mjs`:

```js
assert.equal(course.sessionVersion, 2);
```

Trong `tests/listening-course.test.mjs`:

```js
assert.equal(course.sessionVersion, 6);
```

Thêm kiểm thử Bài 2 qua nhóm đầu sau chuỗi:

```js
[
  "LS1-01-01",
  "LS1-01-02",
  "LS1-01-01",
  "LS1-01-02",
]
```

- [ ] **Step 4: Chạy kiểm thử và xác nhận RED**

Run:

```text
node --test tests/mastery.test.mjs tests/listening-course.test.mjs tests/course-model.test.mjs
```

Expected: FAIL vì Bài 1 vẫn dùng `[S1-01, S1-04]`, ngưỡng vẫn là `3/2`, và
hai course vẫn có `sessionVersion` cũ.

### Task 2: Cài đặt scheduler và reset tiến độ

**Files:**
- Modify: `js/mastery.mjs`
- Modify: `data/courses/small-public-garden.json`
- Modify: `data/courses/listening-song-ngu-sample.json`

- [ ] **Step 1: Đổi ngưỡng mastery**

```js
export const MASTERY_RULE = {
  minCorrect: 2,
  minStreak: 1,
  requiresInterleavedCorrect: true,
};
```

- [ ] **Step 2: Xóa nhóm riêng của Bài 1**

Xóa `manualGroups` và `isManualTask()`. Đổi `buildPracticeGroups()` thành:

```js
export function buildPracticeGroups(tasks) {
  return buildRollingGroups(tasks);
}
```

`buildRollingGroups()` hiện có tiếp tục tạo `AB`, `ABC`, `ABCD`, `BCDE` trong
từng `sentenceId`.

- [ ] **Step 3: Tăng phiên bản session**

Trong Bài 1:

```json
"sessionVersion": 2
```

Trong Bài 2:

```json
"sessionVersion": 6
```

- [ ] **Step 4: Chạy targeted tests và xác nhận GREEN**

Run:

```text
node --test tests/mastery.test.mjs tests/listening-course.test.mjs tests/course-model.test.mjs
```

Expected: toàn bộ targeted tests PASS.

### Task 3: Đồng bộ tài liệu và xác minh toàn hệ thống

**Files:**
- Modify: `docs/superpowers/specs/2026-06-08-interleaved-mastery-loop-design.md`
- Modify: `docs/superpowers/specs/2026-06-10-listening-sample-course-design.md`

- [ ] **Step 1: Đồng bộ tài liệu cũ**

Đổi mọi mô tả ngưỡng `3 lần đúng / chuỗi 2` thành `2 lần đúng / chuỗi 1`, và
xóa mô tả nhóm đầu Bài 1 là `city + life`. Ghi rõ mọi khóa dùng cửa sổ chung:

```text
[A, B] -> [A, B, C] -> [A, B, C, D] -> [B, C, D, E]
```

- [ ] **Step 2: Chạy toàn bộ kiểm thử**

Run:

```text
node --test
```

Expected: tất cả tests PASS, không có fail hoặc skip.

- [ ] **Step 3: Kiểm tra thay đổi**

Run:

```text
git diff --check
git status --short
```

Expected: không có lỗi whitespace; chỉ các file trong kế hoạch thay đổi.

- [ ] **Step 4: Kiểm tra trình duyệt**

Chạy static server, mở Bài 1 và Bài 2, xác nhận:

- task đầu đúng một lần sẽ mở task thứ hai;
- sau vòng `A, B, A, B`, tiến độ chuyển sang nhóm tiếp theo;
- console không có lỗi;
- storage key của Bài 1 kết thúc `:v2`, Bài 2 kết thúc `:v6`.
