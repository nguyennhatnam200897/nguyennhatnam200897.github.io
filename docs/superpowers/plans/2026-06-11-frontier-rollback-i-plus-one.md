# Frontier Rollback i+1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make only the `Gentle i+1` course practice the current frontier task and roll back to embedded prerequisite tasks only when a wrong answer proves that prerequisite failed.

**Architecture:** `js/course-model.mjs` generates rollback target spans for the experiment course. `js/learning.mjs` exposes the first blocking token issue. `js/mastery.mjs` builds frontier groups for the experiment policy and manages short repair state; default courses keep the existing rolling scheduler.

**Tech Stack:** Vanilla JavaScript ES modules, Node built-in test runner, static JSON course data.

---

### Task 1: Token Issue Metadata

**Files:**
- Modify: `js/learning.mjs`
- Test: `tests/learning.test.mjs`

- [ ] **Step 1: Write the failing test**

Add a test that calls `evaluateAnswer({ answer: "many cities" }, "many cite")`
and asserts `result.issue` is:

```js
{
  index: 1,
  actual: "cite",
  expected: "cities",
  type: "mismatch"
}
```

- [ ] **Step 2: Run the focused test**

Run: `node --test tests\learning.test.mjs`

Expected: fail because `issue` is missing.

- [ ] **Step 3: Implement metadata**

Refactor `firstTokenIssue()` to return an object with `message`, `index`,
`actual`, `expected`, and `type`, while preserving the current user-facing
message strings.

- [ ] **Step 4: Re-run focused test**

Run: `node --test tests\learning.test.mjs`

Expected: pass.

### Task 2: Rollback Target Generation

**Files:**
- Modify: `js/course-model.mjs`
- Test: `tests/course-model.test.mjs`

- [ ] **Step 1: Write the failing test**

Load `small-public-garden-gentle-i1.json`, build the course, find `S1-03`, and
assert one rollback target points to `S1-02` with `start: 1` and `end: 2`.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests\course-model.test.mjs`

Expected: fail because `rollbackTargets` is missing.

- [ ] **Step 3: Implement rollback spans**

For `gentle-i-plus-one`, attach rollback targets by finding previous non-bridge
task answers whose normalized token sequence appears inside the current answer.
Store the smallest useful spans on the task.

- [ ] **Step 4: Re-run focused test**

Run: `node --test tests\course-model.test.mjs`

Expected: pass.

### Task 3: Frontier Scheduler and Repair State

**Files:**
- Modify: `js/mastery.mjs`
- Test: `tests/mastery.test.mjs`

- [ ] **Step 1: Write failing scheduler tests**

Add tests that:

- build frontier groups from `cities` and `many cities`;
- confirm groups are `[["cities"], ["many-cities"]]`;
- answer `cities` correctly twice and move to `many-cities`;
- answer `many-cities` wrong with issue index `1` and roll back to `cities`;
- answer the repair `cities` correctly once and return to `many-cities`;
- answer `many-cities` wrong with issue index `0` and stay on `many-cities`.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests\mastery.test.mjs`

Expected: fail because frontier mode and repair state are missing.

- [ ] **Step 3: Implement frontier mode**

Add `mode: "frontier-rollback"` support in `buildPracticeGroups()`. Frontier
groups contain one task, use `minCorrect: 2`, and set
`requiresInterleavedCorrect: false`.

- [ ] **Step 4: Implement repair state**

Add `repair` to session serialization/restoration. When a wrong attempt has a
matching rollback target, set `repair` to the chosen task and return it from
`getCurrentTaskId()`. Clear repair after one correct repair answer.

- [ ] **Step 5: Re-run focused test**

Run: `node --test tests\mastery.test.mjs`

Expected: pass.

### Task 4: App Retry Integration

**Files:**
- Modify: `js/app.mjs`
- Test: `tests/static-site.test.mjs`

- [ ] **Step 1: Write the failing static test**

Assert `handleFailedRetry()` compares the failed task id with `currentTaskId()`
and calls `showCurrentTask({ forceGuide: true })` when the scheduler points to a
different task.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests\static-site.test.mjs`

Expected: fail because retry always revisits the failed task.

- [ ] **Step 3: Implement retry handoff**

In `handleFailedRetry()`, if the scheduler's current task differs from
`activeTask().id`, call `showCurrentTask({ forceGuide: true })`. Otherwise keep
the existing same-task guide retry.

- [ ] **Step 4: Re-run focused test**

Run: `node --test tests\static-site.test.mjs`

Expected: pass.

### Task 5: Full Verification

**Files:**
- Verify all touched files.

- [ ] **Step 1: Run all tests**

Run: `node --test tests\*.test.mjs`

Expected: all tests pass.

- [ ] **Step 2: Check diff hygiene**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 3: Inspect summary**

Run: `git diff --stat`

Expected: changes are limited to the experiment scheduler, evaluator metadata,
tests, and docs.
