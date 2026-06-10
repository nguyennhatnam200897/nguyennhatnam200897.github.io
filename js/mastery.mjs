export const MASTERY_RULE = {
  minCorrect: 2,
  minStreak: 1,
  requiresInterleavedCorrect: true,
};

function group(id, taskIds, options = {}) {
  return { id, taskIds, ...options };
}

function unique(values) {
  return [...new Set(values)];
}

function buildRollingGroups(tasks) {
  const groups = [];
  const recentBySentence = new Map();

  tasks.forEach((task) => {
    const recent = recentBySentence.get(task.sentenceId) ?? [];
    recent.push(task.id);

    if (recent.length >= 2) {
      groups.push(group(`rolling-${task.id}`, unique(recent.slice(-4))));
    }

    recentBySentence.set(task.sentenceId, recent);
  });

  return groups;
}

export function buildPracticeGroups(tasks) {
  return buildRollingGroups(tasks);
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

function isStatsMastered(stats) {
  return (
    stats.correctCount >= MASTERY_RULE.minCorrect &&
    stats.streak >= MASTERY_RULE.minStreak &&
    (!MASTERY_RULE.requiresInterleavedCorrect || stats.hasInterleavedCorrect)
  );
}

export function createMasterySession() {
  return {
    cycleCursor: 0,
    groupIndex: 0,
    introducedIds: [],
    lastAnsweredTaskId: null,
    stats: {},
  };
}

export function serializeMasterySession(session) {
  return {
    cycleCursor: session.cycleCursor,
    groupIndex: session.groupIndex,
    introducedIds: [...session.introducedIds],
    lastAnsweredTaskId: session.lastAnsweredTaskId,
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

function isTaskMastered(session, taskId) {
  return isStatsMastered(normalizeStats(session.stats[taskId]));
}

export function getCurrentTaskId(session, groups) {
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
    (taskId) => !isTaskMastered(session, taskId)
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
  return groupToCheck.taskIds.every((taskId) => isTaskMastered(session, taskId));
}

export function recordMasteryAttempt(session, groups, taskId, correct) {
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

  if (!correct || !isGroupMastered(nextSession, currentGroup)) {
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
      const stats = normalizeStats(session.stats[taskId]);
      const correctProgress = Math.min(
        stats.correctCount / MASTERY_RULE.minCorrect,
        1
      );
      const streakProgress = Math.min(stats.streak / MASTERY_RULE.minStreak, 1);
      const interleavedProgress = stats.hasInterleavedCorrect ? 1 : 0;

      return total + (correctProgress + streakProgress + interleavedProgress) / 3;
    }, 0) / currentGroup.taskIds.length;

  const rawProgress = ((session.groupIndex + groupProgress) / groups.length) * 100;

  return rawProgress > 0 ? Math.max(1, Math.round(rawProgress)) : 0;
}
