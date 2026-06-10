import test from "node:test";
import assert from "node:assert/strict";
import { loadDefaultCourse } from "./helpers/course-fixture.mjs";
import {
  MASTERY_RULE,
  buildPracticeGroups,
  calculateMasteryProgress,
  createMasterySession,
  getCurrentTaskId,
  isTaskIntroduced,
  recordMasteryAttempt,
  restoreMasterySession,
  serializeMasterySession,
} from "../js/mastery.mjs";

const { tasks } = await loadDefaultCourse();
const groups = buildPracticeGroups(tasks);

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
  assert.equal(
    groups.every((group) => group.taskIds.length >= 2 && group.taskIds.length <= 4),
    true
  );
});

test("does not advance after one correct answer per item", () => {
  let session = createMasterySession(groups);

  assert.equal(getCurrentTaskId(session, groups), "S1-01");
  assert.equal(isTaskIntroduced(session, "S1-01"), false);

  session = recordMasteryAttempt(session, groups, "S1-01", true);
  assert.equal(getCurrentTaskId(session, groups), "S1-02");

  session = recordMasteryAttempt(session, groups, "S1-02", true);
  assert.equal(session.groupIndex, 0);
  assert.equal(getCurrentTaskId(session, groups), "S1-01");
});

test("introduces the next lesson-one task after one correct answer", () => {
  let session = createMasterySession(groups);

  session = recordMasteryAttempt(session, groups, "S1-01", true);

  assert.equal(getCurrentTaskId(session, groups), "S1-02");
});

test("uses lesson-one overlapping groups for a future course by default", () => {
  const futureTasks = ["A", "B", "C", "D", "E"].map((id) => ({
    id,
    sentenceId: "F1",
  }));
  const futureGroups = buildPracticeGroups(futureTasks);

  assert.deepEqual(
    futureGroups.map((practiceGroup) => practiceGroup.taskIds),
    [
      ["A", "B"],
      ["A", "B", "C"],
      ["A", "B", "C", "D"],
      ["B", "C", "D", "E"],
    ]
  );
  assert.equal(
    futureGroups.every(
      (practiceGroup) =>
        practiceGroup.minCorrectBeforeNextIntroduction === undefined
    ),
    true
  );
});

test("uses the lesson-one introduction cadence for a future course", () => {
  const futureGroups = buildPracticeGroups([
    { id: "A", sentenceId: "F1" },
    { id: "B", sentenceId: "F1" },
  ]);
  let session = createMasterySession(futureGroups);

  session = recordMasteryAttempt(session, futureGroups, "A", true);

  assert.equal(getCurrentTaskId(session, futureGroups), "B");
});

test("advances only after every item reaches the mastery rule", () => {
  let session = createMasterySession(groups);

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
  assert.equal(getCurrentTaskId(session, groups), "S1-03");
});

test("requires a correct answer after another task has intervened", () => {
  const futureGroups = buildPracticeGroups([
    { id: "A", sentenceId: "F1" },
    { id: "B", sentenceId: "F1" },
  ]);
  let session = createMasterySession(futureGroups);

  ["A", "A", "B", "B"].forEach((taskId) => {
    session = recordMasteryAttempt(
      session,
      futureGroups,
      taskId,
      true
    );
  });

  assert.equal(session.groupIndex, 0);

  session = recordMasteryAttempt(session, futureGroups, "A", true);

  assert.equal(session.groupIndex, 1);
});

test("wrong answers reset only the failed item inside the current group", () => {
  let session = createMasterySession(groups);

  session = recordMasteryAttempt(session, groups, "S1-01", true);
  session = recordMasteryAttempt(session, groups, "S1-02", true);
  session = recordMasteryAttempt(session, groups, "S1-01", false);

  assert.equal(session.groupIndex, 0);
  assert.equal(session.stats["S1-01"].correctCount, 0);
  assert.equal(session.stats["S1-01"].streak, 0);
  assert.equal(session.stats["S1-02"].correctCount, 1);
});

test("serializes and restores the mastery session", () => {
  let session = createMasterySession(groups);
  session = recordMasteryAttempt(session, groups, "S1-01", true);

  const restored = restoreMasterySession(serializeMasterySession(session), groups);

  assert.deepEqual(restored, session);
});

test("calculates partial progress within the active group", () => {
  let session = createMasterySession(groups);
  session = recordMasteryAttempt(session, groups, "S1-01", true);

  const progress = calculateMasteryProgress(session, groups);

  assert.ok(progress > 0);
  assert.ok(progress < 100);
});
