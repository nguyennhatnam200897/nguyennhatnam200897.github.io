import test from "node:test";
import assert from "node:assert/strict";
import { loadDefaultCourse } from "./helpers/course-fixture.mjs";
import { evaluateAnswer, normalizeTextAnswer } from "../js/learning.mjs";
import {
  buildPronunciation,
  getAmericanIpa,
} from "../js/pronunciation.mjs";

const course = await loadDefaultCourse();
const article = course.article;
const tasks = course.tasks;

test("ignores capitalization and punctuation for text answers", () => {
  const task = {
    answer:
      "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
  };

  const result = evaluateAnswer(
    task,
    "many cities are trying to make daily life more sustainable but the most effective changes are often the least dramatic"
  );

  assert.equal(result.correct, true);
  assert.equal(result.kind, "format");
});

test("blocks missing article errors", () => {
  const task = {
    answer:
      "In one neighborhood, the local council turned an empty parking lot into a small public garden.",
  };

  const result = evaluateAnswer(
    task,
    "In one neighborhood, local council turned an empty parking lot into a small public garden."
  );

  assert.equal(result.correct, false);
  assert.match(result.message, /the/);
});

test("reports the first blocking token issue for targeted repair", () => {
  const result = evaluateAnswer({ answer: "many cities" }, "many cite");

  assert.equal(result.correct, false);
  assert.deepEqual(result.issue, {
    index: 1,
    actual: "cite",
    expected: "cities",
    type: "mismatch",
  });
});

test("normalizes text answers consistently", () => {
  assert.equal(
    normalizeTextAnswer("The project, also encouraged shops."),
    "the project also encouraged shops"
  );
});

test("provides simple American IPA for every word form in the article", () => {
  const missing = [
    ...new Set(
      tasks.flatMap(
        (task) => task.answer.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []
      )
    ),
  ].filter((word) => !getAmericanIpa(word));

  assert.deepEqual(missing, []);
  assert.equal(getAmericanIpa("city"), "/ˈsɪti/");
  assert.equal(getAmericanIpa("go"), null);
});

test("builds full IPA and identifies only newly introduced word forms", () => {
  assert.deepEqual(buildPronunciation("daily life", new Set(["life"])), {
    full: "/ˈdeɪli laɪf/",
    newWords: [{ term: "daily", ipa: "/ˈdeɪli/" }],
  });
});

test("keeps lesson tasks free of visible route labels", () => {
  assert.ok(tasks.length > 0);
  assert.equal(
    tasks.some((task) =>
      ["label", "taskTitle", "inputLabel", "supportText"].some((key) => key in task)
    ),
    false
  );
});

test("starts sentence one with singular, plural, then quantity", () => {
  assert.deepEqual(
    tasks.slice(0, 3).map(({ prompt, answer }) => ({ prompt, answer })),
    [
      { prompt: "thành phố", answer: "city" },
      { prompt: "các thành phố", answer: "cities" },
      { prompt: "nhiều thành phố", answer: "many cities" },
    ]
  );
});

test("adds a complete introduction before every exercise", () => {
  assert.equal(
    tasks.every(
      (task) =>
        task.guide?.term &&
        task.guide?.meaning &&
        task.guide?.explanation &&
        task.guide?.speech
    ),
    true
  );
});

test("adds contextual explanations for grammar and connector patterns", () => {
  const byId = new Map(tasks.map((task) => [task.id, task]));

  assert.match(byId.get("S2-06").guide.explanation, /the.*xác định/i);
  assert.match(byId.get("S2-14").guide.explanation, /an.*âm/i);
  assert.match(byId.get("S4-11").guide.explanation, /số nhiều.*child/i);
  assert.match(byId.get("S3-10").guide.explanation, /would.*sẽ/i);
  assert.match(byId.get("S6-09").guide.explanation, /although.*mặc dù/i);
  assert.match(byId.get("S4-31").guide.explanation, /where.*nơi/i);
  assert.match(byId.get("S6-07").guide.explanation, /how.*cách mà/i);
  assert.match(byId.get("S7-11").guide.explanation, /when.*khi/i);
  assert.match(byId.get("S5-20").guide.explanation, /encourage.*to do/i);
});

test("explains city, cities, and many cities as a strict i+1 sequence", () => {
  assert.equal(tasks[0].guide.term, "city");
  assert.equal(tasks[0].guide.meaning, "thành phố");
  assert.match(tasks[1].guide.explanation, /số nhiều.*city/i);
  assert.match(tasks[2].guide.explanation, /many.*nhiều/i);
  assert.deepEqual(tasks[2].guide.parts, [
    { term: "many", meaning: "nhiều", isNew: true },
    { term: "cities", meaning: "các thành phố", isNew: false },
  ]);
});

test("guidance shows American IPA for the full unit and only its new words", () => {
  assert.deepEqual(tasks[0].guide.pronunciation, {
    full: "/ˈsɪti/",
    newWords: [{ term: "city", ipa: "/ˈsɪti/" }],
  });
  assert.deepEqual(tasks[2].guide.pronunciation, {
    full: "/ˈmɛni ˈsɪtiz/",
    newWords: [{ term: "many", ipa: "/ˈmɛni/" }],
  });
  assert.deepEqual(tasks[4].guide.pronunciation, {
    full: "/ˈdeɪli laɪf/",
    newWords: [{ term: "daily", ipa: "/ˈdeɪli/" }],
  });
});

test("keeps single-object tasks to one-word nouns", () => {
  const objectTasks = tasks.filter((task) => task.stage === "object");

  assert.ok(objectTasks.length > 0);
  assert.equal(objectTasks.every((task) => !task.answer.includes(" ")), true);
});

test("builds sentence two from a basic relation to richer sentences", () => {
  const sentenceTwoAnswers = tasks
    .filter((task) => task.sentenceId === "S2")
    .map((task) => task.answer);

  const expectedProgression = [
    "the local council turned a parking lot into a garden",
    "the local council turned an empty parking lot into a garden",
    "the local council turned an empty parking lot into a small public garden",
    article.sentences[1].english,
  ];

  let previousIndex = -1;
  expectedProgression.forEach((answer) => {
    const index = sentenceTwoAnswers.indexOf(answer);
    assert.ok(index > previousIndex, `Missing or misplaced S2 step: ${answer}`);
    previousIndex = index;
  });
});

test("completes each sentence before moving to the next sentence", () => {
  article.sentences.forEach((sentence, sentenceIndex) => {
    const sentenceTasks = tasks.filter((task) => task.sentenceId === sentence.id);
    assert.ok(sentenceTasks.length > 0, `No tasks for ${sentence.id}`);
    assert.equal(
      sentenceTasks.at(-1).answer,
      sentence.english,
      `${sentence.id} must end with the original sentence`
    );

    if (sentenceIndex < article.sentences.length - 1) {
      const finalIndex = tasks.indexOf(sentenceTasks.at(-1));
      const nextSentenceFirstIndex = tasks.findIndex(
        (task) => task.sentenceId === article.sentences[sentenceIndex + 1].id
      );
      assert.ok(finalIndex < nextSentenceFirstIndex);
    }
  });
});

test("builds the paragraph cumulatively one sentence at a time", () => {
  const paragraphTasks = tasks.filter((task) => task.stage === "paragraph");

  assert.equal(paragraphTasks.length, article.sentences.length - 1);
  paragraphTasks.forEach((task, index) => {
    const sentenceCount = index + 2;
    assert.equal(
      task.answer,
      article.sentences
        .slice(0, sentenceCount)
        .map((sentence) => sentence.english)
        .join(" ")
    );
  });
});

test("does not create IPA exercises or visible route labels", () => {
  assert.equal(tasks.every((task) => task.mode !== "ipa"), true);
  assert.equal(tasks.every((task) => task.stage !== "ipa"), true);
  assert.equal(tasks.every((task) => !task.id.endsWith("-ipa")), true);
});

test("keeps task ids unique and avoids ambiguous prompts", () => {
  const ids = tasks.map((task) => task.id);
  const promptAnswers = new Map();

  tasks.forEach((task) => {
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
