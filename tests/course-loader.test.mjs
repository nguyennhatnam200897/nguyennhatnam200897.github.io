import test from "node:test";
import assert from "node:assert/strict";
import {
  loadCourseById,
  loadCourseByEntry,
  loadCourseIndex,
} from "../js/course-loader.mjs";

function createFetch(fixtures) {
  const calls = [];

  async function fetchImpl(path) {
    calls.push(path);
    if (!(path in fixtures)) {
      return { ok: false, status: 404, json: async () => ({}) };
    }

    return {
      ok: true,
      status: 200,
      json: async () => fixtures[path],
    };
  }

  fetchImpl.calls = calls;
  return fetchImpl;
}

const demoCourseData = {
  id: "demo",
  title: "Demo",
  level: "A1",
  topic: "Demo topic",
  paragraphTaskMode: "none",
  sentences: [{ id: "S1", english: "City.", vietnamese: "Thành phố." }],
  taskGroups: [
    [
      {
        id: "S1-01",
        sentenceId: "S1",
        stage: "object",
        prompt: "thành phố",
        answer: "city",
      },
    ],
  ],
};

test("loads the course index with a relative default path", async () => {
  const fetchImpl = createFetch({
    "./data/courses.json": {
      courses: [
        {
          id: "small-public-garden",
          title: "A Small Public Garden",
          level: "B2",
          topic: "Đời sống đô thị và dự án môi trường nhỏ",
          dataPath: "./data/courses/small-public-garden.json",
        },
      ],
    },
  });

  const index = await loadCourseIndex({ fetchImpl });

  assert.equal(fetchImpl.calls[0], "./data/courses.json");
  assert.equal(index.courses[0].id, "small-public-garden");
});

test("loads and builds a course from an index entry", async () => {
  const fetchImpl = createFetch({ "./course.json": demoCourseData });

  const course = await loadCourseByEntry(
    { id: "demo", dataPath: "./course.json" },
    { fetchImpl }
  );

  assert.equal(course.id, "demo");
  assert.equal(course.tasks.length, 1);
});

test("loads a course by id from the index", async () => {
  const fetchImpl = createFetch({
    "./data/courses.json": {
      courses: [
        {
          id: "demo",
          title: "Demo",
          level: "A1",
          topic: "Demo topic",
          dataPath: "./course.json",
        },
      ],
    },
    "./course.json": demoCourseData,
  });

  const course = await loadCourseById("demo", { fetchImpl });

  assert.equal(course.id, "demo");
});
