import { attachGuidance } from "./guidance.mjs";
import { normalizeTextAnswer } from "./learning.mjs";
import { buildMeaningChunkTaskGroups } from "./meaning-chunks.mjs";

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid course data: ${field} must be a non-empty string.`);
  }
}

function cloneObjectArray(value) {
  return value.map((item) =>
    item && typeof item === "object" ? { ...item } : item
  );
}

function cloneGuideMetadata(guide) {
  const metadata = {};

  ["whenNeeded", "roleQuestion", "roleMeaning", "successMessage"].forEach(
    (field) => {
      if (guide[field] !== undefined) {
        metadata[field] = guide[field];
      }
    }
  );

  if (Array.isArray(guide.roleLine)) {
    metadata.roleLine = cloneObjectArray(guide.roleLine);
  }

  return metadata;
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
    ...cloneGuideMetadata(guide),
  };
}

function cloneRepairRules(repairRules) {
  return repairRules.map((rule) => ({
    ...rule,
    ...(Array.isArray(rule.commonWrongAnswers)
      ? { commonWrongAnswers: [...rule.commonWrongAnswers] }
      : {}),
  }));
}

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
    ...(Array.isArray(task.rollbackTargets)
      ? {
          rollbackTargets: task.rollbackTargets.map((target) => ({
            taskId: target.taskId,
            start: Number(target.start),
            end: Number(target.end),
          })),
        }
      : {}),
    ...(task.meaningChunk && typeof task.meaningChunk === "object"
      ? { meaningChunk: { ...task.meaningChunk } }
      : {}),
    ...(Array.isArray(task.roleLine)
      ? { roleLine: cloneObjectArray(task.roleLine) }
      : {}),
    ...(Array.isArray(task.usesChunks)
      ? { usesChunks: [...task.usesChunks] }
      : {}),
    ...(Array.isArray(task.masteryCredit)
      ? { masteryCredit: [...task.masteryCredit] }
      : {}),
    ...(Array.isArray(task.repairRules)
      ? { repairRules: cloneRepairRules(task.repairRules) }
      : {}),
    ...(task.lessonOverview && typeof task.lessonOverview === "object"
      ? {
          lessonOverview: {
            title: task.lessonOverview.title,
            summary: [...(task.lessonOverview.summary ?? [])],
            graded: false,
          },
        }
      : {}),
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

function buildParagraphTasks(courseData, sentences, finalTaskIdBySentenceId) {
  if (courseData.paragraphTaskMode !== "cumulative") {
    return [];
  }

  return sentences.slice(1).map((_, index) => {
    const sentenceCount = index + 2;
    const selected = sentences.slice(0, sentenceCount);
    let start = 0;
    const rollbackTargets = selected.map((sentence) => {
      const end = start + answerTokens(sentence.english).length;
      const target = {
        taskId: finalTaskIdBySentenceId.get(sentence.id),
        start,
        end,
      };

      start = end;
      return target;
    });

    return {
      id: `G${sentenceCount}`,
      sentenceId: "PARAGRAPH",
      sentenceIds: selected.map((sentence) => sentence.id),
      stage: "paragraph",
      prompt: selected.map((sentence) => sentence.vietnamese).join(" "),
      answer: selected.map((sentence) => sentence.english).join(" "),
      audioId: `G${sentenceCount}`,
      rollbackTargets,
    };
  });
}

function normalizePracticeProfile(profile) {
  if (!profile) {
    return undefined;
  }

  if (
    !["gentle-i-plus-one", "meaning-chunk-i-plus-one"].includes(profile)
  ) {
    throw new Error(`Invalid course data: unknown practiceProfile "${profile}".`);
  }

  return profile;
}

function buildPracticePolicy(practiceProfile) {
  if (practiceProfile === "meaning-chunk-i-plus-one") {
    return {
      mode: "frontier-rollback",
      meaningChunkMastery: true,
      minCorrect: 2,
      requiresInterleavedCorrect: true,
      repairCorrectCount: 1,
    };
  }

  if (practiceProfile === "gentle-i-plus-one") {
    return {
      mode: "frontier-rollback",
      minCorrect: 2,
      repairCorrectCount: 1,
    };
  }

  return undefined;
}

function sentenceIdForTaskGroup(group) {
  return group.find((task) => typeof task?.sentenceId === "string")?.sentenceId;
}

function taskGroupsBySentenceId(taskGroups) {
  const groupsBySentenceId = new Map();

  taskGroups.forEach((group) => {
    const sentenceId = sentenceIdForTaskGroup(group);

    if (sentenceId && !groupsBySentenceId.has(sentenceId)) {
      groupsBySentenceId.set(sentenceId, group);
    }
  });

  return groupsBySentenceId;
}

function validateMeaningChunkLessonSentenceIds(courseData) {
  const sentenceIds = new Set((courseData.sentences ?? []).map((sentence) => sentence.id));
  const seenLessonSentenceIds = new Set();

  courseData.meaningChunkLessons.forEach((lesson, index) => {
    assertString(lesson?.sentenceId, `meaningChunkLessons[${index}].sentenceId`);

    if (!sentenceIds.has(lesson.sentenceId)) {
      throw new Error(
        `Invalid course data: meaningChunkLessons[${index}].sentenceId "${lesson.sentenceId}" does not match a course sentence.`
      );
    }

    if (seenLessonSentenceIds.has(lesson.sentenceId)) {
      throw new Error(
        `Invalid course data: meaningChunkLessons[${index}].sentenceId "${lesson.sentenceId}" duplicates an earlier meaning chunk lesson.`
      );
    }

    seenLessonSentenceIds.add(lesson.sentenceId);
  });

  if (courseData.meaningChunkProfile?.lessonCoverage === "complete") {
    const missingSentenceIds = [...sentenceIds].filter(
      (sentenceId) => !seenLessonSentenceIds.has(sentenceId)
    );

    if (missingSentenceIds.length > 0) {
      throw new Error(
        `Invalid course data: lessonCoverage "complete" requires lessons for: ${missingSentenceIds.join(", ")}.`
      );
    }
  }
}

function buildRawTaskGroups(courseData, practiceProfile) {
  const legacyGroups = courseData.taskGroups ?? [];

  if (
    practiceProfile !== "meaning-chunk-i-plus-one" ||
    !Array.isArray(courseData.meaningChunkLessons) ||
    courseData.meaningChunkLessons.length === 0
  ) {
    return legacyGroups;
  }

  validateMeaningChunkLessonSentenceIds(courseData);

  const meaningGroups = buildMeaningChunkTaskGroups(courseData.meaningChunkLessons);
  const meaningGroupsBySentenceId = new Map();
  const legacyGroupsBySentenceId = taskGroupsBySentenceId(legacyGroups);

  courseData.meaningChunkLessons.forEach((lesson, index) => {
    if (typeof lesson?.sentenceId === "string" && lesson.sentenceId.trim() !== "") {
      meaningGroupsBySentenceId.set(lesson.sentenceId, meaningGroups[index]);
    }
  });

  const orderedGroups = (courseData.sentences ?? [])
    .map(
      (sentence) =>
        meaningGroupsBySentenceId.get(sentence.id) ??
        legacyGroupsBySentenceId.get(sentence.id)
    )
    .filter(Boolean);

  return orderedGroups.length > 0 ? orderedGroups : meaningGroups;
}

function countWords(answer) {
  return answer.trim().split(/\s+/).filter(Boolean).length;
}

function answerTokens(answer) {
  return normalizeTextAnswer(answer).split(" ").filter(Boolean);
}

function findTokenSpan(sourceTokens, targetTokens) {
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

function shouldCreateBridgeTask(task, previousTask) {
  if (!previousTask || previousTask.sentenceId !== task.sentenceId) {
    return false;
  }

  const wordGrowth = countWords(task.answer) - countWords(previousTask.answer);

  return wordGrowth >= 3 || ["sentence", "paragraph"].includes(task.stage);
}

function answerFrame(answer) {
  const words = answer.replace(/[.,!?;:]/g, "").trim().split(/\s+/).filter(Boolean);

  if (words.length <= 5) {
    return words.join(" / ");
  }

  const middle = words.slice(1, -1);
  const step = Math.max(1, Math.ceil(middle.length / 3));
  const anchors = middle.filter((_, index) => index % step === 0).slice(0, 3);

  return [words[0], ...anchors, words.at(-1)].join(" / ");
}

function createBridgeTask(task) {
  return {
    ...task,
    id: `${task.id}-BR`,
    prompt: `${task.prompt} [frame: ${answerFrame(task.answer)}]`,
    isBridge: true,
    bridgeForTaskId: task.id,
    supportLevel: "frame",
    guide: {
      term: task.answer,
      meaning: task.prompt,
      explanation:
        "Buoc cau noi: dung khung goi y de ghep cau truoc, roi lam lai cung y khong co khung.",
      parts: [],
      speech: task.guide?.speech ?? task.answer,
    },
  };
}

function insertBridgeTasks(tasks, practiceProfile) {
  if (practiceProfile !== "gentle-i-plus-one") {
    return tasks;
  }

  const withBridges = [];

  tasks.forEach((task) => {
    const previousTask = withBridges.findLast((item) => !item.isBridge);

    if (shouldCreateBridgeTask(task, previousTask)) {
      withBridges.push(createBridgeTask(task));
    }

    withBridges.push(task);
  });

  return withBridges;
}

function buildRollbackTargets(task, previousTasks) {
  const sourceTokens = answerTokens(task.answer);

  return previousTasks
    .map((previousTask) => {
      const span = findTokenSpan(sourceTokens, answerTokens(previousTask.answer));

      if (!span) {
        return null;
      }

      return {
        taskId: previousTask.id,
        start: span.start,
        end: span.end,
      };
    })
    .filter(Boolean);
}

function attachRollbackTargets(tasks, practiceProfile) {
  if (practiceProfile !== "gentle-i-plus-one") {
    return tasks;
  }

  const previousTasks = [];

  return tasks.map((task) => {
    const rollbackTargets = buildRollbackTargets(task, previousTasks);
    const taskWithTargets =
      rollbackTargets.length > 0 ? { ...task, rollbackTargets } : task;

    if (!task.isBridge) {
      previousTasks.push(task);
    }

    return taskWithTargets;
  });
}

function attachGuidancePreservingMetadata(tasks) {
  return attachGuidance(tasks).map((task, index) => {
    const guideMetadata = tasks[index]?.guide
      ? cloneGuideMetadata(tasks[index].guide)
      : {};

    if (Object.keys(guideMetadata).length === 0) {
      return task;
    }

    return {
      ...task,
      guide: {
        ...task.guide,
        ...guideMetadata,
      },
    };
  });
}

function buildFinalTaskIdBySentenceId(sentenceTaskGroups) {
  return new Map(
    sentenceTaskGroups
      .map((group) => {
        const finalTask =
          group.findLast((task) => task.stage === "sentence") ?? group.at(-1);

        return finalTask ? [finalTask.sentenceId, finalTask.id] : null;
      })
      .filter(Boolean)
  );
}

export function buildLessonCourse(courseData) {
  ["id", "title", "level", "topic"].forEach((field) => {
    assertString(courseData[field], field);
  });

  const practiceProfile = normalizePracticeProfile(courseData.practiceProfile);
  const practicePolicy = buildPracticePolicy(practiceProfile);
  const sentences = (courseData.sentences ?? []).map(normalizeSentence);
  const rawTaskGroups = buildRawTaskGroups(courseData, practiceProfile);
  const sentenceTaskGroups = rawTaskGroups.map(
    (group, groupIndex) =>
      insertBridgeTasks(
        group.map((task, taskIndex) =>
          normalizeTask(task, `taskGroups[${groupIndex}][${taskIndex}]`)
        ),
        practiceProfile
      )
  );
  const sentenceTaskGroupsWithRollback = sentenceTaskGroups.map((group) =>
    attachRollbackTargets(group, practiceProfile)
  );
  const finalTaskIdBySentenceId = buildFinalTaskIdBySentenceId(
    sentenceTaskGroupsWithRollback
  );
  const paragraphTasks = attachRollbackTargets(
    insertBridgeTasks(
      buildParagraphTasks(courseData, sentences, finalTaskIdBySentenceId),
      practiceProfile
    ),
    practiceProfile
  );
  const tasks = attachGuidancePreservingMetadata([
    ...sentenceTaskGroupsWithRollback.flat(),
    ...paragraphTasks,
  ]);

  return {
    id: courseData.id,
    title: courseData.title,
    level: courseData.level,
    topic: courseData.topic,
    description: courseData.description ?? "",
    sessionVersion: Number(courseData.sessionVersion) || 1,
    audioBasePath: courseData.audioBasePath ?? "./assets/audio",
    audioExtension: courseData.audioExtension ?? "wav",
    ...(practiceProfile ? { practiceProfile, practicePolicy } : {}),
    article: {
      title: courseData.title,
      level: courseData.level,
      topic: courseData.topic,
      sentences,
    },
    sentences,
    sentenceTaskGroups: sentenceTaskGroupsWithRollback,
    tasks,
    summary: {
      sentenceCount: sentences.length,
      taskCount: tasks.length,
    },
  };
}
