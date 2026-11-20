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

  it("gives every catalogue course its own web image", () => {
    for (const course of workbookCourses) {
      expect(course.id in mapping.thumbnails, course.id).toBe(true);
      expect(course.thumbnailUrl).toBe(getCourseThumbnailPath(course.id));
    }
  });

  it("has the original and the resized file on disk for every mapping", () => {
    for (const [id, entry] of entries) {
      const original = entry.source.startsWith("/")
        ? path.join(publicDir, entry.source)
        : path.join(publicDir, "Thumbnail Samples", entry.source);
      expect(existsSync(original), entry.source).toBe(true);
      expect(existsSync(path.join(publicDir, getCourseThumbnailPath(id)!.slice(1))), id).toBe(true);
    }
  });

  it("explains every choice", () => {
    for (const [id, entry] of entries) expect(entry.reason.length, id).toBeGreaterThan(20);
  });

  it("uses robotics images for Vernatics and subject images for the other key subjects", () => {
    const sourceOf = (id: string) =>
      (mapping.thumbnails as Record<string, { source: string }>)[id]!.source;
    const bySubject = (subject: string) =>
      workbookCourses.filter((course) => course.subject === subject).map((c) => sourceOf(c.id));
    expect(new Set(bySubject("Vernatics (Robotics)"))).toEqual(
      new Set(["/videos/vernatics-poster.jpg"]),
    );
    for (const [subject, word] of [
      ["AI & ML", /AI|Artificial/],
      ["Blockchain", /Block Chain/],
      ["Cryptography", /Crypt/],
      ["Data Science", /Data Science/],
      ["Python", /Python|पायथन/],
      ["Web Development", /Web Development/],
      ["App Development", /App Development/],
      ["Art & Music with Coding", /Art|Music/],
      ["JavaScript", /Javascript/],
      ["Cloud Computing", /Cloud/],
      ["Block Coding", /Block Coding|ब्लॉक/],
    ] as const) {
      for (const source of bySubject(subject)) expect(source, subject).toMatch(word);
    }
  });
});
