import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildLessonCourse } from "../js/course-model.mjs";
import { buildPracticeGroups } from "../js/mastery.mjs";
import { getAmericanIpa, tokenizeEnglish } from "../js/pronunciation.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

const courseData = await readJson(
  "data/courses/listening-song-ngu-sample.json"
);
const course = buildLessonCourse(courseData);
const sentenceTasks = course.tasks.filter((task) => task.stage !== "paragraph");
const paragraphTasks = course.tasks.filter((task) => task.stage === "paragraph");

function answersFor(sentenceId) {
  return sentenceTasks
    .filter((task) => task.sentenceId === sentenceId)
    .map((task) => task.answer);
}

function assertOrdered(sentenceId, answers) {
  const actual = answersFor(sentenceId);
  let previousIndex = -1;

  answers.forEach((answer) => {
    const index = actual.indexOf(answer);
    assert.ok(index > previousIndex, `${sentenceId} thiếu hoặc sai thứ tự: ${answer}`);
    previousIndex = index;
  });
}

test("builds Exercise 1 as a cumulative WAV course", () => {
  assert.equal(course.sentences.length, 8);
  assert.equal(course.sentenceTaskGroups.length, 8);
  assert.equal(course.sessionVersion, 3);
  assert.equal(course.audioExtension, "wav");
  assert.equal(courseData.paragraphTaskMode, "cumulative");
  assert.equal(paragraphTasks.length, 7);
  assert.equal(
    paragraphTasks.every((task) =>
      /phần nội dung cộng dồn/i.test(task.guide.explanation)
    ),
    true
  );

  course.sentenceTaskGroups.forEach((group, index) => {
    assert.ok(group.length >= 4, `LS1-${index + 1} cần nhiều tầng i+1 hơn`);
    assert.equal(group.at(-1).stage, "sentence");
    assert.equal(group.at(-1).answer, course.sentences[index].english);
  });

  assert.ok(sentenceTasks.length >= 60);
});

test("keeps object tasks to reusable one-word nouns", () => {
  const objectAnswers = sentenceTasks
    .filter((task) => task.stage === "object")
    .map((task) => task.answer.toLowerCase());
  const forbiddenBridgeWords = [
    "install",
    "mount",
    "forgot",
    "screw",
    "however",
    "before",
    "use",
    "call",
  ];

  assert.ok(objectAnswers.length >= 8);
  assert.equal(objectAnswers.every((answer) => !answer.includes(" ")), true);
  forbiddenBridgeWords.forEach((word) => {
    assert.equal(objectAnswers.includes(word), false, `${word} không phải object`);
  });
});

test("contains the required i+1 progressions", () => {
  assertOrdered("LS1-02", [
    "television",
    "UHD television",
    "the UHD television",
    "week",
    "last week",
    "you ordered the UHD television last week",
    "the UHD television that you ordered last week",
    "I'm here to install the UHD television",
    course.sentences[1].english,
  ]);

  assertOrdered("LS1-05", [
    "presentation",
    "presentations",
    "seminar",
    "seminars",
    "training seminars",
    "presentations and training seminars",
    "use it for presentations and training seminars",
    course.sentences[4].english,
  ]);

  assertOrdered("LS1-06", [
    "tool",
    "tools",
    "the tools",
    "wall mount",
    "the wall mount",
    "screw the television to the wall mount",
    "I need to screw the television to the wall mount",
    "the tools that I need to screw the television to the wall mount",
    "I forgot the tools that I need to screw the television to the wall mount",
    course.sentences[5].english,
  ]);

  assertOrdered("LS1-08", [
    "call me before you come tomorrow",
    "please call me before you come tomorrow",
    "someone is in the office",
    "someone is in the office to meet you",
    "to make sure that someone is in the office to meet you",
    course.sentences[7].english,
  ]);
});

test("reuses established objects instead of teaching them again", () => {
  const objectOccurrences = new Map();

  sentenceTasks
    .filter((task) => task.stage === "object")
    .forEach((task) => {
      const ids = objectOccurrences.get(task.answer.toLowerCase()) ?? [];
      ids.push(task.sentenceId);
      objectOccurrences.set(task.answer.toLowerCase(), ids);
    });

  for (const reused of ["television", "wall", "office"]) {
    assert.ok(objectOccurrences.has(reused), `${reused} cần có một lần làm neo`);
    assert.equal(
      new Set(objectOccurrences.get(reused)).size,
      1,
      `${reused} không được dạy lại như object ở câu sau`
    );
  }
});

test("provides complete contextual guidance and IPA coverage", () => {
  sentenceTasks.forEach((task) => {
    assert.ok(task.guide?.term, `${task.id} thiếu guide.term`);
    assert.ok(task.guide?.meaning, `${task.id} thiếu guide.meaning`);
    assert.ok(task.guide?.explanation, `${task.id} thiếu guide.explanation`);
    assert.ok(task.guide?.speech, `${task.id} thiếu guide.speech`);
  });

  const missingIpa = [
    ...new Set(sentenceTasks.flatMap((task) => tokenizeEnglish(task.answer))),
  ].filter((word) => !getAmericanIpa(word));

  assert.deepEqual(missingIpa, []);

  const byAnswer = new Map(sentenceTasks.map((task) => [task.answer, task]));
  assert.match(
    byAnswer.get("the UHD television").guide.explanation,
    /the.*xác định/i
  );
  assert.match(
    byAnswer.get("We would like to mount the television on this wall.")
      .guide.explanation,
    /would like to.*lịch sự/i
  );
  assert.match(
    byAnswer.get("to make sure that someone is in the office to meet you")
      .guide.explanation,
    /to make sure.*mục đích/i
  );
});

test("keeps ids and prompts unambiguous", () => {
  const ids = course.tasks.map((task) => task.id);
  const promptAnswers = new Map();

  course.tasks.forEach((task) => {
    assert.notEqual(
      task.prompt.trim().toLocaleLowerCase("vi"),
      task.answer.trim().toLocaleLowerCase("en"),
      `${task.id} đang hiển thị luôn đáp án trong câu hỏi`
    );

    const key = `${task.sentenceId}\u0000${task.prompt}`;
    const answers = promptAnswers.get(key) ?? new Set();
    answers.add(task.answer);
    promptAnswers.set(key, answers);
  });

  assert.equal(new Set(ids).size, ids.length);
  assert.equal(
    [...promptAnswers.values()].every((answers) => answers.size === 1),
    true
  );
});

test("interleaves the listening curriculum in groups of two to four tasks", () => {
  const groups = buildPracticeGroups(course.tasks);
  const knownTaskIds = new Set(course.tasks.map((task) => task.id));
  const groupCountByTask = new Map(
    course.tasks.map((task) => [task.id, 0])
  );

  assert.ok(groups.length > 0);
  groups.forEach((group) => {
    assert.ok(group.taskIds.length >= 2);
    assert.ok(group.taskIds.length <= 4);
    assert.equal(
      group.taskIds.every((taskId) => knownTaskIds.has(taskId)),
      true
    );
    group.taskIds.forEach((taskId) => {
      groupCountByTask.set(taskId, groupCountByTask.get(taskId) + 1);
    });
  });

  assert.deepEqual(
    [...groupCountByTask.entries()].filter(([, count]) => count !== 1),
    []
  );
});

test("does not repeat the full Home Appliance Mart answer in its guide parts", () => {
  const task = sentenceTasks.find((item) => item.id === "LS1-01-02");

  assert.equal(task.prompt, "tên cửa hàng thiết bị gia dụng nơi Steven làm việc");
  assert.deepEqual(task.guide.parts, []);
});

test("maps every task to a traceable WAV asset", async () => {
  const manifest = await readJson(
    "data/audio/listening-song-ngu-sample.json"
  );
  const entries = new Map(manifest.assets.map((entry) => [entry.audioId, entry]));
  const answersByAudioId = new Map();

  course.tasks.forEach((task) => {
    const answers = answersByAudioId.get(task.audioId) ?? new Set();
    answers.add(task.answer);
    answersByAudioId.set(task.audioId, answers);
  });

  answersByAudioId.forEach((answers, audioId) => {
    assert.equal(answers.size, 1, `${audioId} đang dùng cho nhiều answer`);
  });

  for (const task of course.tasks) {
    const entry = entries.get(task.audioId);
    assert.ok(entry, `${task.audioId} chưa có trong manifest`);
    assert.equal(entry.answer, task.answer);

    if (task.stage === "sentence") {
      assert.equal(entry.sourceType, "original");
      assert.equal(typeof entry.start, "number");
      assert.equal(typeof entry.end, "number");
    } else if (task.stage === "paragraph") {
      assert.equal(entry.sourceType, "cumulative");
      assert.ok(entry.clips.length >= 2);
    } else {
      assert.equal(entry.sourceType, "pedagogical");
    }

    const assetPath = path.join(
      root,
      course.audioBasePath.replace("./", ""),
      `${task.audioId}.${course.audioExtension}`
    );
    assert.equal(existsSync(assetPath), true, `${assetPath} không tồn tại`);
    const header = await readFile(assetPath);
    assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(header.subarray(8, 12).toString("ascii"), "WAVE");
  }
});
