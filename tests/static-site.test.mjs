import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadDefaultCourse } from "./helpers/course-fixture.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const defaultCourse = await loadDefaultCourse();

test("uses only relative static assets suitable for a GitHub Pages subpath", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");

  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/js\/app\.mjs"/);
  assert.match(html, /id="guide-content"/);
  assert.match(html, /id="guide-ipa"/);
  assert.match(html, /id="guide-new-words"/);
  assert.match(html, /id="listen-guide"/);
  assert.match(html, /id="continue-guide"/);
  assert.match(html, /id="reset-course"/);
  assert.match(html, /id="course-picker"/);
  assert.match(html, /id="course-list"/);
  assert.match(html, /id="change-course"/);
  assert.match(html, /id="speak-answer"/);
  assert.match(html, /id="speech-input-status"/);
  assert.doesNotMatch(html, /\/src\/main\.jsx|react|vite/i);
});

test("loads app modules through relative imports", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");

  assert.match(appSource, /from "\.\/course-loader\.mjs"/);
  assert.doesNotMatch(appSource, /from "\.\/article\.mjs"/);
  assert.match(appSource, /from "\.\/learning\.mjs"/);
  assert.match(appSource, /from "\.\/lesson-flow\.mjs"/);
  assert.match(appSource, /from "\.\/mastery\.mjs"/);
  assert.match(appSource, /from "\.\/speech\.mjs"/);
  assert.match(appSource, /from "\.\/speech-input\.mjs"/);
  assert.match(appSource, /renderPronunciation/);
  assert.match(appSource, /article-mastery-session-v3:/);
  assert.match(appSource, /course\.sessionVersion\s*>\s*1/);
  assert.match(appSource, /storageKeyFor\(activeCourse\)/);
  assert.match(appSource, /article-mastery-session-v2/);
  assert.match(appSource, /activeCourse\.audioExtension/);
  assert.doesNotMatch(appSource, /react|createRoot|lucide/i);
});

test("does not migrate legacy progress into a versioned course session", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");

  assert.match(
    appSource,
    /course\.id === "small-public-garden"\s*&&\s*course\.sessionVersion === 1/
  );
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

test("speech input fills the answer without auto-submitting", async () => {
  const appSource = await readFile(path.join(root, "js", "app.mjs"), "utf8");
  const speechHandler = appSource.match(
    /function handleSpeechFinal\(transcript\) \{[\s\S]*?\n\}/
  )?.[0];

  assert.ok(speechHandler, "Expected handleSpeechFinal handler");
  assert.match(speechHandler, /elements\.answer\.value\s*=\s*transcript/);
  assert.doesNotMatch(speechHandler, /handleCheck\(/);
  assert.doesNotMatch(speechHandler, /recordMasteryAttempt/);
});

test("does not require npm or generated build directories", () => {
  assert.equal(existsSync(path.join(root, "package.json")), false);
  assert.equal(existsSync(path.join(root, "package-lock.json")), false);
  assert.equal(existsSync(path.join(root, "node_modules")), false);
  assert.equal(existsSync(path.join(root, ".volta-home")), false);
  assert.equal(existsSync(path.join(root, "src")), false);
  assert.equal(existsSync(path.join(root, "dist")), false);
  assert.equal(existsSync(path.join(root, "js", "article.mjs")), false);
});

test("generates local audio with an explicit American voice", async () => {
  const script = await readFile(
    path.join(root, "tools", "generate-american-audio.ps1"),
    "utf8"
  );

  assert.match(script, /Microsoft Zira Desktop/);
  assert.match(script, /Culture\.Name\s+-ne\s+"en-US"/);
  assert.match(script, /export-audio-tasks\.mjs/);
  assert.doesNotMatch(script, /--input-type=module\s+-e/);
});

test("has a valid local WAV asset for every lesson task", async () => {
  const assetPaths = defaultCourse.tasks.map((task) =>
    path.join(root, "assets", "audio", `${task.audioId ?? task.id}.wav`)
  );
  const missing = assetPaths.filter((assetPath) => !existsSync(assetPath));

  assert.deepEqual(missing, []);

  for (const assetPath of assetPaths) {
    const header = await readFile(assetPath);
    assert.equal(header.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(header.subarray(8, 12).toString("ascii"), "WAVE");
  }
});
