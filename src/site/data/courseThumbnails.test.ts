import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import mapping from "./courseThumbnails.json";
import { workbookCourses, getCourseThumbnailPath } from "./courseCatalogue";

const entries = Object.entries(mapping.thumbnails);
const publicDir = path.resolve(__dirname, "../../../public");

describe("course thumbnail mapping", () => {
  it("only maps courses that exist in the catalogue", () => {
    const ids = new Set(workbookCourses.map((course) => course.id));
    expect(entries.filter(([id]) => !ids.has(id))).toEqual([]);
  });

  it("gives every mapped course its web image, and leaves the rest on the placeholder", () => {
    for (const course of workbookCourses) {
      const expected = course.id in mapping.thumbnails ? getCourseThumbnailPath(course.id) : null;
      expect(course.thumbnailUrl).toBe(expected);
    }
  });

  it("has the original and the resized file on disk for every mapping", () => {
    for (const [id, entry] of entries) {
      expect(
        existsSync(path.join(publicDir, "Thumbnail Samples", entry.source)),
        entry.source,
      ).toBe(true);
      expect(existsSync(path.join(publicDir, getCourseThumbnailPath(id)!.slice(1))), id).toBe(true);
    }
  });

  it("shares an image only between records with the same LMS course name", () => {
    // Same normalisation as the workbook's "Name Key (helper)" column.
    const nameKey = (name: string) =>
      name.replace("(Deleted)", "").replace(/[\s-]/g, "").toLocaleLowerCase();
    const byId = new Map(workbookCourses.map((course) => [course.id, course]));
    const bySource = new Map<string, string[]>();
    for (const [id, entry] of entries) {
      bySource.set(entry.source, [...(bySource.get(entry.source) ?? []), id]);
    }
    for (const ids of bySource.values()) {
      const keys = new Set(ids.map((id) => nameKey(byId.get(id)?.source?.lmsName ?? id)));
      expect(keys.size, ids.join(", ")).toBe(1);
    }
  });

  it("records only High or Medium confidence matches", () => {
    expect(new Set(entries.map(([, entry]) => entry.confidence))).toEqual(
      new Set(["High", "Medium"]),
    );
  });
});
