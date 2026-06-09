# Listening Sample Course Design

## Goal

Create one sample listening lesson from the first three minutes of `Luyen-nghe-Tieng-Anh-Thu-dong-Song-ngu.mp3` so the app can start using audio-first bilingual material as course data.

## Source And Tooling

The source MP3 stays as the master listening file. Local tooling will be used instead of an API: install or reuse Python-based audio/transcription tools, extract the first three minutes, transcribe offline, and save only the app-ready lesson data and audio clips.

## Course Shape

Add a second course entry with an id like `listening-song-ngu-sample`. The course should use the existing JSON schema: `article`, `sentences`, `taskGroups`, `guide`, `audioId`, and `audioBasePath`. Each task should focus on listening and typing the English sentence, while Vietnamese bilingual content from the transcript should be used as prompt, meaning, or guidance when available.

## Audio Assets

Create small web-ready clips under `assets/audio/listening-song-ngu-sample/`. The app should not need to load the entire MP3 during a lesson. Clip names should match task `audioId` values and be covered by static tests.

## App Behavior

The existing course picker should show the new sample lesson next to `A Small Public Garden`. Selecting the sample lesson should open the normal guide/exercise flow. No new app framework or build step should be introduced.

## Testing

Add or update tests to verify the course index includes multiple courses, the new course loads through `buildLessonCourse`, every task points to an existing audio asset, and the static site remains GitHub Pages friendly. Run `node --test` and verify the picker in a local browser.
