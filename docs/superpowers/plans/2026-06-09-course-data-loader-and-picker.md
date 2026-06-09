# Course Data Loader And Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the current lesson content into JSON course data, load it through a thin course model/loader, and add a course picker that currently shows only `A Small Public Garden`.

**Architecture:** `data/courses.json` lists available courses; each course has its own JSON file under `data/courses/`. `js/course-model.mjs` turns course JSON into the existing task shape and applies guidance; `js/course-loader.mjs` fetches JSON in the browser. `js/app.mjs` becomes course-aware, renders a picker first, and stores mastery progress under `article-mastery-session-v3:<course-id>`.

**Tech Stack:** Vanilla HTML/CSS/JavaScript ES modules, JSON static assets, Node built-in test runner, GitHub Pages-compatible relative paths.

---

### Task 1: Add Course Model Tests

**Files:**
- Create: `tests/course-model.test.mjs`
- Later create: `js/course-model.mjs`
- Later create: `data/courses/small-public-garden.json`

- [ ] **Step 1: Write failing course model tests**

Create `tests/course-model.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";

const courseData = JSON.parse(
  await readFile(
    new URL("../data/courses/small-public-garden.json", import.meta.url),
    "utf8"
  )
);

const course = buildLessonCourse(courseData);

test("builds the current course from JSON data", () => {
  assert.equal(course.id, "small-public-garden");
  assert.equal(course.article.title, "A Small Public Garden");
  assert.equal(course.article.level, "B2");
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
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: FAIL with module/file not found because `js/course-model.mjs` and JSON data do not exist yet.

### Task 2: Create JSON Course Data And Course Model

**Files:**
- Create: `data/courses.json`
- Create: `data/courses/small-public-garden.json`
- Create: `js/course-model.mjs`
- Modify: `js/guidance.mjs`

- [ ] **Step 1: Generate JSON data mechanically from existing article module**

Run a one-off Node conversion that imports the current `js/article.mjs`, copies its sentences and task groups, and writes:

```text
data/courses.json
data/courses/small-public-garden.json
```

The JSON must use:

```json
{
  "id": "small-public-garden",
  "title": "A Small Public Garden",
  "level": "B2",
  "topic": "Đời sống đô thị và dự án môi trường nhỏ",
  "description": "Chinh phục một bài đọc B2 ngắn về khu vườn công cộng trong đô thị.",
  "audioBasePath": "./assets/audio",
  "paragraphTaskMode": "cumulative",
  "sentences": [],
  "taskGroups": []
}
```

For task ids `S1-01`, `S1-02`, and `S1-03`, include the current special guide content in a `guide` object and omit `pronunciation`.

- [ ] **Step 2: Update guidance to honor JSON guide overrides**

At the top of `createGuidance(task, previousTask)` in `js/guidance.mjs`, before `specialGuides`, add:

```js
if (task.guide) {
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
  };
}
```

- [ ] **Step 3: Implement `js/course-model.mjs`**

Create `js/course-model.mjs`:

```js
import { attachGuidance } from "./guidance.mjs";

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid course data: ${field} must be a non-empty string.`);
  }
}

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
  };
}

function normalizeTask(task, indexPath) {
  ["id", "sentenceId", "stage", "prompt", "answer"].forEach((field) => {
    assertString(task[field], `${indexPath}.${field}`);
  });

  return {
    id: task.id,
    sentenceId: task.sentenceId,
    stage: task.stage,
    prompt: task.prompt,
    answer: task.answer,
    audioId: task.audioId ?? task.id,
    ...(task.guide ? { guide: normalizeGuide(task.guide) } : {}),
  };
}

function normalizeSentence(sentence, index) {
  ["id", "english", "vietnamese"].forEach((field) => {
    assertString(sentence[field], `sentences[${index}].${field}`);
  });

  return {
    id: sentence.id,
    english: sentence.english,
    vietnamese: sentence.vietnamese,
  };
}

function buildParagraphTasks(courseData, sentences) {
  if (courseData.paragraphTaskMode !== "cumulative") {
    return [];
  }

  return sentences.slice(1).map((_, index) => {
    const sentenceCount = index + 2;
    const selected = sentences.slice(0, sentenceCount);

    return {
      id: `G${sentenceCount}`,
      sentenceId: "PARAGRAPH",
      sentenceIds: selected.map((sentence) => sentence.id),
      stage: "paragraph",
      prompt: selected.map((sentence) => sentence.vietnamese).join(" "),
      answer: selected.map((sentence) => sentence.english).join(" "),
      audioId: `G${sentenceCount}`,
    };
  });
}

export function buildLessonCourse(courseData) {
  ["id", "title", "level", "topic"].forEach((field) => {
    assertString(courseData[field], field);
  });

  const sentences = (courseData.sentences ?? []).map(normalizeSentence);
  const sentenceTaskGroups = (courseData.taskGroups ?? []).map((group, groupIndex) =>
    group.map((task, taskIndex) =>
      normalizeTask(task, `taskGroups[${groupIndex}][${taskIndex}]`)
    )
  );
  const paragraphTasks = buildParagraphTasks(courseData, sentences);
  const tasks = attachGuidance([...sentenceTaskGroups.flat(), ...paragraphTasks]);

  return {
    id: courseData.id,
    title: courseData.title,
    level: courseData.level,
    topic: courseData.topic,
    description: courseData.description ?? "",
    audioBasePath: courseData.audioBasePath ?? "./assets/audio",
    article: {
      title: courseData.title,
      level: courseData.level,
      topic: courseData.topic,
      sentences,
    },
    sentences,
    sentenceTaskGroups,
    tasks,
    summary: {
      sentenceCount: sentences.length,
      taskCount: tasks.length,
    },
  };
}
```

- [ ] **Step 4: Run course model tests**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: PASS.

### Task 3: Add Course Loader Tests And Loader

**Files:**
- Create: `tests/course-loader.test.mjs`
- Create: `js/course-loader.mjs`

- [ ] **Step 1: Write failing loader tests**

Create `tests/course-loader.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  loadCourseById,
  loadCourseByEntry,
  loadCourseIndex,
} from "../js/course-loader.mjs";

function createFetch(fixtures) {
  const calls = [];

  async function fetchImpl(path) {
    calls.push(path);
    if (!(path in fixtures)) {
      return { ok: false, status: 404, json: async () => ({}) };
    }

    return {
      ok: true,
      status: 200,
      json: async () => fixtures[path],
    };
  }

  fetchImpl.calls = calls;
  return fetchImpl;
}

test("loads the course index with a relative default path", async () => {
  const fetchImpl = createFetch({
    "./data/courses.json": {
      courses: [
        {
          id: "small-public-garden",
          title: "A Small Public Garden",
          level: "B2",
          topic: "Đời sống đô thị và dự án môi trường nhỏ",
          dataPath: "./data/courses/small-public-garden.json",
        },
      ],
    },
  });

  const index = await loadCourseIndex({ fetchImpl });

  assert.equal(fetchImpl.calls[0], "./data/courses.json");
  assert.equal(index.courses[0].id, "small-public-garden");
});

test("loads and builds a course from an index entry", async () => {
  const fetchImpl = createFetch({
    "./course.json": {
      id: "demo",
      title: "Demo",
      level: "A1",
      topic: "Demo topic",
      paragraphTaskMode: "none",
      sentences: [{ id: "S1", english: "City.", vietnamese: "Thành phố." }],
      taskGroups: [[{ id: "S1-01", sentenceId: "S1", stage: "object", prompt: "thành phố", answer: "city" }]],
    },
  });

  const course = await loadCourseByEntry(
    { id: "demo", dataPath: "./course.json" },
    { fetchImpl }
  );

  assert.equal(course.id, "demo");
  assert.equal(course.tasks.length, 1);
});

test("loads a course by id from the index", async () => {
  const fetchImpl = createFetch({
    "./data/courses.json": {
      courses: [{ id: "demo", title: "Demo", level: "A1", topic: "Demo topic", dataPath: "./course.json" }],
    },
    "./course.json": {
      id: "demo",
      title: "Demo",
      level: "A1",
      topic: "Demo topic",
      paragraphTaskMode: "none",
      sentences: [{ id: "S1", english: "City.", vietnamese: "Thành phố." }],
      taskGroups: [[{ id: "S1-01", sentenceId: "S1", stage: "object", prompt: "thành phố", answer: "city" }]],
    },
  });

  const course = await loadCourseById("demo", { fetchImpl });

  assert.equal(course.id, "demo");
});
```

- [ ] **Step 2: Run loader test to verify RED**

Run:

```bash
node --test tests/course-loader.test.mjs
```

Expected: FAIL because `js/course-loader.mjs` does not exist.

- [ ] **Step 3: Implement `js/course-loader.mjs`**

Create `js/course-loader.mjs`:

```js
import { buildLessonCourse } from "./course-model.mjs";

export const defaultCourseIndexPath = "./data/courses.json";

async function fetchJson(path, fetchImpl) {
  const response = await fetchImpl(path);

  if (!response?.ok) {
    throw new Error(`Could not load ${path}: ${response?.status ?? "unknown"}`);
  }

  return response.json();
}

function normalizeCourseEntry(entry, index) {
  ["id", "title", "level", "topic", "dataPath"].forEach((field) => {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      throw new Error(`Invalid course index: courses[${index}].${field} is required.`);
    }
  });

  return {
    id: entry.id,
    title: entry.title,
    level: entry.level,
    topic: entry.topic,
    description: entry.description ?? "",
    dataPath: entry.dataPath,
  };
}

export async function loadCourseIndex({
  fetchImpl = globalThis.fetch,
  indexPath = defaultCourseIndexPath,
} = {}) {
  const data = await fetchJson(indexPath, fetchImpl);
  const courses = Array.isArray(data.courses)
    ? data.courses.map(normalizeCourseEntry)
    : [];

  return { courses };
}

export async function loadCourseByEntry(
  entry,
  { fetchImpl = globalThis.fetch } = {}
) {
  return buildLessonCourse(await fetchJson(entry.dataPath, fetchImpl));
}

export async function loadCourseById(
  courseId,
  { fetchImpl = globalThis.fetch, indexPath = defaultCourseIndexPath } = {}
) {
  const index = await loadCourseIndex({ fetchImpl, indexPath });
  const entry = index.courses.find((course) => course.id === courseId);

  if (!entry) {
    throw new Error(`Unknown course: ${courseId}`);
  }

  return loadCourseByEntry(entry, { fetchImpl });
}
```

- [ ] **Step 4: Run loader tests**

Run:

```bash
node --test tests/course-loader.test.mjs
```

Expected: PASS.

### Task 4: Refactor Existing Tests And Scripts To Course Model

**Files:**
- Modify: `tests/learning.test.mjs`
- Modify: `tests/mastery.test.mjs`
- Modify: `tests/static-site.test.mjs`
- Modify: `tools/export-audio-tasks.mjs`
- Modify: `tools/generate-curriculum-doc.mjs`
- Delete or shrink: `js/article.mjs`

- [ ] **Step 1: Add a test helper for loading the default course**

Create `tests/helpers/course-fixture.mjs`:

```js
import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../../js/course-model.mjs";

export async function loadDefaultCourse() {
  const data = JSON.parse(
    await readFile(
      new URL("../../data/courses/small-public-garden.json", import.meta.url),
      "utf8"
    )
  );

  return buildLessonCourse(data);
}
```

- [ ] **Step 2: Update tests to use the helper**

Replace imports from `../js/article.mjs` with `loadDefaultCourse()` and use:

```js
const course = await loadDefaultCourse();
const article = course.article;
const tasks = course.tasks;
const sentenceTaskGroups = course.sentenceTaskGroups;
```

Keep all existing assertions about counts, ordering, guidance, IPA, paragraph generation, and audio assets.

- [ ] **Step 3: Update audio export script**

Change `tools/export-audio-tasks.mjs` to read `data/courses/small-public-garden.json`, build the course via `buildLessonCourse()`, and output:

```js
course.tasks.map(({ id, audioId, answer }) => ({
  id: audioId ?? id,
  answer,
}))
```

- [ ] **Step 4: Update curriculum doc generator**

Change `tools/generate-curriculum-doc.mjs` to use `buildLessonCourse()` from JSON and `course.sentenceTaskGroups`.

- [ ] **Step 5: Remove direct học liệu source**

Delete `js/article.mjs` if no imports remain. If deletion causes too much churn, replace it with a tiny deprecated wrapper that imports no hard-coded lesson data.

- [ ] **Step 6: Run updated non-app tests**

Run:

```bash
node --test tests/course-model.test.mjs tests/course-loader.test.mjs tests/learning.test.mjs tests/mastery.test.mjs tests/static-site.test.mjs
```

Expected: PASS after the refactor.

### Task 5: Add Course Picker UI And Course-Aware App State

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Write failing static app tests**

In `tests/static-site.test.mjs`, update/add assertions:

```js
assert.match(html, /id="course-picker"/);
assert.match(html, /id="course-list"/);
assert.match(html, /id="change-course"/);
assert.match(appSource, /from "\.\/course-loader\.mjs"/);
assert.doesNotMatch(appSource, /from "\.\/article\.mjs"/);
assert.match(appSource, /article-mastery-session-v3:/);
assert.match(appSource, /article-mastery-session-v2/);
```

Run:

```bash
node --test tests/static-site.test.mjs
```

Expected: FAIL until app markup/state is refactored.

- [ ] **Step 2: Update `index.html`**

Add a `course-picker` section before the lesson section:

```html
<section id="course-picker" class="coursePicker" aria-label="Chọn bài học">
  <div class="pickerHeader">
    <p class="eyebrow">Article Mastery</p>
    <h1>Bài học</h1>
  </div>
  <p id="course-status" class="courseStatus" aria-live="polite">Đang tải...</p>
  <div id="course-list" class="courseList"></div>
</section>
```

Wrap top buttons in:

```html
<div class="topActions">
  <button id="change-course" class="secondaryButton" type="button" hidden>Đổi bài</button>
  <button id="reset-course" class="resetButton" type="button" hidden>Reset khóa học</button>
</div>
```

Add `id="lesson"` to the existing lesson section and hide it initially.

- [ ] **Step 3: Add CSS for the picker**

Add styles for `.topActions`, `.coursePicker`, `.pickerHeader`, `.eyebrow`, `.courseStatus`, `.courseList`, `.courseCard`, `.courseMeta`, `.courseStats`, and `.courseProgress`, using existing colors and radius.

- [ ] **Step 4: Refactor app imports and top-level state**

Replace:

```js
import { buildLessonTasks } from "./article.mjs";
```

with:

```js
import { loadCourseByEntry, loadCourseIndex } from "./course-loader.mjs";
```

Make `tasks`, `practiceGroups`, `taskIndexById`, `masterySession`, `flow`, and `activeCourse` mutable and initialized only after course selection.

- [ ] **Step 5: Add course picker rendering**

Implement:

```js
function storageKeyFor(courseId) {
  return `article-mastery-session-v3:${courseId}`;
}

function renderCourseCards(courseStates) {
  elements.courseList.replaceChildren();
  courseStates.forEach((courseState) => {
    const card = document.createElement("article");
    const title = document.createElement("h2");
    const meta = document.createElement("p");
    const stats = document.createElement("p");
    const button = document.createElement("button");

    card.className = "courseCard";
    title.textContent = courseState.entry.title;
    meta.textContent = `${courseState.entry.level} · ${courseState.entry.topic}`;
    stats.textContent = `${courseState.summary.sentenceCount} câu · ${courseState.summary.taskCount} nhiệm vụ · ${courseState.progress}%`;
    button.type = "button";
    button.textContent = courseState.progress > 0 ? "Học tiếp" : "Bắt đầu";
    button.addEventListener("click", () => selectCourse(courseState.entry.id));
    card.append(title, meta, stats, button);
    elements.courseList.append(card);
  });
}
```

- [ ] **Step 6: Add course-aware session loading**

Implement v3 storage and legacy migration:

```js
const legacyStorageKey = "article-mastery-session-v2";

function loadSession(course, groups) {
  const key = storageKeyFor(course.id);
  const stored = localStorage.getItem(key);
  const legacy =
    course.id === "small-public-garden"
      ? localStorage.getItem(legacyStorageKey)
      : null;
  const restored = restoreMasterySession(JSON.parse(stored ?? legacy ?? "null"), groups);

  if (!stored && legacy) {
    localStorage.setItem(key, JSON.stringify(serializeMasterySession(restored)));
  }

  return restored;
}
```

- [ ] **Step 7: Keep lesson flow behavior unchanged after selection**

After selecting a course, set:

```js
activeCourse = course;
tasks = course.tasks;
practiceGroups = buildPracticeGroups(tasks);
taskIndexById = new Map(tasks.map((task, index) => [task.id, index]));
masterySession = loadSession(course, practiceGroups);
flow = createFlowForCurrentTask();
```

Then hide picker, show lesson, show top buttons, and call `showCurrentTask()`.

- [ ] **Step 8: Run static-site test**

Run:

```bash
node --test tests/static-site.test.mjs
```

Expected: PASS.

### Task 6: Verify Full Suite And Browser Behavior

**Files:**
- Verify: all changed files

- [ ] **Step 1: Run full test suite**

Run:

```bash
node --test
```

Expected: all tests pass.

- [ ] **Step 2: Start a local static server**

Run:

```bash
python -m http.server 4173
```

If port `4173` is busy, use another available port.

- [ ] **Step 3: Open with Browser plugin**

Open:

```text
http://localhost:4173
```

Verify visually:

- first screen shows only `A Small Public Garden`;
- card shows level/topic/stats/progress;
- clicking `Bắt đầu` or `Học tiếp` opens the existing lesson guide;
- `Đổi bài` returns to picker;
- reset remains available only during a selected course.

- [ ] **Step 4: Inspect final git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only planned files changed plus the pre-existing untracked mp3 untouched.

- [ ] **Step 5: Commit implementation**

Run:

```bash
git add data js tests tools index.html styles.css docs/superpowers/plans/2026-06-09-course-data-loader-and-picker.md
git commit -m "Add course data loader and picker"
```

Expected: commit succeeds without staging `Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3`.
