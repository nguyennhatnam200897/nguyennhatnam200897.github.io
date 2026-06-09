import { buildLessonTasks } from "../js/article.mjs";

process.stdout.write(
  JSON.stringify(
    buildLessonTasks().map(({ id, answer }) => ({ id, answer }))
  )
);
