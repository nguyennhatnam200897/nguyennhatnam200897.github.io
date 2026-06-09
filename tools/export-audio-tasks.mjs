import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildLessonCourse } from "../js/course-model.mjs";

const coursePath =
  process.argv[2] ?? "data/courses/small-public-garden.json";
const absoluteCoursePath = path.resolve(coursePath);
const courseData = JSON.parse(await readFile(absoluteCoursePath, "utf8"));
const course = buildLessonCourse(courseData);
const byAudioId = new Map();

for (const task of course.tasks) {
  const audioId = task.audioId ?? task.id;
  const existing = byAudioId.get(audioId);

  if (existing && existing.answer !== task.answer) {
    throw new Error(
      `${audioId} cannot be shared by different answers: ` +
        `${JSON.stringify(existing.answer)} and ${JSON.stringify(task.answer)}`
    );
  }

  byAudioId.set(audioId, {
    audioId,
    answer: task.answer,
    stage: task.stage,
  });
}

process.stdout.write(
  JSON.stringify({
    courseId: course.id,
    coursePath: pathToFileURL(absoluteCoursePath).href,
    tasks: [...byAudioId.values()],
  })
);
