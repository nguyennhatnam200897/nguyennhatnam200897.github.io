import { readFile } from "node:fs/promises";
import { buildLessonCourse } from "../../js/course-model.mjs";

export async function loadDefaultCourse() {
  const data = JSON.parse(
    await readFile(
      new URL("../../data/courses/small-public-garden.json", import.meta.url),
      "utf8"
    )
  );

  return buildLessonCourse(data);
}
