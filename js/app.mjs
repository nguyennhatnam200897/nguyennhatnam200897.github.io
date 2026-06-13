import { loadCourseByEntry, loadCourseIndex } from "./course-loader.mjs";
import {
  createLessonFlow,
  openExercise,
  openGuide,
  recordSubmission,
  revisitFailedGuide,
} from "./lesson-flow.mjs";
import { evaluateAnswer } from "./learning.mjs";
import {
  buildPracticeGroups,
  calculateMasteryProgress,
  createMasterySession,
  getCurrentTaskId,
  isOverviewSeen,
  isTaskIntroduced,
  markOverviewSeen,
  recordMasteryAttempt,
  restoreMasterySession,
  serializeMasterySession,
} from "./mastery.mjs";
import { createSpeechInput } from "./speech-input.mjs";
import { createSpeechPlayer } from "./speech.mjs";

const legacyStorageKey = "article-mastery-session-v2";
const speechInput = createSpeechInput(window);
const speechPlayer = createSpeechPlayer(window);

const elements = {
  answer: document.querySelector("#answer"),
  changeCourse: document.querySelector("#change-course"),
  checkButton: document.querySelector("#check-answer"),
  continueGuide: document.querySelector("#continue-guide"),
  continueOverview: document.querySelector("#continue-overview"),
  courseList: document.querySelector("#course-list"),
  coursePicker: document.querySelector("#course-picker"),
  courseStatus: document.querySelector("#course-status"),
  exerciseContent: document.querySelector("#exercise-content"),
  expectedAnswer: document.querySelector("#expected-answer"),
  feedback: document.querySelector("#feedback"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackNotes: document.querySelector("#feedback-notes"),
  finishState: document.querySelector("#finish-state"),
  guideContent: document.querySelector("#guide-content"),
  guideDifficultyNotes: document.querySelector("#guide-difficulty-notes"),
  guideExplanation: document.querySelector("#guide-explanation"),
  guideIpa: document.querySelector("#guide-ipa"),
  guideMeaning: document.querySelector("#guide-meaning"),
  guideNewWords: document.querySelector("#guide-new-words"),
  guideParts: document.querySelector("#guide-parts"),
  guidePurpose: document.querySelector("#guide-purpose"),
  guideRole: document.querySelector("#guide-role"),
  guideRoleLine: document.querySelector("#guide-role-line"),
  guideRoleMeaning: document.querySelector("#guide-role-meaning"),
  guideTerm: document.querySelector("#guide-term"),
  guideWhenNeeded: document.querySelector("#guide-when-needed"),
  lesson: document.querySelector("#lesson"),
  listenGuide: document.querySelector("#listen-guide"),
  overviewContent: document.querySelector("#overview-content"),
  overviewMeaningMap: document.querySelector("#overview-meaning-map"),
  overviewSummary: document.querySelector("#overview-summary"),
  overviewTitle: document.querySelector("#overview-title"),
  progress: document.querySelector("#global-progress"),
  progressBar: document.querySelector("#progress-bar"),
  prompt: document.querySelector("#prompt"),
  resetCourse: document.querySelector("#reset-course"),
  speakAnswer: document.querySelector("#speak-answer"),
  speechInputStatus: document.querySelector("#speech-input-status"),
};

let activeCourse = null;
let courseEntries = [];
let courseStates = [];
let flow = null;
let masterySession = null;
let practiceGroups = [];
let speechInputListening = false;
let taskIndexById = new Map();
let tasks = [];

const courseCache = new Map();

function storageKeyFor(course) {
  const versionSuffix =
    course.sessionVersion > 1 ? `:v${course.sessionVersion}` : "";

  return `article-mastery-session-v3:${course.id}${versionSuffix}`;
}

function audioSrcFor(task) {
  return `${activeCourse.audioBasePath}/${task.audioId ?? task.id}.${activeCourse.audioExtension}`;
}

function loadSession(course, groups) {
  const storageKey = storageKeyFor(course);

  try {
    const stored = localStorage.getItem(storageKey);
    const legacy =
      course.id === "small-public-garden" && course.sessionVersion === 1
        ? localStorage.getItem(legacyStorageKey)
        : null;
    const restored = restoreMasterySession(
      JSON.parse(stored ?? legacy ?? "null"),
      groups
    );

    if (!stored && legacy) {
      localStorage.setItem(
        storageKey,
        JSON.stringify(serializeMasterySession(restored))
      );
    }

    return restored;
  } catch {
    return createMasterySession(groups);
  }
}

function saveSession() {
  if (!activeCourse || !masterySession) {
    return;
  }

  localStorage.setItem(
    storageKeyFor(activeCourse),
    JSON.stringify(serializeMasterySession(masterySession))
  );
}

function resetCourse() {
  if (!activeCourse) {
    return;
  }

  const confirmed = window.confirm(
    "Xóa toàn bộ tiến độ của khóa học này và bắt đầu lại từ đầu?"
  );

  if (!confirmed) {
    return;
  }

  const storageKey = storageKeyFor(activeCourse);
  speechPlayer.cancel();
  stopSpeechInput();
  setSpeechInputStatus("");
  localStorage.removeItem(storageKey);
  masterySession = createMasterySession(practiceGroups);
  showCurrentTask({ forceGuide: true });
}

function currentTaskId() {
  return masterySession ? getCurrentTaskId(masterySession, practiceGroups) : null;
}

function taskIndexFromId(taskId) {
  return taskId ? taskIndexById.get(taskId) ?? tasks.length : tasks.length;
}

function createFlowForCurrentTask({ forceGuide = false } = {}) {
  const taskId = currentTaskId();
  const activeIndex = taskIndexFromId(taskId);
  const task = tasks[activeIndex];
  const needsOverview =
    taskId &&
    task?.lessonOverview &&
    !isOverviewSeen(masterySession, task.sentenceId);
  const phase = forceGuide
    ? "guide"
    : needsOverview
      ? "overview"
      : taskId && !isTaskIntroduced(masterySession, taskId)
        ? "guide"
        : "exercise";

  return createLessonFlow(activeIndex, { phase });
}

function isFinished() {
  return !flow || flow.activeIndex >= tasks.length || !currentTaskId();
}

function activeTask() {
  return tasks[flow.activeIndex];
}

function focusAnswer() {
  window.requestAnimationFrame(() => {
    elements.answer.focus();
  });
}

function focusGuideContinue() {
  window.requestAnimationFrame(() => {
    elements.continueGuide.focus();
  });
}

function focusOverviewContinue() {
  window.requestAnimationFrame(() => {
    elements.continueOverview.focus();
  });
}

function setCourseStatus(message) {
  elements.courseStatus.textContent = message;
  elements.courseStatus.hidden = !message;
}

function setSpeechInputStatus(message) {
  elements.speechInputStatus.textContent = message;
  elements.speechInputStatus.hidden = !message;
}

function stopSpeechInput() {
  speechInput.stop();
  speechInputListening = false;
  elements.speakAnswer.textContent = "Nói thử";
}

function speechInputErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Trình duyệt chưa cho phép dùng micro. Bạn vẫn có thể gõ tay.";
  }

  if (error === "no-speech") {
    return "Mình chưa nghe rõ. Bạn có thể nói lại hoặc gõ tay.";
  }

  if (error === "audio-capture") {
    return "Trình duyệt chưa tìm thấy micro. Bạn vẫn có thể gõ tay.";
  }

  if (error === "unsupported") {
    return "Trình duyệt này chưa hỗ trợ nói để nhập. Bạn vẫn có thể gõ tay.";
  }

  return "Tính năng nói đang không khả dụng. Bạn vẫn có thể gõ tay.";
}

function handleSpeechFinal(transcript) {
  stopSpeechInput();
  elements.answer.value = transcript;
  setSpeechInputStatus(
    `Máy nghe được: "${transcript}". Bạn có thể sửa trước khi kiểm tra.`
  );
  focusAnswer();
}

function handleSpeakAnswer() {
  if (flow?.phase !== "exercise" || isFinished() || flow.feedback) {
    return;
  }

  if (speechInputListening) {
    stopSpeechInput();
    setSpeechInputStatus("Đã dừng nghe. Bạn có thể nói lại hoặc gõ tay.");
    focusAnswer();
    return;
  }

  speechPlayer.cancel();
  setSpeechInputStatus("Đang nghe...");
  speechInputListening = true;
  elements.speakAnswer.textContent = "Dừng nghe";

  const started = speechInput.start({
    onEnd: () => {
      speechInputListening = false;
      elements.speakAnswer.textContent = "Nói thử";
    },
    onError: (error) => {
      speechInputListening = false;
      elements.speakAnswer.textContent = "Nói thử";
      setSpeechInputStatus(speechInputErrorMessage(error));
    },
    onFinal: handleSpeechFinal,
    onInterim: (transcript) => {
      setSpeechInputStatus(`Máy đang nghe: "${transcript}"`);
    },
  });

  if (!started) {
    speechInputListening = false;
    elements.speakAnswer.textContent = "Nói thử";
  }
}

async function loadCourseForEntry(entry) {
  if (!courseCache.has(entry.id)) {
    courseCache.set(entry.id, loadCourseByEntry(entry));
  }

  return courseCache.get(entry.id);
}

async function buildCourseState(entry) {
  try {
    const course = await loadCourseForEntry(entry);
    const groups = buildPracticeGroups(course.tasks, course.practicePolicy);
    const session = loadSession(course, groups);

    return {
      course,
      entry,
      error: null,
      progress: calculateMasteryProgress(session, groups),
      summary: course.summary,
    };
  } catch (error) {
    return {
      course: null,
      entry,
      error,
      progress: 0,
      summary: { sentenceCount: 0, taskCount: 0 },
    };
  }
}

function renderCourseCards(states) {
  elements.courseList.replaceChildren();

  states.forEach((courseState) => {
    const card = document.createElement("article");
    const title = document.createElement("h2");
    const meta = document.createElement("p");
    const description = document.createElement("p");
    const stats = document.createElement("p");
    const progress = document.createElement("div");
    const progressBar = document.createElement("div");
    const button = document.createElement("button");

    card.className = "courseCard";
    title.textContent = courseState.entry.title;
    meta.className = "courseMeta";
    meta.textContent = `${courseState.entry.level} · ${courseState.entry.topic}`;
    description.className = "courseDescription";
    description.textContent = courseState.entry.description;
    stats.className = "courseStats";
    stats.textContent = courseState.error
      ? "Không thể mở bài học này."
      : `${courseState.summary.sentenceCount} câu · ${courseState.summary.taskCount} nhiệm vụ · ${courseState.progress}%`;
    progress.className = "courseProgress";
    progressBar.style.width = `${courseState.progress}%`;
    progress.append(progressBar);
    button.type = "button";
    button.disabled = Boolean(courseState.error);
    button.textContent = courseState.progress > 0 ? "Học tiếp" : "Bắt đầu";
    button.addEventListener("click", () => {
      selectCourse(courseState.entry.id);
    });

    card.append(title, meta, description, stats, progress, button);
    elements.courseList.append(card);
  });
}

async function refreshCoursePicker() {
  if (courseEntries.length === 0) {
    setCourseStatus("Chưa có bài học.");
    renderCourseCards([]);
    return;
  }

  setCourseStatus("Đang tải...");
  courseStates = await Promise.all(courseEntries.map(buildCourseState));
  renderCourseCards(courseStates);
  setCourseStatus("");
}

function showPicker() {
  speechPlayer.cancel();
  stopSpeechInput();
  setSpeechInputStatus("");
  activeCourse = null;
  flow = null;
  masterySession = null;
  tasks = [];
  practiceGroups = [];
  taskIndexById = new Map();
  elements.answer.value = "";
  elements.coursePicker.hidden = false;
  elements.lesson.hidden = true;
  elements.progress.hidden = true;
  elements.resetCourse.hidden = true;
  elements.changeCourse.hidden = true;
  elements.overviewContent.hidden = true;
  elements.guideContent.hidden = true;
  elements.exerciseContent.hidden = true;
  elements.finishState.hidden = true;
  refreshCoursePicker();
}

async function selectCourse(courseId) {
  const entry = courseEntries.find((courseEntry) => courseEntry.id === courseId);

  if (!entry) {
    setCourseStatus("Không tìm thấy bài học này.");
    return;
  }

  const courseState =
    courseStates.find((state) => state.entry.id === courseId) ??
    (await buildCourseState(entry));

  if (!courseState || courseState.error) {
    setCourseStatus("Không thể mở bài học này.");
    return;
  }

  activeCourse = courseState.course;
  tasks = activeCourse.tasks;
  practiceGroups = buildPracticeGroups(tasks, activeCourse.practicePolicy);
  taskIndexById = new Map(tasks.map((task, index) => [task.id, index]));
  masterySession = loadSession(activeCourse, practiceGroups);
  flow = createFlowForCurrentTask();

  elements.coursePicker.hidden = true;
  elements.lesson.hidden = false;
  elements.progress.hidden = false;
  elements.resetCourse.hidden = false;
  elements.changeCourse.hidden = false;
  showCurrentTask();
}

function renderGuideParts(parts) {
  elements.guideParts.replaceChildren();
  elements.guideParts.hidden = parts.length === 0;

  parts.forEach((part) => {
    const item = document.createElement("div");
    const term = document.createElement("strong");
    const meaning = document.createElement("small");

    item.className = `guidePart${part.isNew ? " isNew" : ""}`;
    term.textContent = part.term;
    meaning.textContent = part.meaning;
    item.append(term, meaning);
    elements.guideParts.append(item);
  });
}

function renderPronunciation(pronunciation) {
  elements.guideIpa.textContent = pronunciation.full;
  elements.guideIpa.hidden = !pronunciation.full;
  elements.guideNewWords.replaceChildren();

  const showNewWords =
    pronunciation.newWords.length > 0 &&
    !(
      pronunciation.newWords.length === 1 &&
      pronunciation.newWords[0].ipa === pronunciation.full
    );

  elements.guideNewWords.hidden = !showNewWords;

  if (!showNewWords) {
    return;
  }

  pronunciation.newWords.forEach(({ term, ipa }) => {
    const row = document.createElement("p");
    const word = document.createElement("strong");
    const phonetic = document.createElement("span");

    word.textContent = term;
    phonetic.textContent = ipa;
    row.append(word, phonetic);
    elements.guideNewWords.append(row);
  });
}

function renderGuideRole(guide) {
  const hasRole = Boolean(
    guide.whenNeeded || guide.roleQuestion || guide.roleMeaning
  );

  elements.guideRole.hidden = !hasRole;
  elements.guideWhenNeeded.replaceChildren();
  elements.guidePurpose.replaceChildren();
  elements.guideRoleMeaning.replaceChildren();

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
  const rows = Array.isArray(roleLine) ? roleLine : [];

  elements.guideRoleLine.replaceChildren();
  elements.guideRoleLine.hidden = rows.length === 0;

  if (rows.length === 0) {
    return;
  }

  rows.forEach((item) => {
    const row = document.createElement("p");
    const role = document.createElement("strong");
    const arrow = document.createElement("span");
    const term = document.createElement("span");

    role.textContent = item.roleQuestion ?? "";
    arrow.textContent = "->";
    term.textContent = item.english ?? "";
    row.append(role, arrow, term);
    elements.guideRoleLine.append(row);
  });
}

function renderGuideDifficultyNotes(notes = []) {
  const rows = Array.isArray(notes) ? notes : [];

  elements.guideDifficultyNotes.replaceChildren();
  elements.guideDifficultyNotes.hidden = rows.length === 0;

  if (rows.length === 0) {
    return;
  }

  const title = document.createElement("h3");
  title.textContent = "Điểm dễ sai";
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

function renderGuide(task) {
  elements.guideTerm.textContent = task.guide.term;
  elements.guideMeaning.textContent = task.guide.meaning;
  elements.guideExplanation.textContent = task.guide.explanation;
  // Role metadata such as task.guide.whenNeeded and task.guide.roleQuestion is guide-only.
  renderGuideRole(task.guide);
  renderGuideRoleLine(task.guide.roleLine ?? task.roleLine ?? []);
  renderGuideDifficultyNotes(task.guide.difficultyNotes);
  renderPronunciation(task.guide.pronunciation);
  renderGuideParts(task.guide.parts);
}

function renderOverviewMeaningMap(meaningMap = []) {
  const rows = Array.isArray(meaningMap) ? meaningMap : [];

  elements.overviewMeaningMap.replaceChildren();
  elements.overviewMeaningMap.hidden = rows.length === 0;

  if (rows.length === 0) {
    return;
  }

  const title = document.createElement("h3");
  const list = document.createElement("ol");

  title.textContent = "Bản đồ ý";
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

function renderOverview(task) {
  const overview = task.lessonOverview;

  elements.overviewTitle.textContent = overview.title;
  elements.overviewSummary.className = "overviewSummary";
  elements.overviewSummary.replaceChildren();

  overview.summary.forEach((summary) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = summary;
    elements.overviewSummary.append(paragraph);
  });

  renderOverviewMeaningMap(overview.meaningMap);
}

function renderFeedback() {
  const feedback = flow.feedback;
  elements.feedbackNotes.replaceChildren();

  if (!feedback) {
    elements.feedback.hidden = true;
    elements.feedback.className = "feedback";
    elements.feedbackMessage.textContent = "";
    elements.expectedAnswer.hidden = true;
    elements.expectedAnswer.textContent = "";
    return;
  }

  elements.feedback.hidden = false;
  elements.feedback.className = `feedback ${feedback.correct ? "correct" : "wrong"}`;
  elements.feedbackMessage.textContent = feedback.message;
  elements.expectedAnswer.hidden = feedback.correct;
  elements.expectedAnswer.textContent = feedback.correct ? "" : feedback.expected;

  feedback.notes.forEach((note) => {
    const noteElement = document.createElement("small");
    noteElement.textContent = note;
    elements.feedbackNotes.append(noteElement);
  });
}

function renderExercise(task) {
  const hasSubmitted = Boolean(flow.feedback);

  elements.prompt.textContent = task.prompt;
  elements.prompt.className =
    task.stage === "paragraph"
      ? "promptParagraph"
      : task.prompt.length > 220
        ? "promptLong"
        : task.prompt.length > 80
          ? "promptMedium"
          : "promptShort";

  elements.answer.disabled = hasSubmitted;
  elements.speakAnswer.hidden = !speechInput.isAvailable || hasSubmitted;
  elements.speakAnswer.disabled = hasSubmitted;
  if (!hasSubmitted && !speechInputListening) {
    elements.speakAnswer.textContent = "Nói thử";
  }
  elements.checkButton.disabled = Boolean(flow.feedback?.correct);
  elements.checkButton.textContent = flow.feedback
    ? flow.feedback.correct
      ? "Đang nghe..."
      : "Học lại"
    : "Kiểm tra";
  renderFeedback();
}

function render() {
  if (!activeCourse || !flow || !masterySession) {
    return;
  }

  const finished = isFinished();
  const progress = calculateMasteryProgress(masterySession, practiceGroups);

  elements.progressBar.style.width = `${progress}%`;
  elements.progress.setAttribute("aria-valuenow", String(progress));
  elements.progress.setAttribute("aria-label", `Đã hoàn thành ${progress}%`);
  elements.overviewContent.hidden = finished || flow.phase !== "overview";
  elements.guideContent.hidden = finished || flow.phase !== "guide";
  elements.exerciseContent.hidden = finished || flow.phase !== "exercise";
  elements.finishState.hidden = !finished;

  if (finished) {
    return;
  }

  const task = activeTask();

  if (flow.phase === "overview") {
    renderOverview(task);
  } else if (flow.phase === "guide") {
    renderGuide(task);
  } else {
    renderExercise(task);
  }
}

function playGuide() {
  if (flow?.phase === "guide" && !isFinished()) {
    const task = activeTask();
    stopSpeechInput();
    speechPlayer.speak(task.guide.speech, { audioSrc: audioSrcFor(task) });
  }
}

function showCurrentTask({ forceGuide = false, speak = true } = {}) {
  stopSpeechInput();
  setSpeechInputStatus("");
  flow = createFlowForCurrentTask({ forceGuide });
  elements.answer.value = "";
  render();

  if (isFinished()) {
    return;
  }

  if (flow.phase === "overview") {
    focusOverviewContinue();
  } else if (flow.phase === "guide") {
    focusGuideContinue();

    if (speak) {
      playGuide();
    }
  } else {
    focusAnswer();
  }
}

function handleOverviewContinue() {
  if (flow?.phase !== "overview" || isFinished()) {
    return;
  }

  const task = activeTask();
  masterySession = markOverviewSeen(masterySession, task.sentenceId);
  saveSession();
  flow = openGuide(flow);
  render();
  focusGuideContinue();
  playGuide();
}

function handleGuideContinue() {
  if (flow?.phase !== "guide" || isFinished()) {
    return;
  }

  speechPlayer.cancel();
  stopSpeechInput();
  setSpeechInputStatus("");
  flow = openExercise(flow);
  elements.answer.value = "";
  render();
  focusAnswer();
}

function handleCorrectSpeechEnd() {
  if (!flow?.feedback?.correct || !flow.waitingForSpeech) {
    return;
  }

  showCurrentTask();
}

function handleFailedRetry() {
  if (!flow?.feedback || flow.feedback.correct) {
    return;
  }

  speechPlayer.cancel();
  stopSpeechInput();
  setSpeechInputStatus("");

  const scheduledTaskId = currentTaskId();

  if (scheduledTaskId && scheduledTaskId !== activeTask().id) {
    showCurrentTask({ forceGuide: true });
    return;
  }

  flow = revisitFailedGuide(flow);
  elements.answer.value = "";
  render();
  focusGuideContinue();
  playGuide();
}

function handleCheck() {
  if (flow?.phase !== "exercise" || isFinished() || flow.feedback?.correct) {
    return;
  }

  stopSpeechInput();
  setSpeechInputStatus("");

  if (flow.feedback && !flow.feedback.correct) {
    handleFailedRetry();
    return;
  }

  const task = activeTask();
  const feedback = evaluateAnswer(task, elements.answer.value);
  const previousGroupIndex = masterySession.groupIndex;

  masterySession = recordMasteryAttempt(
    masterySession,
    practiceGroups,
    task.id,
    feedback.correct,
    feedback
  );
  saveSession();
  const completedGroup =
    feedback.correct && masterySession.groupIndex > previousGroupIndex;
  const resolvedFeedback =
    completedGroup && task.guide.successMessage
      ? { ...feedback, message: task.guide.successMessage }
      : feedback;
  flow = recordSubmission(flow, resolvedFeedback);
  render();

  speechPlayer.speak(task.answer, {
    audioSrc: audioSrcFor(task),
    onEnd: feedback.correct ? handleCorrectSpeechEnd : undefined,
  });

  if (!feedback.correct) {
    window.requestAnimationFrame(() => {
      elements.checkButton.focus();
    });
  }
}

function handleAnswerKeyDown(event) {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  handleCheck();
}

function handleGlobalKeyDown(event) {
  if (event.key !== "Enter" || event.shiftKey || !flow) {
    return;
  }

  if (flow.phase === "overview") {
    event.preventDefault();
    handleOverviewContinue();
    return;
  }

  if (flow.phase === "guide") {
    event.preventDefault();
    handleGuideContinue();
    return;
  }

  if (flow.feedback && !flow.feedback.correct) {
    event.preventDefault();
    handleFailedRetry();
  }
}

async function initializeApp() {
  elements.progress.hidden = true;
  elements.lesson.hidden = true;
  elements.resetCourse.hidden = true;
  elements.changeCourse.hidden = true;
  elements.speakAnswer.hidden = true;
  setSpeechInputStatus("");

  try {
    const index = await loadCourseIndex();
    courseEntries = index.courses;
    await refreshCoursePicker();
  } catch {
    setCourseStatus("Không tải được danh sách bài học.");
  }
}

elements.answer.addEventListener("keydown", handleAnswerKeyDown);
elements.changeCourse.addEventListener("click", showPicker);
elements.checkButton.addEventListener("click", handleCheck);
elements.continueGuide.addEventListener("click", handleGuideContinue);
elements.continueOverview.addEventListener("click", handleOverviewContinue);
elements.listenGuide.addEventListener("click", playGuide);
elements.resetCourse.addEventListener("click", resetCourse);
elements.speakAnswer.addEventListener("click", handleSpeakAnswer);
document.addEventListener("keydown", handleGlobalKeyDown);

initializeApp();
