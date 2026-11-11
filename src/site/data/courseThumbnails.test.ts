import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import mapping from "./courseThumbnails.json";
import { catalogueCourses, getCourseThumbnailPath } from "./courseCatalogue";

const entries = Object.entries(mapping.thumbnails);
const publicDir = path.resolve(__dirname, "../../../public");

describe("course thumbnail mapping", () => {
  it("only maps courses that exist in the catalogue", () => {
    const ids = new Set(catalogueCourses.map((course) => course.id));
    expect(entries.filter(([id]) => !ids.has(id))).toEqual([]);
  });

  it("gives every mapped course its web image, and leaves the rest on the placeholder", () => {
    for (const course of catalogueCourses) {
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

  it("does not reuse an image across different courses", () => {
    const bySource = new Map<string, string[]>();
    for (const [id, entry] of entries) {
      bySource.set(entry.source, [...(bySource.get(entry.source) ?? []), id]);
    }
    const shared = [...bySource.values()].filter((ids) => ids.length > 1);
    // COURSE-040 and COURSE-041 are identical rows in the workbook, so they share one image.
    expect(shared).toEqual([["COURSE-040", "COURSE-041"]]);
  });

  it("records only High or Medium confidence matches", () => {
    expect(new Set(entries.map(([, entry]) => entry.confidence))).toEqual(
      new Set(["High", "Medium"]),
    );
  });
});
