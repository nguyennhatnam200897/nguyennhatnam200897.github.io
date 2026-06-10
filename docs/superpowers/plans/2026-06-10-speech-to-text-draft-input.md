# Speech-To-Text Draft Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `Nói thử` speech-to-text button that fills the current answer box as an editable draft without changing scoring or mastery rules.

**Architecture:** Create a focused `js/speech-input.mjs` wrapper around browser `SpeechRecognition` / `webkitSpeechRecognition`. Wire it into `app.mjs` as a draft input helper only: transcript updates the textarea and status text, while `handleCheck()` remains the only path that records progress.

**Tech Stack:** Static HTML, CSS, vanilla ES modules, Node built-in test runner, browser Web Speech API.

---

### Task 1: Speech Input Wrapper

**Files:**
- Create: `tests/speech-input.test.mjs`
- Create: `js/speech-input.mjs`

- [x] **Step 1: Write failing tests for browser support and transcript handling**

Create `tests/speech-input.test.mjs` with tests that expect:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { createSpeechInput } from "../js/speech-input.mjs";

class FakeRecognition {
  static instances = [];

  constructor() {
    this.abortCalled = false;
    this.continuous = null;
    this.interimResults = null;
    this.lang = "";
    this.maxAlternatives = null;
    this.startCalled = false;
    this.stopCalled = false;
    FakeRecognition.instances.push(this);
  }

  start() {
    this.startCalled = true;
  }

  stop() {
    this.stopCalled = true;
  }

  abort() {
    this.abortCalled = true;
  }
}

test("reports unavailable when no recognition API exists", () => {
  const input = createSpeechInput({});

  assert.equal(input.isAvailable, false);
});

test("starts one short en-US recognition pass and returns final transcript", () => {
  FakeRecognition.instances = [];
  const input = createSpeechInput({ SpeechRecognition: FakeRecognition });
  const finals = [];

  input.start({ onFinal: (text) => finals.push(text) });
  const recognition = FakeRecognition.instances[0];

  assert.equal(input.isAvailable, true);
  assert.equal(recognition.lang, "en-US");
  assert.equal(recognition.continuous, false);
  assert.equal(recognition.interimResults, true);
  assert.equal(recognition.maxAlternatives, 1);
  assert.equal(recognition.startCalled, true);

  recognition.onresult({
    resultIndex: 0,
    results: [
      {
        isFinal: true,
        0: { transcript: "many cities" },
      },
    ],
  });

  assert.deepEqual(finals, ["many cities"]);
});
```

- [x] **Step 2: Run tests and verify the expected missing-module failure**

Run:

```powershell
& 'C:\Users\PC- VPQG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\speech-input.test.mjs
```

Expected: FAIL because `js/speech-input.mjs` does not exist yet.

- [x] **Step 3: Implement minimal speech input wrapper**

Create `js/speech-input.mjs` with:

```js
export function createSpeechInput(environment = globalThis) {
  const Recognition =
    environment.SpeechRecognition ?? environment.webkitSpeechRecognition;

  let activeRecognition = null;

  function clearActive(recognition) {
    if (activeRecognition === recognition) {
      activeRecognition = null;
    }
  }

  function stop() {
    if (!activeRecognition) {
      return;
    }

    const recognition = activeRecognition;
    activeRecognition = null;
    recognition.abort?.();
  }

  function start({ onEnd, onError, onFinal, onInterim, onStart } = {}) {
    if (!Recognition) {
      onError?.("unsupported");
      return false;
    }

    stop();

    const recognition = new Recognition();
    activeRecognition = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      onStart?.();
    };
    recognition.onend = () => {
      clearActive(recognition);
      onEnd?.();
    };
    recognition.onerror = (event) => {
      clearActive(recognition);
      onError?.(event?.error ?? "unknown");
    };
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          final += `${final ? " " : ""}${transcript}`;
        } else {
          interim += `${interim ? " " : ""}${transcript}`;
        }
      }

      if (interim) {
        onInterim?.(interim);
      }

      if (final) {
        onFinal?.(final);
      }
    };

    try {
      recognition.start();
      return true;
    } catch (error) {
      clearActive(recognition);
      onError?.(error?.name ?? "unknown");
      return false;
    }
  }

  return {
    isAvailable: Boolean(Recognition),
    start,
    stop,
  };
}
```

- [x] **Step 4: Run focused test and verify pass**

Run:

```powershell
& 'C:\Users\PC- VPQG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\speech-input.test.mjs
```

Expected: PASS.

### Task 2: Exercise UI Integration

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `js/app.mjs`
- Modify: `tests/static-site.test.mjs`

- [x] **Step 1: Write failing static tests for the UI contract**

Update `tests/static-site.test.mjs` so the static markup test expects:

```js
assert.match(html, /id="speak-answer"/);
assert.match(html, /id="speech-input-status"/);
```

Update the module import test to expect:

```js
assert.match(appSource, /from "\.\/speech-input\.mjs"/);
```

Add a test that checks transcript is not auto-submitted:

```js
test("speech input fills the answer without auto-submitting", async () => {
  const appSource = await readFile("js/app.mjs", "utf8");
  const speechHandler = appSource.match(
    /function handleSpeechFinal\(transcript\) \{[\s\S]*?\n\}/
  )?.[0];

  assert.ok(speechHandler, "Expected handleSpeechFinal handler");
  assert.match(speechHandler, /elements\.answer\.value\s*=\s*transcript/);
  assert.doesNotMatch(speechHandler, /handleCheck\(/);
  assert.doesNotMatch(speechHandler, /recordMasteryAttempt/);
});
```

- [x] **Step 2: Run static tests and verify failure**

Run:

```powershell
& 'C:\Users\PC- VPQG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\static-site.test.mjs
```

Expected: FAIL because the button, status region and app import do not exist.

- [x] **Step 3: Add markup and styling**

In `index.html`, add a small speech helper block between the textarea and `.actions`:

```html
<div class="speechInput">
  <button id="speak-answer" class="secondaryButton" type="button" hidden>
    Nói thử
  </button>
  <p id="speech-input-status" class="speechInputStatus" aria-live="polite"></p>
</div>
```

In `styles.css`, add compact styles:

```css
.speechInput {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  margin: -0.5rem 0 1rem;
  min-height: 2.5rem;
}

.speechInputStatus {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0;
  max-width: 34rem;
}
```

- [x] **Step 4: Wire speech input into app state**

In `js/app.mjs`:

- import `createSpeechInput`;
- create `const speechInput = createSpeechInput(window);`;
- add `speakAnswer` and `speechInputStatus` to `elements`;
- add helper functions:

```js
function setSpeechInputStatus(message) {
  elements.speechInputStatus.textContent = message;
  elements.speechInputStatus.hidden = !message;
}

function stopSpeechInput() {
  speechInput.stop();
  elements.speakAnswer.textContent = "Nói thử";
}

function speechInputErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Trình duyệt chưa cho phép dùng micro. Bạn vẫn có thể gõ tay.";
  }

  if (error === "no-speech") {
    return "Mình chưa nghe rõ. Bạn có thể nói lại hoặc gõ tay.";
  }

  if (error === "audio-capture") {
    return "Trình duyệt chưa tìm thấy micro. Bạn vẫn có thể gõ tay.";
  }

  if (error === "unsupported") {
    return "Trình duyệt này chưa hỗ trợ nói để nhập. Bạn vẫn có thể gõ tay.";
  }

  return "Tính năng nói đang không khả dụng. Bạn vẫn có thể gõ tay.";
}

function handleSpeechFinal(transcript) {
  elements.answer.value = transcript;
  setSpeechInputStatus(`Máy nghe được: "${transcript}". Bạn có thể sửa trước khi kiểm tra.`);
  focusAnswer();
}

function handleSpeakAnswer() {
  if (flow?.phase !== "exercise" || isFinished() || flow.feedback) {
    return;
  }

  speechPlayer.cancel();
  setSpeechInputStatus("Đang nghe...");
  elements.speakAnswer.textContent = "Đang nghe...";
  const started = speechInput.start({
    onEnd: () => {
      elements.speakAnswer.textContent = "Nói thử";
    },
    onError: (error) => {
      elements.speakAnswer.textContent = "Nói thử";
      setSpeechInputStatus(speechInputErrorMessage(error));
    },
    onFinal: handleSpeechFinal,
    onInterim: (transcript) => {
      setSpeechInputStatus(`Máy đang nghe: "${transcript}"`);
    },
  });

  if (!started) {
    elements.speakAnswer.textContent = "Nói thử";
  }
}
```

Call `stopSpeechInput()` when changing/resetting course, moving guide/exercise,
checking an answer, retrying a failed task, and showing a new current task.

In `renderExercise(task)`, show the button only when available and no feedback
has been submitted:

```js
elements.speakAnswer.hidden = !speechInput.isAvailable || hasSubmitted;
elements.speakAnswer.disabled = hasSubmitted;
```

Register the click listener:

```js
elements.speakAnswer.addEventListener("click", handleSpeakAnswer);
```

- [x] **Step 5: Run focused tests and verify pass**

Run:

```powershell
& 'C:\Users\PC- VPQG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests\speech-input.test.mjs tests\static-site.test.mjs
```

Expected: PASS.

### Task 3: Full Verification

**Files:**
- Verify all changed files.

- [x] **Step 1: Run full automated test suite**

Run:

```powershell
& 'C:\Users\PC- VPQG\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
```

Expected: all tests pass.

- [x] **Step 2: Inspect git diff**

Run:

```powershell
git diff -- index.html styles.css js/app.mjs js/speech-input.mjs tests/speech-input.test.mjs tests/static-site.test.mjs docs/superpowers/plans/2026-06-10-speech-to-text-draft-input.md
```

Expected: changes are limited to speech-to-text support, docs/specs, and tests.

- [ ] **Step 3: Attempt commit if Git metadata is writable**

Run:

```powershell
git add -- index.html styles.css js/app.mjs js/speech-input.mjs tests/speech-input.test.mjs tests/static-site.test.mjs docs/superpowers/specs/2026-06-03-article-mastery-english-app-design.md docs/superpowers/specs/2026-06-10-speech-to-text-draft-input-design.md docs/superpowers/plans/2026-06-10-speech-to-text-draft-input.md
git commit -m "Add speech-to-text draft input"
```

Expected: commit succeeds if `.git` metadata is writable. If Git still cannot
create `.git/index.lock`, leave the working tree changes in place and report the
permission blocker.
