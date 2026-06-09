# Contextual Guidance Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rule-based, context-aware guide explanations for common grammar and composition patterns in the Article Mastery lesson flow.

**Architecture:** Keep the public task and guide shape unchanged. Add small pure helper functions inside `js/guidance.mjs` that return a richer explanation string when a task matches a known pattern, then fall back to the existing generic explanation.

**Tech Stack:** Vanilla JavaScript ES modules, Node built-in test runner, static GitHub Pages-compatible assets.

---

### Task 1: Add Guidance Pattern Tests

**Files:**
- Modify: `tests/learning.test.mjs`

- [ ] **Step 1: Add targeted assertions for contextual guidance**

Append this test after the existing guidance-related tests in `tests/learning.test.mjs`:

```js
test("adds contextual explanations for grammar and connector patterns", () => {
  const tasks = buildLessonTasks();
  const byId = new Map(tasks.map((task) => [task.id, task]));

  assert.match(byId.get("S2-06").guide.explanation, /the.*xác định/i);
  assert.match(byId.get("S2-14").guide.explanation, /an.*âm/i);
  assert.match(byId.get("S4-11").guide.explanation, /số nhiều.*child/i);
  assert.match(byId.get("S3-10").guide.explanation, /would.*sẽ/i);
  assert.match(byId.get("S6-09").guide.explanation, /although.*mặc dù/i);
  assert.match(byId.get("S4-31").guide.explanation, /where.*nơi/i);
  assert.match(byId.get("S6-07").guide.explanation, /how.*cách mà/i);
  assert.match(byId.get("S7-11").guide.explanation, /when.*khi/i);
  assert.match(byId.get("S5-20").guide.explanation, /encourage.*to do/i);
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
node --test tests/learning.test.mjs
```

Expected: FAIL because the current generic explanations do not include the contextual keywords.

### Task 2: Implement Contextual Explanation Rules

**Files:**
- Modify: `js/guidance.mjs`

- [ ] **Step 1: Add helper functions**

In `js/guidance.mjs`, add pure helper functions after `specialGuides` and before `genericExplanation`:

```js
function startsWithWord(value, word) {
  return value.toLowerCase().startsWith(`${word} `);
}

function isDirectExpansion(task, previousTask) {
  return (
    previousTask?.sentenceId === task.sentenceId &&
    task.answer.toLowerCase().includes(previousTask.answer.toLowerCase())
  );
}

function inflectionExplanation(task, previousTask) {
  if (task.stage !== "inflection" || previousTask?.sentenceId !== task.sentenceId) {
    return null;
  }

  return `“${task.answer}” là dạng số nhiều của “${previousTask.answer}”, có nghĩa là “${task.prompt}”. Hãy học riêng bước này để không nhầm một đối tượng với nhiều đối tượng.`;
}

function articleExplanation(task) {
  const answer = task.answer.toLowerCase();

  if (startsWithWord(answer, "the")) {
    return `Cụm “${task.answer}” dùng “the” vì người nói đang chỉ một đối tượng đã xác định trong ngữ cảnh bài. Ở bước này, hãy giữ “the” như một phần bắt buộc của cụm.`;
  }

  if (startsWithWord(answer, "an")) {
    return `Cụm “${task.answer}” dùng “an” để nói về một đối tượng đếm được, và “an” đứng trước âm mở đầu như trong “${task.answer.split(" ")[1]}”.`;
  }

  if (startsWithWord(answer, "a")) {
    return `Cụm “${task.answer}” dùng “a” để nói về một đối tượng đếm được chưa cần xác định là đối tượng nào.`;
  }

  return null;
}

function wouldExplanation(task) {
  if (task.stage !== "clause" || !/\bwould\b/i.test(task.answer)) {
    return null;
  }

  return `Trong “${task.answer}”, “would” diễn đạt ý “sẽ/có thể sẽ” trong lời phàn nàn hoặc dự đoán, không phải một hành động đang xảy ra ngay lúc này.`;
}

function connectorExplanation(task) {
  const answer = task.answer.toLowerCase();

  if (startsWithWord(answer, "although")) {
    return `“Although” có nghĩa là “mặc dù”. Phần sau “although” tạo nền tương phản, còn mệnh đề còn lại nói ý chính của câu.`;
  }

  if (startsWithWord(answer, "where")) {
    return `“Where” mở đầu phần bổ nghĩa cho một nơi chốn. Ở đây nó giúp nói rõ nơi đó là nơi trẻ em, người lớn tuổi và nhân viên văn phòng có thể làm gì.`;
  }

  if (startsWithWord(answer, "how")) {
    return `“How” có nghĩa là “cách mà”. Cụm “${task.answer}” nói về cách mọi người nghĩ về không gian chung.`;
  }

  if (startsWithWord(answer, "when")) {
    return `“When” có nghĩa là “khi”. Phần này nối điều kiện/thời điểm với ý chính: sự thay đổi có tác động khi mọi người cảm thấy nó thuộc về họ.`;
  }

  return null;
}

function encourageToExplanation(task) {
  if (!/\bencouraged\b/i.test(task.answer) || !/\bto (use|place)\b/i.test(task.answer)) {
    return null;
  }

  return `Cấu trúc “encourage someone to do something” nghĩa là khuyến khích ai đó làm việc gì. Trong câu này, dự án khuyến khích các cửa hàng “to use” và “to place”.`;
}

function expansionExplanation(task, previousTask) {
  if (!isDirectExpansion(task, previousTask) || task.stage === "inflection") {
    return null;
  }

  return `Bước này mở rộng từ “${previousTask.answer}” thành “${task.answer}”. Hãy chú ý lớp nghĩa mới được thêm vào để cụm gần hơn với câu gốc.`;
}

function contextualExplanation(task, previousTask) {
  return (
    inflectionExplanation(task, previousTask) ??
    encourageToExplanation(task) ??
    connectorExplanation(task) ??
    wouldExplanation(task) ??
    articleExplanation(task) ??
    expansionExplanation(task, previousTask)
  );
}
```

- [ ] **Step 2: Use contextual explanations before generic fallback**

Update the returned `explanation` in `createGuidance()` from:

```js
explanation: genericExplanation(task, previousTask),
```

to:

```js
explanation:
  contextualExplanation(task, previousTask) ??
  genericExplanation(task, previousTask),
```

- [ ] **Step 3: Run the targeted test**

Run:

```bash
node --test tests/learning.test.mjs
```

Expected: PASS.

### Task 3: Verify Full App Invariants

**Files:**
- Verify: `tests/*.mjs`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
node --test
```

Expected: all tests pass, including static-site, speech, mastery, lesson-flow, and learning tests.

- [ ] **Step 2: Inspect git diff**

Run:

```bash
git diff -- js/guidance.mjs tests/learning.test.mjs docs/superpowers/plans/2026-06-09-contextual-guidance-rules.md
```

Expected: only contextual guidance code, tests, and this plan changed.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add js/guidance.mjs tests/learning.test.mjs docs/superpowers/plans/2026-06-09-contextual-guidance-rules.md
git commit -m "Enrich lesson guidance explanations"
```

Expected: commit succeeds. Leave unrelated untracked files untouched.
