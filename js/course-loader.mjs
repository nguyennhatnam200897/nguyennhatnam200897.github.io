import { buildLessonCourse } from "./course-model.mjs";

export const defaultCourseIndexPath = "./data/courses.json";

async function fetchJson(path, fetchImpl) {
  const response = await fetchImpl(path);

  if (!response?.ok) {
    throw new Error(`Could not load ${path}: ${response?.status ?? "unknown"}`);
  }

  return response.json();
}

function normalizeCourseEntry(entry, index) {
  ["id", "title", "level", "topic", "dataPath"].forEach((field) => {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      throw new Error(`Invalid course index: courses[${index}].${field} is required.`);
    }
  });

  return {
    id: entry.id,
    title: entry.title,
    level: entry.level,
    topic: entry.topic,
    description: entry.description ?? "",
    dataPath: entry.dataPath,
  };
}

export async function loadCourseIndex({
  fetchImpl = globalThis.fetch,
  indexPath = defaultCourseIndexPath,
} = {}) {
  const data = await fetchJson(indexPath, fetchImpl);
  const courses = Array.isArray(data.courses)
    ? data.courses.map(normalizeCourseEntry)
    : [];

  return { courses };
}

export async function loadCourseByEntry(
  entry,
  { fetchImpl = globalThis.fetch } = {}
) {
  return buildLessonCourse(await fetchJson(entry.dataPath, fetchImpl));
}

export async function loadCourseById(
  courseId,
  { fetchImpl = globalThis.fetch, indexPath = defaultCourseIndexPath } = {}
) {
  const index = await loadCourseIndex({ fetchImpl, indexPath });
  const entry = index.courses.find((course) => course.id === courseId);

  if (!entry) {
    throw new Error(`Unknown course: ${courseId}`);
  }

  return loadCourseByEntry(entry, { fetchImpl });
}
