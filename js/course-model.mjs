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
