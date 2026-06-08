import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildLessonTasks } from "../js/article.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

test("uses only relative static assets suitable for a GitHub Pages subpath", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");

  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/js\/app\.mjs"/);
  assert.match(html, /id="guide-content"/);
  assert.match(html, /id="listen-guide"/);
  assert.match(html, /id="continue-guide"/);
  assert.match(html, /id="reset-course"/);
  assert.doesNotMatch(html, /\/src\/main\.jsx|react|vite/i);
});

test("loads app modules through relative imports", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");

  assert.match(appSource, /from "\.\/article\.mjs"/);
  assert.match(appSource, /from "\.\/learning\.mjs"/);
  assert.match(appSource, /from "\.\/lesson-flow\.mjs"/);
  assert.match(appSource, /from "\.\/mastery\.mjs"/);
  assert.match(appSource, /from "\.\/speech\.mjs"/);
  assert.doesNotMatch(appSource, /react|createRoot|lucide/i);
});

test("keeps exercise Enter from leaking into the next guide", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");
  const handler = appSource.match(
    /function handleAnswerKeyDown\(event\) \{[\s\S]*?\n\}/
  )?.[0];

  assert.ok(handler);
  assert.match(handler, /event\.stopPropagation\(\)/);
});

test("retries the exact failed task instead of asking the scheduler for another task", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");
  const handler = appSource.match(
    /function handleFailedRetry\(\) \{[\s\S]*?\n\}/
  )?.[0];

  assert.ok(handler);
  assert.match(appSource, /revisitFailedGuide/);
  assert.match(handler, /flow\s*=\s*revisitFailedGuide\(flow\)/);
  assert.doesNotMatch(handler, /showCurrentTask\(\{\s*forceGuide:\s*true\s*\}\)/);
});

test("resets course progress from the reset button", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");
  const handler = appSource.match(/function resetCourse\(\) \{[\s\S]*?\n\}/)?.[0];

  assert.ok(handler);
  assert.match(handler, /localStorage\.removeItem\(storageKey\)/);
  assert.match(handler, /masterySession\s*=\s*createMasterySession\(practiceGroups\)/);
  assert.match(handler, /showCurrentTask\(\{\s*forceGuide:\s*true\s*\}\)/);
  assert.match(appSource, /resetCourse.*addEventListener\("click"/s);
});

test("does not require npm or generated build directories", () => {
  assert.equal(existsSync(path.join(root, "package.json")), false);
  assert.equal(existsSync(path.join(root, "package-lock.json")), false);
  assert.equal(existsSync(path.join(root, "node_modules")), false);
  assert.equal(existsSync(path.join(root, ".volta-home")), false);
  assert.equal(existsSync(path.join(root, "src")), false);
  assert.equal(existsSync(path.join(root, "dist")), false);
});

test("has a local audio asset for every lesson task", () => {
  const missing = buildLessonTasks()
    .map((task) => path.join(root, "assets", "audio", `${task.id}.wav`))
    .filter((assetPath) => !existsSync(assetPath));

  assert.deepEqual(missing, []);
});
