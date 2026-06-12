export const MASTERY_RULE = {
  minCorrect: 2,
  minStreak: 1,
  requiresInterleavedCorrect: true,
};

const repairRulePunctuationPattern = /[.,!?;:"\u201c\u201d\u2018\u2019'()[\]{}]/g;

function group(id, taskIds, options = {}) {
  return { id, taskIds, ...options };
}

function unique(values) {
  return [...new Set(values)];
}

function groupOptionsFor(practicePolicy = {}) {
  const minCorrectBeforeNextIntroduction = Number(
    practicePolicy.minCorrectBeforeNextIntroduction
  );

  if (minCorrectBeforeNextIntroduction > 0) {
    return { minCorrectBeforeNextIntroduction };
  }

  return {};
}

function normalizeRepairRuleText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2019\u2018]/g, "'")
    .replace(repairRulePunctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeRepairRuleText(value) {
  return normalizeRepairRuleText(value).split(" ").filter(Boolean);
}

function matchingTokenSpans(tokens, targetTokens) {
  if (targetTokens.length === 0 || targetTokens.length > tokens.length) {
    return [];
  }

  const spans = [];
  const lastStart = tokens.length - targetTokens.length;

  for (let start = 0; start <= lastStart; start += 1) {
    const matches = targetTokens.every(
      (targetToken, offset) => tokens[start + offset] === targetToken
    );

    if (matches) {
      spans.push({ start, end: start + targetTokens.length });
    }
  }

  return spans;
}

function isIssueIndexNearSpan(issueIndex, span) {
  return (
    issueIndex >= span.start - 1 &&
    issueIndex <= span.end
  );
}

function masteryRuleFor(groupToCheck = {}, taskId) {
  const taskRule = taskId
    ? groupToCheck.masteryRulesByTaskId?.[taskId]
    : undefined;

  return {
    minCorrect:
      Number(taskRule?.minCorrect ?? groupToCheck.minCorrect) ||
      MASTERY_RULE.minCorrect,
    minStreak:
      Number(taskRule?.minStreak ?? groupToCheck.minStreak) ||
      MASTERY_RULE.minStreak,
    requiresInterleavedCorrect:
      taskRule?.requiresInterleavedCorrect ??
      groupToCheck.requiresInterleavedCorrect ??
      MASTERY_RULE.requiresInterleavedCorrect,
  };
}

function buildRollingGroups(tasks, practicePolicy) {
  const groups = [];
  const recentBySentence = new Map();
  const options = groupOptionsFor(practicePolicy);

  tasks.forEach((task) => {
    const recent = recentBySentence.get(task.sentenceId) ?? [];
    recent.push(task.id);

    if (recent.length >= 2) {
      groups.push(group(`rolling-${task.id}`, unique(recent.slice(-4)), options));
    }

    recentBySentence.set(task.sentenceId, recent);
  });

  return groups;
}

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
              [task.id]: task.repairRules.map((rule) => ({
                ...rule,
                commonWrongAnswers: Array.isArray(rule.commonWrongAnswers)
                  ? [...rule.commonWrongAnswers]
                  : [],
              })),
            },
          }
        : {}),
    })
  );
}

function taskRepairOptions(tasks) {
  const rollbackTargetsByTaskId = {};
  const repairRulesByTaskId = {};

  tasks.forEach((task) => {
    if (Array.isArray(task.rollbackTargets) && task.rollbackTargets.length > 0) {
      rollbackTargetsByTaskId[task.id] = task.rollbackTargets.map((target) => ({
        ...target,
      }));
    }

    if (Array.isArray(task.repairRules) && task.repairRules.length > 0) {
      repairRulesByTaskId[task.id] = task.repairRules.map((rule) => ({
        ...rule,
        commonWrongAnswers: Array.isArray(rule.commonWrongAnswers)
          ? [...rule.commonWrongAnswers]
          : [],
      }));
    }
  });

  return {
    ...(Object.keys(rollbackTargetsByTaskId).length > 0
      ? { rollbackTargetsByTaskId }
      : {}),
    ...(Object.keys(repairRulesByTaskId).length > 0
      ? { repairRulesByTaskId }
      : {}),
  };
}

function taskMasteryRule({
  minCorrect,
  requiresInterleavedCorrect,
}) {
  return {
    minCorrect,
    minStreak: 1,
    requiresInterleavedCorrect,
  };
}

function meaningChunkGroup(id, tasks, rules, practicePolicy, options = {}) {
  return group(id, tasks.map((task) => task.id), {
    repairCorrectCount: Number(practicePolicy.repairCorrectCount) || 1,
    masteryRulesByTaskId: Object.fromEntries(
      tasks.map((task) => [task.id, rules[task.id]])
    ),
    ...taskRepairOptions(tasks),
    ...options,
  });
}

function buildMeaningChunkSentenceGroups(tasks, practicePolicy) {
  const groups = [];
  const chunkSteps = new Map();
  const compositions = [];
  const scheduledTaskIds = new Set();
  const preparedChunkIds = new Set();

  tasks.forEach((task) => {
    const chunkId = task.meaningChunk?.id;

    if (chunkId) {
      const steps = chunkSteps.get(chunkId) ?? [];
      steps.push(task);
      chunkSteps.set(chunkId, steps);
    }

    if (Array.isArray(task.usesChunks)) {
      compositions.push(task);
    }
  });

  const appendInternalSteps = (chunkId) => {
    const steps = chunkSteps.get(chunkId) ?? [];

    steps
      .filter((task) => !task.meaningChunk?.isFinalStep)
      .forEach((task) => {
        if (scheduledTaskIds.has(task.id)) {
          return;
        }

        groups.push(
          meaningChunkGroup(
            `meaning-step-${task.id}`,
            [task],
            {
              [task.id]: taskMasteryRule({
                minCorrect: 1,
                requiresInterleavedCorrect: false,
              }),
            },
            practicePolicy
          )
        );
        scheduledTaskIds.add(task.id);
      });
  };

  const finalStepForChunk = (chunkId) =>
    (chunkSteps.get(chunkId) ?? []).find(
      (task) => task.meaningChunk?.isFinalStep
    );

  const nextUnpreparedChunkId = (compositionIndex, excludedChunkIds) => {
    for (
      let index = compositionIndex + 1;
      index < compositions.length;
      index += 1
    ) {
      const candidate = compositions[index].usesChunks.find(
        (chunkId) =>
          !preparedChunkIds.has(chunkId) &&
          !excludedChunkIds.has(chunkId) &&
          finalStepForChunk(chunkId)
      );

      if (candidate) {
        return candidate;
      }
    }

    return null;
  };

  compositions.forEach((composition, compositionIndex) => {
    const newChunkIds = composition.usesChunks.filter(
      (chunkId) => !preparedChunkIds.has(chunkId)
    );
    const practiceChunkIds = [...newChunkIds];

    if (practiceChunkIds.length === 1) {
      const supportChunkId = nextUnpreparedChunkId(
        compositionIndex,
        new Set(practiceChunkIds)
      );

      if (supportChunkId) {
        practiceChunkIds.push(supportChunkId);
      }
    }

    practiceChunkIds.forEach((chunkId) => {
      appendInternalSteps(chunkId);
    });

    const finalSteps = practiceChunkIds
      .map(finalStepForChunk)
      .filter(
        (task) => task && !scheduledTaskIds.has(task.id)
      );

    if (finalSteps.length === 1) {
      throw new Error(
        `Invalid meaning chunk schedule: cannot interleave meaning chunk ` +
          `"${finalSteps[0].meaningChunk.id}" before composition ` +
          `"${composition.id}".`
      );
    }

    if (finalSteps.length > 0) {
      groups.push(
        meaningChunkGroup(
          `meaning-chunks-${composition.id}`,
          finalSteps,
          Object.fromEntries(
            finalSteps.map((task) => [
              task.id,
              taskMasteryRule({
                minCorrect: Number(practicePolicy.minCorrect) || 2,
                requiresInterleavedCorrect: true,
              }),
            ])
          ),
          practicePolicy,
          { minCorrectBeforeNextIntroduction: 1 }
        )
      );
      finalSteps.forEach((task) => {
        scheduledTaskIds.add(task.id);
        preparedChunkIds.add(task.meaningChunk.id);
      });
    }

    groups.push(
      meaningChunkGroup(
        `meaning-compose-${composition.id}`,
        [composition],
        {
          [composition.id]: taskMasteryRule({
            minCorrect: 1,
            requiresInterleavedCorrect: false,
          }),
        },
        practicePolicy
      )
    );
    scheduledTaskIds.add(composition.id);
  });

  tasks
    .filter((task) => !scheduledTaskIds.has(task.id))
    .forEach((task) => {
      groups.push(
        meaningChunkGroup(
          `meaning-fallback-${task.id}`,
          [task],
          {
            [task.id]: taskMasteryRule({
              minCorrect: task.meaningChunk?.isFinalStep
                ? Number(practicePolicy.minCorrect) || 2
                : 1,
              requiresInterleavedCorrect: false,
            }),
          },
          practicePolicy
        )
      );
    });

  return groups;
}

function buildMeaningChunkGroups(tasks, practicePolicy) {
  const groups = [];
  const tasksBySentenceId = new Map();

  tasks.forEach((task) => {
    const sentenceTasks = tasksBySentenceId.get(task.sentenceId) ?? [];
    sentenceTasks.push(task);
    tasksBySentenceId.set(task.sentenceId, sentenceTasks);
  });

  tasksBySentenceId.forEach((sentenceTasks) => {
    const hasMeaningChunkData = sentenceTasks.some(
      (task) => task.meaningChunk || Array.isArray(task.usesChunks)
    );

    groups.push(
      ...(hasMeaningChunkData
        ? buildMeaningChunkSentenceGroups(sentenceTasks, practicePolicy)
        : buildFrontierGroups(sentenceTasks, practicePolicy))
    );
  });

  return groups;
}

export function buildPracticeGroups(tasks, practicePolicy) {
  if (practicePolicy?.meaningChunkMastery) {
    return buildMeaningChunkGroups(tasks, practicePolicy);
  }

  if (practicePolicy?.mode === "frontier-rollback") {
    return buildFrontierGroups(tasks, practicePolicy);
  }

  return buildRollingGroups(tasks, practicePolicy);
}

function emptyStats() {
  return {
    correctCount: 0,
    hasInterleavedCorrect: false,
    streak: 0,
    wrongCount: 0,
  };
}

function normalizeStats(stats = {}) {
  return {
    correctCount: Number(stats.correctCount) || 0,
    hasInterleavedCorrect: Boolean(stats.hasInterleavedCorrect),
    streak: Number(stats.streak) || 0,
    wrongCount: Number(stats.wrongCount) || 0,
  };
}

function isStatsMastered(stats, rule = MASTERY_RULE) {
  return (
    stats.correctCount >= rule.minCorrect &&
    stats.streak >= rule.minStreak &&
    (!rule.requiresInterleavedCorrect || stats.hasInterleavedCorrect)
  );
}

export function createMasterySession() {
  return {
    cycleCursor: 0,
    groupIndex: 0,
    introducedIds: [],
    lastAnsweredTaskId: null,
    repair: null,
    stats: {},
  };
}

export function serializeMasterySession(session) {
  return {
    cycleCursor: session.cycleCursor,
    groupIndex: session.groupIndex,
    introducedIds: [...session.introducedIds],
    lastAnsweredTaskId: session.lastAnsweredTaskId,
    repair: session.repair ? { ...session.repair } : null,
    stats: Object.fromEntries(
      Object.entries(session.stats).map(([taskId, stats]) => [
        taskId,
        normalizeStats(stats),
      ])
    ),
  };
}

export function restoreMasterySession(value, groups) {
  if (!value || typeof value !== "object") {
    return createMasterySession(groups);
  }

  const groupIndex = Math.min(
    Math.max(Number(value.groupIndex) || 0, 0),
    groups.length
  );

  return {
    cycleCursor: Math.max(Number(value.cycleCursor) || 0, 0),
    groupIndex,
    introducedIds: Array.isArray(value.introducedIds)
      ? value.introducedIds.filter((taskId) => typeof taskId === "string")
      : [],
    lastAnsweredTaskId:
      typeof value.lastAnsweredTaskId === "string" ? value.lastAnsweredTaskId : null,
    repair:
      value.repair &&
      typeof value.repair === "object" &&
      typeof value.repair.taskId === "string"
        ? {
            taskId: value.repair.taskId,
            returnGroupIndex: Math.min(
              Math.max(Number(value.repair.returnGroupIndex) || groupIndex, 0),
              groups.length
            ),
            returnTaskId:
              typeof value.repair.returnTaskId === "string"
                ? value.repair.returnTaskId
                : null,
            correctCountRequired:
              Number(value.repair.correctCountRequired) || 1,
          }
        : null,
    stats: Object.fromEntries(
      Object.entries(value.stats ?? {}).map(([taskId, stats]) => [
        taskId,
        normalizeStats(stats),
      ])
    ),
  };
}

export function getCurrentGroup(session, groups) {
  return groups[session.groupIndex] ?? null;
}

export function isTaskIntroduced(session, taskId) {
  return session.introducedIds.includes(taskId);
}

function isTaskMastered(session, taskId, groupToCheck) {
  return isStatsMastered(
    normalizeStats(session.stats[taskId]),
    masteryRuleFor(groupToCheck, taskId)
  );
}

export function getCurrentTaskId(session, groups) {
  if (session.repair?.taskId) {
    return session.repair.taskId;
  }

  const currentGroup = getCurrentGroup(session, groups);

  if (!currentGroup) {
    return null;
  }

  const unintroducedTask = currentGroup.taskIds.find(
    (taskId) => !isTaskIntroduced(session, taskId)
  );

  if (unintroducedTask) {
    const introducedTaskIds = currentGroup.taskIds.filter((taskId) =>
      isTaskIntroduced(session, taskId)
    );
    const latestIntroducedTaskId = introducedTaskIds.at(-1);
    const minCorrectBeforeNext =
      currentGroup.minCorrectBeforeNextIntroduction ?? 0;

    if (
      latestIntroducedTaskId &&
      normalizeStats(session.stats[latestIntroducedTaskId]).correctCount <
        minCorrectBeforeNext
    ) {
      return latestIntroducedTaskId;
    }

    return unintroducedTask;
  }

  const pending = currentGroup.taskIds.filter(
    (taskId) => !isTaskMastered(session, taskId, currentGroup)
  );

  if (pending.length === 0) {
    return null;
  }

  const rotated = [...pending.slice(session.cycleCursor), ...pending.slice(0, session.cycleCursor)];
  const notLast = rotated.find((taskId) => taskId !== session.lastAnsweredTaskId);

  return notLast ?? rotated[0];
}

function markIntroduced(session, taskId) {
  if (isTaskIntroduced(session, taskId)) {
    return session.introducedIds;
  }

  return [...session.introducedIds, taskId];
}

function updateStats(stats, taskId, correct, lastAnsweredTaskId) {
  const current = normalizeStats(stats[taskId]);

  if (!correct) {
    return {
      ...stats,
      [taskId]: {
        ...emptyStats(),
        wrongCount: current.wrongCount + 1,
      },
    };
  }

  return {
    ...stats,
    [taskId]: {
      ...current,
      correctCount: current.correctCount + 1,
      hasInterleavedCorrect:
        current.hasInterleavedCorrect ||
        Boolean(lastAnsweredTaskId && lastAnsweredTaskId !== taskId),
      streak: current.streak + 1,
    },
  };
}

function isGroupMastered(session, groupToCheck) {
  return groupToCheck.taskIds.every((taskId) =>
    isTaskMastered(session, taskId, groupToCheck)
  );
}

function repairRuleTaskIdFor(groupToCheck, taskId, feedback) {
  const actualTokens = tokenizeRepairRuleText(feedback?.normalizedActual);
  const issueIndex = Number(feedback?.issue?.index);
  const repairRules = groupToCheck.repairRulesByTaskId?.[taskId] ?? [];

  if (
    actualTokens.length === 0 ||
    !Number.isInteger(issueIndex) ||
    issueIndex < 0 ||
    repairRules.length === 0
  ) {
    return null;
  }

  const matchingRule = repairRules.find((rule) =>
    (Array.isArray(rule.commonWrongAnswers) ? rule.commonWrongAnswers : []).some(
      (answer) => {
        const answerTokens = tokenizeRepairRuleText(answer);

        return matchingTokenSpans(actualTokens, answerTokens).some((span) =>
          isIssueIndexNearSpan(issueIndex, span)
        );
      }
    )
  );

  return matchingRule?.taskId ?? null;
}

function rollbackTaskIdFor(groupToCheck, taskId, feedback) {
  const repairRuleTaskId = repairRuleTaskIdFor(groupToCheck, taskId, feedback);

  if (repairRuleTaskId) {
    return repairRuleTaskId;
  }

  const issueIndex = Number(feedback?.issue?.index);
  const rollbackTargets = groupToCheck.rollbackTargetsByTaskId?.[taskId] ?? [];

  if (!Number.isInteger(issueIndex) || rollbackTargets.length === 0) {
    return null;
  }

  const matches = rollbackTargets
    .filter((target) => issueIndex >= target.start && issueIndex < target.end)
    .sort((a, b) => {
      const aLength = a.end - a.start;
      const bLength = b.end - b.start;

      return aLength - bLength || b.start - a.start;
    });

  return matches[0]?.taskId ?? null;
}

function recordRepairAttempt(session, taskId, correct) {
  const stats = updateStats(
    session.stats,
    taskId,
    correct,
    session.lastAnsweredTaskId
  );
  const nextSession = {
    ...session,
    introducedIds: markIntroduced(session, taskId),
    lastAnsweredTaskId: taskId,
    stats,
  };

  if (
    !correct ||
    normalizeStats(stats[taskId]).correctCount <
      (session.repair.correctCountRequired ?? 1)
  ) {
    return nextSession;
  }

  return {
    ...nextSession,
    cycleCursor: 0,
    groupIndex: session.repair.returnGroupIndex,
    repair: null,
  };
}

export function recordMasteryAttempt(session, groups, taskId, correct, feedback) {
  if (session.repair?.taskId === taskId) {
    return recordRepairAttempt(session, taskId, correct);
  }

  const currentGroup = getCurrentGroup(session, groups);

  if (!currentGroup || !currentGroup.taskIds.includes(taskId)) {
    return session;
  }

  const stats = updateStats(
    session.stats,
    taskId,
    correct,
    session.lastAnsweredTaskId
  );
  const nextSession = {
    ...session,
    cycleCursor: (session.cycleCursor + 1) % currentGroup.taskIds.length,
    introducedIds: markIntroduced(session, taskId),
    lastAnsweredTaskId: taskId,
    stats,
  };

  if (!correct) {
    const rollbackTaskId = rollbackTaskIdFor(currentGroup, taskId, feedback);

    return {
      ...nextSession,
      repair:
        rollbackTaskId && rollbackTaskId !== taskId
          ? {
              taskId: rollbackTaskId,
              returnGroupIndex: session.groupIndex,
              returnTaskId: taskId,
              correctCountRequired: currentGroup.repairCorrectCount ?? 1,
            }
          : null,
    };
  }

  if (!isGroupMastered(nextSession, currentGroup)) {
    return nextSession;
  }

  return {
    ...nextSession,
    cycleCursor: 0,
    groupIndex: Math.min(nextSession.groupIndex + 1, groups.length),
    stats: {},
  };
}

export function calculateMasteryProgress(session, groups) {
  if (groups.length === 0 || session.groupIndex >= groups.length) {
    return 100;
  }

  const currentGroup = getCurrentGroup(session, groups);
  const groupProgress =
    currentGroup.taskIds.reduce((total, taskId) => {
      const rule = masteryRuleFor(currentGroup, taskId);
      const stats = normalizeStats(session.stats[taskId]);
      const correctProgress = Math.min(
        stats.correctCount / rule.minCorrect,
        1
      );
      const streakProgress = Math.min(stats.streak / rule.minStreak, 1);

      if (!rule.requiresInterleavedCorrect) {
        return total + (correctProgress + streakProgress) / 2;
      }

      const interleavedProgress = stats.hasInterleavedCorrect ? 1 : 0;

      return total + (correctProgress + streakProgress + interleavedProgress) / 3;
    }, 0) / currentGroup.taskIds.length;

  const rawProgress = ((session.groupIndex + groupProgress) / groups.length) * 100;

  return rawProgress > 0 ? Math.max(1, Math.round(rawProgress)) : 0;
}
