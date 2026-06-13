export function createLessonFlow(activeIndex = 0, options = {}) {
  return {
    activeIndex,
    phase: options.phase ?? "guide",
    feedback: null,
    waitingForSpeech: false,
  };
}

export function openExercise(flow) {
  return {
    ...flow,
    phase: "exercise",
    feedback: null,
    waitingForSpeech: false,
  };
}

export function openGuide(flow) {
  return {
    ...flow,
    phase: "guide",
    feedback: null,
    waitingForSpeech: false,
  };
}

export function recordSubmission(flow, feedback) {
  return {
    ...flow,
    phase: "exercise",
    feedback,
    waitingForSpeech: Boolean(feedback.correct),
  };
}

export function finishCorrectSpeech(flow, nextIndex) {
  if (!flow.feedback?.correct || !flow.waitingForSpeech) {
    return flow;
  }

  return createLessonFlow(nextIndex);
}

export function revisitFailedGuide(flow) {
  if (!flow.feedback || flow.feedback.correct) {
    return flow;
  }

  return createLessonFlow(flow.activeIndex);
}
