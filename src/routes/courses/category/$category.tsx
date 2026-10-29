import { createFileRoute, notFound } from "@tanstack/react-router";
import CoursesPage from "@/site/pages/CoursesPage";
import { getCategoryBySlug } from "@/site/data/courseCatalogue";
import {
  parseCatalogueSearch,
  serializeCatalogueSearch,
  validateCatalogueSearch,
} from "@/site/data/catalogueSearch";
import { useSiteNavigate } from "@/site/useSiteNavigate";

export const Route = createFileRoute("/courses/category/$category")({
  validateSearch: validateCatalogueSearch,
  loaderDeps: ({ search }) => ({ query: search }),
  loader: ({ params, deps }) => {
    const category = getCategoryBySlug(params.category);
    if (!category) throw notFound();
    const filtered = Object.keys(deps.query).some(
      (key) => key !== "sort" || deps.query[key] !== "recommended",
    );
    return { category, noindex: filtered };
  },
  head: ({ loaderData, params }) => {
    const category = loaderData?.category ?? getCategoryBySlug(params.category) ?? "Courses";
    return {
      meta: [
        { title: `${category} Courses — APTCODER` },
        { name: "description", content: `Explore APTCODER ${category} courses.` },
        { property: "og:title", content: `${category} Courses — APTCODER` },
        { property: "og:description", content: `Explore APTCODER ${category} courses.` },
        { name: "robots", content: loaderData?.noindex ? "noindex, follow" : "index, follow" },
      ],
    };
  },
  component: CoursesCategoryRoute,
});

function CoursesCategoryRoute() {
  const { category } = Route.useLoaderData();
  const search = Route.useSearch();
  const routerNavigate = Route.useNavigate();
  const navigate = useSiteNavigate();
  const filters = parseCatalogueSearch(search);
  return (
    <CoursesPage
      category={category}
      filters={filters}
      navigate={navigate}
      onFiltersChange={(next, replace = false) => {
        void routerNavigate({ search: () => serializeCatalogueSearch(next), replace });
      }}
    />
  );
}
