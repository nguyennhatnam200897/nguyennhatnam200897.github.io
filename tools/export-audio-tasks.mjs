import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../js/course-model.mjs";

const courseData = JSON.parse(
  await readFile(
    new URL("../data/courses/small-public-garden.json", import.meta.url),
    "utf8"
  )
);
const course = buildLessonCourse(courseData);

process.stdout.write(
  JSON.stringify(
    course.tasks.map(({ id, audioId, answer }) => ({
      id: audioId ?? id,
      answer,
    }))
  )
);
