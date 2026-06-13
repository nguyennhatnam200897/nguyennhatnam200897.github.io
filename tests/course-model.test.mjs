import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";

async function readCourseData(pathname) {
  return JSON.parse(await readFile(new URL(pathname, import.meta.url), "utf8"));
}

const courseData = await readCourseData("../data/courses/small-public-garden.json");
const course = buildLessonCourse(courseData);

function buildSingleChunkLesson({
  id = "S1-meaning-chunks",
  sentenceId = "S1",
} = {}) {
  return {
    id,
    sentenceId,
    chunks: [
      {
        id: `${sentenceId}-C01`,
        english: "many cities",
        vietnamese: "many cities",
        chunkType: "entity",
        roleQuestion: "Ai?",
        whenNeeded: "When talking about many cities.",
        roleMeaning: "This chunk names who the sentence talks about.",
        iPlusOneSteps: [
          { id: `${sentenceId}-C01-STEP01`, prompt: "city", answer: "city" },
          { id: `${sentenceId}-C01-STEP02`, prompt: "cities", answer: "cities" },
          {
            id: `${sentenceId}-C01-STEP03`,
            prompt: "many cities",
            answer: "many cities",
          },
        ],
      },
    ],
  };
}

function buildCompleteTwoSentenceFixture() {
  return {
    id: "complete-meaning-demo",
    title: "Complete Meaning Demo",
    level: "A2",
    topic: "Meaning chunks",
    practiceProfile: "meaning-chunk-i-plus-one",
    paragraphTaskMode: "cumulative",
    meaningChunkProfile: {
      version: 2,
      lessonCoverage: "complete",
    },
    sentences: [
      {
        id: "S1",
        english: "Many cities try.",
        vietnamese: "Nhiều thành phố cố gắng.",
      },
      {
        id: "S2",
        english: "People meet.",
        vietnamese: "Mọi người gặp nhau.",
      },
    ],
    taskGroups: [],
    meaningChunkLessons: [
      {
        id: "S1-meaning-chunks",
        sentenceId: "S1",
        chunks: [
          {
            id: "S1-C01",
            english: "many cities",
            vietnamese: "nhiều thành phố",
            chunkType: "entity",
            roleQuestion: "Ai?",
            whenNeeded: "Khi muốn nói về nhiều thành phố.",
            roleMeaning: "Cụm này cho biết ai đang được nói tới.",
            iPlusOneSteps: [
              {
                id: "S1-C01-FINAL",
                prompt: "nhiều thành phố",
                answer: "many cities",
              },
            ],
          },
        ],
        compositionTasks: [
          {
            id: "S1-FINAL",
            stage: "sentence",
            prompt: "Nhiều thành phố cố gắng.",
            answer: "Many cities try.",
            usesChunks: ["S1-C01"],
          },
        ],
      },
      {
        id: "S2-meaning-chunks",
        sentenceId: "S2",
        chunks: [
          {
            id: "S2-C01",
            english: "people",
            vietnamese: "mọi người",
            chunkType: "entity",
            roleQuestion: "Ai?",
            whenNeeded: "Khi muốn nói về mọi người.",
            roleMeaning: "Cụm này cho biết ai đang được nói tới.",
            iPlusOneSteps: [
              {
                id: "S2-C01-FINAL",
                prompt: "mọi người",
                answer: "people",
              },
            ],
          },
        ],
        compositionTasks: [
          {
            id: "S2-FINAL",
            stage: "sentence",
            prompt: "Mọi người gặp nhau.",
            answer: "People meet.",
            usesChunks: ["S2-C01"],
          },
        ],
      },
    ],
  };
}

test("builds the current course from JSON data", () => {
  assert.equal(course.id, "small-public-garden");
  assert.equal(course.article.title, "A Small Public Garden");
  assert.equal(course.article.level, "B2");
  assert.equal(course.sessionVersion, 2);
  assert.equal(course.article.topic, "Đời sống đô thị và dự án môi trường nhỏ");
  assert.equal(course.tasks.length, 138);
  assert.deepEqual(
    course.sentenceTaskGroups.map((group) => group.length),
    [18, 20, 16, 35, 21, 9, 13]
  );
});

test("creates cumulative paragraph tasks from course sentences", () => {
  const paragraphTasks = course.tasks.filter((task) => task.stage === "paragraph");

  assert.deepEqual(
    paragraphTasks.map((task) => task.id),
    ["G2", "G3", "G4", "G5", "G6", "G7"]
  );
  assert.equal(paragraphTasks.at(-1).sentenceIds.length, 7);
  assert.equal(
    paragraphTasks.at(-1).answer,
    course.article.sentences.map((sentence) => sentence.english).join(" ")
  );
});

test("accepts complete meaning chunk coverage for every sentence", () => {
  assert.doesNotThrow(() =>
    buildLessonCourse(buildCompleteTwoSentenceFixture())
  );
});

test("rejects complete meaning chunk coverage when a sentence is missing", () => {
  const fixture = buildCompleteTwoSentenceFixture();
  fixture.meaningChunkLessons = fixture.meaningChunkLessons.slice(0, 1);

  assert.throws(
    () => buildLessonCourse(fixture),
    /lessonCoverage "complete" requires lessons for: S2/
  );
});

test("maps cumulative paragraph spans to final sentence tasks", () => {
  const completeCourse = buildLessonCourse(buildCompleteTwoSentenceFixture());
  const paragraph = completeCourse.tasks.find((task) => task.id === "G2");

  assert.equal(paragraph.stage, "paragraph");
  assert.deepEqual(
    paragraph.rollbackTargets.map((target) => target.taskId),
    ["S1-FINAL", "S2-FINAL"]
  );
  assert.equal(
    paragraph.rollbackTargets.at(-1).end,
    paragraph.answer.replace(/[.,!?;:]/g, "").split(/\s+/).length
  );
});

test("keeps JSON guide overrides and contextual guidance", () => {
  const byId = new Map(course.tasks.map((task) => [task.id, task]));

  assert.equal(byId.get("S1-01").guide.explanation, "“City” dùng để chỉ một thành phố.");
  assert.match(byId.get("S2-06").guide.explanation, /the.*xác định/i);
  assert.match(byId.get("S5-20").guide.explanation, /encourage.*to do/i);
});

test("keeps task ids unique and prompts unambiguous inside each sentence", () => {
  const ids = course.tasks.map((task) => task.id);
  const promptAnswers = new Map();

  course.tasks.forEach((task) => {
    const key = `${task.sentenceId}\u0000${task.prompt}`;
    const answers = promptAnswers.get(key) ?? new Set();
    answers.add(task.answer);
    promptAnswers.set(key, answers);
  });

  assert.equal(new Set(ids).size, ids.length);
  assert.equal([...promptAnswers.values()].every((answers) => answers.size === 1), true);
});

test("builds the meaning chunk i+1 experiment as a cloned course", async () => {
  const experimentData = await readCourseData(
    "../data/courses/small-public-garden-gentle-i1.json"
  );
  const experiment = buildLessonCourse(experimentData);
  const byId = new Map(experiment.tasks.map((task) => [task.id, task]));

  assert.equal(experiment.id, "small-public-garden-gentle-i1");
  assert.equal(experiment.sessionVersion, 2);
  assert.equal(experiment.practiceProfile, "meaning-chunk-i-plus-one");
  assert.equal(experiment.practicePolicy.mode, "frontier-rollback");
  assert.equal(experiment.practicePolicy.meaningChunkMastery, true);
  assert.equal(experiment.practicePolicy.requiresInterleavedCorrect, true);
  assert.deepEqual(experiment.article.sentences, course.article.sentences);
  assert.equal(course.practicePolicy, undefined);
  assert.equal(course.tasks.some((task) => task.id === "S1-C01-STEP03"), false);
  assert.equal(experiment.tasks.some((task) => task.id === "S1-C01-STEP03"), true);
  assert.equal(experiment.tasks.some((task) => task.id === "S2-01"), true);
  assert.equal(byId.get("S1-C01-STEP03").answer, "many cities");
  assert.equal(
    byId.get("S1-M03").answer,
    "many cities are trying to make daily life more sustainable"
  );
  assert.equal(byId.get("S1-M03").guide.roleLine.length, 4);
  assert.deepEqual(
    byId
      .get("S1-M03")
      .rollbackTargets.find((target) => target.taskId === "S1-C01-STEP03"),
    {
      taskId: "S1-C01-STEP03",
      start: 0,
      end: 2,
    }
  );
});

test("supports a course-level audio extension", () => {
  const audioCourse = buildLessonCourse({
    id: "audio-demo",
    title: "Audio Demo",
    level: "A2",
    topic: "Listening",
    audioBasePath: "./assets/audio/audio-demo",
    audioExtension: "mp3",
    paragraphTaskMode: "none",
    sentences: [
      {
        id: "S1",
        english: "I listen every day.",
        vietnamese: "Tôi nghe mỗi ngày.",
      },
    ],
    taskGroups: [
      [
        {
          id: "S1-01",
          sentenceId: "S1",
          stage: "sentence",
          prompt: "Tôi nghe mỗi ngày.",
          answer: "I listen every day.",
        },
      ],
    ],
  });

  assert.equal(audioCourse.audioExtension, "mp3");
});

test("builds a meaning chunk i+1 experiment while keeping unmigrated legacy sentences", async () => {
  const experimentData = await readCourseData(
    "../data/courses/small-public-garden-gentle-i1.json"
  );
  const experiment = buildLessonCourse({
    ...experimentData,
    sessionVersion: 2,
    practiceProfile: "meaning-chunk-i-plus-one",
    meaningChunkLessons: [
      {
        id: "S1-meaning-chunks",
        sentenceId: "S1",
        chunks: [
          {
            id: "S1-C01",
            english: "many cities",
            vietnamese: "many cities",
            chunkType: "entity",
            roleQuestion: "Ai?",
            whenNeeded: "When talking about many cities as the actor.",
            roleMeaning: "This chunk names who the sentence talks about.",
            iPlusOneSteps: [
              { id: "S1-C01-STEP01", prompt: "city", answer: "city" },
              { id: "S1-C01-STEP02", prompt: "cities", answer: "cities" },
              {
                id: "S1-C01-STEP03",
                prompt: "many cities",
                answer: "many cities",
              },
            ],
          },
        ],
      },
    ],
  });

  assert.equal(experiment.practiceProfile, "meaning-chunk-i-plus-one");
  assert.equal(experiment.practicePolicy.mode, "frontier-rollback");
  assert.equal(experiment.sessionVersion, 2);
  assert.equal(course.practicePolicy, undefined);
  assert.equal(course.tasks.some((task) => task.id === "S1-C01-STEP03"), false);
  assert.equal(experiment.tasks.some((task) => task.id === "S1-C01-STEP03"), true);
  assert.equal(experiment.tasks.some((task) => task.id === "S1-01"), false);
  assert.equal(experiment.tasks.some((task) => task.isBridge), false);
  assert.equal(experiment.tasks.some((task) => task.id === "S2-01"), true);
  assert.deepEqual(
    experiment.sentenceTaskGroups[0].map((task) => task.id),
    ["S1-C01-STEP01", "S1-C01-STEP02", "S1-C01-STEP03"]
  );
  assert.equal(
    experiment.sentenceTaskGroups[0].some((task) => /^S1-\d/.test(task.id)),
    false
  );
});

test("preserves meaning chunk guide and role metadata through course normalization", () => {
  const experiment = buildLessonCourse({
    id: "meaning-demo",
    title: "Meaning Demo",
    level: "A2",
    topic: "Meaning chunks",
    practiceProfile: "meaning-chunk-i-plus-one",
    paragraphTaskMode: "none",
    sentences: [
      {
        id: "S1",
        english: "Many cities try.",
        vietnamese: "Many cities try.",
      },
    ],
    taskGroups: [],
    meaningChunkLessons: [
      {
        id: "S1-meaning-chunks",
        sentenceId: "S1",
        chunks: [
          {
            id: "S1-C01",
            english: "many cities",
            vietnamese: "many cities",
            chunkType: "entity",
            roleQuestion: "Ai?",
            whenNeeded: "When talking about many cities.",
            roleMeaning: "This chunk names who the sentence talks about.",
            successMessage: "Bạn đã có cụm: many cities.",
            iPlusOneSteps: [
              { id: "S1-C01-STEP01", prompt: "cities", answer: "cities" },
              {
                id: "S1-C01-STEP02",
                prompt: "many cities",
                answer: "many cities",
              },
            ],
          },
        ],
        compositionTasks: [
          {
            id: "S1-M01",
            prompt: "many cities",
            answer: "many cities",
            usesChunks: ["S1-C01"],
            successMessage: "You built the meaning.",
            roleLine: [
              { roleQuestion: "Ai?", chunkId: "S1-C01", english: "many cities" },
            ],
          },
        ],
        repairRules: [
          {
            id: "S1-R01",
            appliesTo: ["S1-M01"],
            chunkId: "S1-C01",
            detect: {
              commonWrongAnswers: ["many city"],
            },
            message: "Use the plural chunk.",
          },
        ],
      },
    ],
  });
  const byId = new Map(experiment.tasks.map((task) => [task.id, task]));
  const smallStepGuide = byId.get("S1-C01-STEP01").guide;
  const finalStepGuide = byId.get("S1-C01-STEP02").guide;

  assert.equal(Object.hasOwn(smallStepGuide, "whenNeeded"), false);
  assert.equal(Object.hasOwn(smallStepGuide, "roleQuestion"), false);
  assert.equal(Object.hasOwn(smallStepGuide, "roleMeaning"), false);
  assert.equal(Object.hasOwn(smallStepGuide, "successMessage"), false);
  assert.equal(
    finalStepGuide.whenNeeded,
    "When talking about many cities."
  );
  assert.equal(finalStepGuide.roleQuestion, "Ai?");
  assert.equal(
    finalStepGuide.roleMeaning,
    "This chunk names who the sentence talks about."
  );
  assert.equal(
    finalStepGuide.successMessage,
    "Bạn đã có cụm: many cities."
  );
  assert.equal(byId.get("S1-C01-STEP02").meaningChunk.id, "S1-C01");
  assert.deepEqual(byId.get("S1-M01").usesChunks, ["S1-C01"]);
  assert.deepEqual(byId.get("S1-M01").masteryCredit, ["S1-C01"]);
  assert.deepEqual(byId.get("S1-M01").repairRules, [
    {
      taskId: "S1-C01-STEP02",
      commonWrongAnswers: ["many city"],
      message: "Use the plural chunk.",
    },
  ]);
  assert.equal(byId.get("S1-M01").guide.successMessage, "You built the meaning.");
  assert.deepEqual(byId.get("S1-M01").roleLine, [
    { roleQuestion: "Ai?", chunkId: "S1-C01", english: "many cities" },
  ]);
});

test("rejects meaning chunk lessons for unknown course sentences", () => {
  assert.throws(
    () =>
      buildLessonCourse({
        id: "unknown-meaning-sentence",
        title: "Unknown Meaning Sentence",
        level: "A2",
        topic: "Meaning chunks",
        practiceProfile: "meaning-chunk-i-plus-one",
        paragraphTaskMode: "none",
        sentences: [
          {
            id: "S1",
            english: "Many cities try.",
            vietnamese: "Many cities try.",
          },
        ],
        taskGroups: [],
        meaningChunkLessons: [
          buildSingleChunkLesson({
            id: "S99-meaning-chunks",
            sentenceId: "S99",
          }),
        ],
      }),
    /Invalid course data: meaningChunkLessons\[0\]\.sentenceId "S99" does not match a course sentence\./
  );
});

test("rejects duplicate meaning chunk lessons for the same sentence", () => {
  assert.throws(
    () =>
      buildLessonCourse({
        id: "duplicate-meaning-sentence",
        title: "Duplicate Meaning Sentence",
        level: "A2",
        topic: "Meaning chunks",
        practiceProfile: "meaning-chunk-i-plus-one",
        paragraphTaskMode: "none",
        sentences: [
          {
            id: "S1",
            english: "Many cities try.",
            vietnamese: "Many cities try.",
          },
        ],
        taskGroups: [],
        meaningChunkLessons: [
          buildSingleChunkLesson(),
          buildSingleChunkLesson({ id: "S1-meaning-chunks-again" }),
        ],
      }),
    /Invalid course data: meaningChunkLessons\[1\]\.sentenceId "S1" duplicates an earlier meaning chunk lesson\./
  );
});
