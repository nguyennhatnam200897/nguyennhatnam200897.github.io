import { buildLessonTasks } from "./article.mjs";
import {
  createLessonFlow,
  openExercise,
  recordSubmission,
  revisitFailedGuide,
} from "./lesson-flow.mjs";
import { evaluateAnswer } from "./learning.mjs";
import {
  buildPracticeGroups,
  calculateMasteryProgress,
  createMasterySession,
  getCurrentTaskId,
  isTaskIntroduced,
  recordMasteryAttempt,
  restoreMasterySession,
  serializeMasterySession,
} from "./mastery.mjs";
import { createSpeechPlayer } from "./speech.mjs";

const storageKey = "article-mastery-session-v2";
const tasks = buildLessonTasks();
const practiceGroups = buildPracticeGroups(tasks);
const taskIndexById = new Map(tasks.map((task, index) => [task.id, index]));
const speechPlayer = createSpeechPlayer(window);

function audioSrcFor(task) {
  return `./assets/audio/${task.id}.wav`;
}

const elements = {
  answer: document.querySelector("#answer"),
  checkButton: document.querySelector("#check-answer"),
  continueGuide: document.querySelector("#continue-guide"),
  exerciseContent: document.querySelector("#exercise-content"),
  expectedAnswer: document.querySelector("#expected-answer"),
  feedback: document.querySelector("#feedback"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackNotes: document.querySelector("#feedback-notes"),
  finishState: document.querySelector("#finish-state"),
  guideContent: document.querySelector("#guide-content"),
  guideExplanation: document.querySelector("#guide-explanation"),
  guideMeaning: document.querySelector("#guide-meaning"),
  guideParts: document.querySelector("#guide-parts"),
  guideTerm: document.querySelector("#guide-term"),
  listenGuide: document.querySelector("#listen-guide"),
  progress: document.querySelector("#global-progress"),
  progressBar: document.querySelector("#progress-bar"),
  prompt: document.querySelector("#prompt"),
  resetCourse: document.querySelector("#reset-course"),
};

let masterySession = loadSession();
let flow = createFlowForCurrentTask();

function loadSession() {
  try {
    return restoreMasterySession(
      JSON.parse(localStorage.getItem(storageKey) ?? "null"),
      practiceGroups
    );
  } catch {
    return createMasterySession(practiceGroups);
  }
}

function saveSession() {
  localStorage.setItem(
    storageKey,
    JSON.stringify(serializeMasterySession(masterySession))
  );
}

function resetCourse() {
  const confirmed = window.confirm(
    "Xóa toàn bộ tiến độ của khóa học này và bắt đầu lại từ đầu?"
  );

  if (!confirmed) {
    return;
  }

  speechPlayer.cancel();
  localStorage.removeItem(storageKey);
  masterySession = createMasterySession(practiceGroups);
  showCurrentTask({ forceGuide: true });
}

function currentTaskId() {
  return getCurrentTaskId(masterySession, practiceGroups);
}

function taskIndexFromId(taskId) {
  return taskId ? taskIndexById.get(taskId) ?? tasks.length : tasks.length;
}

function createFlowForCurrentTask({ forceGuide = false } = {}) {
  const taskId = currentTaskId();
  const activeIndex = taskIndexFromId(taskId);
  const phase =
    forceGuide || (taskId && !isTaskIntroduced(masterySession, taskId))
      ? "guide"
      : "exercise";

  return createLessonFlow(activeIndex, { phase });
}

function isFinished() {
  return flow.activeIndex >= tasks.length || !currentTaskId();
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

function renderGuide(task) {
  elements.guideTerm.textContent = task.guide.term;
  elements.guideMeaning.textContent = task.guide.meaning;
  elements.guideExplanation.textContent = task.guide.explanation;
  renderGuideParts(task.guide.parts);
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
  elements.checkButton.disabled = Boolean(flow.feedback?.correct);
  elements.checkButton.textContent = flow.feedback
    ? flow.feedback.correct
      ? "Đang nghe..."
      : "Học lại"
    : "Kiểm tra";
  renderFeedback();
}

function render() {
  const finished = isFinished();
  const progress = calculateMasteryProgress(masterySession, practiceGroups);

  elements.progressBar.style.width = `${progress}%`;
  elements.progress.setAttribute("aria-valuenow", String(progress));
  elements.progress.setAttribute("aria-label", `Đã hoàn thành ${progress}%`);
  elements.guideContent.hidden = finished || flow.phase !== "guide";
  elements.exerciseContent.hidden = finished || flow.phase !== "exercise";
  elements.finishState.hidden = !finished;

  if (finished) {
    return;
  }

  const task = activeTask();

  if (flow.phase === "guide") {
    renderGuide(task);
  } else {
    renderExercise(task);
  }
}

function playGuide() {
  if (flow.phase === "guide" && !isFinished()) {
    const task = activeTask();
    speechPlayer.speak(task.guide.speech, { audioSrc: audioSrcFor(task) });
  }
}

function showCurrentTask({ forceGuide = false, speak = true } = {}) {
  flow = createFlowForCurrentTask({ forceGuide });
  elements.answer.value = "";
  render();

  if (isFinished()) {
    return;
  }

  if (flow.phase === "guide") {
    focusGuideContinue();

    if (speak) {
      playGuide();
    }
  } else {
    focusAnswer();
  }
}

function handleGuideContinue() {
  if (flow.phase !== "guide" || isFinished()) {
    return;
  }

  speechPlayer.cancel();
  flow = openExercise(flow);
  elements.answer.value = "";
  render();
  focusAnswer();
}

function handleCorrectSpeechEnd() {
  if (!flow.feedback?.correct || !flow.waitingForSpeech) {
    return;
  }

  showCurrentTask();
}

function handleFailedRetry() {
  if (!flow.feedback || flow.feedback.correct) {
    return;
  }

  speechPlayer.cancel();
  flow = revisitFailedGuide(flow);
  elements.answer.value = "";
  render();
  focusGuideContinue();
  playGuide();
}

function handleCheck() {
  if (flow.phase !== "exercise" || isFinished() || flow.feedback?.correct) {
    return;
  }

  if (flow.feedback && !flow.feedback.correct) {
    handleFailedRetry();
    return;
  }

  const task = activeTask();
  const feedback = evaluateAnswer(task, elements.answer.value);

  masterySession = recordMasteryAttempt(
    masterySession,
    practiceGroups,
    task.id,
    feedback.correct
  );
  saveSession();
  flow = recordSubmission(flow, feedback);
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
  if (event.key !== "Enter" || event.shiftKey) {
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

elements.answer.addEventListener("keydown", handleAnswerKeyDown);
elements.checkButton.addEventListener("click", handleCheck);
elements.continueGuide.addEventListener("click", handleGuideContinue);
elements.listenGuide.addEventListener("click", playGuide);
elements.resetCourse.addEventListener("click", resetCourse);
document.addEventListener("keydown", handleGlobalKeyDown);

showCurrentTask();
