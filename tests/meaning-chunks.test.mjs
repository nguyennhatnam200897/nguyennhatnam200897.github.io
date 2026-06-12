import test from "node:test";
import assert from "node:assert/strict";
import { buildMeaningChunkTaskGroups } from "../js/meaning-chunks.mjs";

const lesson = {
  id: "S1-meaning-chunks",
  sentenceId: "S1",
  chunks: [
    {
      id: "S1-C01",
      english: "many cities",
      vietnamese: "nhiều thành phố",
      chunkType: "entity",
      roleQuestion: "Ai?",
      whenNeeded:
        "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
      roleMeaning: "Cụm này cho biết ai đang được nói tới.",
      iPlusOneSteps: [
        { id: "S1-C01-STEP01", prompt: "thành phố", answer: "city" },
        { id: "S1-C01-STEP02", prompt: "các thành phố", answer: "cities" },
        { id: "S1-C01-STEP03", prompt: "nhiều thành phố", answer: "many cities" },
      ],
    },
    {
      id: "S1-C02",
      english: "are trying to",
      vietnamese: "đang cố gắng làm",
      chunkType: "action-frame",
      roleQuestion: "Đang cố làm gì?",
      whenNeeded:
        "Khi muốn nói ai đó đang cố gắng làm một việc, nhưng việc đó chưa chắc đã xong.",
      roleMeaning: "Cụm này mở ra hành động người nói muốn thực hiện.",
      iPlusOneSteps: [
        { id: "S1-C02-STEP01", prompt: "cố gắng", answer: "try" },
        { id: "S1-C02-STEP02", prompt: "đang cố gắng", answer: "are trying" },
        { id: "S1-C02-STEP03", prompt: "đang cố gắng làm", answer: "are trying to" },
      ],
    },
  ],
  compositionTasks: [
    {
      id: "S1-M01",
      prompt: "nhiều thành phố đang cố gắng làm",
      answer: "many cities are trying to",
      usesChunks: ["S1-C01", "S1-C02"],
      masteryCredit: ["S1-C01", "S1-C02"],
      roleLine: [
        { roleQuestion: "Ai?", chunkId: "S1-C01", english: "many cities" },
        {
          roleQuestion: "Đang cố làm gì?",
          chunkId: "S1-C02",
          english: "are trying to",
        },
      ],
      successMessage:
        "Bạn đã ghép được: ai đang cố làm gì.",
    },
  ],
  repairRules: [
    {
      id: "S1-R01",
      appliesTo: ["S1-M01"],
      chunkId: "S1-C01",
      detect: {
        expected: "many cities",
        commonWrongAnswers: ["many city"],
      },
      message: "Cụm cần sửa: nhiều thành phố.",
    },
  ],
};

test("builds step tasks and composition tasks from meaning chunks", () => {
  const groups = buildMeaningChunkTaskGroups([lesson]);

  assert.equal(groups.length, 1);
  assert.deepEqual(
    groups[0].map((task) => task.id),
    [
      "S1-C01-STEP01",
      "S1-C01-STEP02",
      "S1-C01-STEP03",
      "S1-C02-STEP01",
      "S1-C02-STEP02",
      "S1-C02-STEP03",
      "S1-M01",
    ]
  );

  const finalChunkTask = groups[0].find((task) => task.id === "S1-C01-STEP03");
  assert.equal(finalChunkTask.stage, "phrase");
  assert.equal(finalChunkTask.meaningChunk.id, "S1-C01");
  assert.equal(finalChunkTask.meaningChunk.isFinalStep, true);
  assert.equal(finalChunkTask.guide.whenNeeded, lesson.chunks[0].whenNeeded);
  assert.equal(finalChunkTask.guide.roleQuestion, "Ai?");
});

test("composition rollback targets complete chunks instead of smaller old steps", () => {
  const [tasks] = buildMeaningChunkTaskGroups([lesson]);
  const composition = tasks.find((task) => task.id === "S1-M01");

  assert.deepEqual(composition.rollbackTargets, [
    { taskId: "S1-C01-STEP03", start: 0, end: 2 },
    { taskId: "S1-C02-STEP03", start: 2, end: 5 },
  ]);
  assert.deepEqual(composition.repairRules, [
    {
      taskId: "S1-C01-STEP03",
      commonWrongAnswers: ["many city"],
      message: "Cụm cần sửa: nhiều thành phố.",
    },
  ]);
  assert.deepEqual(composition.roleLine, lesson.compositionTasks[0].roleLine);
});
