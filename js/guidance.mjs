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

function startsWithWord(value, word) {
  return value.toLowerCase().startsWith(`${word} `);
}

function isDirectExpansion(task, previousTask) {
  return (
    previousTask?.sentenceId === task.sentenceId &&
    task.answer.toLowerCase().includes(previousTask.answer.toLowerCase())
  );
}

function inflectionExplanation(task, previousTask) {
  if (
    task.stage !== "inflection" ||
    previousTask?.sentenceId !== task.sentenceId ||
    previousTask.answer.includes(" ")
  ) {
    return null;
  }

  return `“${task.answer}” là dạng số nhiều của “${previousTask.answer}”, có nghĩa là “${task.prompt}”. Hãy học riêng bước này để không nhầm một đối tượng với nhiều đối tượng.`;
}

function articleExplanation(task) {
  const answer = task.answer.toLowerCase();

  if (startsWithWord(answer, "the")) {
    return `Cụm “${task.answer}” dùng “the” vì người nói đang chỉ một đối tượng đã xác định trong ngữ cảnh bài. Ở bước này, hãy giữ “the” như một phần bắt buộc của cụm.`;
  }

  if (startsWithWord(answer, "an")) {
    return `Cụm “${task.answer}” dùng “an” để nói về một đối tượng đếm được, và “an” đứng trước âm mở đầu như trong “${task.answer.split(" ")[1]}”.`;
  }

  if (startsWithWord(answer, "a")) {
    return `Cụm “${task.answer}” dùng “a” để nói về một đối tượng đếm được chưa cần xác định là đối tượng nào.`;
  }

  return null;
}

function wouldExplanation(task) {
  if (task.stage !== "clause" || !/\bwould\b/i.test(task.answer)) {
    return null;
  }

  return `Trong “${task.answer}”, “would” diễn đạt ý “sẽ/có thể sẽ” trong lời phàn nàn hoặc dự đoán, không phải một hành động đang xảy ra ngay lúc này.`;
}

function connectorExplanation(task) {
  const answer = task.answer.toLowerCase();

  if (startsWithWord(answer, "although")) {
    return `“Although” có nghĩa là “mặc dù”. Phần sau “although” tạo nền tương phản, còn mệnh đề còn lại nói ý chính của câu.`;
  }

  if (startsWithWord(answer, "where")) {
    return `“Where” mở đầu phần bổ nghĩa cho một nơi chốn. Ở đây nó giúp nói rõ nơi đó là nơi trẻ em, người lớn tuổi và nhân viên văn phòng có thể làm gì.`;
  }

  if (startsWithWord(answer, "how")) {
    return `“How” có nghĩa là “cách mà”. Cụm “${task.answer}” nói về cách mọi người nghĩ về không gian chung.`;
  }

  if (startsWithWord(answer, "when")) {
    return `“When” có nghĩa là “khi”. Phần này nối điều kiện/thời điểm với ý chính: sự thay đổi có tác động khi mọi người cảm thấy nó thuộc về họ.`;
  }

  return null;
}

function encourageToExplanation(task) {
  if (
    !/\bencouraged\b/i.test(task.answer) ||
    !/\bto (use|place)\b/i.test(task.answer)
  ) {
    return null;
  }

  return `Cấu trúc “encourage someone to do something” nghĩa là khuyến khích ai đó làm việc gì. Trong câu này, dự án khuyến khích các cửa hàng “to use” và “to place”.`;
}

function expansionExplanation(task, previousTask) {
  if (!isDirectExpansion(task, previousTask) || task.stage === "inflection") {
    return null;
  }

  return `Bước này mở rộng từ “${previousTask.answer}” thành “${task.answer}”. Hãy chú ý lớp nghĩa mới được thêm vào để cụm gần hơn với câu gốc.`;
}

function contextualExplanation(task, previousTask) {
  return (
    inflectionExplanation(task, previousTask) ??
    encourageToExplanation(task) ??
    connectorExplanation(task) ??
    wouldExplanation(task) ??
    articleExplanation(task) ??
    expansionExplanation(task, previousTask)
  );
}

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
  if (task.guide) {
    return {
      term: task.guide.term ?? task.answer,
      meaning: task.guide.meaning ?? task.prompt,
      explanation:
        task.guide.explanation ??
        genericExplanation({ ...task, guide: undefined }, previousTask),
      parts: Array.isArray(task.guide.parts)
        ? task.guide.parts.map((part) => ({ ...part }))
        : [],
      speech: task.guide.speech ?? task.answer,
    };
  }

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
    explanation:
      contextualExplanation(task, previousTask) ??
      genericExplanation(task, previousTask),
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
