# Meaning Map Difficulty Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a non-quiz guidance layer that shows a meaning map before each sentence and explains difficult language points before learners type.

**Architecture:** Extend the existing meaning-chunk course data with optional `overview.meaningMap` and `difficultyNotes` metadata. Propagate that metadata through `js/meaning-chunks.mjs` and `js/course-model.mjs`, then render it only in overview and guide screens in `js/app.mjs`. Keep mastery, answer checking, audio, and exercise behavior unchanged.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript ES modules, JSON course data, Node built-in test runner.

---

## Scope Check

This is one subsystem: guidance metadata for the existing `meaning-chunk-i-plus-one` flow. It touches data schema, normalization, UI render, content, and tests, but does not change scheduler, answer scoring, audio generation, or course selection.

## File Structure

- Modify `tests/meaning-chunks.test.mjs`: prove meaning-map and difficulty-note metadata can be authored in a meaning-chunk lesson and rejected when invalid.
- Modify `js/meaning-chunks.mjs`: validate, clone, and attach `overview.meaningMap` and `difficultyNotes` to built tasks.
- Modify `tests/course-model.test.mjs`: prove course normalization preserves the new metadata and the Gentle course has required content coverage.
- Modify `js/course-model.mjs`: preserve `lessonOverview.meaningMap` and `guide.difficultyNotes` during normalization.
- Modify `tests/static-site.test.mjs`: lock HTML IDs and ensure the app renders the new guide-only surfaces.
- Modify `index.html`: add containers for overview meaning map and guide difficulty notes.
- Modify `styles.css`: style the new sections with the existing quiet learning UI.
- Modify `js/app.mjs`: render the meaning map in overview and difficulty notes in guide, never in exercise.
- Modify `data/courses/small-public-garden-gentle-i1.json`: add meaning maps and authored difficulty notes to the current experimental course only.

---

### Task 1: Add Failing Meaning-Chunk Metadata Tests

**Files:**
- Modify: `tests/meaning-chunks.test.mjs`
- Test: `tests/meaning-chunks.test.mjs`

- [ ] **Step 1: Add meaning map to the fixture overview**

In the top-level `lesson.overview` fixture, after `graded: false`, add this field:

```js
    meaningMap: [
      { label: "Ai?", meaning: "nhieu thanh pho", chunkId: "S1-C01" },
      {
        label: "Dang co lam gi?",
        meaning: "dang co gang lam",
        chunkId: "S1-C02",
      },
    ],
```

- [ ] **Step 2: Add fixture difficulty notes to the final chunk and composition**

In `lesson.chunks[0]`, after `successMessage`, add:

```js
      difficultyNotes: [
        {
          tag: "plural",
          title: "Vi sao dung cities?",
          body: "Tieng Anh can so nhieu khi noi ve nhieu thanh pho.",
        },
      ],
```

In `lesson.compositionTasks[0]`, after `successMessage`, add:

```js
      difficultyNotes: [
        {
          tag: "to-frame",
          title: "Vi sao co to?",
          body: "are trying to mo ra hanh dong phia sau.",
        },
      ],
```

- [ ] **Step 3: Add assertions for copied metadata**

In the first test, after `assert.deepEqual(groups[0][0].lessonOverview, lesson.overview);`, add:

```js
  assert.deepEqual(groups[0][0].lessonOverview.meaningMap, [
    { label: "Ai?", meaning: "nhieu thanh pho", chunkId: "S1-C01" },
    {
      label: "Dang co lam gi?",
      meaning: "dang co gang lam",
      chunkId: "S1-C02",
    },
  ]);
```

In the same test, after the `successMessage` assertion, add:

```js
  assert.deepEqual(finalChunkTask.guide.difficultyNotes, [
    {
      tag: "plural",
      title: "Vi sao dung cities?",
      body: "Tieng Anh can so nhieu khi noi ve nhieu thanh pho.",
    },
  ]);
  assert.equal(Object.hasOwn(oneTokenTask.guide, "difficultyNotes"), false);
  assert.equal(Object.hasOwn(pluralTask.guide, "difficultyNotes"), false);
```

In the composition rollback test, after `assert.deepEqual(composition.roleLine, lesson.compositionTasks[0].roleLine);`, add:

```js
  assert.deepEqual(composition.guide.difficultyNotes, [
    {
      tag: "to-frame",
      title: "Vi sao co to?",
      body: "are trying to mo ra hanh dong phia sau.",
    },
  ]);
```

- [ ] **Step 4: Add rejection tests**

At the end of `tests/meaning-chunks.test.mjs`, add:

```js
test("rejects a meaning map item that references an unknown chunk", () => {
  const invalidLesson = structuredClone(lesson);
  invalidLesson.overview.meaningMap = [
    { label: "Unknown", meaning: "missing", chunkId: "S1-C99" },
  ];

  assert.throws(
    () => buildMeaningChunkTaskGroups([invalidLesson]),
    /Invalid meaning chunk data: S1-meaning-chunks.overview.meaningMap\[0\].chunkId references unknown chunk "S1-C99"\./
  );
});

test("rejects malformed difficulty notes", () => {
  const invalidLesson = structuredClone(lesson);
  invalidLesson.chunks[0].difficultyNotes = [
    { tag: "plural", title: "", body: "Missing title." },
  ];

  assert.throws(
    () => buildMeaningChunkTaskGroups([invalidLesson]),
    /Invalid meaning chunk data: S1-meaning-chunks.S1-C01.difficultyNotes\[0\].title must be a non-empty string\./
  );
});
```

- [ ] **Step 5: Run the focused test and confirm it fails**

Run:

```bash
node --test tests/meaning-chunks.test.mjs
```

Expected: FAIL because `lessonOverview.meaningMap`, `guide.difficultyNotes`, and validation for the new fields do not exist yet.

---

### Task 2: Implement Meaning-Chunk Metadata Propagation

**Files:**
- Modify: `js/meaning-chunks.mjs`
- Test: `tests/meaning-chunks.test.mjs`

- [ ] **Step 1: Add helper functions near `cloneRoleLine`**

Add these functions after `cloneRoleLine`:

```js
function cloneDifficultyNotes(notes = []) {
  return notes.map((note) => {
    const copy = {
      title: note.title,
      body: note.body,
    };

    if (typeof note.tag === "string") {
      copy.tag = note.tag;
    }

    return copy;
  });
}

function cloneMeaningMap(meaningMap = []) {
  return meaningMap.map((item) => {
    const copy = {
      label: item.label,
    };

    if (typeof item.meaning === "string") {
      copy.meaning = item.meaning;
    }

    if (typeof item.chunkId === "string") {
      copy.chunkId = item.chunkId;
    }

    return copy;
  });
}

function assertDifficultyNotes(value, field) {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    fail(`${field} must be an array.`);
  }

  value.forEach((note, index) => {
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      fail(`${field}[${index}] must be an object.`);
    }

    assertString(note.title, `${field}[${index}].title`);
    assertString(note.body, `${field}[${index}].body`);

    if (note.tag !== undefined) {
      assertString(note.tag, `${field}[${index}].tag`);
    }
  });
}

function difficultyNotesForStep(chunk, step, isFinalStep) {
  if (step.difficultyNotes !== undefined) {
    return cloneDifficultyNotes(step.difficultyNotes);
  }

  if (isFinalStep && chunk.difficultyNotes !== undefined) {
    return cloneDifficultyNotes(chunk.difficultyNotes);
  }

  return [];
}
```

- [ ] **Step 2: Extend `buildStepGuide`**

Replace `buildStepGuide` with:

```js
function buildStepGuide(chunk, step, isFinalStep) {
  const difficultyNotes = difficultyNotesForStep(chunk, step, isFinalStep);
  const guide = {
    term: step.term ?? step.answer,
    meaning: step.meaning ?? step.prompt,
    explanation:
      step.explanation ??
      step.purpose ??
      (isFinalStep
        ? `Complete chunk for "${chunk.english}".`
        : `Small step toward "${chunk.english}".`),
    parts: cloneParts(step.parts),
    speech: step.speech ?? step.answer,
  };

  if (isFinalStep) {
    guide.whenNeeded = chunk.whenNeeded;
    guide.roleQuestion = chunk.roleQuestion;
    guide.roleMeaning = chunk.roleMeaning;
    guide.successMessage = step.successMessage ?? chunk.successMessage;
  }

  if (difficultyNotes.length > 0) {
    guide.difficultyNotes = difficultyNotes;
  }

  return guide;
}
```

- [ ] **Step 3: Validate difficulty notes in chunks and steps**

In `validateChunk`, after the `roleMeaning` assertion, add:

```js
  assertDifficultyNotes(
    chunk.difficultyNotes,
    `${lesson.id}.${chunk.id}.difficultyNotes`
  );
```

Inside `buildStepTask`, after the `stage` validation block, add:

```js
  assertDifficultyNotes(
    step.difficultyNotes,
    `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].difficultyNotes`
  );
```

- [ ] **Step 4: Extend composition guide and validation**

Replace `buildCompositionGuide` with:

```js
function buildCompositionGuide(composition) {
  const difficultyNotes = cloneDifficultyNotes(composition.difficultyNotes);
  const guide = {
    term: composition.term ?? composition.answer,
    meaning: composition.meaning ?? composition.prompt,
    explanation:
      composition.explanation ??
      "Use the complete chunks to build a longer meaning.",
    parts: cloneParts(composition.parts),
    speech: composition.speech ?? composition.answer,
    roleLine: cloneRoleLine(composition.roleLine),
    successMessage: composition.successMessage,
  };

  if (difficultyNotes.length > 0) {
    guide.difficultyNotes = difficultyNotes;
  }

  return guide;
}
```

In `buildCompositionTask`, after the `masteryCredit` validation block, add:

```js
  assertDifficultyNotes(
    composition.difficultyNotes,
    `${lesson.id}.${composition.id}.difficultyNotes`
  );
```

- [ ] **Step 5: Validate and clone overview meaning maps**

Replace `validateOverview` with:

```js
function validateOverview(lesson, chunksById) {
  if (lesson.overview === undefined) {
    return;
  }

  assertString(lesson.overview.title, `${lesson.id}.overview.title`);

  if (
    !Array.isArray(lesson.overview.summary) ||
    lesson.overview.summary.length === 0 ||
    lesson.overview.summary.some(
      (item) => typeof item !== "string" || item.trim() === ""
    )
  ) {
    fail(`${lesson.id}.overview.summary must be a non-empty array of strings.`);
  }

  if (lesson.overview.graded !== false) {
    fail(`${lesson.id}.overview.graded must be false.`);
  }

  if (lesson.overview.meaningMap === undefined) {
    return;
  }

  if (!Array.isArray(lesson.overview.meaningMap)) {
    fail(`${lesson.id}.overview.meaningMap must be an array.`);
  }

  lesson.overview.meaningMap.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      fail(`${lesson.id}.overview.meaningMap[${index}] must be an object.`);
    }

    assertString(item.label, `${lesson.id}.overview.meaningMap[${index}].label`);

    if (item.meaning !== undefined) {
      assertString(
        item.meaning,
        `${lesson.id}.overview.meaningMap[${index}].meaning`
      );
    }

    if (item.chunkId !== undefined) {
      assertString(
        item.chunkId,
        `${lesson.id}.overview.meaningMap[${index}].chunkId`
      );

      if (!chunksById.has(item.chunkId)) {
        fail(
          `${lesson.id}.overview.meaningMap[${index}].chunkId references unknown chunk "${item.chunkId}".`
        );
      }
    }
  });
}
```

In `buildLessonTasks`, remove the existing `validateOverview(lesson);` call near the top. After `const chunksById = buildChunkIndex(lesson.chunks, lesson);`, add:

```js
  validateOverview(lesson, chunksById);
```

Replace the existing `if (tasks[0] && lesson.overview)` block in `buildLessonTasks` with:

```js
  if (tasks[0] && lesson.overview) {
    const lessonOverview = {
      title: lesson.overview.title,
      summary: Array.from(lesson.overview.summary),
      graded: false,
    };

    if (Array.isArray(lesson.overview.meaningMap)) {
      lessonOverview.meaningMap = cloneMeaningMap(lesson.overview.meaningMap);
    }

    tasks[0] = Object.assign({}, tasks[0], { lessonOverview });
  }
```

- [ ] **Step 6: Run the focused test and confirm it passes**

Run:

```bash
node --test tests/meaning-chunks.test.mjs
```

Expected: PASS for all tests in `tests/meaning-chunks.test.mjs`.

- [ ] **Step 7: Commit**

Run:

```bash
git add tests/meaning-chunks.test.mjs js/meaning-chunks.mjs
git commit -m "Add meaning chunk guide metadata"
```

---

### Task 3: Preserve Metadata Through Course Normalization

**Files:**
- Modify: `tests/course-model.test.mjs`
- Modify: `js/course-model.mjs`
- Test: `tests/course-model.test.mjs`

- [ ] **Step 1: Extend the normalization fixture test**

In the test named `preserves meaning chunk guide and role metadata through course normalization`, add this `overview` object to the single meaning chunk lesson, before `chunks`:

```js
        overview: {
          title: "Build the idea",
          summary: ["Read the idea map before typing."],
          graded: false,
          meaningMap: [
            { label: "Who?", meaning: "many cities", chunkId: "S1-C01" },
          ],
        },
```

In that same fixture, add this field to chunk `S1-C01`, after `successMessage`:

```js
            difficultyNotes: [
              {
                tag: "plural",
                title: "Plural form",
                body: "Use cities because the idea is more than one city.",
              },
            ],
```

In composition `S1-M01`, after `roleLine`, add:

```js
            difficultyNotes: [
              {
                tag: "word-order",
                title: "Keep the chunk order",
                body: "The subject chunk comes before the action chunk.",
              },
            ],
```

After `const finalStepGuide = byId.get("S1-C01-STEP02").guide;`, add:

```js
  const firstTask = byId.get("S1-C01-STEP01");
```

Before the final assertion in that test, add:

```js
  assert.deepEqual(firstTask.lessonOverview.meaningMap, [
    { label: "Who?", meaning: "many cities", chunkId: "S1-C01" },
  ]);
  assert.deepEqual(finalStepGuide.difficultyNotes, [
    {
      tag: "plural",
      title: "Plural form",
      body: "Use cities because the idea is more than one city.",
    },
  ]);
  assert.deepEqual(byId.get("S1-M01").guide.difficultyNotes, [
    {
      tag: "word-order",
      title: "Keep the chunk order",
      body: "The subject chunk comes before the action chunk.",
    },
  ]);
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: FAIL because `course-model.mjs` does not clone `difficultyNotes` or `meaningMap` yet.

- [ ] **Step 3: Update `js/course-model.mjs` cloning helpers**

After `cloneObjectArray`, add:

```js
function cloneDifficultyNotes(notes) {
  return notes.map((note) => {
    const copy = {
      title: note.title,
      body: note.body,
    };

    if (typeof note.tag === "string") {
      copy.tag = note.tag;
    }

    return copy;
  });
}

function cloneMeaningMap(meaningMap) {
  return meaningMap.map((item) => {
    const copy = {
      label: item.label,
    };

    if (typeof item.meaning === "string") {
      copy.meaning = item.meaning;
    }

    if (typeof item.chunkId === "string") {
      copy.chunkId = item.chunkId;
    }

    return copy;
  });
}
```

In `cloneGuideMetadata`, after the `roleLine` block, add:

```js
  if (Array.isArray(guide.difficultyNotes)) {
    metadata.difficultyNotes = cloneDifficultyNotes(guide.difficultyNotes);
  }
```

After `normalizeSentence`, add:

```js
function normalizeLessonOverview(lessonOverview) {
  const normalized = {
    title: lessonOverview.title,
    summary: Array.from(lessonOverview.summary ?? []),
    graded: false,
  };

  if (Array.isArray(lessonOverview.meaningMap)) {
    normalized.meaningMap = cloneMeaningMap(lessonOverview.meaningMap);
  }

  return normalized;
}
```

Then replace the `lessonOverview` object inside `normalizeTask` with:

```js
          lessonOverview: normalizeLessonOverview(task.lessonOverview),
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: PASS for `tests/course-model.test.mjs`.

- [ ] **Step 5: Commit**

Run:

```bash
git add tests/course-model.test.mjs js/course-model.mjs
git commit -m "Preserve guide note metadata"
```

---

### Task 4: Render Meaning Maps and Difficulty Notes in the UI

**Files:**
- Modify: `tests/static-site.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Test: `tests/static-site.test.mjs`

- [ ] **Step 1: Add failing static tests**

In the test named `uses only relative static assets suitable for a GitHub Pages subpath`, after `assert.match(html, /id="overview-summary"/);`, add:

```js
  assert.match(html, /id="overview-meaning-map"/);
```

After `assert.match(html, /id="guide-role-line"/);`, add:

```js
  assert.match(html, /id="guide-difficulty-notes"/);
```

In the test named `renders meaning chunk role guidance in the guide screen`, after `assert.match(appSource, /task\.guide\.roleQuestion/);`, add:

```js
  assert.match(appSource, /renderGuideDifficultyNotes/);
  assert.match(appSource, /task\.guide\.difficultyNotes/);
```

Add a new test after the test named `renders lesson overviews and completion milestone messages`:

```js
test("renders meaning maps in overview and keeps guidance out of exercise", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");
  const renderExercise = appSource.match(
    /function renderExercise\(task\) \{[\s\S]*?\n\}/
  )?.[0];

  assert.ok(renderExercise);
  assert.match(appSource, /renderOverviewMeaningMap/);
  assert.match(appSource, /overview\.meaningMap/);
  assert.doesNotMatch(renderExercise, /difficultyNotes|meaningMap|guideRoleLine/);
});
```

- [ ] **Step 2: Run static tests and confirm they fail**

Run:

```bash
node --test tests/static-site.test.mjs
```

Expected: FAIL because the new containers and render functions do not exist.

- [ ] **Step 3: Add HTML containers**

In `index.html`, inside `#overview-content`, after `<div id="overview-summary"></div>`, add:

```html
            <div id="overview-meaning-map" class="meaningMap" hidden></div>
```

Inside `#guide-content`, after `<div id="guide-role-line" class="guideRoleLine" hidden></div>`, add:

```html
            <div id="guide-difficulty-notes" class="difficultyNotes" hidden></div>
```

- [ ] **Step 4: Add app element references**

In `js/app.mjs`, add these fields to `elements`:

```js
  guideDifficultyNotes: document.querySelector("#guide-difficulty-notes"),
```

Place it after `guideContent`.

```js
  overviewMeaningMap: document.querySelector("#overview-meaning-map"),
```

Place it after `overviewContent`.

- [ ] **Step 5: Add renderer functions**

In `js/app.mjs`, after `renderGuideRoleLine`, add:

```js
function renderGuideDifficultyNotes(notes = []) {
  const rows = Array.isArray(notes) ? notes : [];

  elements.guideDifficultyNotes.replaceChildren();
  elements.guideDifficultyNotes.hidden = rows.length === 0;

  if (rows.length === 0) {
    return;
  }

  const title = document.createElement("h3");
  title.textContent = "Diem de sai";
  elements.guideDifficultyNotes.append(title);

  rows.forEach((note) => {
    const item = document.createElement("article");
    const noteTitle = document.createElement("h4");
    const body = document.createElement("p");

    item.className = "difficultyNote";
    noteTitle.textContent = note.title;
    body.textContent = note.body;
    item.append(noteTitle, body);
    elements.guideDifficultyNotes.append(item);
  });
}
```

In `js/app.mjs`, after `renderGuide`, add:

```js
function renderOverviewMeaningMap(meaningMap = []) {
  const rows = Array.isArray(meaningMap) ? meaningMap : [];

  elements.overviewMeaningMap.replaceChildren();
  elements.overviewMeaningMap.hidden = rows.length === 0;

  if (rows.length === 0) {
    return;
  }

  const title = document.createElement("h3");
  const list = document.createElement("ol");

  title.textContent = "Ban do y";
  list.className = "meaningMapList";
  elements.overviewMeaningMap.append(title, list);

  rows.forEach((item) => {
    const row = document.createElement("li");
    const label = document.createElement("strong");
    const meaning = document.createElement("span");

    row.className = "meaningMapItem";
    label.textContent = item.label;
    meaning.textContent = item.meaning ?? "";
    row.append(label);

    if (meaning.textContent) {
      row.append(meaning);
    }

    list.append(row);
  });
}
```

- [ ] **Step 6: Call the new renderers**

In `renderGuide`, after `renderGuideRoleLine(task.guide.roleLine ?? task.roleLine ?? []);`, add:

```js
  renderGuideDifficultyNotes(task.guide.difficultyNotes);
```

In `renderOverview`, after the `overview.summary.forEach` block, add:

```js
  renderOverviewMeaningMap(overview.meaningMap);
```

- [ ] **Step 7: Add CSS**

In `styles.css`, after the `.overviewSummary p` rule, add:

```css
.meaningMap {
  border: 1px solid var(--line);
  border-radius: 6px;
  margin-bottom: 28px;
  max-width: 650px;
  padding: 16px;
}

.meaningMap h3,
.difficultyNotes h3 {
  color: var(--green);
  font-size: 15px;
  font-weight: 750;
  letter-spacing: 0;
  margin: 0 0 12px;
}

.meaningMapList {
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.meaningMapItem {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  line-height: 1.45;
}

.meaningMapItem strong {
  color: var(--text);
}

.meaningMapItem span {
  color: var(--muted);
}
```

After the `.guideRoleLine strong` rule, add:

```css
.difficultyNotes {
  background: var(--amber-soft);
  border: 1px solid var(--amber-line);
  border-radius: 6px;
  display: grid;
  gap: 12px;
  margin-top: 18px;
  max-width: 650px;
  padding: 16px;
}

.difficultyNote h4 {
  font-size: 16px;
  line-height: 1.35;
  margin: 0 0 4px;
}

.difficultyNote p {
  color: #4b2600;
  font-size: 16px;
  line-height: 1.55;
  margin: 0;
}
```

In the mobile media query, after `.overviewSummary p`, add:

```css
  .meaningMapItem {
    align-items: start;
    flex-direction: column;
    gap: 2px;
  }
```

- [ ] **Step 8: Run static tests and confirm they pass**

Run:

```bash
node --test tests/static-site.test.mjs
```

Expected: PASS for `tests/static-site.test.mjs`.

- [ ] **Step 9: Commit**

Run:

```bash
git add tests/static-site.test.mjs index.html styles.css js/app.mjs
git commit -m "Render meaning map guidance"
```

---

### Task 5: Add Content Coverage Tests for the Gentle Course

**Files:**
- Modify: `tests/course-model.test.mjs`
- Test: `tests/course-model.test.mjs`

- [ ] **Step 1: Add collector helpers**

After `buildCompleteTwoSentenceFixture`, add:

```js
function collectDifficultyNotesFromLesson(lesson) {
  const notes = [];

  lesson.chunks.forEach((chunk) => {
    if (Array.isArray(chunk.difficultyNotes)) {
      chunk.difficultyNotes.forEach((note) => notes.push(note));
    }

    chunk.iPlusOneSteps.forEach((step) => {
      if (Array.isArray(step.difficultyNotes)) {
        step.difficultyNotes.forEach((note) => notes.push(note));
      }
    });
  });

  (lesson.compositionTasks ?? []).forEach((task) => {
    if (Array.isArray(task.difficultyNotes)) {
      task.difficultyNotes.forEach((note) => notes.push(note));
    }
  });

  return notes;
}

function collectDifficultyNotesFromCourseData(courseData) {
  const notes = [];

  courseData.meaningChunkLessons.forEach((lesson) => {
    collectDifficultyNotesFromLesson(lesson).forEach((note) => notes.push(note));
  });

  return notes;
}
```

- [ ] **Step 2: Add the coverage test**

After the test named `defines complete meaning chunk coverage for sentences five through seven`, add:

```js
test("defines meaning maps and non-quiz difficulty note coverage for Gentle course", async () => {
  const experimentData = await readCourseData(
    "../data/courses/small-public-garden-gentle-i1.json"
  );
  const experiment = buildLessonCourse(experimentData);
  const lessonBySentenceId = new Map(
    experimentData.meaningChunkLessons.map((lesson) => [
      lesson.sentenceId,
      lesson,
    ])
  );
  const requiredTags = [
    "article",
    "plural",
    "modal",
    "connector",
    "relative-place",
    "time-condition",
    "content-clause",
    "to-frame",
    "word-order",
    "ellipsis",
  ];
  const notes = collectDifficultyNotesFromCourseData(experimentData);
  const tagSet = new Set(notes.map((note) => note.tag).filter(Boolean));
  const missingTags = requiredTags.filter((tag) => !tagSet.has(tag));
  const quizPattern = /hay chon|tra loi|dien vao|dung dap an nao/i;
  const quizNotes = notes.filter((note) =>
    quizPattern.test(`${note.title} ${note.body}`)
  );

  assert.deepEqual(missingTags, []);
  assert.deepEqual(quizNotes, []);
  assert.equal(notes.length >= 20, true);

  ["S1", "S2", "S3", "S4", "S5", "S6", "S7"].forEach((sentenceId) => {
    const lesson = lessonBySentenceId.get(sentenceId);

    assert.ok(lesson.overview);
    assert.equal(Array.isArray(lesson.overview.meaningMap), true);
    assert.equal(lesson.overview.meaningMap.length > 0, true);
    lesson.overview.meaningMap.forEach((item) => {
      if (item.chunkId) {
        assert.ok(
          lesson.chunks.some((chunk) => chunk.id === item.chunkId),
          `${sentenceId} meaning map references ${item.chunkId}`
        );
      }
    });
  });

  const byId = new Map(experiment.tasks.map((task) => [task.id, task]));
  assert.equal(
    Array.isArray(byId.get("S2-C03-STEP05").guide.difficultyNotes),
    true
  );
  assert.equal(
    Array.isArray(byId.get("S5-M02").guide.difficultyNotes),
    true
  );
  assert.equal(
    byId.get("S2-C03-STEP01").guide.difficultyNotes,
    undefined
  );
});
```

- [ ] **Step 3: Run the focused test and confirm it fails**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: FAIL because the Gentle course JSON does not contain the authored maps and notes yet.

---

### Task 6: Author Gentle Course Meaning Maps and Difficulty Notes

**Files:**
- Modify: `data/courses/small-public-garden-gentle-i1.json`
- Test: `tests/course-model.test.mjs`

- [ ] **Step 1: Add overview meaning maps**

Add `meaningMap` to each existing lesson overview using these exact rows.

S1:

```json
[
  { "label": "Ai?", "meaning": "nhieu thanh pho", "chunkId": "S1-C01" },
  { "label": "Dang co lam gi?", "meaning": "dang co gang lam", "chunkId": "S1-C02" },
  { "label": "Tac dong vao cai gi?", "meaning": "doi song hang ngay", "chunkId": "S1-C03" },
  { "label": "Ket qua gi?", "meaning": "ben vung hon", "chunkId": "S1-C04" },
  { "label": "Quan he hai y?", "meaning": "nhung", "chunkId": "S1-C08" },
  { "label": "Cai gi duoc nhan dinh?", "meaning": "nhung thay doi hieu qua nhat", "chunkId": "S1-C05" },
  { "label": "Thuong la gi?", "meaning": "thuong la", "chunkId": "S1-C06" },
  { "label": "Co dac diem gi?", "meaning": "it gay an tuong manh nhat", "chunkId": "S1-C07" }
]
```

S2:

```json
[
  { "label": "O dau?", "meaning": "trong mot khu dan cu", "chunkId": "S2-C01" },
  { "label": "Ai thuc hien thay doi?", "meaning": "hoi dong dia phuong", "chunkId": "S2-C02" },
  { "label": "Cai gi duoc thay doi?", "meaning": "mot bai do xe trong", "chunkId": "S2-C03" },
  { "label": "Tro thanh cai gi?", "meaning": "mot khu vuon cong cong nho", "chunkId": "S2-C04" },
  { "label": "Khung bien doi?", "meaning": "bien cai gi thanh cai gi", "chunkId": "S2-C05" }
]
```

S3:

```json
[
  { "label": "Khi nao?", "meaning": "ban dau", "chunkId": "S3-C01" },
  { "label": "Ai phan nan?", "meaning": "mot so cu dan", "chunkId": "S3-C02" },
  { "label": "Ho da lam gi?", "meaning": "phan nan rang", "chunkId": "S3-C03" },
  { "label": "Dieu dang lo thu nhat?", "meaning": "du an se lam giam cho do xe", "chunkId": "S3-C04" },
  { "label": "Dieu dang lo them?", "meaning": "va thu hut tieng on", "chunkId": "S3-C05" }
]
```

S4:

```json
[
  { "label": "Doi huong y?", "meaning": "tuy nhien", "chunkId": "S4-C01" },
  { "label": "Khi nao?", "meaning": "trong vai thang", "chunkId": "S4-C02" },
  { "label": "Dieu gi thay doi?", "meaning": "khu vuon thanh mot noi yen tinh", "chunkId": "S4-C03" },
  { "label": "Noi do tre em lam gi?", "meaning": "tre em co the choi", "chunkId": "S4-C04" },
  { "label": "Nguoi lon tuoi lam gi?", "meaning": "co the gap nhau", "chunkId": "S4-C05" },
  { "label": "Nhan vien van phong lam gi?", "meaning": "nghi trong gio trua", "chunkId": "S4-C06" }
]
```

S5:

```json
[
  { "label": "Dieu gi tao anh huong?", "meaning": "du an nay", "chunkId": "S5-C01" },
  { "label": "Khuyen khich ai lam gi?", "meaning": "khuyen khich cua hang gan do", "chunkId": "S5-C02" },
  { "label": "Hanh dong thu nhat?", "meaning": "dung it tui nhua hon", "chunkId": "S5-C03" },
  { "label": "Hanh dong thu hai?", "meaning": "dat thung tai che ngoai cua", "chunkId": "S5-C04" }
]
```

S6:

```json
[
  { "label": "Quan he nhuong bo?", "meaning": "mac du", "chunkId": "S6-C01" },
  { "label": "Gioi han duoc thua nhan?", "meaning": "khong giai quyet moi van de", "chunkId": "S6-C02" },
  { "label": "Tac dong thuc te?", "meaning": "no da thay doi", "chunkId": "S6-C03" },
  { "label": "Thay doi dieu gi?", "meaning": "cach moi nguoi nghi ve khong gian chung", "chunkId": "S6-C04" }
]
```

S7:

```json
[
  { "label": "Bai hoc rut ra?", "meaning": "no cho thay rang", "chunkId": "S7-C01" },
  { "label": "Cai gi tao anh huong?", "meaning": "mot du an dia phuong don gian", "chunkId": "S7-C02" },
  { "label": "Anh huong dieu gi?", "meaning": "thoi quen hang ngay", "chunkId": "S7-C03" },
  { "label": "Khi nao anh huong xay ra?", "meaning": "khi moi nguoi cam thay su thay doi thuoc ve ho", "chunkId": "S7-C04" }
]
```

- [ ] **Step 2: Add difficulty notes to these exact targets**

Use these exact authored notes. Add each note array to the target object named in the first column.

| Target | Notes |
| --- | --- |
| `S1-C01` | `plural`: `Vi sao dung cities?` / `Tieng Viet noi nhieu thanh pho. Tieng Anh phai doi city thanh cities vi dang noi hon mot thanh pho.` |
| `S1-C05` | `plural`: `changes la so nhieu` / `Mot su thay doi la change. Khi noi nhung thay doi, tieng Anh dung changes.` |
| `S1-C05` | `article`: `Vi sao co the?` / `the di voi most effective de chi nhom thay doi dang duoc xac dinh la hieu qua nhat trong y nay.` |
| `S1-C05` | `word-order`: `Trat tu trong cum danh tu` / `Tieng Anh dat most effective truoc changes: muc do va tinh chat di truoc danh tu chinh.` |
| `S1-C08` | `connector`: `but doi huong y` / `but bao hieu y sau lam nguoi doc nhin lai y truoc theo mot huong trai mong doi.` |
| `S2-C02` | `article`: `the local council` / `Dung the vi hoi dong dia phuong la mot doi tuong xac dinh trong khu dan cu dang noi den.` |
| `S2-C03` | `article`: `Vi sao dung an?` / `lot la danh tu dem duoc so it, nen can a hoac an. Dung an vi empty bat dau bang am nguyen am.` |
| `S2-C03` | `word-order`: `parking lot la mot cum` / `parking dung truoc lot de noi loai bai do xe. Khong dao thanh lot parking.` |
| `S2-C04` | `article`: `a small public garden` / `Dung a vi day la mot khu vuon cong cong nho duoc gioi thieu nhu mot ket qua moi.` |
| `S2-C05` | `word-order`: `turned into` / `Khung turned A into B giu thu tu: vat ban dau dung sau turned, ket qua dung sau into.` |
| `S3-C02` | `plural`: `residents la mot nhom` / `some di voi danh tu so nhieu residents vi chi mot so nguoi trong nhom cu dan.` |
| `S3-C03` | `content-clause`: `complained that mo noi dung` / `that bao hieu phan sau la noi dung loi phan nan, khong phai mot tu rieng le.` |
| `S3-C04` | `modal`: `would la loi du doan lo ngai` / `would o day dien dat dieu cu dan nghi se xay ra, khong phai viec da xay ra.` |
| `S3-C04` | `plural`: `parking spaces` / `spaces la so nhieu vi y noi nhieu cho do xe, khong phai mot cho duy nhat.` |
| `S3-C05` | `ellipsis`: `and attract noise khong lap lai` / `Cum nay noi them he qua thu hai va muon dung lai khung the project would tu phan truoc.` |
| `S4-C01` | `connector`: `however doi chieu` / `however bao hieu ket qua sau do khac voi dieu cu dan lo luc dau.` |
| `S4-C02` | `plural`: `a few months` / `a few nghia la vai, nen month doi thanh months.` |
| `S4-C03` | `article`: `the garden` / `Dung the vi khu vuon da duoc gioi thieu o cau truoc, khong con la mot vat moi.` |
| `S4-C04` | `relative-place`: `where bo nghia cho place` / `where mo mot phan noi ve dieu co the xay ra tai noi do.` |
| `S4-C04` | `plural`: `children la so nhieu bat quy tac` / `child doi thanh children khi noi tre em noi chung trong khu vuon.` |
| `S4-C04` | `modal`: `could play` / `could noi ve kha nang khu vuon tao ra, khong phai mot hanh dong dang xay ra tai luc noi.` |
| `S4-C06` | `time-condition`: `during lunch breaks` / `during dat hanh dong nghi ngoi vao khoang thoi gian nghi trua.` |
| `S5-C02` | `to-frame`: `encouraged shops to` / `encourage someone to do something nghia la khuyen khich ai lam viec gi. Vi vay sau shops can to de mo hanh dong.` |
| `S5-C03` | `plural`: `plastic bags` / `bags la so nhieu vi y noi tui nhua noi chung, khong phai mot tui.` |
| `S5-C04` | `to-frame`: `and to place` / `to place song song voi to use: ca hai la hanh dong ma cac cua hang duoc khuyen khich lam.` |
| `S5-C04` | `ellipsis`: `outside their doors` / `their doors dung their de gan cua voi cac cua hang, va khong lap lai nearby shops.` |
| `S6-C01` | `connector`: `although la nhuong bo` / `although dat mot gioi han o dau cau, roi y chinh sau dau phay moi noi tac dong that su.` |
| `S6-C04` | `content-clause`: `how people thought` / `how o day nghia la cach ma moi nguoi suy nghi, lam ro dieu da thay doi.` |
| `S7-C01` | `content-clause`: `showed that mo ket luan` / `that mo noi dung bai hoc duoc rut ra tu cau chuyen.` |
| `S7-C02` | `article`: `a simple local project` / `Dung a vi noi mot du an dia phuong don gian nhu mot vi du dai dien.` |
| `S7-C02` | `word-order`: `simple local project` / `simple va local dung truoc project de mo ta loai du an truoc khi neu danh tu chinh.` |
| `S7-C03` | `modal`: `can influence` / `can noi ve kha nang chung cua mot du an, khong phai mot hanh dong da xong.` |
| `S7-C04` | `time-condition`: `when people feel` / `when noi dieu kien de anh huong xay ra: khi moi nguoi cam thay thay doi thuoc ve ho.` |
| `S7-C04` | `article`: `the change` / `Dung the vi change la su thay doi dang duoc noi den trong cau, khong phai mot thay doi bat ky.` |

- [ ] **Step 3: Place composition-level notes where they explain a larger join**

Add these exact notes to composition tasks:

| Target | Notes |
| --- | --- |
| `S1-M06` | `connector`: `Hai ve duoc noi bang but` / `Ve truoc noi thanh pho muon lam doi song ben vung hon. Ve sau noi nhung thay doi hieu qua nhat lai it gay an tuong manh.` |
| `S3-M02` | `content-clause`: `Noi dung loi phan nan nam sau that` / `some residents complained that la khung dan vao. Phan sau that la dieu ho lo ngai.` |
| `S4-M03` | `relative-place`: `where gan voi a quiet place` / `where khong bat dau mot cau moi doc lap; no giai thich noi yen tinh do duoc dung de lam gi.` |
| `S5-M02` | `to-frame`: `Hai hanh dong song song` / `to use va to place la hai hanh dong cung nam sau encouraged nearby shops to.` |
| `S6-M02` | `connector`: `Mac du nhung van` / `Although neu gioi han, nhung y chinh la tac dong: it changed how people thought about shared space.` |
| `S7-M02` | `time-condition`: `when dat dieu kien` / `Anh huong den thoi quen xay ra khi moi nguoi cam thay su thay doi thuoc ve ho.` |

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
node --test tests/course-model.test.mjs
```

Expected: PASS for `tests/course-model.test.mjs`.

- [ ] **Step 5: Commit**

Run:

```bash
git add tests/course-model.test.mjs data/courses/small-public-garden-gentle-i1.json
git commit -m "Author Gentle meaning guidance"
```

---

### Task 7: Full Verification and UI QA

**Files:**
- Verify all changed files

- [ ] **Step 1: Run the full test suite**

Run:

```bash
node --test
```

Expected: all tests pass.

- [ ] **Step 2: Check whitespace**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 3: Start a local static server**

Run:

```bash
python -m http.server 4173
```

Expected: the server prints a serving message for port `4173`. Keep this terminal session open until browser QA is complete.

- [ ] **Step 4: Browser QA desktop**

Use the Browser plugin to open:

```text
http://localhost:4173
```

Select `A Small Public Garden - Gentle i+1`. Verify:

- overview shows the meaning map before the guide;
- guide shows `Diem de sai` on authored final chunks;
- exercise screen shows only the Vietnamese prompt and answer controls;
- no console errors;
- desktop layout has no overlapping text.

- [ ] **Step 5: Browser QA mobile**

Set a mobile viewport near `390x844`. Verify:

- meaning map wraps cleanly;
- difficulty notes wrap cleanly;
- buttons stay inside the viewport;
- answer textarea is not covered by guide-only content.

- [ ] **Step 6: Stop the local server**

Stop the server with `Ctrl+C`.

- [ ] **Step 7: Commit verification notes only if code changed during QA**

If QA reveals and fixes a UI issue, run:

```bash
git add index.html styles.css js/app.mjs tests/static-site.test.mjs
git commit -m "Polish guidance layout"
```

If QA does not require code changes, do not create a commit for this step.

---

### Task 8: Final Integration Check

**Files:**
- Verify repository state

- [ ] **Step 1: Inspect git state**

Run:

```bash
git status --short --branch
```

Expected: branch is clean after the task commits.

- [ ] **Step 2: Summarize implementation**

Prepare a concise Vietnamese summary with:

- metadata schema added;
- UI surfaces added;
- Gentle course content enriched;
- tests and browser QA results.

- [ ] **Step 3: Wait for merge and public instruction**

Do not merge or push unless the user asks for merge and public deployment in a later message.
