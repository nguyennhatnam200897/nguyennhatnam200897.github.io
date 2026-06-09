import {
  buildPronunciation,
  tokenizeEnglish,
} from "./pronunciation.mjs";

const specialGuides = {
  "S1-01": {
    term: "city",
    meaning: "thành phố",
    explanation: "“City” dùng để chỉ một thành phố.",
    parts: [],
    speech: "city",
  },
  "S1-02": {
    term: "cities",
    meaning: "các thành phố",
    explanation:
      "“Cities” là dạng số nhiều của “city”, dùng khi nói về từ hai thành phố trở lên.",
    parts: [
      { term: "city", meaning: "một thành phố", isNew: false },
      { term: "cities", meaning: "các thành phố", isNew: true },
    ],
    speech: "cities",
  },
  "S1-03": {
    term: "many cities",
    meaning: "nhiều thành phố",
    explanation:
      "“Many” có nghĩa là “nhiều”. Đặt “many” trước danh từ số nhiều “cities”.",
    parts: [
      { term: "many", meaning: "nhiều", isNew: true },
      { term: "cities", meaning: "các thành phố", isNew: false },
    ],
    speech: "many cities",
  },
};

function genericExplanation(task, previousTask) {
  if (
    task.stage === "inflection" &&
    previousTask?.sentenceId === task.sentenceId &&
    !previousTask.answer.includes(" ")
  ) {
    return `“${task.answer}” là dạng số nhiều của “${previousTask.answer}”, có nghĩa là “${task.prompt}”.`;
  }

  const introductions = {
    object: `Từ “${task.answer}” có nghĩa là “${task.prompt}”.`,
    inflection: `Dạng “${task.answer}” có nghĩa là “${task.prompt}”.`,
    phrase: `Cụm “${task.answer}” có nghĩa là “${task.prompt}”.`,
    clause: `Cấu trúc “${task.answer}” diễn đạt ý “${task.prompt}”.`,
    sentence:
      "Đây là câu tiếng Anh hoàn chỉnh trong bài. Hãy đọc theo và chú ý thứ tự các ý.",
    paragraph:
      "Đây là phần bài báo được ghép từ các câu bạn đã học. Hãy đọc liền mạch toàn bộ phần này.",
  };

  return introductions[task.stage] ?? `“${task.answer}” có nghĩa là “${task.prompt}”.`;
}

export function createGuidance(task, previousTask) {
  const special = specialGuides[task.id];

  if (special) {
    return {
      ...special,
      parts: special.parts.map((part) => ({ ...part })),
    };
  }

  return {
    term: task.answer,
    meaning: task.prompt,
    explanation: genericExplanation(task, previousTask),
    parts: [],
    speech: task.answer,
  };
}

export function attachGuidance(tasks) {
  const knownWords = new Set();

  return tasks.map((task, index) => {
    const guide = createGuidance(task, tasks[index - 1]);
    const words = tokenizeEnglish(guide.term);
    const pronunciation = buildPronunciation(guide.term, knownWords);
    const showFull =
      !["sentence", "paragraph"].includes(task.stage) && words.length <= 12;

    words.forEach((word) => knownWords.add(word));

    return {
      ...task,
      guide: {
        ...guide,
        pronunciation: {
          ...pronunciation,
          full: showFull ? pronunciation.full : "",
        },
      },
    };
  });
}
