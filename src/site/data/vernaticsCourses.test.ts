import { describe, expect, it } from "vitest";
import { parseCatalogueSearch } from "./catalogueSearch";
import {
  sortCourses,
  catalogueCourses,
  categoryOptions,
  emptyCatalogueFilters,
  getCourseLevelLabel,
  subjectOptions,
  matchesCatalogueFilters,
  workbookCourses,
} from "./courseCatalogue";
import workbook from "./courseCatalogue.generated.json";
import { vernaticsCourses } from "./vernaticsCourses";

describe("Vernatics courses (added outside the workbook)", () => {
  it("adds a Vernatics category right after AI & Data Science, without changing the workbook courses", () => {
    expect(workbookCourses).toHaveLength(workbook.courses.length);
    expect(catalogueCourses).toHaveLength(workbook.courses.length + 3);
    expect(categoryOptions).toEqual([
      "AI & Data Science",
      "Vernatics",
      "Coding Foundations",
      "Python",
      "Web Development",
      "JavaScript",
      "App Development",
      "Games & Creative Coding",
      "Blockchain & Cryptography",
      "Cloud Computing",
    ]);
  });

  it("lists Robo Star, Robo Orbit and Robo Galaxy with their levels and the Vernatics image", () => {
    expect(vernaticsCourses.map((course) => [course.title, getCourseLevelLabel(course)])).toEqual([
      ["Robo Star", "Simple Level"],
      ["Robo Orbit", "Moderate Level"],
      ["Robo Galaxy", "Tough Level"],
    ]);
    for (const course of vernaticsCourses) {
      expect(course.category).toBe("Vernatics");
      expect(course.thumbnailUrl).toBe("/videos/vernatics-poster.jpg");
      // Same subject as the workbook's Vernatics courses, so one Subject option covers all.
      expect(course.subject).toBe("Vernatics (Robotics)");
    }
    expect(subjectOptions.filter((subject) => subject.startsWith("Vernatics"))).toEqual([
      "Vernatics (Robotics)",
    ]);
  });

  it("shows the workbook's Vernatics courses and the three Robo courses in the category", () => {
    const filters = parseCatalogueSearch({ category: "vernatics" });
    expect(filters.categories).toEqual(["Vernatics"]);
    const shown = catalogueCourses.filter((course) =>
      matchesCatalogueFilters(course, { ...emptyCatalogueFilters, categories: filters.categories }),
    );
    expect(sortCourses(shown, "recommended").map((course) => course.title)).toEqual([
      "Vernatics Fundamentals",
      "Advanced Vernatics Concepts",
      "Robo Star",
      "Robo Orbit",
      "Robo Galaxy",
    ]);
  });

  it("uses route slugs no workbook course uses", () => {
    const used = new Set(workbookCourses.map((course) => course.routeSlug));
    expect(vernaticsCourses.filter((course) => used.has(course.routeSlug))).toEqual([]);
  });
});
