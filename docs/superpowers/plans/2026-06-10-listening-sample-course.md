# Listening Sample Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one sample listening course from the first three minutes of `Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3`.

**Architecture:** Keep the existing static JSON course architecture. Add local audio tooling to extract/transcribe the sample, create one new JSON course, add small audio clips under `assets/audio/listening-song-ngu-sample/`, and extend tests so future courses are validated through the same schema.

**Tech Stack:** Vanilla ES modules, Node `node:test`, Python local tooling, offline transcription, static GitHub Pages assets.

---

### Task 1: Prepare Local Audio Tooling

**Files:**
- Create: `tools/transcribe-listening-sample.py`
- Create: `tools/build-listening-sample-assets.py`

- [ ] **Step 1: Install local Python tooling**

Run:

```powershell
python -m pip install --user faster-whisper imageio-ffmpeg
```

Expected: command exits 0 and Python can import both packages.

- [ ] **Step 2: Create a transcription helper**

Create `tools/transcribe-listening-sample.py` that loads `faster_whisper.WhisperModel`, transcribes only the first 180 seconds of the MP3, and writes a JSON draft with segment text and timestamps under `tmp/listening-sample-transcript.json`.

- [ ] **Step 3: Create an asset extraction helper**

Create `tools/build-listening-sample-assets.py` that uses `imageio_ffmpeg.get_ffmpeg_exe()` to cut the first 180 seconds and the chosen lesson clips into `assets/audio/listening-song-ngu-sample/`.

### Task 2: Add Failing Course Tests

**Files:**
- Modify: `tests/course-loader.test.mjs`
- Modify: `tests/static-site.test.mjs`

- [ ] **Step 1: Add test for multiple real courses**

Add a test that reads `data/courses.json`, asserts both `small-public-garden` and `listening-song-ngu-sample` are present, loads every referenced JSON file, and builds each course with `buildLessonCourse`.

- [ ] **Step 2: Add test for listening sample audio**

Add a test that loads `data/courses/listening-song-ngu-sample.json`, builds the course, and asserts every task audio file exists under `assets/audio/listening-song-ngu-sample/` with an MP3 frame/header.

- [ ] **Step 3: Verify RED**

Run:

```powershell
node --test tests/course-loader.test.mjs tests/static-site.test.mjs
```

Expected: fails because the new course JSON and audio clips do not exist yet.

### Task 3: Generate Listening Sample Data

**Files:**
- Create: `data/courses/listening-song-ngu-sample.json`
- Modify: `data/courses.json`
- Create: `assets/audio/listening-song-ngu-sample/*.mp3`

- [ ] **Step 1: Transcribe first three minutes**

Run the transcription helper and inspect `tmp/listening-sample-transcript.json`. Select the first clean English listening passage and its Vietnamese support text from the bilingual transcript.

- [ ] **Step 2: Cut lesson audio clips**

Use the asset helper to create short `.mp3` clips for each selected English sentence and an optional full sample clip for manual review.

- [ ] **Step 3: Write course JSON**

Create `data/courses/listening-song-ngu-sample.json` with:

```json
{
  "id": "listening-song-ngu-sample",
  "title": "Listening Sample: Song Ngu",
  "level": "A2-B1",
  "topic": "Listening from bilingual audio",
  "description": "Bai nghe mau tu vai phut dau cua file MP3 song ngu.",
  "audioBasePath": "./assets/audio/listening-song-ngu-sample",
  "paragraphTaskMode": "none",
  "sentences": [],
  "taskGroups": []
}
```

Fill `sentences` and `taskGroups` from the transcript. Each task should use `stage: "sentence"`, Vietnamese meaning as `prompt`, English as `answer`, and a `guide` with context from the bilingual audio.

- [ ] **Step 4: Register course**

Add an entry to `data/courses.json` for `listening-song-ngu-sample`.

### Task 4: Verify App Behavior

**Files:**
- Modify only if tests or browser check expose a real issue.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
node --test tests/course-loader.test.mjs tests/static-site.test.mjs
```

Expected: pass.

- [ ] **Step 2: Run full tests**

Run:

```powershell
node --test
```

Expected: all tests pass.

- [ ] **Step 3: Browser-check picker**

Start a local static server, open the app, confirm the picker shows two courses, select the sample course, and confirm the first guide opens without console errors.

- [ ] **Step 4: Commit implementation**

Stage the spec, plan, tooling, data, audio clips, and tests. Commit with:

```powershell
git commit -m "Add listening sample course"
```
