# Meaning Chunk i+1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai lát cắt đầu tiên của phương pháp i+1 theo cụm nghĩa cho câu 1 trong course thử nghiệm `small-public-garden-gentle-i1`, giữ các course còn lại không đổi.

**Architecture:** Thêm lớp dữ liệu `meaningChunkLessons` và một bộ chuyển đổi nhỏ để sinh các task viết/nói độc lập từ cụm nghĩa, role line, composition task và repair rule. `course-model` chỉ dùng lớp mới khi `practiceProfile` là `meaning-chunk-i-plus-one`; các course cũ vẫn dùng `taskGroups`. UI hướng dẫn hiển thị `Khi nào cần?`, `Mục đích là gì?` và dòng vai trò trước bài tập, còn màn exercise vẫn chỉ có prompt tiếng Việt và ô trả lời tiếng Anh.

**Tech Stack:** Vanilla JavaScript ES modules, static JSON course data, Node built-in test runner, PowerShell audio generation script.

---

## File Structure

- Create: `js/meaning-chunks.mjs`
  - Chuyển `meaningChunkLessons` thành các task cùng shape với task hiện có.
  - Sinh `rollbackTargets` theo cụm hoàn chỉnh, không kéo người học về mảnh quá nhỏ như `cities` nếu lỗi nằm trong `many cities`.
  - Gắn metadata cho guide: `whenNeeded`, `roleQuestion`, `roleMeaning`, `roleLine`, `successMessage`.
- Create: `tests/meaning-chunks.test.mjs`
  - Kiểm thử bộ chuyển đổi bằng fixture nhỏ, độc lập với JSON course lớn.
- Modify: `js/course-model.mjs`
  - Nhận `practiceProfile: "meaning-chunk-i-plus-one"`.
  - Ưu tiên task sinh từ `meaningChunkLessons` cho sentence có dữ liệu mới, giữ `taskGroups` cũ cho sentence chưa migrate.
  - Giữ nguyên behavior của `small-public-garden` và profile `gentle-i-plus-one`.
- Modify: `js/guidance.mjs`
  - Không làm mất metadata guide mới khi gọi `attachGuidance`.
- Modify: `js/learning.mjs`
  - Thêm `normalizedActual` và `normalizedExpected` vào feedback sai để repair rule nhận diện lỗi phổ biến như `the least dramatic changes`.
- Modify: `js/mastery.mjs`
  - Cho frontier repair đọc cả `rollbackTargets` theo token span và `repairRules` theo common wrong answer.
- Modify: `index.html`, `styles.css`, `js/app.mjs`
  - Thêm vùng hiển thị role guidance trước exercise.
- Modify: `data/courses/small-public-garden-gentle-i1.json`
  - Bump `sessionVersion` lên `2`.
  - Đổi `practiceProfile` thành `meaning-chunk-i-plus-one`.
  - Thêm `meaningChunkProfile` và `meaningChunkLessons` cho câu 1.
- Modify: `tests/course-model.test.mjs`, `tests/learning.test.mjs`, `tests/mastery.test.mjs`, `tests/static-site.test.mjs`
  - Khóa regression cho course cũ, course thử nghiệm, metadata guide, repair rule và static HTML.
- Modify: `js/pronunciation.mjs`
  - Thêm IPA cho `try`, vì dữ liệu cụm mới có step `try`.

---

### Task 1: Meaning Chunk Converter

**Files:**
- Create: `tests/meaning-chunks.test.mjs`
- Create: `js/meaning-chunks.mjs`

- [ ] **Step 1: Write the failing converter test**

Create `tests/meaning-chunks.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the failing converter test**

Run: `node --test tests\meaning-chunks.test.mjs`

Expected: fail with an import error because `js/meaning-chunks.mjs` does not exist.

- [ ] **Step 3: Implement the converter**

Create `js/meaning-chunks.mjs`:

```js
import { normalizeTextAnswer } from "./learning.mjs";

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid meaning chunk data: ${field} must be a non-empty string.`);
  }
}

function normalizedTokens(value) {
  return normalizeTextAnswer(value).split(" ").filter(Boolean);
}

function findTokenSpan(source, target) {
  const sourceTokens = normalizedTokens(source);
  const targetTokens = normalizedTokens(target);

  if (targetTokens.length === 0 || targetTokens.length > sourceTokens.length) {
    return null;
  }

  for (let start = 0; start <= sourceTokens.length - targetTokens.length; start += 1) {
    const matches = targetTokens.every(
      (token, index) => sourceTokens[start + index] === token
    );

    if (matches) {
      return { start, end: start + targetTokens.length };
    }
  }

  return null;
}

function stageFor(answer, fallback) {
  const wordCount = normalizedTokens(answer).length;

  if (fallback) {
    return fallback;
  }

  return wordCount <= 1 ? "object" : "phrase";
}

function normalizeRoleLine(roleLine = []) {
  return roleLine.map((item) => ({
    roleQuestion: item.roleQuestion,
    chunkId: item.chunkId,
    english: item.english,
  }));
}

function buildStepGuide(chunk, step, isFinalStep) {
  return {
    term: step.answer,
    meaning: step.prompt,
    explanation:
      step.purpose ??
      (isFinalStep
        ? `${chunk.english} là cụm hoàn chỉnh cho ý "${chunk.vietnamese}".`
        : `${step.answer} là một bước nhỏ để đi tới cụm "${chunk.english}".`),
    parts: Array.isArray(step.parts) ? step.parts.map((part) => ({ ...part })) : [],
    speech: step.speech ?? step.answer,
    whenNeeded: chunk.whenNeeded,
    roleQuestion: chunk.roleQuestion,
    roleMeaning: chunk.roleMeaning,
    successMessage: step.successMessage ?? chunk.successMessage,
  };
}

function buildStepTask(lesson, chunk, step, stepIndex) {
  assertString(step.id, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].id`);
  assertString(step.prompt, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].prompt`);
  assertString(step.answer, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].answer`);

  const isFinalStep = stepIndex === chunk.iPlusOneSteps.length - 1;

  return {
    id: step.id,
    sentenceId: lesson.sentenceId,
    stage: step.stage ?? stageFor(step.answer, step.stage),
    prompt: step.prompt,
    answer: step.answer,
    audioId: step.audioId ?? step.id,
    meaningChunk: {
      id: chunk.id,
      english: chunk.english,
      vietnamese: chunk.vietnamese,
      chunkType: chunk.chunkType,
      roleQuestion: chunk.roleQuestion,
      isFinalStep,
    },
    guide: buildStepGuide(chunk, step, isFinalStep),
  };
}

function finalStepFor(chunk) {
  return chunk.iPlusOneSteps.at(-1);
}

function buildRollbackTargets(composition, chunksById) {
  return (composition.usesChunks ?? [])
    .map((chunkId) => {
      const chunk = chunksById.get(chunkId);
      const finalStep = chunk ? finalStepFor(chunk) : null;
      const span = chunk ? findTokenSpan(composition.answer, chunk.english) : null;

      if (!chunk || !finalStep || !span) {
        return null;
      }

      return {
        taskId: finalStep.id,
        start: span.start,
        end: span.end,
      };
    })
    .filter(Boolean);
}

function buildRepairRules(composition, lesson, chunksById) {
  return (lesson.repairRules ?? [])
    .filter((rule) => rule.appliesTo?.includes(composition.id))
    .map((rule) => {
      const chunk = chunksById.get(rule.chunkId);
      const finalStep = chunk ? finalStepFor(chunk) : null;

      if (!chunk || !finalStep) {
        return null;
      }

      return {
        taskId: finalStep.id,
        commonWrongAnswers: [...(rule.detect?.commonWrongAnswers ?? [])],
        message: rule.message,
      };
    })
    .filter(Boolean);
}

function buildCompositionGuide(composition) {
  const roleLine = normalizeRoleLine(composition.roleLine);

  return {
    term: composition.answer,
    meaning: composition.prompt,
    explanation:
      composition.explanation ??
      "Hãy dùng các cụm đã sở hữu để ghép thành một ý dài hơn.",
    parts: roleLine.map((item) => ({
      term: item.english,
      meaning: item.roleQuestion,
      isNew: false,
    })),
    speech: composition.speech ?? composition.answer,
    roleLine,
    successMessage: composition.successMessage,
  };
}

function buildCompositionTask(lesson, composition, chunksById) {
  assertString(composition.id, `${lesson.id}.compositionTasks.id`);
  assertString(composition.prompt, `${lesson.id}.${composition.id}.prompt`);
  assertString(composition.answer, `${lesson.id}.${composition.id}.answer`);

  const roleLine = normalizeRoleLine(composition.roleLine);
  const rollbackTargets = buildRollbackTargets(composition, chunksById);
  const repairRules = buildRepairRules(composition, lesson, chunksById);

  return {
    id: composition.id,
    sentenceId: lesson.sentenceId,
    stage: composition.stage ?? "clause",
    prompt: composition.prompt,
    answer: composition.answer,
    audioId: composition.audioId ?? composition.id,
    roleLine,
    usesChunks: [...(composition.usesChunks ?? [])],
    masteryCredit: [...(composition.masteryCredit ?? composition.usesChunks ?? [])],
    ...(rollbackTargets.length > 0 ? { rollbackTargets } : {}),
    ...(repairRules.length > 0 ? { repairRules } : {}),
    guide: buildCompositionGuide({ ...composition, roleLine }),
  };
}

function buildLessonTasks(lesson) {
  assertString(lesson.id, "meaningChunkLessons.id");
  assertString(lesson.sentenceId, `${lesson.id}.sentenceId`);

  const chunks = lesson.chunks ?? [];
  const chunksById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const stepTasks = chunks.flatMap((chunk) => {
    assertString(chunk.id, `${lesson.id}.chunks.id`);
    assertString(chunk.english, `${lesson.id}.${chunk.id}.english`);
    assertString(chunk.vietnamese, `${lesson.id}.${chunk.id}.vietnamese`);
    assertString(chunk.roleQuestion, `${lesson.id}.${chunk.id}.roleQuestion`);
    assertString(chunk.whenNeeded, `${lesson.id}.${chunk.id}.whenNeeded`);

    if (!Array.isArray(chunk.iPlusOneSteps) || chunk.iPlusOneSteps.length === 0) {
      throw new Error(
        `Invalid meaning chunk data: ${lesson.id}.${chunk.id}.iPlusOneSteps must not be empty.`
      );
    }

    return chunk.iPlusOneSteps.map((step, stepIndex) =>
      buildStepTask(lesson, chunk, step, stepIndex)
    );
  });

  const compositionTasks = (lesson.compositionTasks ?? []).map((composition) =>
    buildCompositionTask(lesson, composition, chunksById)
  );

  return [...stepTasks, ...compositionTasks];
}

export function buildMeaningChunkTaskGroups(meaningChunkLessons = []) {
  return meaningChunkLessons.map(buildLessonTasks);
}
```

- [ ] **Step 4: Run the converter test**

Run: `node --test tests\meaning-chunks.test.mjs`

Expected: pass.

- [ ] **Step 5: Commit the converter slice**

```bash
git add js/meaning-chunks.mjs tests/meaning-chunks.test.mjs
git commit -m "Add meaning chunk task converter"
```

---

### Task 2: Course Model Integration

**Files:**
- Modify: `js/course-model.mjs`
- Modify: `tests/course-model.test.mjs`

- [ ] **Step 1: Write failing course model tests**

Append to `tests/course-model.test.mjs`:

```js
test("builds a meaning chunk i+1 course without changing the original course", async () => {
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
            vietnamese: "nhiều thành phố",
            chunkType: "entity",
            roleQuestion: "Ai?",
            whenNeeded:
              "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
            roleMeaning: "Cụm này cho biết ai đang được nói tới.",
            iPlusOneSteps: [
              { id: "S1-C01-STEP01", prompt: "thành phố", answer: "city" },
              { id: "S1-C01-STEP02", prompt: "các thành phố", answer: "cities" },
              {
                id: "S1-C01-STEP03",
                prompt: "nhiều thành phố",
                answer: "many cities",
              },
            ],
          },
        ],
        compositionTasks: [],
      },
    ],
  });

  assert.equal(experiment.practiceProfile, "meaning-chunk-i-plus-one");
  assert.equal(experiment.practicePolicy.mode, "frontier-rollback");
  assert.equal(experiment.sessionVersion, 2);
  assert.equal(course.practicePolicy, undefined);
  assert.equal(course.tasks.some((task) => task.id === "S1-C01-STEP03"), false);
  assert.equal(
    experiment.tasks.some((task) => task.id === "S1-C01-STEP03"),
    true
  );
  assert.equal(
    experiment.tasks.some((task) => task.id === "S2-01"),
    true
  );
});

test("preserves meaning chunk metadata through normalization and guidance", () => {
  const meaningCourse = buildLessonCourse({
    id: "meaning-demo",
    title: "Meaning Demo",
    level: "A2",
    topic: "Demo",
    practiceProfile: "meaning-chunk-i-plus-one",
    paragraphTaskMode: "none",
    sentences: [
      {
        id: "S1",
        english: "Many cities are trying to.",
        vietnamese: "Nhiều thành phố đang cố gắng làm.",
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
            roleMeaning: "Cụm này trả lời câu hỏi ai.",
            iPlusOneSteps: [
              { id: "S1-C01-STEP01", prompt: "thành phố", answer: "city" },
              {
                id: "S1-C01-STEP02",
                prompt: "nhiều thành phố",
                answer: "many cities",
              },
            ],
          },
        ],
        compositionTasks: [
          {
            id: "S1-M01",
            prompt: "nhiều thành phố đang cố gắng làm",
            answer: "many cities are trying to",
            usesChunks: ["S1-C01"],
            roleLine: [
              { roleQuestion: "Ai?", chunkId: "S1-C01", english: "many cities" },
            ],
          },
        ],
      },
    ],
  });
  const byId = new Map(meaningCourse.tasks.map((task) => [task.id, task]));

  assert.equal(byId.get("S1-C01-STEP02").guide.whenNeeded, "Khi muốn nói về nhiều thành phố.");
  assert.equal(byId.get("S1-C01-STEP02").guide.roleQuestion, "Ai?");
  assert.deepEqual(byId.get("S1-M01").roleLine, [
    { roleQuestion: "Ai?", chunkId: "S1-C01", english: "many cities" },
  ]);
});
```

- [ ] **Step 2: Run the failing course model test**

Run: `node --test tests\course-model.test.mjs`

Expected: fail because `meaning-chunk-i-plus-one` is not a valid profile and metadata is stripped.

- [ ] **Step 3: Import the converter and preserve task metadata**

In `js/course-model.mjs`, add the import:

```js
import { buildMeaningChunkTaskGroups } from "./meaning-chunks.mjs";
```

In `normalizeGuide`, preserve the new fields:

```js
function normalizeGuide(guide) {
  if (!guide) {
    return undefined;
  }

  return {
    term: guide.term,
    meaning: guide.meaning,
    explanation: guide.explanation,
    parts: Array.isArray(guide.parts)
      ? guide.parts.map((part) => ({ ...part }))
      : [],
    speech: guide.speech,
    ...(typeof guide.whenNeeded === "string"
      ? { whenNeeded: guide.whenNeeded }
      : {}),
    ...(typeof guide.roleQuestion === "string"
      ? { roleQuestion: guide.roleQuestion }
      : {}),
    ...(typeof guide.roleMeaning === "string"
      ? { roleMeaning: guide.roleMeaning }
      : {}),
    ...(Array.isArray(guide.roleLine)
      ? { roleLine: guide.roleLine.map((item) => ({ ...item })) }
      : {}),
    ...(typeof guide.successMessage === "string"
      ? { successMessage: guide.successMessage }
      : {}),
  };
}
```

In `normalizeTask`, preserve the new top-level task fields:

```js
function normalizeTask(task, indexPath) {
  ["id", "sentenceId", "stage", "prompt", "answer"].forEach((field) => {
    assertString(task[field], `${indexPath}.${field}`);
  });

  return {
    id: task.id,
    sentenceId: task.sentenceId,
    ...(Array.isArray(task.sentenceIds)
      ? { sentenceIds: [...task.sentenceIds] }
      : {}),
    stage: task.stage,
    prompt: task.prompt,
    answer: task.answer,
    audioId: task.audioId ?? task.id,
    ...(task.isBridge ? { isBridge: true } : {}),
    ...(typeof task.bridgeForTaskId === "string"
      ? { bridgeForTaskId: task.bridgeForTaskId }
      : {}),
    ...(typeof task.supportLevel === "string"
      ? { supportLevel: task.supportLevel }
      : {}),
    ...(task.meaningChunk ? { meaningChunk: { ...task.meaningChunk } } : {}),
    ...(Array.isArray(task.roleLine)
      ? { roleLine: task.roleLine.map((item) => ({ ...item })) }
      : {}),
    ...(Array.isArray(task.usesChunks)
      ? { usesChunks: [...task.usesChunks] }
      : {}),
    ...(Array.isArray(task.masteryCredit)
      ? { masteryCredit: [...task.masteryCredit] }
      : {}),
    ...(Array.isArray(task.rollbackTargets)
      ? {
          rollbackTargets: task.rollbackTargets.map((target) => ({
            taskId: target.taskId,
            start: Number(target.start),
            end: Number(target.end),
          })),
        }
      : {}),
    ...(Array.isArray(task.repairRules)
      ? {
          repairRules: task.repairRules.map((rule) => ({
            taskId: rule.taskId,
            commonWrongAnswers: [...(rule.commonWrongAnswers ?? [])],
            message: rule.message,
          })),
        }
      : {}),
    ...(task.guide ? { guide: normalizeGuide(task.guide) } : {}),
  };
}
```

- [ ] **Step 4: Add the new practice profile**

Replace `normalizePracticeProfile` and `buildPracticePolicy` in `js/course-model.mjs` with:

```js
function normalizePracticeProfile(profile) {
  if (!profile) {
    return undefined;
  }

  const knownProfiles = new Set([
    "gentle-i-plus-one",
    "meaning-chunk-i-plus-one",
  ]);

  if (!knownProfiles.has(profile)) {
    throw new Error(`Invalid course data: unknown practiceProfile "${profile}".`);
  }

  return profile;
}

function buildPracticePolicy(practiceProfile) {
  if (
    practiceProfile === "gentle-i-plus-one" ||
    practiceProfile === "meaning-chunk-i-plus-one"
  ) {
    return {
      mode: "frontier-rollback",
      minCorrect: 2,
      repairCorrectCount: 1,
    };
  }

  return undefined;
}
```

- [ ] **Step 5: Build mixed task groups for meaning chunk lessons**

Add this helper to `js/course-model.mjs`:

```js
function buildRawTaskGroups(courseData, practiceProfile) {
  const legacyGroups = courseData.taskGroups ?? [];

  if (
    practiceProfile !== "meaning-chunk-i-plus-one" ||
    !Array.isArray(courseData.meaningChunkLessons) ||
    courseData.meaningChunkLessons.length === 0
  ) {
    return legacyGroups;
  }

  const meaningGroups = buildMeaningChunkTaskGroups(courseData.meaningChunkLessons);
  const meaningSentenceIds = new Set(
    courseData.meaningChunkLessons.map((lesson) => lesson.sentenceId)
  );
  const legacyBySentenceId = new Map(
    legacyGroups.map((group) => [group[0]?.sentenceId, group])
  );

  return (courseData.sentences ?? []).flatMap((sentence) => {
    if (meaningSentenceIds.has(sentence.id)) {
      return meaningGroups.filter((group) => group[0]?.sentenceId === sentence.id);
    }

    const legacyGroup = legacyBySentenceId.get(sentence.id);
    return legacyGroup ? [legacyGroup] : [];
  });
}
```

Then replace the existing `sentenceTaskGroups` creation inside `buildLessonCourse` with:

```js
  const rawTaskGroups = buildRawTaskGroups(courseData, practiceProfile);
  const sentenceTaskGroups = rawTaskGroups.map((group, groupIndex) =>
    insertBridgeTasks(
      group.map((task, taskIndex) =>
        normalizeTask(task, `taskGroups[${groupIndex}][${taskIndex}]`)
      ),
      practiceProfile
    )
  );
```

- [ ] **Step 6: Run the focused tests**

Run: `node --test tests\meaning-chunks.test.mjs tests\course-model.test.mjs`

Expected: pass.

- [ ] **Step 7: Commit the course model slice**

```bash
git add js/course-model.mjs tests/course-model.test.mjs
git commit -m "Wire meaning chunk lessons into course model"
```

---

### Task 3: Guidance Metadata and UI

**Files:**
- Modify: `js/guidance.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Write failing static UI tests**

Append to `tests/static-site.test.mjs`:

```js
test("renders meaning chunk role guidance in the guide screen", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");

  assert.match(html, /id="guide-role"/);
  assert.match(html, /id="guide-when-needed"/);
  assert.match(html, /id="guide-role-line"/);
  assert.match(appSource, /renderGuideRole/);
  assert.match(appSource, /task\.guide\.whenNeeded/);
  assert.match(appSource, /task\.guide\.roleQuestion/);
});
```

- [ ] **Step 2: Run the failing static UI test**

Run: `node --test tests\static-site.test.mjs`

Expected: fail because the guide role nodes and renderer do not exist.

- [ ] **Step 3: Preserve metadata in generated guidance**

In `js/guidance.mjs`, inside the `if (task.guide)` branch of `createGuidance`, return the new fields:

```js
    return {
      term: task.guide.term ?? task.answer,
      meaning: task.guide.meaning ?? task.prompt,
      explanation:
        task.guide.explanation ??
        genericExplanation({ ...task, guide: undefined }, previousTask),
      parts: Array.isArray(task.guide.parts)
        ? task.guide.parts.map((part) => ({ ...part }))
        : [],
      speech: task.guide.speech ?? task.answer,
      ...(typeof task.guide.whenNeeded === "string"
        ? { whenNeeded: task.guide.whenNeeded }
        : {}),
      ...(typeof task.guide.roleQuestion === "string"
        ? { roleQuestion: task.guide.roleQuestion }
        : {}),
      ...(typeof task.guide.roleMeaning === "string"
        ? { roleMeaning: task.guide.roleMeaning }
        : {}),
      ...(Array.isArray(task.guide.roleLine)
        ? { roleLine: task.guide.roleLine.map((item) => ({ ...item })) }
        : {}),
      ...(typeof task.guide.successMessage === "string"
        ? { successMessage: task.guide.successMessage }
        : {}),
    };
```

- [ ] **Step 4: Add guide role nodes to HTML**

In `index.html`, add this block after `guide-explanation` and before `guide-new-words`:

```html
            <div id="guide-role" class="guideRole" hidden>
              <div id="guide-when-needed"></div>
              <div id="guide-purpose"></div>
              <div id="guide-role-meaning"></div>
            </div>
            <div id="guide-role-line" class="guideRoleLine" hidden></div>
```

- [ ] **Step 5: Add role guidance styles**

In `styles.css`, add after `.guideExplanation`:

```css
.guideRole {
  background: var(--green-soft);
  border: 1px solid #d6e6d5;
  border-radius: 6px;
  display: grid;
  gap: 10px;
  line-height: 1.55;
  margin-top: 22px;
  padding: 16px;
}

.guideRole div {
  color: var(--text);
  font-size: 16px;
}

.guideRole strong {
  color: var(--green);
}

.guideRoleLine {
  border: 1px solid var(--line);
  border-radius: 6px;
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding: 14px;
}

.guideRoleLine p {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.45;
  margin: 0;
}

.guideRoleLine strong {
  color: var(--green);
}
```

- [ ] **Step 6: Render role guidance in the app**

In `js/app.mjs`, add the new elements:

```js
  guidePurpose: document.querySelector("#guide-purpose"),
  guideRole: document.querySelector("#guide-role"),
  guideRoleLine: document.querySelector("#guide-role-line"),
  guideRoleMeaning: document.querySelector("#guide-role-meaning"),
  guideWhenNeeded: document.querySelector("#guide-when-needed"),
```

Add these functions before `renderGuide`:

```js
function renderGuideRole(guide) {
  const hasRole = Boolean(
    guide.whenNeeded || guide.roleQuestion || guide.roleMeaning
  );

  elements.guideRole.hidden = !hasRole;
  elements.guideWhenNeeded.textContent = "";
  elements.guidePurpose.textContent = "";
  elements.guideRoleMeaning.textContent = "";

  if (!hasRole) {
    return;
  }

  if (guide.whenNeeded) {
    const label = document.createElement("strong");
    const text = document.createTextNode(` ${guide.whenNeeded}`);

    label.textContent = "Khi nào cần?";
    elements.guideWhenNeeded.append(label, text);
  }

  if (guide.roleQuestion) {
    const label = document.createElement("strong");
    const text = document.createTextNode(` ${guide.roleQuestion}`);

    label.textContent = "Mục đích là gì?";
    elements.guidePurpose.append(label, text);
  }

  if (guide.roleMeaning) {
    const label = document.createElement("strong");
    const text = document.createTextNode(` ${guide.roleMeaning}`);

    label.textContent = "Vai trò trong câu:";
    elements.guideRoleMeaning.append(label, text);
  }
}

function renderGuideRoleLine(roleLine = []) {
  elements.guideRoleLine.replaceChildren();
  elements.guideRoleLine.hidden = roleLine.length === 0;

  roleLine.forEach((item) => {
    const row = document.createElement("p");
    const role = document.createElement("strong");
    const arrow = document.createElement("span");
    const term = document.createElement("span");

    role.textContent = item.roleQuestion;
    arrow.textContent = "->";
    term.textContent = item.english;
    row.append(role, arrow, term);
    elements.guideRoleLine.append(row);
  });
}
```

Then update `renderGuide(task)`:

```js
function renderGuide(task) {
  elements.guideTerm.textContent = task.guide.term;
  elements.guideMeaning.textContent = task.guide.meaning;
  elements.guideExplanation.textContent = task.guide.explanation;
  renderGuideRole(task.guide);
  renderGuideRoleLine(task.guide.roleLine ?? task.roleLine ?? []);
  renderPronunciation(task.guide.pronunciation);
  renderGuideParts(task.guide.parts);
}
```

- [ ] **Step 7: Run focused UI tests**

Run: `node --test tests\static-site.test.mjs tests\course-model.test.mjs`

Expected: pass.

- [ ] **Step 8: Commit the UI slice**

```bash
git add js/guidance.mjs js/app.mjs index.html styles.css tests/static-site.test.mjs
git commit -m "Show meaning chunk role guidance"
```

---

### Task 4: Repair Rules for Common Wrong Answers

**Files:**
- Modify: `js/learning.mjs`
- Modify: `js/mastery.mjs`
- Modify: `tests/learning.test.mjs`
- Modify: `tests/mastery.test.mjs`

- [ ] **Step 1: Add failing learning metadata test**

Append to `tests/learning.test.mjs`:

```js
test("includes normalized answers in blocking feedback for repair rules", () => {
  const result = evaluateAnswer(
    { answer: "the most effective changes are often the least dramatic" },
    "the most effective changes are often the least dramatic changes"
  );

  assert.equal(result.correct, false);
  assert.equal(
    result.normalizedActual,
    "the most effective changes are often the least dramatic changes"
  );
  assert.equal(
    result.normalizedExpected,
    "the most effective changes are often the least dramatic"
  );
});
```

- [ ] **Step 2: Add failing mastery repair rule test**

Append to `tests/mastery.test.mjs`:

```js
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
```

- [ ] **Step 3: Run failing repair tests**

Run: `node --test tests\learning.test.mjs tests\mastery.test.mjs`

Expected: fail because feedback lacks normalized strings and mastery ignores `repairRules`.

- [ ] **Step 4: Add normalized feedback fields**

In `js/learning.mjs`, inside the wrong-answer return object in `evaluateAnswer`, add:

```js
    normalizedActual: actual,
    normalizedExpected: expected,
```

The wrong-answer return should include:

```js
  return {
    correct: false,
    kind: "blocking",
    message: issue.message,
    expected: task.answer,
    normalizedActual: actual,
    normalizedExpected: expected,
    issue: {
      index: issue.index,
      actual: issue.actual,
      expected: issue.expected,
      type: issue.type,
    },
    notes: ["Lỗi này chặn qua vì output phải tái tạo đúng từ/cụm/câu của bài gốc."],
  };
```

- [ ] **Step 5: Preserve repair rules in frontier groups**

In `js/mastery.mjs`, update `buildFrontierGroups`:

```js
function buildFrontierGroups(tasks, practicePolicy = {}) {
  const minCorrect = Number(practicePolicy.minCorrect) || 2;
  const repairCorrectCount = Number(practicePolicy.repairCorrectCount) || 1;

  return tasks.map((task) =>
    group(`frontier-${task.id}`, [task.id], {
      minCorrect,
      minStreak: 1,
      requiresInterleavedCorrect: false,
      repairCorrectCount,
      ...(Array.isArray(task.rollbackTargets) && task.rollbackTargets.length > 0
        ? {
            rollbackTargetsByTaskId: {
              [task.id]: task.rollbackTargets.map((target) => ({ ...target })),
            },
          }
        : {}),
      ...(Array.isArray(task.repairRules) && task.repairRules.length > 0
        ? {
            repairRulesByTaskId: {
              [task.id]: task.repairRules.map((rule) => ({ ...rule })),
            },
          }
        : {}),
    })
  );
}
```

- [ ] **Step 6: Match common wrong answer before token span repair**

In `js/mastery.mjs`, add:

```js
function normalizeRuleText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[.,!?;:"\u201c\u201d\u2018\u2019'()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function repairRuleTaskIdFor(groupToCheck, taskId, feedback) {
  const normalizedActual = normalizeRuleText(feedback?.normalizedActual);
  const repairRules = groupToCheck.repairRulesByTaskId?.[taskId] ?? [];

  if (!normalizedActual || repairRules.length === 0) {
    return null;
  }

  const match = repairRules.find((rule) =>
    (rule.commonWrongAnswers ?? []).some((wrongAnswer) =>
      normalizedActual.includes(normalizeRuleText(wrongAnswer))
    )
  );

  return match?.taskId ?? null;
}
```

Then change the start of `rollbackTaskIdFor`:

```js
function rollbackTaskIdFor(groupToCheck, taskId, feedback) {
  const ruleTaskId = repairRuleTaskIdFor(groupToCheck, taskId, feedback);

  if (ruleTaskId) {
    return ruleTaskId;
  }

  const issueIndex = Number(feedback?.issue?.index);
  const rollbackTargets = groupToCheck.rollbackTargetsByTaskId?.[taskId] ?? [];
```

- [ ] **Step 7: Run focused repair tests**

Run: `node --test tests\learning.test.mjs tests\mastery.test.mjs`

Expected: pass.

- [ ] **Step 8: Commit the repair slice**

```bash
git add js/learning.mjs js/mastery.mjs tests/learning.test.mjs tests/mastery.test.mjs
git commit -m "Add meaning chunk repair rules"
```

---

### Task 5: Sentence 1 Meaning Chunk Data

**Files:**
- Modify: `data/courses/small-public-garden-gentle-i1.json`
- Modify: `js/pronunciation.mjs`
- Modify: `tests/course-model.test.mjs`
- Modify: `tests/learning.test.mjs`

- [ ] **Step 1: Add failing course data tests**

Replace the existing test named `"builds the gentle i+1 experiment as a cloned course with bridges"` in `tests/course-model.test.mjs` with:

```js
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
  assert.deepEqual(experiment.article.sentences, course.article.sentences);
  assert.equal(course.practicePolicy, undefined);
  assert.equal(course.tasks.some((task) => task.id === "S1-C01-STEP03"), false);
  assert.equal(experiment.tasks.some((task) => task.id === "S1-C01-STEP03"), true);
  assert.equal(experiment.tasks.some((task) => task.id === "S2-01"), true);
  assert.equal(byId.get("S1-C01-STEP03").answer, "many cities");
  assert.equal(byId.get("S1-M03").answer, "many cities are trying to make daily life more sustainable");
  assert.equal(byId.get("S1-M03").guide.roleLine.length, 4);
  assert.deepEqual(
    byId.get("S1-M03").rollbackTargets.find(
      (target) => target.taskId === "S1-C01-STEP03"
    ),
    {
      taskId: "S1-C01-STEP03",
      start: 0,
      end: 2,
    }
  );
});
```

Append to `tests/course-model.test.mjs`:

```js
test("gentle i+1 course starts sentence one with meaning chunk data", async () => {
  const experimentData = await readCourseData(
    "../data/courses/small-public-garden-gentle-i1.json"
  );
  const experiment = buildLessonCourse(experimentData);
  const firstSentenceTasks = experiment.tasks.filter(
    (task) => task.sentenceId === "S1"
  );
  const byId = new Map(experiment.tasks.map((task) => [task.id, task]));

  assert.equal(experiment.practiceProfile, "meaning-chunk-i-plus-one");
  assert.equal(experiment.sessionVersion, 2);
  assert.deepEqual(
    firstSentenceTasks.slice(0, 8).map((task) => task.id),
    [
      "S1-C01-STEP01",
      "S1-C01-STEP02",
      "S1-C01-STEP03",
      "S1-C02-STEP01",
      "S1-C02-STEP02",
      "S1-C02-STEP03",
      "S1-C03-STEP01",
      "S1-C03-STEP02",
    ]
  );
  assert.equal(byId.get("S1-C01-STEP03").guide.roleQuestion, "Ai?");
  assert.equal(byId.get("S1-M03").answer, "many cities are trying to make daily life more sustainable");
  assert.deepEqual(
    byId.get("S1-M03").rollbackTargets.find(
      (target) => target.taskId === "S1-C01-STEP03"
    ),
    { taskId: "S1-C01-STEP03", start: 0, end: 2 }
  );
  assert.equal(
    experiment.tasks.some((task) => task.id === "S2-01"),
    true
  );
});
```

Append to `tests/learning.test.mjs`:

```js
test("provides simple American IPA for meaning chunk step words", async () => {
  const experimentData = JSON.parse(
    await readFile(
      new URL("../data/courses/small-public-garden-gentle-i1.json", import.meta.url),
      "utf8"
    )
  );
  const experiment = buildLessonCourse(experimentData);
  const missing = [
    ...new Set(
      experiment.tasks.flatMap(
        (task) => task.answer.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []
      )
    ),
  ].filter((word) => !getAmericanIpa(word));

  assert.deepEqual(missing, []);
});
```

Also add this import near the top of `tests/learning.test.mjs`:

```js
import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";
```

- [ ] **Step 2: Run failing data tests**

Run: `node --test tests\course-model.test.mjs tests\learning.test.mjs`

Expected: fail because the course still uses `gentle-i-plus-one` and `try` has no IPA.

- [ ] **Step 3: Add IPA for `try`**

In `js/pronunciation.mjs`, add near `trying`:

```js
  try: "/traɪ/",
```

- [ ] **Step 4: Update the Gentle i+1 course metadata**

In `data/courses/small-public-garden-gentle-i1.json`:

- Change `sessionVersion` from `1` to `2`.
- Change `practiceProfile` from `gentle-i-plus-one` to `meaning-chunk-i-plus-one`.
- Update the description to:

```json
"description": "Bản thử nghiệm i+1 theo cụm nghĩa: học từng cụm có vai trò rõ ràng, rồi ghép thành ý dài hơn."
```

- Add this object after `practiceProfile`:

```json
  "meaningChunkProfile": {
    "version": 1,
    "scriptSpec": "docs/superpowers/specs/2026-06-12-sentence-1-meaning-chunk-learning-script.md",
    "masteryRule": {
      "minCorrect": 2,
      "requiresInterleavedCorrect": true,
      "requiresUseInLongerMeaning": true
    }
  },
```

- [ ] **Step 5: Add sentence 1 meaning chunk data**

Add this `meaningChunkLessons` array before `taskGroups`:

```json
  "meaningChunkLessons": [
    {
      "id": "S1-meaning-chunks",
      "sentenceId": "S1",
      "source": {
        "english": "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
        "vietnamese": "Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất."
      },
      "chunks": [
        {
          "id": "S1-C01",
          "english": "many cities",
          "vietnamese": "nhiều thành phố",
          "chunkType": "entity",
          "roleQuestion": "Ai?",
          "whenNeeded": "Khi muốn nói về nhiều thành phố như một nhóm đang làm điều gì đó.",
          "roleMeaning": "Cụm này cho biết ai hoặc cái gì đang được nói tới.",
          "iPlusOneSteps": [
            {
              "id": "S1-C01-STEP01",
              "prompt": "thành phố",
              "answer": "city",
              "audioId": "S1-01",
              "purpose": "Tạo mỏ neo nghĩa."
            },
            {
              "id": "S1-C01-STEP02",
              "prompt": "các thành phố",
              "answer": "cities",
              "audioId": "S1-02",
              "purpose": "Thêm lớp số nhiều."
            },
            {
              "id": "S1-C01-STEP03",
              "prompt": "nhiều thành phố",
              "answer": "many cities",
              "audioId": "S1-03",
              "purpose": "Thêm lớp số lượng và hoàn chỉnh cụm."
            }
          ]
        },
        {
          "id": "S1-C02",
          "english": "are trying to",
          "vietnamese": "đang cố gắng làm",
          "chunkType": "action-frame",
          "roleQuestion": "Đang cố làm gì?",
          "whenNeeded": "Khi muốn nói ai đó đang cố gắng làm một việc, nhưng việc đó chưa chắc đã xong.",
          "roleMeaning": "Cụm này mở ra ý định hoặc nỗ lực của chủ thể.",
          "iPlusOneSteps": [
            {
              "id": "S1-C02-STEP01",
              "prompt": "cố gắng",
              "answer": "try",
              "purpose": "Nắm lõi nghĩa là cố gắng."
            },
            {
              "id": "S1-C02-STEP02",
              "prompt": "đang cố gắng",
              "answer": "are trying",
              "purpose": "Thêm cảm giác hành động đang diễn ra."
            },
            {
              "id": "S1-C02-STEP03",
              "prompt": "đang cố gắng làm",
              "answer": "are trying to",
              "purpose": "Mở ra hành động phía sau."
            }
          ]
        },
        {
          "id": "S1-C03",
          "english": "make daily life",
          "vietnamese": "làm cho đời sống hằng ngày",
          "chunkType": "action-object",
          "roleQuestion": "Tác động vào cái gì?",
          "whenNeeded": "Khi muốn nói một hành động tác động vào đời sống hằng ngày.",
          "roleMeaning": "Cụm này cho biết hành động đang chạm tới đối tượng nào.",
          "iPlusOneSteps": [
            {
              "id": "S1-C03-STEP01",
              "prompt": "cuộc sống",
              "answer": "life",
              "audioId": "S1-04",
              "purpose": "Tạo mỏ neo nghĩa."
            },
            {
              "id": "S1-C03-STEP02",
              "prompt": "đời sống hằng ngày",
              "answer": "daily life",
              "audioId": "S1-05",
              "purpose": "Biến mỏ neo thành một cụm đời sống cụ thể."
            },
            {
              "id": "S1-C03-STEP03",
              "prompt": "làm cho đời sống hằng ngày",
              "answer": "make daily life",
              "purpose": "Đặt đời sống hằng ngày vào một hành động có tác động."
            }
          ]
        },
        {
          "id": "S1-C04",
          "english": "more sustainable",
          "vietnamese": "bền vững hơn",
          "chunkType": "result",
          "roleQuestion": "Kết quả gì?",
          "whenNeeded": "Khi muốn nói một điều gì đó trở nên bền vững hơn.",
          "roleMeaning": "Cụm này cho biết trạng thái hoặc kết quả muốn đạt tới.",
          "iPlusOneSteps": [
            {
              "id": "S1-C04-STEP01",
              "prompt": "bền vững",
              "answer": "sustainable",
              "purpose": "Nắm trạng thái nền."
            },
            {
              "id": "S1-C04-STEP02",
              "prompt": "bền vững hơn",
              "answer": "more sustainable",
              "purpose": "Thêm hướng cải thiện."
            }
          ]
        },
        {
          "id": "S1-C05",
          "english": "the most effective changes",
          "vietnamese": "những thay đổi hiệu quả nhất",
          "chunkType": "claim-subject",
          "roleQuestion": "Cái gì đang được nhận định?",
          "whenNeeded": "Khi muốn nói về những thay đổi tốt nhất hoặc có tác dụng nhất.",
          "roleMeaning": "Cụm này cho biết điều đang được đưa ra nhận định.",
          "iPlusOneSteps": [
            {
              "id": "S1-C05-STEP01",
              "prompt": "sự thay đổi",
              "answer": "change",
              "audioId": "S1-10",
              "purpose": "Tạo mỏ neo nghĩa."
            },
            {
              "id": "S1-C05-STEP02",
              "prompt": "những thay đổi",
              "answer": "changes",
              "audioId": "S1-11",
              "purpose": "Thêm lớp số nhiều."
            },
            {
              "id": "S1-C05-STEP03",
              "prompt": "những thay đổi hiệu quả",
              "answer": "effective changes",
              "audioId": "S1-12",
              "purpose": "Thêm chất lượng của thay đổi."
            },
            {
              "id": "S1-C05-STEP04",
              "prompt": "những thay đổi hiệu quả nhất",
              "answer": "the most effective changes",
              "audioId": "S1-13",
              "purpose": "Thêm lớp so sánh cao nhất và xác định nhóm đang được nói tới."
            }
          ]
        },
        {
          "id": "S1-C06",
          "english": "are often",
          "vietnamese": "thường là",
          "chunkType": "claim-link",
          "roleQuestion": "Thường là gì?",
          "whenNeeded": "Khi muốn nói điều gì đó thường xảy ra hoặc thường đúng.",
          "roleMeaning": "Cụm này nối điều được nhận định với đặc điểm thường gặp.",
          "iPlusOneSteps": [
            {
              "id": "S1-C06-STEP01",
              "prompt": "là",
              "answer": "are",
              "purpose": "Nắm phần nối nhận định."
            },
            {
              "id": "S1-C06-STEP02",
              "prompt": "thường là",
              "answer": "are often",
              "purpose": "Thêm sắc thái thường xảy ra."
            }
          ]
        },
        {
          "id": "S1-C07",
          "english": "the least dramatic",
          "vietnamese": "ít gây ấn tượng mạnh nhất",
          "chunkType": "description",
          "roleQuestion": "Có đặc điểm gì?",
          "whenNeeded": "Khi muốn nói một thứ ít gây ấn tượng mạnh nhất hoặc ít nổi bật nhất.",
          "roleMeaning": "Cụm này cho biết đặc điểm của điều đang được nhận định.",
          "iPlusOneSteps": [
            {
              "id": "S1-C07-STEP01",
              "prompt": "gây ấn tượng mạnh",
              "answer": "dramatic",
              "purpose": "Nắm đặc điểm nền."
            },
            {
              "id": "S1-C07-STEP02",
              "prompt": "ít gây ấn tượng mạnh nhất",
              "answer": "the least dramatic",
              "purpose": "Giữ đúng dạng rút gọn của câu gốc, không lặp lại changes ở cuối."
            }
          ]
        },
        {
          "id": "S1-C08",
          "english": "but",
          "vietnamese": "nhưng",
          "chunkType": "linker",
          "roleQuestion": "Quan hệ giữa hai ý là gì?",
          "whenNeeded": "Khi ý sau đổi hướng hoặc hơi trái với điều người nghe có thể đang nghĩ.",
          "roleMeaning": "Cụm này báo hiệu ý sau làm người nghe nhìn lại ý trước theo hướng khác.",
          "iPlusOneSteps": [
            {
              "id": "S1-C08-STEP01",
              "prompt": "nhưng",
              "answer": "but",
              "purpose": "Nắm quan hệ đổi hướng giữa hai ý."
            }
          ]
        }
      ],
      "compositionTasks": [
        {
          "id": "S1-M01",
          "prompt": "nhiều thành phố đang cố gắng làm",
          "answer": "many cities are trying to",
          "usesChunks": ["S1-C01", "S1-C02"],
          "masteryCredit": ["S1-C01", "S1-C02"],
          "roleLine": [
            { "roleQuestion": "Ai?", "chunkId": "S1-C01", "english": "many cities" },
            { "roleQuestion": "Đang cố làm gì?", "chunkId": "S1-C02", "english": "are trying to" }
          ],
          "successMessage": "Bạn đã ghép được: ai đang cố làm gì."
        },
        {
          "id": "S1-M02",
          "prompt": "làm cho đời sống hằng ngày bền vững hơn",
          "answer": "make daily life more sustainable",
          "usesChunks": ["S1-C03", "S1-C04"],
          "masteryCredit": ["S1-C03", "S1-C04"],
          "roleLine": [
            { "roleQuestion": "Tác động vào cái gì?", "chunkId": "S1-C03", "english": "make daily life" },
            { "roleQuestion": "Kết quả gì?", "chunkId": "S1-C04", "english": "more sustainable" }
          ],
          "successMessage": "Bạn đã ghép được: hành động tác động vào cái gì để đạt kết quả gì."
        },
        {
          "id": "S1-M03",
          "prompt": "nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn",
          "answer": "many cities are trying to make daily life more sustainable",
          "audioId": "S1-09",
          "usesChunks": ["S1-C01", "S1-C02", "S1-C03", "S1-C04"],
          "masteryCredit": ["S1-C01", "S1-C02", "S1-C03", "S1-C04"],
          "roleLine": [
            { "roleQuestion": "Ai?", "chunkId": "S1-C01", "english": "many cities" },
            { "roleQuestion": "Đang cố làm gì?", "chunkId": "S1-C02", "english": "are trying to" },
            { "roleQuestion": "Tác động vào cái gì?", "chunkId": "S1-C03", "english": "make daily life" },
            { "roleQuestion": "Kết quả gì?", "chunkId": "S1-C04", "english": "more sustainable" }
          ],
          "successMessage": "Bạn đã viết được một ý hoàn chỉnh: ai đang cố làm gì, tác động vào cái gì, để đạt kết quả gì."
        },
        {
          "id": "S1-M04",
          "prompt": "những thay đổi hiệu quả nhất thường là",
          "answer": "the most effective changes are often",
          "usesChunks": ["S1-C05", "S1-C06"],
          "masteryCredit": ["S1-C05", "S1-C06"],
          "roleLine": [
            { "roleQuestion": "Cái gì đang được nhận định?", "chunkId": "S1-C05", "english": "the most effective changes" },
            { "roleQuestion": "Thường là gì?", "chunkId": "S1-C06", "english": "are often" }
          ],
          "successMessage": "Bạn đã mở được ý nhận định thứ hai."
        },
        {
          "id": "S1-M05",
          "prompt": "những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất",
          "answer": "the most effective changes are often the least dramatic",
          "audioId": "S1-17",
          "usesChunks": ["S1-C05", "S1-C06", "S1-C07"],
          "masteryCredit": ["S1-C05", "S1-C06", "S1-C07"],
          "roleLine": [
            { "roleQuestion": "Cái gì đang được nhận định?", "chunkId": "S1-C05", "english": "the most effective changes" },
            { "roleQuestion": "Thường là gì?", "chunkId": "S1-C06", "english": "are often" },
            { "roleQuestion": "Có đặc điểm gì?", "chunkId": "S1-C07", "english": "the least dramatic" }
          ],
          "successMessage": "Bạn đã viết được ý thứ hai: cái gì thường có đặc điểm gì."
        },
        {
          "id": "S1-M06",
          "stage": "sentence",
          "prompt": "Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất.",
          "answer": "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
          "audioId": "S1-18",
          "usesChunks": ["S1-C01", "S1-C02", "S1-C03", "S1-C04", "S1-C08", "S1-C05", "S1-C06", "S1-C07"],
          "masteryCredit": ["S1-C01", "S1-C02", "S1-C03", "S1-C04", "S1-C08", "S1-C05", "S1-C06", "S1-C07"],
          "roleLine": [
            { "roleQuestion": "Ai?", "chunkId": "S1-C01", "english": "many cities" },
            { "roleQuestion": "Đang cố làm gì?", "chunkId": "S1-C02", "english": "are trying to" },
            { "roleQuestion": "Tác động vào cái gì?", "chunkId": "S1-C03", "english": "make daily life" },
            { "roleQuestion": "Kết quả gì?", "chunkId": "S1-C04", "english": "more sustainable" },
            { "roleQuestion": "Quan hệ giữa hai ý là gì?", "chunkId": "S1-C08", "english": "but" },
            { "roleQuestion": "Cái gì đang được nhận định?", "chunkId": "S1-C05", "english": "the most effective changes" },
            { "roleQuestion": "Thường là gì?", "chunkId": "S1-C06", "english": "are often" },
            { "roleQuestion": "Có đặc điểm gì?", "chunkId": "S1-C07", "english": "the least dramatic" }
          ],
          "successMessage": "Bạn đã hoàn thành câu này và dùng được các câu hỏi vai trò để xây một ý dài."
        }
      ],
      "repairRules": [
        {
          "id": "S1-R01",
          "appliesTo": ["S1-M01", "S1-M03", "S1-M06"],
          "chunkId": "S1-C01",
          "detect": {
            "expected": "many cities",
            "commonWrongAnswers": ["many city"]
          },
          "message": "Cụm cần sửa: nhiều thành phố."
        },
        {
          "id": "S1-R02",
          "appliesTo": ["S1-M01", "S1-M03", "S1-M06"],
          "chunkId": "S1-C02",
          "detect": {
            "expected": "are trying to",
            "commonWrongAnswers": ["trying to", "are try to", "are trying"]
          },
          "message": "Cụm cần sửa: đang cố gắng làm."
        },
        {
          "id": "S1-R03",
          "appliesTo": ["S1-M02", "S1-M03", "S1-M06"],
          "chunkId": "S1-C03",
          "detect": {
            "expected": "daily life",
            "commonWrongAnswers": ["daily lives"]
          },
          "message": "Cụm cần sửa: đời sống hằng ngày."
        },
        {
          "id": "S1-R04",
          "appliesTo": ["S1-M04", "S1-M05", "S1-M06"],
          "chunkId": "S1-C05",
          "detect": {
            "expected": "the most effective changes",
            "commonWrongAnswers": ["most effective changes"]
          },
          "message": "Cụm cần sửa: những thay đổi hiệu quả nhất."
        },
        {
          "id": "S1-R05",
          "appliesTo": ["S1-M05", "S1-M06"],
          "chunkId": "S1-C07",
          "detect": {
            "expected": "the least dramatic",
            "commonWrongAnswers": ["the least dramatic changes", "least dramatic changes"]
          },
          "message": "Ý của bạn dễ hiểu, nhưng câu gốc không lặp lại changes ở cuối. Cụm cần dùng: ít gây ấn tượng mạnh nhất."
        }
      ]
    }
  ],
```

- [ ] **Step 6: Run focused data tests**

Run: `node --test tests\course-model.test.mjs tests\learning.test.mjs`

Expected: pass.

- [ ] **Step 7: Commit the data slice**

```bash
git add data/courses/small-public-garden-gentle-i1.json js/pronunciation.mjs tests/course-model.test.mjs tests/learning.test.mjs
git commit -m "Add sentence one meaning chunk data"
```

---

### Task 6: Audio Assets and Full Verification

**Files:**
- Verify: `assets/audio/*.wav`
- Verify: all changed files

- [ ] **Step 1: Generate audio for the experiment course**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-american-audio.ps1 -CourseDataPath data/courses/small-public-garden-gentle-i1.json -OutputDirectory assets/audio
```

Expected output includes:

```text
Microsoft Zira Desktop (en-US):
```

The count may be larger than the original course because sentence 1 now includes new chunk-step audio ids such as `S1-C02-STEP01`.

- [ ] **Step 2: Run focused tests**

Run:

```powershell
node --test tests\meaning-chunks.test.mjs
node --test tests\course-model.test.mjs
node --test tests\learning.test.mjs
node --test tests\mastery.test.mjs
node --test tests\static-site.test.mjs
```

Expected: each command passes.

- [ ] **Step 3: Run the full test suite**

Run:

```powershell
node --test tests
```

Expected: all tests pass.

- [ ] **Step 4: Check whitespace and changed file scope**

Run:

```powershell
git diff --check
git status --short
```

Expected:

- `git diff --check` prints no whitespace errors.
- `git status --short` shows only files touched by this plan plus newly generated audio files for the experiment course.

- [ ] **Step 5: Commit verification and audio assets**

```bash
git add assets/audio js tests data/courses index.html styles.css
git commit -m "Verify meaning chunk i plus one experiment"
```

---

## Self-Review

**Spec coverage:** This plan covers the settled requirements: one exercise type, speech as input support only, exact reverse translation, `whenNeeded`, `roleQuestion`, internal chunk i+1, composition i+1, targeted repair, and first implementation on `small-public-garden-gentle-i1`.

**Behavior kept stable:** `small-public-garden` remains unchanged. `gentle-i-plus-one` profile remains accepted for older tests and future comparison. `meaning-chunk-i-plus-one` activates only when the course explicitly opts in.

**Known limit of this slice:** Only sentence 1 receives full meaning chunk data. Sentences 2-7 stay on the existing task data inside the experiment course so the course remains usable while we evaluate the new learning feel on the first sentence.
