# Complete Gentle Meaning Chunk Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện course `A Small Public Garden - Gentle i+1` để cả bảy câu học tuần tự theo cụm nghĩa, repair đúng cụm hỏng và kết thúc bằng sáu lượt ghép đoạn cộng dồn.

**Architecture:** Giữ course gốc và course nghe nguyên trạng. Mở rộng converter cụm nghĩa để chỉ gắn vai trò vào task cuối, thay scheduler cụm nghĩa bằng các group tuần tự một task, bổ sung overview không chấm điểm và success message trong UI, rồi thay toàn bộ task legacy của course thử nghiệm bằng bảy `meaningChunkLessons`. Paragraph tasks tiếp tục được sinh từ model nhưng có rollback span về task câu hoàn chỉnh.

**Tech Stack:** Vanilla JavaScript ES modules, JSON course data, Node `node:test`, static HTML/CSS, PowerShell `System.Speech`, GitHub Pages.

---

## File Map

- `js/meaning-chunks.mjs`: validate và chuyển `meaningChunkLessons` thành task.
- `js/mastery.mjs`: tạo lịch học tuần tự, mastery và repair.
- `js/course-model.mjs`: trộn dữ liệu course, sinh paragraph task và policy.
- `js/lesson-flow.mjs`: trạng thái `overview`, `guide`, `exercise`.
- `js/app.mjs`: render overview, role guidance và success message.
- `index.html`, `styles.css`: vùng overview và style liên quan.
- `data/courses/small-public-garden-gentle-i1.json`: toàn bộ học liệu S1-S7.
- `js/pronunciation.mjs`: IPA cho word form mới.
- `tests/meaning-chunks.test.mjs`: contract converter.
- `tests/mastery.test.mjs`: contract scheduler và repair.
- `tests/course-model.test.mjs`: dữ liệu course, paragraph rollback và hồi quy.
- `tests/lesson-flow.test.mjs`, `tests/static-site.test.mjs`: overview/UI.
- `tests/course-catalog.test.mjs`: audio coverage.
- `assets/audio/*.wav`: audio cho task mới.

### Task 1: Chỉ gắn vai trò vào cụm hoàn chỉnh

**Files:**
- Modify: `tests/meaning-chunks.test.mjs`
- Modify: `tests/course-model.test.mjs`
- Modify: `js/meaning-chunks.mjs`

- [ ] **Step 1: Viết kiểm thử thất bại cho metadata hướng dẫn**

Trong `tests/meaning-chunks.test.mjs`, bổ sung assertion:

```js
const smallStep = groups[0].find((task) => task.id === "S1-C01-STEP01");

assert.equal(smallStep.guide.whenNeeded, undefined);
assert.equal(smallStep.guide.roleQuestion, undefined);
assert.equal(smallStep.guide.roleMeaning, undefined);
assert.equal(smallStep.guide.successMessage, undefined);
assert.equal(finalChunkTask.guide.whenNeeded, lesson.chunks[0].whenNeeded);
assert.equal(finalChunkTask.guide.roleQuestion, "Ai?");
assert.equal(finalChunkTask.guide.roleMeaning, lesson.chunks[0].roleMeaning);
```

Trong fixture, thêm:

```js
successMessage: "Bạn đã có cụm: many cities.",
```

và assert:

```js
assert.equal(
  finalChunkTask.guide.successMessage,
  "Bạn đã có cụm: many cities."
);
```

Đổi test trong `tests/course-model.test.mjs` để `S1-C01-STEP01` không có role
metadata, còn `S1-C01-STEP02` là final step và giữ đủ metadata.

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test tests/meaning-chunks.test.mjs tests/course-model.test.mjs
```

Expected: FAIL vì `buildStepGuide()` đang sao chép metadata cụm vào mọi step.

- [ ] **Step 3: Sửa converter tối thiểu**

Đổi `buildStepGuide()` thành:

```js
function buildStepGuide(chunk, step, isFinalStep) {
  const roleMetadata = isFinalStep
    ? {
        whenNeeded: chunk.whenNeeded,
        roleQuestion: chunk.roleQuestion,
        roleMeaning: chunk.roleMeaning,
        successMessage: step.successMessage ?? chunk.successMessage,
      }
    : {};

  return {
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
    ...roleMetadata,
  };
}
```

- [ ] **Step 4: Chạy test GREEN**

Run:

```powershell
node --test tests/meaning-chunks.test.mjs tests/course-model.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add js/meaning-chunks.mjs tests/meaning-chunks.test.mjs tests/course-model.test.mjs
git commit -m "Show meaning chunk roles only at completion"
```

### Task 2: Scheduler thành thạo tuần tự từng cụm

**Files:**
- Modify: `tests/mastery.test.mjs`
- Modify: `js/mastery.mjs`

- [ ] **Step 1: Đổi test group sang thứ tự mới**

Thay test interleaving cụm nghĩa bằng kỳ vọng:

```js
assert.deepEqual(
  meaningChunkGroups.map((practiceGroup) => practiceGroup.taskIds),
  [
    ["C1-step"],
    ["C1-final"],
    ["C2-step"],
    ["C2-final"],
    ["M1"],
    ["C3-step"],
    ["C3-final"],
    ["M2"],
    ["C4-step"],
    ["C4-final"],
    ["M3"],
  ]
);

assert.deepEqual(meaningChunkGroups[1].masteryRulesByTaskId["C1-final"], {
  minCorrect: 2,
  minStreak: 2,
  requiresInterleavedCorrect: false,
});
```

Thay sequence test bằng:

```js
const expectedSequence = [
  "C1-step",
  "C1-final",
  "C1-final",
  "C2-step",
  "C2-final",
  "C2-final",
  "M1",
];
```

Thêm test reset chuỗi:

```js
session = recordMasteryAttempt(session, groups, "C1-final", true);
session = recordMasteryAttempt(session, groups, "C1-final", false);
assert.equal(getCurrentTaskId(session, groups), "C1-final");
session = recordMasteryAttempt(session, groups, "C1-final", true);
assert.equal(getCurrentTaskId(session, groups), "C1-final");
```

Thêm hồi quy:

```js
assert.deepEqual(
  buildPracticeGroups(defaultTasks).slice(0, 2).map((group) => group.taskIds),
  [["S1-01", "S1-04"], ["S1-01", "S1-02", "S1-04"]]
);
```

- [ ] **Step 2: Chạy test để xác nhận RED**

Run:

```powershell
node --test tests/mastery.test.mjs
```

Expected: FAIL vì scheduler hiện ghép final step của hai cụm vào cùng group.

- [ ] **Step 3: Thay builder cụm nghĩa**

Trong `js/mastery.mjs`, thay `buildMeaningChunkSentenceGroups()` bằng logic:

```js
function buildMeaningChunkSentenceGroups(tasks, practicePolicy) {
  const groups = [];
  const chunkTasksById = new Map();
  const compositions = [];
  const scheduledTaskIds = new Set();
  const preparedChunkIds = new Set();

  tasks.forEach((task) => {
    if (task.meaningChunk?.id) {
      const chunkTasks = chunkTasksById.get(task.meaningChunk.id) ?? [];
      chunkTasks.push(task);
      chunkTasksById.set(task.meaningChunk.id, chunkTasks);
    } else if (Array.isArray(task.usesChunks)) {
      compositions.push(task);
    }
  });

  const appendTask = (task, prefix) => {
    const isFinalChunk = Boolean(task.meaningChunk?.isFinalStep);
    const rule = taskMasteryRule({
      minCorrect: isFinalChunk
        ? Number(practicePolicy.minCorrect) || 2
        : 1,
      minStreak: isFinalChunk ? 2 : 1,
      requiresInterleavedCorrect: false,
    });

    groups.push(meaningChunkGroup(
      `${prefix}-${task.id}`,
      [task],
      { [task.id]: rule },
      practicePolicy
    ));
    scheduledTaskIds.add(task.id);
  };

  const appendChunk = (chunkId) => {
    if (preparedChunkIds.has(chunkId)) {
      return;
    }

    const chunkTasks = chunkTasksById.get(chunkId);

    if (!chunkTasks) {
      throw new Error(
        `Invalid meaning chunk schedule: unknown chunk "${chunkId}".`
      );
    }

    chunkTasks.forEach((task) => appendTask(task, "meaning-step"));
    preparedChunkIds.add(chunkId);
  };

  compositions.forEach((composition) => {
    composition.usesChunks.forEach(appendChunk);
    appendTask(composition, "meaning-compose");
  });

  tasks
    .filter((task) => !scheduledTaskIds.has(task.id))
    .forEach((task) => appendTask(task, "meaning-fallback"));

  return groups;
}
```

Mở rộng `taskMasteryRule()`:

```js
function taskMasteryRule({
  minCorrect,
  minStreak = 1,
  requiresInterleavedCorrect,
}) {
  return { minCorrect, minStreak, requiresInterleavedCorrect };
}
```

Không thay `buildRollingGroups()` hoặc `buildFrontierGroups()`.

- [ ] **Step 4: Chạy test GREEN và hồi quy**

Run:

```powershell
node --test tests/mastery.test.mjs tests/listening-course.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add js/mastery.mjs tests/mastery.test.mjs
git commit -m "Enforce sequential meaning chunk mastery"
```

### Task 3: Overview không chấm điểm và success message

**Files:**
- Modify: `tests/meaning-chunks.test.mjs`
- Modify: `tests/course-model.test.mjs`
- Modify: `tests/lesson-flow.test.mjs`
- Modify: `tests/static-site.test.mjs`
- Modify: `js/meaning-chunks.mjs`
- Modify: `js/course-model.mjs`
- Modify: `js/mastery.mjs`
- Modify: `js/lesson-flow.mjs`
- Modify: `js/app.mjs`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Viết test converter giữ overview ở task đầu**

Thêm overview vào fixture:

```js
overview: {
  title: "Mình sẽ xây câu này từ các cụm nghĩa",
  summary: [
    "Câu này nói về nhiều thành phố.",
    "Mình sẽ học từng cụm rồi ghép thành câu.",
  ],
  graded: false,
},
```

Assert:

```js
assert.deepEqual(groups[0][0].lessonOverview, lesson.overview);
assert.equal(
  groups[0].slice(1).some((task) => task.lessonOverview),
  false
);
```

- [ ] **Step 2: Viết test session lưu overview đã xem**

Trong `tests/mastery.test.mjs`:

```js
let session = createMasterySession();
session = markOverviewSeen(session, "S1");

assert.deepEqual(session.seenOverviewIds, ["S1"]);
assert.equal(isOverviewSeen(session, "S1"), true);
assert.deepEqual(
  restoreMasterySession(serializeMasterySession(session), groups).seenOverviewIds,
  ["S1"]
);
```

- [ ] **Step 3: Viết test lesson flow có phase overview**

Trong `tests/lesson-flow.test.mjs`:

```js
const overview = createLessonFlow(0, { phase: "overview" });
const guide = openGuide(overview);

assert.equal(overview.phase, "overview");
assert.equal(guide.phase, "guide");
assert.equal(guide.activeIndex, 0);
```

- [ ] **Step 4: Viết static test cho UI**

Assert HTML có:

```js
assert.match(html, /id="overview-content"/);
assert.match(html, /id="overview-title"/);
assert.match(html, /id="overview-summary"/);
assert.match(html, /id="continue-overview"/);
```

Assert app có:

```js
assert.match(appSource, /renderOverview/);
assert.match(appSource, /markOverviewSeen/);
assert.match(appSource, /task\.guide\.successMessage/);
```

- [ ] **Step 5: Chạy test RED**

Run:

```powershell
node --test tests/meaning-chunks.test.mjs tests/mastery.test.mjs tests/lesson-flow.test.mjs tests/static-site.test.mjs
```

Expected: FAIL vì overview/session/UI chưa tồn tại.

- [ ] **Step 6: Preserve overview**

Trong `buildLessonTasks()`:

```js
const tasks = [...stepTasks, ...compositionTasks];

if (tasks[0] && lesson.overview) {
  tasks[0] = {
    ...tasks[0],
    lessonOverview: {
      title: lesson.overview.title,
      summary: [...lesson.overview.summary],
      graded: false,
    },
  };
}
```

Validate `title`, `summary`, `graded === false`; clone `lessonOverview` trong
`normalizeTask()`.

- [ ] **Step 7: Persist overview state**

Thêm vào mastery session:

```js
seenOverviewIds: [],
```

và export:

```js
export function isOverviewSeen(session, sentenceId) {
  return session.seenOverviewIds.includes(sentenceId);
}

export function markOverviewSeen(session, sentenceId) {
  return isOverviewSeen(session, sentenceId)
    ? session
    : {
        ...session,
        seenOverviewIds: [...session.seenOverviewIds, sentenceId],
      };
}
```

Clone trường này trong serialize/restore.

- [ ] **Step 8: Thêm phase overview**

Trong `lesson-flow.mjs`:

```js
export function openGuide(flow) {
  return {
    ...flow,
    phase: "guide",
    feedback: null,
    waitingForSpeech: false,
  };
}
```

Trong app, `createFlowForCurrentTask()` chọn `"overview"` khi task có
`lessonOverview` và sentence chưa được xem.

- [ ] **Step 9: Thêm markup và render**

Trong `index.html`:

```html
<section id="overview-content" class="overview" hidden>
  <h2 id="overview-title"></h2>
  <div id="overview-summary"></div>
  <button id="continue-overview" type="button">Bắt đầu xây câu</button>
</section>
```

`renderOverview()` tạo từng dòng bằng `textContent`. Handler:

```js
function handleOverviewContinue() {
  const task = activeTask();
  masterySession = markOverviewSeen(masterySession, task.sentenceId);
  saveSession();
  flow = openGuide(flow);
  render();
  focusGuideContinue();
  playGuide();
}
```

Ẩn role line trong exercise như hiện tại.

- [ ] **Step 10: Hiển thị success message đúng mốc**

Trong `handleCheck()`, giữ `previousGroupIndex`, record attempt, rồi:

```js
const completedGroup =
  feedback.correct &&
  masterySession.groupIndex > previousGroupIndex;
const resolvedFeedback =
  completedGroup && task.guide.successMessage
    ? { ...feedback, message: task.guide.successMessage }
    : feedback;
flow = recordSubmission(flow, resolvedFeedback);
```

Audio và chuyển task vẫn dùng `feedback.correct`.

- [ ] **Step 11: Chạy test GREEN**

Run:

```powershell
node --test tests/meaning-chunks.test.mjs tests/course-model.test.mjs tests/mastery.test.mjs tests/lesson-flow.test.mjs tests/static-site.test.mjs
```

Expected: PASS.

- [ ] **Step 12: Commit**

```powershell
git add index.html styles.css js/app.mjs js/course-model.mjs js/lesson-flow.mjs js/mastery.mjs js/meaning-chunks.mjs tests
git commit -m "Add meaning chunk overviews and milestones"
```

### Task 4: Khóa contract engine cho lesson hoàn chỉnh và paragraph repair

**Files:**
- Modify: `tests/course-model.test.mjs`
- Modify: `js/course-model.mjs`
- Modify: `js/mastery.mjs`
- Modify: `data/courses/small-public-garden-gentle-i1.json`

- [ ] **Step 1: Viết test coverage bằng fixture hoàn chỉnh**

Tạo course fixture hai câu, có `meaningChunkProfile.lessonCoverage:
"complete"` và hai lesson `S1`, `S2`. Assert model chấp nhận fixture.

```js
const completeTwoSentenceFixture = {
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

assert.doesNotThrow(() => buildLessonCourse(completeTwoSentenceFixture));
```

- [ ] **Step 2: Viết test từ chối coverage thiếu**

Xóa lesson S2 khỏi fixture và assert:

```js
assert.throws(
  () => buildLessonCourse(incompleteFixture),
  /lessonCoverage "complete" requires lessons for: S2/
);
```

- [ ] **Step 3: Viết test paragraph rollback**

```js
const paragraph = byId.get("G2");

assert.equal(paragraph.stage, "paragraph");
assert.deepEqual(
  paragraph.rollbackTargets.map((target) => target.taskId),
  ["S1-FINAL", "S2-FINAL"]
);
assert.equal(
  paragraph.rollbackTargets.at(-1).end,
  paragraph.answer.replace(/[.,!?;:]/g, "").split(/\s+/).length
);
```

Assert paragraph mastery group:

```js
assert.deepEqual(paragraphGroup.masteryRulesByTaskId.G2, {
  minCorrect: 1,
  minStreak: 1,
  requiresInterleavedCorrect: false,
});
```

- [ ] **Step 4: Chạy RED**

Run:

```powershell
node --test tests/course-model.test.mjs tests/mastery.test.mjs
```

Expected: FAIL vì lesson coverage và paragraph rollback chưa có.

- [ ] **Step 5: Validate complete coverage**

Thêm `meaningChunkProfile.lessonCoverage` vào course data:

```json
{
  "lessonCoverage": "complete"
}
```

Trong model, nếu giá trị là `"complete"`, so sánh tập `sentenceId` của lessons
với toàn bộ `sentences`; thiếu hoặc thừa đều throw thông báo cụ thể.

- [ ] **Step 6: Sinh paragraph rollback spans**

Sau khi build sentence groups, lấy task cuối stage `sentence` của từng group.
Trong `buildParagraphTasks()`, token hóa từng câu theo đúng thứ tự và tạo:

```js
rollbackTargets: selected.map((sentence) => ({
  taskId: finalTaskIdBySentenceId.get(sentence.id),
  start,
  end,
})),
```

Mỗi span phải phủ đúng token của một câu trong paragraph.

- [ ] **Step 7: Cho paragraph đúng một lần**

Trong meaning chunk scheduler, với sentence group `PARAGRAPH`, dùng:

```js
minCorrect: task.stage === "paragraph" ? 1 : defaultMinCorrect
```

và giữ `requiresInterleavedCorrect: false`.

- [ ] **Step 8: Chạy GREEN**

Run:

```powershell
node --test tests/course-model.test.mjs tests/mastery.test.mjs
```

Expected: PASS bằng fixture hai câu; không phụ thuộc dữ liệu thật S2-S7.

- [ ] **Step 9: Commit phần engine**

```powershell
git add js/course-model.mjs js/mastery.mjs tests/course-model.test.mjs tests/mastery.test.mjs
git commit -m "Add complete lesson and paragraph repair contracts"
```

### Task 5: Biên soạn cụm nghĩa cho S2 và S3

**Files:**
- Modify: `data/courses/small-public-garden-gentle-i1.json`
- Modify: `tests/course-model.test.mjs`
- Modify: `js/pronunciation.mjs`

- [ ] **Step 1: Viết test cấu trúc S2-S3**

Assert chunk answer:

```js
assert.deepEqual(
  s2.chunks.map((chunk) => chunk.english),
  [
    "in one neighborhood",
    "the local council",
    "an empty parking lot",
    "a small public garden",
    "turned an empty parking lot into a small public garden",
  ]
);

assert.deepEqual(
  s3.chunks.map((chunk) => chunk.english),
  [
    "at first",
    "some residents",
    "complained that",
    "the project would reduce parking spaces",
    "and attract noise",
  ]
);
```

Assert final composition answers equal `sentences` S2/S3.

- [ ] **Step 2: Chạy RED**

Run:

```powershell
node --test tests/course-model.test.mjs
```

Expected: FAIL vì S2/S3 chưa có meaning lesson.

- [ ] **Step 3: Thêm overview và chunks S2**

Dùng IDs:

```text
S2-C01, S2-C02, S2-C03, S2-C04, S2-C05
Các step dùng mẫu S2-Cxx-STEPyy và tăng yy theo thứ tự i+1 trong spec.
S2-M01 = the local council turned an empty parking lot into a small public garden
S2-M02 = câu S2 hoàn chỉnh
```

Mỗi chunk dùng đúng đường i+1, vai trò và composition trong spec đã duyệt.
Final task `S2-M02` có `stage: "sentence"`.

- [ ] **Step 4: Thêm repair S2**

Tối thiểu:

```json
[
  {
    "id": "S2-R01",
    "appliesTo": ["S2-M01", "S2-M02"],
    "chunkId": "S2-C03",
    "detect": { "commonWrongAnswers": ["a empty parking lot"] },
    "message": "Cụm cần sửa dùng an trước âm đầu của empty: một bãi đỗ xe trống."
  },
  {
    "id": "S2-R02",
    "appliesTo": ["S2-M01", "S2-M02"],
    "chunkId": "S2-C02",
    "detect": { "commonWrongAnswers": ["local council"] },
    "message": "Cụm cần sửa: hội đồng địa phương đã được xác định trong bối cảnh."
  }
]
```

- [ ] **Step 5: Thêm overview, chunks và repair S3**

Dùng IDs:

```text
S3-C01, S3-C02, S3-C03, S3-C04, S3-C05
S3-M01 = the project would reduce parking spaces and attract noise
S3-M02 = some residents complained that the project would reduce parking spaces and attract noise
S3-M03 = câu S3 hoàn chỉnh
```

Repair tối thiểu: `resident`, thiếu `would`, thiếu `that`, lặp
`the project` trước `attract noise`.

- [ ] **Step 6: Xác nhận độ phủ IPA**

Các dạng S2-S3 hiện đã có trong `AMERICAN_IPA`, gồm:

```js
turned: "/tɝnd/",
complained: "/kəmˈpleɪnd/",
reduce: "/rɪˈdus/",
attract: "/əˈtrækt/",
```

Chỉ sửa `js/pronunciation.mjs` nếu test liệt kê word form thật sự còn thiếu.

- [ ] **Step 7: Chạy test**

Run:

```powershell
node --test tests/course-model.test.mjs tests/learning.test.mjs
```

Expected: assertions S2/S3 PASS; test coverage S4-S7 vẫn có thể đỏ cho tới task
tương ứng.

- [ ] **Step 8: Commit**

```powershell
git add data/courses/small-public-garden-gentle-i1.json js/pronunciation.mjs tests/course-model.test.mjs
git commit -m "Add Gentle meaning chunks for sentences two and three"
```

### Task 6: Biên soạn cụm nghĩa cho S4

**Files:**
- Modify: `data/courses/small-public-garden-gentle-i1.json`
- Modify: `tests/course-model.test.mjs`
- Modify: `js/pronunciation.mjs`

- [ ] **Step 1: Viết test S4**

```js
assert.deepEqual(
  s4.chunks.map((chunk) => chunk.english),
  [
    "however",
    "within a few months",
    "the garden became a quiet place",
    "where children could play",
    "older people could meet",
    "office workers could rest during lunch breaks",
  ]
);
assert.equal(s4.compositionTasks.at(-1).answer, sentenceById.get("S4").english);
assert.equal(s4.compositionTasks.at(-1).roleLine.length, 6);
```

- [ ] **Step 2: Chạy RED**

Run:

```powershell
node --test tests/course-model.test.mjs
```

- [ ] **Step 3: Thêm lesson S4**

Dùng:

```text
S4-C01, S4-C02, S4-C03, S4-C04, S4-C05, S4-C06
S4-M01 = where children could play, older people could meet
S4-M02 = where children could play, older people could meet, and office workers could rest during lunch breaks
S4-M03 = the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks
S4-M04 = within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks
S4-M05 = câu S4 hoàn chỉnh
```

Giữ các step bất quy tắc `child -> children` và `person -> people`.

- [ ] **Step 4: Thêm repair S4**

Tối thiểu: `child/children`, thiếu `could`, thiếu `where`, `break/breaks`,
thiếu `however`.

- [ ] **Step 5: Bổ sung IPA và chạy test**

Run:

```powershell
node --test tests/course-model.test.mjs tests/learning.test.mjs
```

Expected: S4 PASS.

- [ ] **Step 6: Commit**

```powershell
git add data/courses/small-public-garden-gentle-i1.json js/pronunciation.mjs tests/course-model.test.mjs
git commit -m "Add Gentle meaning chunks for sentence four"
```

### Task 7: Biên soạn cụm nghĩa cho S5-S7 và xóa legacy khỏi luồng

**Files:**
- Modify: `data/courses/small-public-garden-gentle-i1.json`
- Modify: `tests/course-model.test.mjs`
- Modify: `js/pronunciation.mjs`

- [ ] **Step 1: Viết test chunk maps**

```js
assert.deepEqual(s5.chunks.map(({ english }) => english), [
  "the project",
  "also encouraged nearby shops to",
  "use fewer plastic bags",
  "and to place recycling bins outside their doors",
]);

assert.deepEqual(s6.chunks.map(({ english }) => english), [
  "although",
  "the garden did not solve every environmental problem",
  "it changed",
  "how people thought about shared space",
]);

assert.deepEqual(s7.chunks.map(({ english }) => english), [
  "it showed that",
  "a simple local project",
  "can influence daily habits",
  "when people feel that the change belongs to them",
]);
```

Assert final compositions are exact S5-S7 source sentences.

- [ ] **Step 2: Chạy RED**

Run:

```powershell
node --test tests/course-model.test.mjs
```

- [ ] **Step 3: Thêm lesson S5**

IDs:

```text
S5-C01, S5-C02, S5-C03, S5-C04
S5-M01 = also encouraged nearby shops to use fewer plastic bags
S5-M02 = use fewer plastic bags and to place recycling bins outside their doors
S5-M03 = câu S5 hoàn chỉnh
```

Repair: `shop/shops`, `bag/bags`, `fewer/less`, thiếu `to` trước `place`,
`door/doors`.

- [ ] **Step 4: Thêm lesson S6**

IDs:

```text
S6-C01, S6-C02, S6-C03, S6-C04
S6-M01 = it changed how people thought about shared space
S6-M02 = câu S6 hoàn chỉnh
```

Repair: thiếu `although`, dùng `all` thay `every`, thiếu `did not`, thiếu
`how`.

- [ ] **Step 5: Thêm lesson S7**

IDs:

```text
S7-C01, S7-C02, S7-C03, S7-C04
S7-M01 = a simple local project can influence daily habits
S7-M02 = a simple local project can influence daily habits when people feel that the change belongs to them
S7-M03 = câu S7 hoàn chỉnh
```

Repair: thiếu `that` sau `showed`, `habit/habits`, thiếu `when`,
`belong/belongs`.

- [ ] **Step 6: Khóa complete coverage và tăng session version**

Đặt:

```json
"sessionVersion": 3,
"meaningChunkProfile": {
  "version": 2,
  "lessonCoverage": "complete",
  "scriptSpec": "docs/superpowers/specs/2026-06-13-complete-gentle-meaning-chunk-course-design.md",
  "masteryRule": {
    "minCorrect": 2,
    "requiresInterleavedCorrect": false,
    "requiresUseInLongerMeaning": true
  }
}
```

Giữ `taskGroups` tạm thời như dữ liệu nguồn nếu tooling còn cần, nhưng model
phải chứng minh không task legacy nào đi vào `experiment.tasks`.

- [ ] **Step 7: Khóa test coverage dữ liệu thật**

Trong `tests/course-model.test.mjs`:

```js
assert.deepEqual(
  experimentData.meaningChunkLessons.map((lesson) => lesson.sentenceId),
  ["S1", "S2", "S3", "S4", "S5", "S6", "S7"]
);
assert.equal(
  experiment.sentenceTaskGroups.every((group) =>
    group.every(
      (task) =>
        task.meaningChunk ||
        Array.isArray(task.usesChunks)
    )
  ),
  true
);
assert.equal(
  experiment.tasks.some((task) => /^S[1-7]-\d+$/.test(task.id)),
  false
);
```

- [ ] **Step 8: Chạy focused tests**

Run:

```powershell
node --test tests/course-model.test.mjs tests/meaning-chunks.test.mjs tests/mastery.test.mjs tests/learning.test.mjs
```

Expected: PASS, bao gồm đủ S1-S7 và không legacy task.

- [ ] **Step 9: Commit**

```powershell
git add data/courses/small-public-garden-gentle-i1.json js/pronunciation.mjs tests/course-model.test.mjs
git commit -m "Complete Gentle meaning chunk lessons"
```

### Task 8: Audio cho toàn bộ task mới

**Files:**
- Modify: `tests/course-catalog.test.mjs`
- Create/Modify: `assets/audio/*.wav`

- [ ] **Step 1: Viết test audio course thử nghiệm**

Assert mọi task có file:

```js
const experiment = await loadCourseById("small-public-garden-gentle-i1");
const missing = experiment.tasks
  .map((task) => path.join(root, "assets", "audio", `${task.audioId}.wav`))
  .filter((assetPath) => !existsSync(assetPath));

assert.deepEqual(missing, []);
```

Với mỗi file, assert `RIFF` và `WAVE`.

- [ ] **Step 2: Chạy RED**

Run:

```powershell
node --test tests/course-catalog.test.mjs
```

Expected: FAIL liệt kê audio ID mới.

- [ ] **Step 3: Tái sử dụng audio legacy bằng audioId**

Trong JSON, mọi step có answer giống task cũ dùng `audioId` cũ, ví dụ:

```json
{ "id": "S2-C01-STEP01", "answer": "neighborhood", "audioId": "S2-01" }
```

Composition mới không có audio tương ứng giữ ID mới.

- [ ] **Step 4: Sinh audio còn thiếu**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tools/generate-american-audio.ps1 `
  -CourseDataPath data/courses/small-public-garden-gentle-i1.json `
  -OutputDirectory assets/audio
```

Expected output:

```text
Microsoft Zira Desktop (en-US):
```

Output phải kết thúc bằng:

```text
files for small-public-garden-gentle-i1
```

- [ ] **Step 5: Chạy GREEN**

Run:

```powershell
node --test tests/course-catalog.test.mjs tests/speech.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add assets/audio tests/course-catalog.test.mjs
git commit -m "Add audio for complete Gentle course"
```

### Task 9: Kiểm thử repair đoạn và toàn hệ thống

**Files:**
- Modify: `tests/mastery.test.mjs`
- Modify: `tests/static-site.test.mjs`
- Modify: `docs/superpowers/specs/2026-06-12-sequential-meaning-chunk-mastery-design.md`

- [ ] **Step 1: Thêm test paragraph rollback**

Tạo paragraph task fixture với rollback:

```js
{
  id: "G2",
  sentenceId: "PARAGRAPH",
  stage: "paragraph",
  rollbackTargets: [
    { taskId: "S1-FINAL", start: 0, end: 4 },
    { taskId: "S2-FINAL", start: 4, end: 9 },
  ],
}
```

Ghi nhận sai với `issue.index = 6`, assert:

```js
assert.equal(getCurrentTaskId(session, groups), "S2-FINAL");
```

Sau repair đúng, assert quay về `G2`.

- [ ] **Step 2: Chạy RED/GREEN**

Run:

```powershell
node --test tests/mastery.test.mjs
```

Nếu engine từ Task 4 đã đủ, test PASS ngay sau khi chứng minh rollback. Nếu
FAIL, sửa `buildMeaningChunkGroups()` để paragraph group giữ
`rollbackTargetsByTaskId`.

- [ ] **Step 3: Đồng bộ tài liệu scheduler**

Trong spec ngày 12/6, ghi trạng thái triển khai:

```text
Đã áp dụng đầy đủ cho course small-public-garden-gentle-i1 ngày 13/06/2026.
```

Ghi rõ paragraph đúng một lần và rollback về câu/cụm hỏng.

- [ ] **Step 4: Chạy full suite và diff hygiene**

Run:

```powershell
node --test
git diff --check
git status --short
```

Expected: tất cả test PASS, `git diff --check` không có output.

- [ ] **Step 5: Commit**

```powershell
git add tests/mastery.test.mjs tests/static-site.test.mjs docs/superpowers/specs/2026-06-12-sequential-meaning-chunk-mastery-design.md
git commit -m "Verify complete Gentle mastery flow"
```

### Task 10: Browser QA, merge và public

**Files:**
- No production file changes expected.

- [ ] **Step 1: Chạy local server**

Run:

```powershell
python -m http.server 4174
```

Expected: app available at `http://127.0.0.1:4174/`.

- [ ] **Step 2: Kiểm tra desktop**

Với Browser:

1. chọn `A Small Public Garden - Gentle i+1`;
2. xác nhận overview S1 xuất hiện trước guide;
3. xác nhận `city` không có role metadata;
4. xác nhận `many cities` có đủ ba phần vai trò;
5. nhập đúng `many cities` lần đầu và thấy cùng task lần hai;
6. nhập đúng lần hai và thấy success message rồi sang `try`;
7. kiểm tra một composition có role line ở guide nhưng exercise chỉ có prompt;
8. cố ý nhập `many city` trong composition, repair về `many cities`, rồi quay lại composition;
9. dùng reset và course picker để kiểm tra session version mới.

- [ ] **Step 3: Kiểm tra mobile 390 x 800**

Xác nhận:

- overview không tràn;
- role line xuống dòng tự nhiên;
- prompt paragraph không che textarea;
- các nút không đổi kích thước khi trạng thái thay đổi;
- không có nội dung chồng lấn.

- [ ] **Step 4: Kiểm tra console và full test cuối**

Run:

```powershell
node --test
git diff --check
git status --short --branch
```

Browser console expected: no errors.

- [ ] **Step 5: Merge main và push**

```powershell
git switch main
git pull --ff-only origin main
git merge --ff-only codex/complete-gentle-meaning-chunks
node --test
git push origin main
```

- [ ] **Step 6: Xác minh GitHub Pages**

Chờ workflow `pages build and deployment` của commit mới hoàn tất `success`.
Mở bản public và xác nhận:

- course JSON có `sessionVersion: 3`;
- có đủ bảy `meaningChunkLessons`;
- scheduler public dùng group tuần tự;
- course picker và S1 overview tải được;
- không có lỗi console.
