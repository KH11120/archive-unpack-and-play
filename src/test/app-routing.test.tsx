import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the catalogue index, category route, and course-detail route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/courses").at(-1)?.routeId).toBe("/courses/");
    expect(router.matchRoutes("/courses/category/python").at(-1)?.routeId).toBe(
      "/courses/category/$category",
    );
    expect(router.matchRoutes("/courses/example-course").at(-1)?.routeId).toBe("/courses/$slug");
  });
});
