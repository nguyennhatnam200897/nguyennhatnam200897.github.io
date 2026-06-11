# Gentle i+1 experiment implementation plan

## Architecture

Add a course-local `practiceProfile` to the cloned lesson one JSON. The course
model expands that profile into generated bridge tasks plus a `practicePolicy`.
The mastery module keeps its default behavior when no policy is provided and
uses the policy only for the new experiment course.

## Steps

1. Add tests for the cloned course contract.
   - Confirm the existing lesson one task count remains unchanged.
   - Confirm the experiment course builds, has `practicePolicy`, and contains
     generated bridge tasks.
   - Confirm bridge tasks point back to their target and reuse target audio.

2. Add tests for the gentle scheduler policy.
   - Confirm default `buildPracticeGroups(tasks)` remains unchanged.
   - Confirm `buildPracticeGroups(tasks, { minCorrectBeforeNextIntroduction: 2 })`
     attaches the delayed-introduction threshold.
   - Confirm the next task waits until two correct answers on the latest task.

3. Add tests for app integration.
   - Confirm `js/app.mjs` passes `course.practicePolicy` into
     `buildPracticeGroups` in both course-card progress and selected-course
     practice.

4. Implement course model support.
   - Preserve `practiceProfile`.
   - Create `practicePolicy` for `gentle-i-plus-one`.
   - Generate bridge tasks only for that profile.
   - Preserve bridge metadata during task normalization.

5. Implement scheduler support.
   - Accept an optional policy in `buildPracticeGroups`.
   - Attach `minCorrectBeforeNextIntroduction` to generated groups only when the
     policy asks for it.

6. Clone and register the course.
   - Copy lesson one data to `small-public-garden-gentle-i1.json`.
   - Update metadata and add `practiceProfile`.
   - Add the new entry to `data/courses.json`.

7. Run the focused and full test suite.
