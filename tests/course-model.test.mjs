import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";

async function readCourseData(pathname) {
  return JSON.parse(await readFile(new URL(pathname, import.meta.url), "utf8"));
}

const courseData = await readCourseData("../data/courses/small-public-garden.json");
const course = buildLessonCourse(courseData);

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

test("builds the gentle i+1 experiment as a cloned course with bridges", async () => {
  const experimentData = await readCourseData(
    "../data/courses/small-public-garden-gentle-i1.json"
  );
  const experiment = buildLessonCourse(experimentData);
  const bridges = experiment.tasks.filter((task) => task.isBridge);
  const byId = new Map(experiment.tasks.map((task) => [task.id, task]));

  assert.equal(experiment.id, "small-public-garden-gentle-i1");
  assert.equal(experiment.sessionVersion, 1);
  assert.equal(experiment.practiceProfile, "gentle-i-plus-one");
  assert.deepEqual(experiment.article.sentences, course.article.sentences);
  assert.equal(course.practicePolicy, undefined);
  assert.equal(course.tasks.some((task) => task.isBridge), false);
  assert.ok(experiment.tasks.length > course.tasks.length);
  assert.ok(bridges.length > 0);
  assert.deepEqual(
    experiment.sentenceTaskGroups.map((group) => group.length).slice(0, 2),
    [22, 24]
  );

  bridges.forEach((bridge) => {
    const target = byId.get(bridge.bridgeForTaskId);
    const bridgeIndex = experiment.tasks.findIndex((task) => task.id === bridge.id);
    const targetIndex = experiment.tasks.findIndex((task) => task.id === target?.id);

    assert.ok(target, `${bridge.id} should point to a target task`);
    assert.equal(bridge.answer, target.answer);
    assert.equal(bridge.audioId, target.audioId);
    assert.equal(bridgeIndex < targetIndex, true);
    assert.match(bridge.prompt, /\[frame:/);
    assert.match(bridge.guide.explanation, /cau noi/);
  });
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
