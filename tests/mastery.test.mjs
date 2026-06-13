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

test("can delay the next task introduction with a course policy", () => {
  const futureGroups = buildPracticeGroups(
    [
      { id: "A", sentenceId: "F1" },
      { id: "B", sentenceId: "F1" },
    ],
    { minCorrectBeforeNextIntroduction: 2 }
  );
  let session = createMasterySession(futureGroups);

  assert.equal(futureGroups[0].minCorrectBeforeNextIntroduction, 2);
  assert.equal(getCurrentTaskId(session, futureGroups), "A");

  session = recordMasteryAttempt(session, futureGroups, "A", true);
  assert.equal(getCurrentTaskId(session, futureGroups), "A");

  session = recordMasteryAttempt(session, futureGroups, "A", true);
  assert.equal(getCurrentTaskId(session, futureGroups), "B");
});

test("uses frontier groups for a rollback i+1 course", () => {
  const futureGroups = buildPracticeGroups(
    [
      { id: "cities", sentenceId: "F1", answer: "cities" },
      {
        id: "many-cities",
        sentenceId: "F1",
        answer: "many cities",
        rollbackTargets: [{ taskId: "cities", start: 1, end: 2 }],
      },
    ],
    { mode: "frontier-rollback", minCorrect: 2, repairCorrectCount: 1 }
  );

  assert.deepEqual(
    futureGroups.map((practiceGroup) => practiceGroup.taskIds),
    [["cities"], ["many-cities"]]
  );
  assert.equal(futureGroups[0].requiresInterleavedCorrect, false);
});

test("builds sequential meaning chunk groups in composition order", () => {
  const meaningChunkGroups = buildPracticeGroups(
    [
      {
        id: "C1-step",
        sentenceId: "F1",
        meaningChunk: { id: "C1", isFinalStep: false },
      },
      {
        id: "C1-final",
        sentenceId: "F1",
        meaningChunk: { id: "C1", isFinalStep: true },
        rollbackTargets: [{ taskId: "C1-step", start: 0, end: 1 }],
        repairRules: [
          {
            taskId: "C1-step",
            commonWrongAnswers: ["wrong C1"],
          },
        ],
      },
      {
        id: "C2-step",
        sentenceId: "F1",
        meaningChunk: { id: "C2", isFinalStep: false },
      },
      {
        id: "C2-final",
        sentenceId: "F1",
        meaningChunk: { id: "C2", isFinalStep: true },
      },
      {
        id: "M1",
        sentenceId: "F1",
        usesChunks: ["C1", "C2"],
        masteryCredit: ["C1", "C2"],
      },
      {
        id: "C3-step",
        sentenceId: "F1",
        meaningChunk: { id: "C3", isFinalStep: false },
      },
      {
        id: "C3-final",
        sentenceId: "F1",
        meaningChunk: { id: "C3", isFinalStep: true },
      },
      {
        id: "M2",
        sentenceId: "F1",
        usesChunks: ["C1", "C3"],
        masteryCredit: ["C3"],
      },
      {
        id: "C4-step",
        sentenceId: "F1",
        meaningChunk: { id: "C4", isFinalStep: false },
      },
      {
        id: "C4-final",
        sentenceId: "F1",
        meaningChunk: { id: "C4", isFinalStep: true },
      },
      {
        id: "M3",
        sentenceId: "F1",
        usesChunks: ["C1", "C2", "C3", "C4"],
        masteryCredit: ["C4"],
      },
    ],
    {
      mode: "frontier-rollback",
      meaningChunkMastery: true,
      minCorrect: 2,
      repairCorrectCount: 1,
    }
  );

  assert.deepEqual(
    meaningChunkGroups.map(({ id, taskIds }) => ({ id, taskIds })),
    [
      { id: "meaning-step-C1-step", taskIds: ["C1-step"] },
      { id: "meaning-step-C1-final", taskIds: ["C1-final"] },
      { id: "meaning-step-C2-step", taskIds: ["C2-step"] },
      { id: "meaning-step-C2-final", taskIds: ["C2-final"] },
      { id: "meaning-compose-M1", taskIds: ["M1"] },
      { id: "meaning-step-C3-step", taskIds: ["C3-step"] },
      { id: "meaning-step-C3-final", taskIds: ["C3-final"] },
      { id: "meaning-compose-M2", taskIds: ["M2"] },
      { id: "meaning-step-C4-step", taskIds: ["C4-step"] },
      { id: "meaning-step-C4-final", taskIds: ["C4-final"] },
      { id: "meaning-compose-M3", taskIds: ["M3"] },
    ]
  );
  assert.deepEqual(meaningChunkGroups[0].masteryRulesByTaskId["C1-step"], {
    minCorrect: 1,
    minStreak: 1,
    requiresInterleavedCorrect: false,
  });
  assert.deepEqual(meaningChunkGroups[1].masteryRulesByTaskId["C1-final"], {
    minCorrect: 2,
    minStreak: 2,
    requiresInterleavedCorrect: false,
  });
  assert.deepEqual(meaningChunkGroups[7].masteryRulesByTaskId.M2, {
    minCorrect: 1,
    minStreak: 1,
    requiresInterleavedCorrect: false,
  });
  assert.equal(
    meaningChunkGroups.flatMap((practiceGroup) => practiceGroup.taskIds).filter(
      (taskId) => taskId === "C1-final"
    ).length,
    1
  );
  assert.equal(meaningChunkGroups[1].repairCorrectCount, 1);
  assert.deepEqual(meaningChunkGroups[1].rollbackTargetsByTaskId, {
    "C1-final": [{ taskId: "C1-step", start: 0, end: 1 }],
  });
  assert.deepEqual(meaningChunkGroups[1].repairRulesByTaskId, {
    "C1-final": [
      {
        taskId: "C1-step",
        commonWrongAnswers: ["wrong C1"],
      },
    ],
  });
});

test("requires each complete chunk twice in a row before composition", () => {
  const meaningChunkGroups = buildPracticeGroups(
    [
      {
        id: "C1-step",
        sentenceId: "F1",
        meaningChunk: { id: "C1", isFinalStep: false },
      },
      {
        id: "C1-final",
        sentenceId: "F1",
        meaningChunk: { id: "C1", isFinalStep: true },
      },
      {
        id: "C2-step",
        sentenceId: "F1",
        meaningChunk: { id: "C2", isFinalStep: false },
      },
      {
        id: "C2-final",
        sentenceId: "F1",
        meaningChunk: { id: "C2", isFinalStep: true },
      },
      {
        id: "M1",
        sentenceId: "F1",
        usesChunks: ["C1", "C2"],
        masteryCredit: ["C1", "C2"],
      },
    ],
    {
      mode: "frontier-rollback",
      meaningChunkMastery: true,
      minCorrect: 2,
      repairCorrectCount: 1,
    }
  );
  let session = createMasterySession(meaningChunkGroups);
  const expectedSequence = [
    "C1-step",
    "C1-final",
    "C1-final",
    "C2-step",
    "C2-final",
    "C2-final",
    "M1",
  ];

  expectedSequence.forEach((taskId, index) => {
    assert.equal(getCurrentTaskId(session, meaningChunkGroups), taskId);
    session = recordMasteryAttempt(
      session,
      meaningChunkGroups,
      taskId,
      true
    );
    assert.equal(session.groupIndex <= index + 1, true);
  });

  assert.equal(getCurrentTaskId(session, meaningChunkGroups), null);
});

test("resets consecutive final chunk mastery after a wrong answer", () => {
  const meaningChunkGroups = buildPracticeGroups(
    [
      {
        id: "C1-final",
        sentenceId: "F1",
        meaningChunk: { id: "C1", isFinalStep: true },
      },
      {
        id: "M1",
        sentenceId: "F1",
        usesChunks: ["C1"],
        masteryCredit: ["C1"],
      },
    ],
    {
      mode: "frontier-rollback",
      meaningChunkMastery: true,
      minCorrect: 2,
      repairCorrectCount: 1,
    }
  );
  let session = createMasterySession(meaningChunkGroups);

  assert.equal(getCurrentTaskId(session, meaningChunkGroups), "C1-final");
  session = recordMasteryAttempt(
    session,
    meaningChunkGroups,
    "C1-final",
    true
  );
  assert.equal(getCurrentTaskId(session, meaningChunkGroups), "C1-final");

  session = recordMasteryAttempt(
    session,
    meaningChunkGroups,
    "C1-final",
    false
  );
  assert.deepEqual(session.stats["C1-final"], {
    correctCount: 0,
    hasInterleavedCorrect: false,
    streak: 0,
    wrongCount: 1,
  });
  assert.equal(getCurrentTaskId(session, meaningChunkGroups), "C1-final");

  session = recordMasteryAttempt(
    session,
    meaningChunkGroups,
    "C1-final",
    true
  );
  assert.equal(getCurrentTaskId(session, meaningChunkGroups), "C1-final");
});

test("rejects compositions that reference an unknown meaning chunk", () => {
  assert.throws(
    () =>
      buildPracticeGroups(
        [
          {
            id: "M1",
            sentenceId: "F1",
            usesChunks: ["missing"],
            masteryCredit: ["missing"],
          },
        ],
        {
          mode: "frontier-rollback",
          meaningChunkMastery: true,
          minCorrect: 2,
          repairCorrectCount: 1,
        }
      ),
    /unknown chunk "missing"/
  );
});

test("rolls back only when the failed token is inside a learned prerequisite", () => {
  const futureGroups = buildPracticeGroups(
    [
      { id: "cities", sentenceId: "F1", answer: "cities" },
      {
        id: "many-cities",
        sentenceId: "F1",
        answer: "many cities",
        rollbackTargets: [{ taskId: "cities", start: 1, end: 2 }],
      },
    ],
    { mode: "frontier-rollback", minCorrect: 2, repairCorrectCount: 1 }
  );
  let session = createMasterySession(futureGroups);

  session = recordMasteryAttempt(session, futureGroups, "cities", true);
  assert.equal(getCurrentTaskId(session, futureGroups), "cities");
  session = recordMasteryAttempt(session, futureGroups, "cities", true);
  assert.equal(getCurrentTaskId(session, futureGroups), "many-cities");

  session = recordMasteryAttempt(session, futureGroups, "many-cities", false, {
    issue: { index: 1, actual: "cite", expected: "cities", type: "mismatch" },
  });
  assert.equal(getCurrentTaskId(session, futureGroups), "cities");

  session = recordMasteryAttempt(session, futureGroups, "cities", true);
  assert.equal(getCurrentTaskId(session, futureGroups), "many-cities");

  session = recordMasteryAttempt(session, futureGroups, "many-cities", false, {
    issue: { index: 0, actual: "cities", expected: "many", type: "mismatch" },
  });
  assert.equal(getCurrentTaskId(session, futureGroups), "many-cities");
});

test("uses common wrong answer repair rules when token spans do not catch the issue", () => {
  const futureGroups = buildPracticeGroups(
    [
      {
        id: "least-dramatic",
        sentenceId: "F1",
        answer: "the least dramatic",
      },
      {
        id: "full-claim",
        sentenceId: "F1",
        answer: "the most effective changes are often the least dramatic",
        repairRules: [
          {
            taskId: "least-dramatic",
            commonWrongAnswers: ["the least dramatic changes"],
            message: "Cụm cần dùng: the least dramatic.",
          },
        ],
      },
    ],
    { mode: "frontier-rollback", minCorrect: 2, repairCorrectCount: 1 }
  );
  let session = createMasterySession(futureGroups);

  session = recordMasteryAttempt(session, futureGroups, "least-dramatic", true);
  session = recordMasteryAttempt(session, futureGroups, "least-dramatic", true);

  session = recordMasteryAttempt(session, futureGroups, "full-claim", false, {
    normalizedActual:
      "the most effective changes are often the least dramatic changes",
    issue: { index: 9, actual: "changes", expected: undefined, type: "extra" },
  });

  assert.equal(getCurrentTaskId(session, futureGroups), "least-dramatic");
});

test("falls back to token rollback when common wrong answer is away from the issue", () => {
  const futureGroups = buildPracticeGroups(
    [
      {
        id: "many-cities",
        sentenceId: "F1",
        answer: "many cities",
      },
      {
        id: "are-trying-to",
        sentenceId: "F1",
        answer: "are trying to",
      },
      {
        id: "long-claim",
        sentenceId: "F1",
        answer: "many cities in the region are trying to make life better",
        rollbackTargets: [{ taskId: "many-cities", start: 0, end: 2 }],
        repairRules: [
          {
            taskId: "are-trying-to",
            commonWrongAnswers: ["are trying"],
            message: "Use the full chunk: are trying to.",
          },
        ],
      },
    ],
    { mode: "frontier-rollback", minCorrect: 2, repairCorrectCount: 1 }
  );
  let session = createMasterySession(futureGroups);

  session = recordMasteryAttempt(session, futureGroups, "many-cities", true);
  session = recordMasteryAttempt(session, futureGroups, "many-cities", true);
  session = recordMasteryAttempt(session, futureGroups, "are-trying-to", true);
  session = recordMasteryAttempt(session, futureGroups, "are-trying-to", true);

  session = recordMasteryAttempt(session, futureGroups, "long-claim", false, {
    normalizedActual: "many city in the region are trying to make life better",
    issue: { index: 1, actual: "city", expected: "cities", type: "mismatch" },
  });

  assert.equal(getCurrentTaskId(session, futureGroups), "many-cities");
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
