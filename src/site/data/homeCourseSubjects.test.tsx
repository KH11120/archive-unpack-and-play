import { render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import CourseSubjectLink from "@/site/components/CourseSubjectLink";
import { parseCatalogueSearch } from "./catalogueSearch";
import { catalogueCourses, matchesCatalogueFilters, subjectOptions } from "./courseCatalogue";
import { homeCourseSubjects } from "./homeCourseSubjects";

const links: [string, readonly string[]][] = [
  ["Explore Programs (hero)", homeCourseSubjects.heroPrograms],
  ...Object.entries(homeCourseSubjects.projects).map(
    ([tab, subjects]) => [`${tab} tab`, subjects] as [string, readonly string[]],
  ),
];

async function hrefFor(subjects: readonly string[]) {
  const rootRoute = createRootRoute({
    component: () => <CourseSubjectLink subjects={subjects}>Go</CourseSubjectLink>,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={router} />);
  return (await screen.findByRole("link", { name: "Go" })).getAttribute("href");
}

describe("homepage Explore links", () => {
  it("covers every project tab on the homepage", () => {
    expect(Object.keys(homeCourseSubjects.projects)).toEqual([
      "Games",
      "Websites",
      "Apps",
      "Robotics",
      "Animation & Interactive Stories",
      "AI Projects",
    ]);
  });

  it.each(links)("%s uses only workbook subjects and finds only their courses", (_, subjects) => {
    expect(subjects.length).toBeGreaterThan(0);
    for (const subject of subjects) expect(subjectOptions).toContain(subject);

    // The address the link produces, read back the way the Courses page reads it.
    const filters = parseCatalogueSearch({ subject: subjects.join(",") });
    expect(filters.subjects).toEqual([...subjects]);
    const shown = catalogueCourses.filter((course) => matchesCatalogueFilters(course, filters));
    expect(shown.length).toBeGreaterThan(0);
    expect(shown).toEqual(
      catalogueCourses.filter((course) => subjects.includes(course.subject ?? "")),
    );
  });

  it("sends More Possibilities to all courses", async () => {
    expect(homeCourseSubjects.morePossibilities).toEqual([]);
    expect(await hrefFor(homeCourseSubjects.morePossibilities)).toBe("/courses");
  });

  it("puts the chosen subjects in the address", async () => {
    expect(await hrefFor(["App Development"])).toBe("/courses?subject=App+Development");
  });
});
