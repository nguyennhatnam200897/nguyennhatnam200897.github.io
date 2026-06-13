import test from "node:test";
import assert from "node:assert/strict";
import {
  createLessonFlow,
  finishCorrectSpeech,
  openExercise,
  openGuide,
  recordSubmission,
  revisitFailedGuide,
} from "../js/lesson-flow.mjs";

test("starts every unfinished task in its guide", () => {
  const flow = createLessonFlow(0);

  assert.deepEqual(flow, {
    activeIndex: 0,
    phase: "guide",
    feedback: null,
    waitingForSpeech: false,
  });
});

test("can start a known task directly in the exercise phase", () => {
  const flow = createLessonFlow(3, { phase: "exercise" });

  assert.equal(flow.activeIndex, 3);
  assert.equal(flow.phase, "exercise");
});

test("opens the exercise from the guide", () => {
  const flow = openExercise(createLessonFlow(0));

  assert.equal(flow.phase, "exercise");
  assert.equal(flow.activeIndex, 0);
});

test("opens the guide from a lesson overview", () => {
  const overview = createLessonFlow(0, { phase: "overview" });
  const guide = openGuide(overview);

  assert.equal(overview.phase, "overview");
  assert.equal(guide.phase, "guide");
  assert.equal(guide.activeIndex, 0);
  assert.equal(guide.feedback, null);
});

test("waits for correct-answer speech before opening the next guide", () => {
  const exercise = openExercise(createLessonFlow(0));
  const submitted = recordSubmission(exercise, { correct: true });

  assert.equal(submitted.phase, "exercise");
  assert.equal(submitted.waitingForSpeech, true);

  const next = finishCorrectSpeech(submitted, 1);

  assert.equal(next.activeIndex, 1);
  assert.equal(next.phase, "guide");
  assert.equal(next.feedback, null);
  assert.equal(next.waitingForSpeech, false);
});

test("returns a failed exercise to the guide for the same task", () => {
  const exercise = openExercise(createLessonFlow(4));
  const submitted = recordSubmission(exercise, { correct: false });
  const retry = revisitFailedGuide(submitted);

  assert.equal(submitted.waitingForSpeech, false);
  assert.equal(retry.activeIndex, 4);
  assert.equal(retry.phase, "guide");
  assert.equal(retry.feedback, null);
});
