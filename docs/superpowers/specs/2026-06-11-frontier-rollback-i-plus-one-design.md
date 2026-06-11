# Frontier rollback i+1 design

## Goal

Change only the `Gentle i+1` experiment course from unconditional overlapping
review to true i+1 frontier practice.

Once a learner moves from `i` to `i+1`, the app should not ask `i` again just
because it appears in the old rolling window. It should return to `i` only when
the learner's wrong answer to `i+1` shows that the embedded `i` part is broken.

## Example

Sequence:

1. `cities`
2. `many cities`

After `cities` is learned, `many cities` becomes the active frontier. The app
does not ask `cities` again while `many cities` is being learned.

If the learner answers `many cite`, the first blocking token issue is inside the
embedded `cities` span, so the next repair task is `cities`.

If the learner answers `cities`, the first blocking token issue is `many`, so
the app stays on `many cities` rather than falling back to `cities`.

## Scope

- Applies only to courses whose `practiceProfile` is `gentle-i-plus-one`.
- Existing lesson one and listening courses keep the overlapping groups and the
  shared interleaved mastery rule.
- Speech-to-text remains input support only; it never changes scoring.
- The exact-answer rule stays intact.

## Practice policy

`buildLessonCourse()` maps `gentle-i-plus-one` to:

```js
{
  mode: "frontier-rollback",
  minCorrect: 2,
  repairCorrectCount: 1
}
```

`buildPracticeGroups()` uses the policy to build one frontier group per task.
The group advances after the current task is correct twice. It does not require
interleaved correctness because old tasks are intentionally hidden unless repair
is needed.

## Rollback targets

For the experiment course, each task receives `rollbackTargets` generated from
previous non-bridge tasks in the same sentence or paragraph chain.

A rollback target stores:

- `taskId`: the previous task to repair;
- `start`: the start token index inside the current task answer;
- `end`: the exclusive end token index.

When a blocking answer has a first token issue, the scheduler picks the smallest
rollback target whose token span contains that issue. This makes `many cite`
return to `cities`, not to the broader `many cities`.

## Repair behavior

When rollback is triggered:

1. The current frontier task records a wrong attempt.
2. `getCurrentTaskId()` returns the repair task.
3. The app's `Học lại` path follows the scheduler if the scheduler points to a
   different task.
4. One correct repair answer clears the repair state.
5. The learner returns to the original frontier task.

If no rollback target matches the error, the app keeps the current failed task
as before.

## Verification

Tests should prove:

- default courses still use overlapping groups;
- `Gentle i+1` uses one-task frontier groups;
- `many cite` on `many cities` rolls back to `cities`;
- an error in `many` does not roll back to `cities`;
- one correct repair returns to the frontier task;
- `evaluateAnswer()` exposes the first blocking token issue;
- app retry follows the scheduler when a repair task is active.
