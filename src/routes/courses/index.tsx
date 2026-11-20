import { createFileRoute } from "@tanstack/react-router";
import CoursesPage from "@/site/pages/CoursesPage";
import {
  parseCatalogueSearch,
  serializeCatalogueSearch,
  validateCatalogueSearch,
} from "@/site/data/catalogueSearch";
import { useSiteNavigate } from "@/site/useSiteNavigate";

export const Route = createFileRoute("/courses/")({
  validateSearch: validateCatalogueSearch,
  loaderDeps: ({ search }) => ({ query: search }),
  loader: ({ deps }) => ({ noindex: hasSearchState(deps.query) }),
  head: ({ loaderData }) => ({
    meta: [
      { title: "APTCODER | Courses" },
      {
        name: "description",
        content:
          "Explore APTCODER technology courses by subject, learning model, grade, language and program type.",
      },
      { property: "og:title", content: "APTCODER | Courses" },
      {
        property: "og:description",
        content:
          "Explore APTCODER technology courses by subject, learning model, grade, language and program type.",
      },
      { name: "robots", content: loaderData?.noindex ? "noindex, follow" : "index, follow" },
    ],
  }),
  component: CoursesCatalogueRoute,
});

function CoursesCatalogueRoute() {
  const search = Route.useSearch();
  const routerNavigate = Route.useNavigate();
  const navigate = useSiteNavigate();
  const filters = parseCatalogueSearch(search);
  return (
    <CoursesPage
      filters={filters}
      navigate={navigate}
      onFiltersChange={(next, replace = false) => {
        void routerNavigate({ search: () => serializeCatalogueSearch(next), replace });
      }}
    />
  );
}

function hasSearchState(search: Record<string, unknown>) {
  return Object.keys(search).some((key) => key !== "sort" || search[key] !== "recommended");
}
