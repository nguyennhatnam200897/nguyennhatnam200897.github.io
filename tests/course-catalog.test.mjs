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
  assert.ok(ids.includes("listening-song-ngu-sample"));

  for (const entry of index.courses) {
    const data = await readJson(entry.dataPath.replace("./", ""));
    const course = buildLessonCourse(data);

    assert.equal(course.id, entry.id);
    assert.ok(course.tasks.length > 0);
  }
});

test("listening sample tasks point at committed mp3 clips", async () => {
  const data = await readJson("data/courses/listening-song-ngu-sample.json");
  const course = buildLessonCourse(data);

  assert.equal(course.audioExtension, "mp3");
  assert.equal(course.audioBasePath, "./assets/audio/listening-song-ngu-sample");
  assert.ok(course.tasks.length >= 3);

  for (const task of course.tasks) {
    const assetPath = path.join(
      root,
      course.audioBasePath.replace("./", ""),
      `${task.audioId ?? task.id}.${course.audioExtension}`
    );
    const header = await readFile(assetPath);

    assert.equal(existsSync(assetPath), true);
    assert.ok(
      header.subarray(0, 3).toString("ascii") === "ID3" ||
        header[0] === 0xff,
      `${assetPath} is not an mp3`
    );
  }
});
