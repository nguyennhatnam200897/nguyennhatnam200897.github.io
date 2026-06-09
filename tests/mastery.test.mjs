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

test("starts sentence one with a city and life interleaving group", () => {
  assert.deepEqual(groups[0].taskIds, ["S1-01", "S1-04"]);
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
  assert.equal(getCurrentTaskId(session, groups), "S1-04");

  session = recordMasteryAttempt(session, groups, "S1-04", true);
  assert.equal(session.groupIndex, 0);
  assert.equal(getCurrentTaskId(session, groups), "S1-01");
});

test("keeps the original anchor group introduction cadence", () => {
  let session = createMasterySession(groups);

  session = recordMasteryAttempt(session, groups, "S1-01", true);

  assert.equal(getCurrentTaskId(session, groups), "S1-04");
});

test("advances only after every item reaches the mastery rule", () => {
  let session = createMasterySession(groups);

  [
    "S1-01",
    "S1-04",
    "S1-01",
    "S1-04",
    "S1-01",
    "S1-04",
  ].forEach((taskId) => {
    session = recordMasteryAttempt(session, groups, taskId, true);
  });

  assert.equal(MASTERY_RULE.minCorrect, 3);
  assert.equal(MASTERY_RULE.minStreak, 2);
  assert.equal(MASTERY_RULE.requiresInterleavedCorrect, true);
  assert.equal(session.groupIndex, 1);
  assert.equal(getCurrentTaskId(session, groups), "S1-02");
});

test("wrong answers reset only the failed item inside the current group", () => {
  let session = createMasterySession(groups);

  session = recordMasteryAttempt(session, groups, "S1-01", true);
  session = recordMasteryAttempt(session, groups, "S1-04", true);
  session = recordMasteryAttempt(session, groups, "S1-01", false);

  assert.equal(session.groupIndex, 0);
  assert.equal(session.stats["S1-01"].correctCount, 0);
  assert.equal(session.stats["S1-01"].streak, 0);
  assert.equal(session.stats["S1-04"].correctCount, 1);
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
