const punctuationPattern = /[.,!?;:"\u201c\u201d\u2018\u2019'()[\]{}]/g;

export function normalizeTextAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[\u2019\u2018]/g, "'")
    .replace(punctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstTokenIssue(input, expected) {
  const actualTokens = normalizeTextAnswer(input).split(" ").filter(Boolean);
  const expectedTokens = normalizeTextAnswer(expected).split(" ").filter(Boolean);
  const max = Math.max(actualTokens.length, expectedTokens.length);

  for (let index = 0; index < max; index += 1) {
    if (actualTokens[index] !== expectedTokens[index]) {
      if (actualTokens[index] === undefined) {
        return `Thiếu từ "${expectedTokens[index]}" ở vị trí ${index + 1}.`;
      }

      if (expectedTokens[index] === undefined) {
        return `Thừa từ "${actualTokens[index]}" ở vị trí ${index + 1}.`;
      }

      return `Ở vị trí ${index + 1}, bạn nhập "${actualTokens[index]}", đáp án là "${expectedTokens[index]}".`;
    }
  }

  return "Câu chưa khớp với bài gốc.";
}

export function evaluateAnswer(task, input) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      correct: false,
      kind: "empty",
      message: "Bạn cần nhập câu trả lời trước khi kiểm tra.",
      expected: task.answer,
      notes: [],
    };
  }

  const actual = normalizeTextAnswer(trimmedInput);
  const expected = normalizeTextAnswer(task.answer);
  const correct = actual === expected;
  const exact = trimmedInput === task.answer;

  if (correct) {
    return {
      correct: true,
      kind: exact ? "correct" : "format",
      message: exact
        ? "Đúng."
        : "Đúng nội dung. Có lỗi hình thức nhưng không chặn qua.",
      expected: task.answer,
      notes: exact
        ? []
        : ["Cần chú ý viết hoa, dấu câu hoặc khoảng trắng để giống bài gốc hơn."],
    };
  }

  return {
    correct: false,
    kind: "blocking",
    message: firstTokenIssue(trimmedInput, task.answer),
    expected: task.answer,
    notes: ["Lỗi này chặn qua vì output phải tái tạo đúng từ/cụm/câu của bài gốc."],
  };
}
