import { normalizeTextAnswer } from "./learning.mjs";

const errorPrefix = "Invalid meaning chunk data:";

function fail(message) {
  throw new Error(`${errorPrefix} ${message}`);
}

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${field} must be a non-empty string.`);
  }
}

function assertStringArray(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(`${field} must be an array of strings.`);
  }
}

function normalizedTokens(value) {
  return normalizeTextAnswer(value).split(" ").filter(Boolean);
}

function defaultStage(answer) {
  return normalizedTokens(answer).length <= 1 ? "object" : "phrase";
}

function cloneParts(parts) {
  return Array.isArray(parts) ? parts.map((part) => ({ ...part })) : [];
}

function cloneRoleLine(roleLine = []) {
  return roleLine.map((item) => ({ ...item }));
}

function findTokenSpan(sourceTokens, targetTokens, startAt = 0) {
  if (targetTokens.length === 0 || targetTokens.length > sourceTokens.length) {
    return null;
  }

  for (let start = startAt; start <= sourceTokens.length - targetTokens.length; start += 1) {
    const matches = targetTokens.every(
      (token, index) => sourceTokens[start + index] === token
    );

    if (matches) {
      return { start, end: start + targetTokens.length };
    }
  }

  return null;
}

function relatedTokenForms(token) {
  const forms = new Set([token]);

  if (token.endsWith("ies") && token.length > 3) {
    forms.add(`${token.slice(0, -3)}y`);
  }

  if (token.endsWith("ing") && token.length > 4) {
    const withoutIng = token.slice(0, -3);
    forms.add(withoutIng);
    forms.add(`${withoutIng}e`);
  }

  if (token.endsWith("es") && token.length > 3) {
    forms.add(token.slice(0, -1));
    forms.add(token.slice(0, -2));
  }

  if (token.endsWith("s") && token.length > 2) {
    forms.add(token.slice(0, -1));
  }

  return forms;
}

function findRelatedTokenSpan(sourceTokens, targetTokens) {
  if (targetTokens.length !== 1) {
    return null;
  }

  const targetForms = relatedTokenForms(targetTokens[0]);
  const start = sourceTokens.findIndex(
    (token) =>
      [...relatedTokenForms(token)].some((form) => targetForms.has(form))
  );

  return start >= 0 ? { start, end: start + 1 } : null;
}

function finalStepFor(chunk) {
  return chunk.iPlusOneSteps.at(-1);
}

function buildStepGuide(chunk, step, isFinalStep) {
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
    ...(isFinalStep
      ? {
          whenNeeded: chunk.whenNeeded,
          roleQuestion: chunk.roleQuestion,
          roleMeaning: chunk.roleMeaning,
          successMessage: step.successMessage ?? chunk.successMessage,
        }
      : {}),
  };
}

function buildStepRollbackTargets(chunk, stepIndex) {
  if (stepIndex === 0) {
    return [];
  }

  const answerTokens = normalizedTokens(chunk.iPlusOneSteps[stepIndex].answer);

  for (let previousIndex = stepIndex - 1; previousIndex >= 0; previousIndex -= 1) {
    const previousStep = chunk.iPlusOneSteps[previousIndex];
    const previousTokens = normalizedTokens(previousStep.answer);
    const span =
      findTokenSpan(answerTokens, previousTokens) ??
      findRelatedTokenSpan(answerTokens, previousTokens);

    if (span) {
      return [{ taskId: previousStep.id, ...span }];
    }
  }

  return [];
}

function buildStepTask(lesson, chunk, step, stepIndex) {
  assertString(step.id, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].id`);
  assertString(step.prompt, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].prompt`);
  assertString(step.answer, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].answer`);

  if (step.stage !== undefined) {
    assertString(step.stage, `${lesson.id}.${chunk.id}.iPlusOneSteps[${stepIndex}].stage`);
  }

  const isFinalStep = stepIndex === chunk.iPlusOneSteps.length - 1;
  const rollbackTargets = buildStepRollbackTargets(chunk, stepIndex);

  return {
    id: step.id,
    sentenceId: lesson.sentenceId,
    stage: step.stage ?? defaultStage(step.answer),
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
    ...(rollbackTargets.length > 0 ? { rollbackTargets } : {}),
    guide: buildStepGuide(chunk, step, isFinalStep),
  };
}

function validateChunk(lesson, chunk, chunkIndex) {
  assertString(chunk.id, `${lesson.id}.chunks[${chunkIndex}].id`);
  assertString(chunk.english, `${lesson.id}.${chunk.id}.english`);
  assertString(chunk.vietnamese, `${lesson.id}.${chunk.id}.vietnamese`);
  assertString(chunk.chunkType, `${lesson.id}.${chunk.id}.chunkType`);
  assertString(chunk.roleQuestion, `${lesson.id}.${chunk.id}.roleQuestion`);
  assertString(chunk.whenNeeded, `${lesson.id}.${chunk.id}.whenNeeded`);
  assertString(chunk.roleMeaning, `${lesson.id}.${chunk.id}.roleMeaning`);

  if (!Array.isArray(chunk.iPlusOneSteps) || chunk.iPlusOneSteps.length === 0) {
    fail(`${lesson.id}.${chunk.id}.iPlusOneSteps must be a non-empty array.`);
  }
}

function buildChunkIndex(chunks, lesson) {
  const chunksById = new Map();

  chunks.forEach((chunk, chunkIndex) => {
    validateChunk(lesson, chunk, chunkIndex);

    if (chunksById.has(chunk.id)) {
      fail(`${lesson.id}.chunks contains duplicate id "${chunk.id}".`);
    }

    chunksById.set(chunk.id, chunk);
  });

  return chunksById;
}

function buildRollbackTargets(composition, chunksById, lesson) {
  const answerTokens = normalizedTokens(composition.answer);
  let cursor = 0;

  return composition.usesChunks.map((chunkId) => {
    const chunk = chunksById.get(chunkId);

    if (!chunk) {
      fail(`${lesson.id}.${composition.id}.usesChunks references unknown chunk "${chunkId}".`);
    }

    const span = findTokenSpan(answerTokens, normalizedTokens(chunk.english), cursor);

    if (!span) {
      fail(`${lesson.id}.${composition.id}.answer does not contain chunk "${chunkId}".`);
    }

    cursor = span.end;

    return {
      taskId: finalStepFor(chunk).id,
      start: span.start,
      end: span.end,
    };
  });
}

function buildRepairRules(composition, lesson, chunksById) {
  return (lesson.repairRules ?? [])
    .filter((rule) => Array.isArray(rule.appliesTo) && rule.appliesTo.includes(composition.id))
    .map((rule, ruleIndex) => {
      assertString(rule.chunkId, `${lesson.id}.repairRules[${ruleIndex}].chunkId`);
      assertString(rule.message, `${lesson.id}.repairRules[${ruleIndex}].message`);

      const chunk = chunksById.get(rule.chunkId);

      if (!chunk) {
        fail(`${lesson.id}.repairRules[${ruleIndex}] references unknown chunk "${rule.chunkId}".`);
      }

      return {
        taskId: finalStepFor(chunk).id,
        commonWrongAnswers: [...(rule.detect?.commonWrongAnswers ?? [])],
        message: rule.message,
      };
    });
}

function buildCompositionGuide(composition) {
  return {
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
}

function buildCompositionTask(lesson, composition, chunksById, compositionIndex) {
  assertString(composition.id, `${lesson.id}.compositionTasks[${compositionIndex}].id`);
  assertString(composition.prompt, `${lesson.id}.${composition.id}.prompt`);
  assertString(composition.answer, `${lesson.id}.${composition.id}.answer`);
  assertStringArray(composition.usesChunks, `${lesson.id}.${composition.id}.usesChunks`);

  if (composition.stage !== undefined) {
    assertString(composition.stage, `${lesson.id}.${composition.id}.stage`);
  }

  if (composition.masteryCredit !== undefined) {
    assertStringArray(composition.masteryCredit, `${lesson.id}.${composition.id}.masteryCredit`);
  }

  const roleLine = cloneRoleLine(composition.roleLine);

  return {
    id: composition.id,
    sentenceId: lesson.sentenceId,
    stage: composition.stage ?? "clause",
    prompt: composition.prompt,
    answer: composition.answer,
    audioId: composition.audioId ?? composition.id,
    roleLine,
    usesChunks: [...composition.usesChunks],
    masteryCredit: [...(composition.masteryCredit ?? composition.usesChunks)],
    rollbackTargets: buildRollbackTargets(composition, chunksById, lesson),
    repairRules: buildRepairRules(composition, lesson, chunksById),
    guide: buildCompositionGuide({ ...composition, roleLine }),
  };
}

function assertUniqueTaskIds(tasks, lesson) {
  const seenIds = new Set();

  tasks.forEach((task) => {
    if (seenIds.has(task.id)) {
      fail(`${lesson.id} contains duplicate task id "${task.id}".`);
    }

    seenIds.add(task.id);
  });
}

function buildLessonTasks(lesson, lessonIndex) {
  assertString(lesson.id, `meaningChunkLessons[${lessonIndex}].id`);
  assertString(lesson.sentenceId, `${lesson.id}.sentenceId`);

  if (!Array.isArray(lesson.chunks)) {
    fail(`${lesson.id}.chunks must be an array.`);
  }

  const chunksById = buildChunkIndex(lesson.chunks, lesson);
  const stepTasks = lesson.chunks.flatMap((chunk) =>
    chunk.iPlusOneSteps.map((step, stepIndex) =>
      buildStepTask(lesson, chunk, step, stepIndex)
    )
  );

  const compositionTasks = (lesson.compositionTasks ?? []).map(
    (composition, compositionIndex) =>
      buildCompositionTask(lesson, composition, chunksById, compositionIndex)
  );

  const tasks = [...stepTasks, ...compositionTasks];
  assertUniqueTaskIds(tasks, lesson);

  return tasks;
}

export function buildMeaningChunkTaskGroups(meaningChunkLessons = []) {
  const groups = meaningChunkLessons.map(buildLessonTasks);
  assertUniqueTaskIds(groups.flat(), { id: "meaningChunkLessons" });

  return groups;
}
