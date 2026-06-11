# Gentle i+1 experiment course design

## Goal

Create a new experiment course cloned from lesson one so the learner can compare
the current progression with a softer i+1 progression without changing existing
courses.

Update: the experiment's repetition model is now refined by
`2026-06-11-frontier-rollback-i-plus-one-design.md`. Bridge tasks stay, but the
course no longer uses unconditional overlapping review for old tasks.

The experiment applies two ideas:

1. Add bridge tasks before larger jumps.
2. Slow down task introduction so a new task opens only after the latest task has
   been answered correctly more than once.

## Scope

- Clone `data/courses/small-public-garden.json` to a new course file.
- Add the cloned course to `data/courses.json`.
- Keep the original lesson one and the listening sample unchanged by default.
- Reuse the same article text, Vietnamese prompts, audio assets, and broad
  American pronunciation support.
- Keep speech-to-text as input support only; it does not affect scoring.

## Course contract

The cloned course uses:

- `id`: `small-public-garden-gentle-i1`
- `title`: `A Small Public Garden - Gentle i+1`
- `practiceProfile`: `gentle-i-plus-one`
- `sessionVersion`: `1`

The course model turns this profile into a `practicePolicy` object consumed by
the mastery scheduler.

## Bridge tasks

Bridge tasks are generated at build time for the experiment course only.

They are inserted immediately before a target task when the target is a larger
step than the previous task in the same sentence or paragraph chain. A larger
step is currently defined as:

- the answer grows by at least three English words; or
- the target is a full sentence or paragraph.

A bridge task:

- keeps the same answer as the target task;
- reuses the target task audio;
- adds a light answer frame to the prompt;
- carries `isBridge: true` and `bridgeForTaskId`;
- appears before the original target task.

This gives the learner one scaffolded pass, then the normal prompt.

## Gentle introduction cadence

Existing courses keep the current cadence:

- a new task can be introduced after one correct answer on the latest task;
- each group still advances only when every task meets the shared mastery rule:
  at least two correct answers, including one correct answer after another task
  has intervened.

The experiment course now uses `frontier-rollback` cadence:

- each frontier task is practiced until it is correct twice;
- earlier tasks hidden inside the frontier task do not appear again by default;
- an earlier task appears again only when the wrong answer shows that embedded
  part failed.

This keeps the learner moving through i+1 instead of repeatedly dropping back to
already-covered i steps.

## Non-goals

- Do not alter scoring rules for existing courses.
- Do not create new audio.
- Do not grade pronunciation or speech-to-text.
- Do not manually rewrite the whole lesson one curriculum.

## Verification

Tests should prove:

- lesson one still has the same task count and default grouping behavior;
- the new course builds from its cloned data;
- the new course has generated bridge tasks and more tasks than lesson one;
- bridge tasks reuse the target answer and audio;
- default courses do not receive bridge tasks or delayed introduction;
- the experiment course passes its `practicePolicy` into the scheduler;
- the scheduler practices only the frontier task unless a targeted repair is
  triggered.
