import { render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import CourseCategoryLink from "@/site/components/CourseCategoryLink";
import { parseCatalogueSearch } from "./catalogueSearch";
import {
  catalogueCourses,
  emptyCatalogueFilters,
  getCatalogueCategories,
  getCourseCategorySlug,
  matchesCatalogueFilters,
} from "./courseCatalogue";
import { homeCourseCategories } from "./homeCourseCategories";

const links: [string, readonly string[]][] = [
  ["Explore Programs (hero)", homeCourseCategories.heroPrograms],
  ...Object.entries(homeCourseCategories.projects).map(
    ([tab, categories]) => [`${tab} tab`, categories] as [string, readonly string[]],
  ),
];

async function hrefFor(categories: readonly string[]) {
  const rootRoute = createRootRoute({
    component: () => <CourseCategoryLink categories={categories}>Go</CourseCategoryLink>,
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
    expect(Object.keys(homeCourseCategories.projects)).toEqual([
      "Games",
      "Websites",
      "Apps",
      "Robotics",
      "Animation & Interactive Stories",
      "AI Projects",
    ]);
  });

  it.each(links)(
    "%s uses only existing categories and finds only their courses",
    (_, categories) => {
      expect(categories.length).toBeGreaterThan(0);
      for (const category of categories) expect(getCatalogueCategories()).toContain(category);

      // The address the link produces, read back the way the Courses page reads it.
      const filters = parseCatalogueSearch({
        category: categories.map(getCourseCategorySlug).join(","),
      });
      expect(filters.categories).toEqual([...categories]);
      const shown = catalogueCourses.filter((course) =>
        matchesCatalogueFilters(course, {
          ...emptyCatalogueFilters,
          categories: filters.categories,
        }),
      );
      expect(shown.length).toBeGreaterThan(0);
      expect(shown.every((course) => categories.includes(course.category))).toBe(true);
      expect(shown).toHaveLength(
        catalogueCourses.filter((course) => categories.includes(course.category)).length,
      );
    },
  );

  it("sends More Possibilities to all courses", async () => {
    expect(homeCourseCategories.morePossibilities).toEqual([]);
    expect(await hrefFor(homeCourseCategories.morePossibilities)).toBe("/courses");
  });

  it("links to a category page for one category and to /courses?category= for several", async () => {
    expect(await hrefFor(["App Development"])).toBe("/courses/category/app-development");
  });

  it("puts several categories in the address", async () => {
    expect(await hrefFor(["AI & Data Science", "Coding Foundations"])).toBe(
      "/courses?category=ai-data-science%2Ccoding-foundations",
    );
  });
});
