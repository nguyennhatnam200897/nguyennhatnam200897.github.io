import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildLessonCourse } from "../js/course-model.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("course catalog includes the listening sample and builds every course", async () => {
  const index = await readJson("data/courses.json");
  const ids = index.courses.map((entry) => entry.id);

  assert.ok(ids.includes("small-public-garden"));
  assert.ok(ids.includes("small-public-garden-gentle-i1"));
  assert.ok(ids.includes("listening-song-ngu-sample"));

  for (const entry of index.courses) {
    const data = await readJson(entry.dataPath.replace("./", ""));
    const course = buildLessonCourse(data);

    assert.equal(course.id, entry.id);
    assert.equal(data.description, entry.description);
    assert.ok(course.tasks.length > 0);
  }
});

test("listening sample uses committed course-local WAV assets", async () => {
  const data = await readJson("data/courses/listening-song-ngu-sample.json");
  const course = buildLessonCourse(data);

  assert.equal(course.audioExtension, "wav");
  assert.equal(course.audioBasePath, "./assets/audio/listening-song-ngu-sample");
  assert.ok(course.tasks.length >= 60);

  for (const task of course.tasks) {
    const assetPath = path.join(
      root,
      course.audioBasePath.replace("./", ""),
      `${task.audioId ?? task.id}.${course.audioExtension}`
    );
    const header = await readFile(assetPath);

    assert.equal(existsSync(assetPath), true);
    assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(header.subarray(8, 12).toString("ascii"), "WAVE");
  }
});
