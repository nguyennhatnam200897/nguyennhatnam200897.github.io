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
        { id: "S1-C02-STEP01", prompt: "cố gắng", answer: "try", stage: "phrase" },
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
  const oneTokenTask = groups[0].find((task) => task.id === "S1-C01-STEP01");
  const explicitStageTask = groups[0].find((task) => task.id === "S1-C02-STEP01");

  assert.equal(oneTokenTask.stage, "object");
  assert.equal(oneTokenTask.audioId, "S1-C01-STEP01");
  assert.equal(explicitStageTask.stage, "phrase");
  assert.equal(finalChunkTask.stage, "phrase");
  assert.deepEqual(finalChunkTask.meaningChunk, {
    id: "S1-C01",
    english: "many cities",
    vietnamese: "nhiều thành phố",
    chunkType: "entity",
    roleQuestion: "Ai?",
    isFinalStep: true,
  });
  assert.equal(finalChunkTask.guide.term, "many cities");
  assert.equal(finalChunkTask.guide.meaning, "nhiều thành phố");
  assert.deepEqual(finalChunkTask.guide.parts, []);
  assert.equal(finalChunkTask.guide.speech, "many cities");
  assert.equal(finalChunkTask.guide.whenNeeded, lesson.chunks[0].whenNeeded);
  assert.equal(finalChunkTask.guide.roleQuestion, "Ai?");
  assert.equal(finalChunkTask.guide.roleMeaning, lesson.chunks[0].roleMeaning);
});

test("composition rollback targets complete chunks instead of smaller old steps", () => {
  const [tasks] = buildMeaningChunkTaskGroups([lesson]);
  const composition = tasks.find((task) => task.id === "S1-M01");

  assert.equal(composition.stage, "clause");
  assert.equal(composition.audioId, "S1-M01");
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

test("rejects duplicate output task ids", () => {
  const duplicateIdLesson = {
    id: "duplicate-task-ids",
    sentenceId: "D1",
    chunks: [
      {
        id: "D1-C01",
        english: "clear signal",
        vietnamese: "tin hiệu rõ",
        chunkType: "entity",
        roleQuestion: "Cái gì?",
        whenNeeded: "Khi muốn nói về một tín hiệu rõ.",
        roleMeaning: "Cụm này cho biết điều đang được nói tới.",
        iPlusOneSteps: [
          { id: "DUPLICATE-TASK", prompt: "tin hiệu rõ", answer: "clear signal" },
        ],
      },
    ],
    compositionTasks: [
      {
        id: "DUPLICATE-TASK",
        prompt: "tin hiệu rõ",
        answer: "clear signal",
        usesChunks: ["D1-C01"],
      },
    ],
  };

  assert.throws(
    () => buildMeaningChunkTaskGroups([duplicateIdLesson]),
    /Invalid meaning chunk data:.*DUPLICATE-TASK/
  );
});

test("rollback targets match repeated chunk phrases in usesChunks order", () => {
  const repeatedPhraseLesson = {
    id: "repeated-phrase",
    sentenceId: "R1",
    chunks: [
      {
        id: "R1-C01",
        english: "can help",
        vietnamese: "có thể giúp",
        chunkType: "action-frame",
        roleQuestion: "Có thể làm gì?",
        whenNeeded: "Khi muốn nói một việc có khả năng giúp.",
        roleMeaning: "Cụm này mở hành động giúp đỡ thứ nhất.",
        iPlusOneSteps: [
          { id: "R1-C01-STEP01", prompt: "giúp", answer: "help" },
          { id: "R1-C01-STEP02", prompt: "có thể giúp", answer: "can help" },
        ],
      },
      {
        id: "R1-C02",
        english: "can help",
        vietnamese: "có thể giúp",
        chunkType: "action-frame",
        roleQuestion: "Còn có thể làm gì?",
        whenNeeded: "Khi muốn lặp lại cùng một khả năng giúp ở ý sau.",
        roleMeaning: "Cụm này mở hành động giúp đỡ thứ hai.",
        iPlusOneSteps: [
          { id: "R1-C02-STEP01", prompt: "giúp", answer: "help" },
          { id: "R1-C02-STEP02", prompt: "có thể giúp", answer: "can help" },
        ],
      },
    ],
    compositionTasks: [
      {
        id: "R1-M01",
        prompt: "có thể giúp và có thể giúp",
        answer: "can help and can help",
        usesChunks: ["R1-C01", "R1-C02"],
      },
    ],
  };
  const [tasks] = buildMeaningChunkTaskGroups([repeatedPhraseLesson]);
  const composition = tasks.find((task) => task.id === "R1-M01");

  assert.deepEqual(composition.rollbackTargets, [
    { taskId: "R1-C01-STEP02", start: 0, end: 2 },
    { taskId: "R1-C02-STEP02", start: 3, end: 5 },
  ]);
});
