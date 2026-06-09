import { readFile, writeFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";

const courseData = JSON.parse(
  await readFile(
    new URL("../data/courses/small-public-garden.json", import.meta.url),
    "utf8"
  )
);
const course = buildLessonCourse(courseData);
const article = course.article;

const escapeCell = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");

const lines = [
  "# Giáo án i+1 chi tiết: A Small Public Garden",
  "",
  "Ngày cập nhật: 2026-06-08",
  "",
  "> Đây là giáo án hiện hành của webapp. Dữ liệu thực thi tương ứng nằm trong `data/courses/small-public-garden.json`.",
  "",
  "## Nguyên tắc áp dụng",
  "",
  "- Học lần lượt từng câu; hoàn tất câu hiện tại mới sang câu tiếp theo.",
  "- Tầng đầu chỉ có danh từ/đối tượng viết thành một từ.",
  "- Dạng gốc đi trước biến thể: `city` -> `cities` -> `many cities`.",
  "- Cụm được xây từ danh từ neo; mỗi lượt chỉ thêm một lớp nghĩa hoặc chức năng.",
  "- Mệnh đề lõi được hoàn thiện trước khi thêm `that`, `where`, `how`, `when`, `although` hoặc từ nối.",
  "- Câu phức được xây từ các mệnh đề có nghĩa; câu cơ bản đi trước câu mở rộng.",
  "- Sau khi hoàn tất bảy câu, đoạn được ghép cộng dồn từng câu.",
  "",
  `Tổng số nhiệm vụ: **${course.tasks.length}**.`,
  "",
];

course.sentenceTaskGroups.forEach((tasks, index) => {
  const sentence = article.sentences[index];
  lines.push(
    `## ${sentence.id}. ${sentence.english}`,
    "",
    `**Nghĩa đích:** ${sentence.vietnamese}`,
    "",
    "| Bước | Tầng | Tiếng Việt sư phạm | Đáp án tiếng Anh |",
    "| ---: | --- | --- | --- |"
  );

  tasks.forEach((lessonTask, taskIndex) => {
    lines.push(
      `| ${taskIndex + 1} | ${escapeCell(lessonTask.stage)} | ${escapeCell(lessonTask.prompt)} | \`${escapeCell(lessonTask.answer)}\` |`
    );
  });

  lines.push("");
});

const paragraphTasks = course.tasks.filter(
  (lessonTask) => lessonTask.stage === "paragraph"
);

lines.push(
  "## Ghép đoạn cộng dồn",
  "",
  "| Bước | Phạm vi | Đáp án |",
  "| ---: | --- | --- |"
);

paragraphTasks.forEach((lessonTask, index) => {
  lines.push(
    `| ${index + 1} | ${lessonTask.sentenceIds.join(" + ")} | \`${escapeCell(lessonTask.answer)}\` |`
  );
});

lines.push("");

await writeFile(
  new URL(
    "../docs/superpowers/specs/2026-06-08-b2-i-plus-one-curriculum.md",
    import.meta.url
  ),
  lines.join("\n"),
  "utf8"
);
