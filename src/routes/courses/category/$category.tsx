import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateCatalogueSearch } from "@/site/data/catalogueSearch";

/**
 * Old category page (/courses/category/<slug>). The catalogue is now browsed by subject, so a
 * shared or bookmarked category address opens /courses with that category's subjects selected
 * (see LEGACY_CATEGORY_SUBJECTS), keeping any other filters in the address.
 */
export const Route = createFileRoute("/courses/category/$category")({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/courses",
      search: validateCatalogueSearch({
        ...(search as Record<string, unknown>),
        category: params.category,
      }),
      replace: true,
    });
  },
});
