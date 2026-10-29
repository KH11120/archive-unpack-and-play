import { createFileRoute, notFound } from "@tanstack/react-router";
import CourseDetailPage from "@/site/pages/CourseDetailPage";
import { getCatalogueCourseByRouteSlug } from "@/site/data/courseCatalogue";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCatalogueCourseByRouteSlug(params.slug);
    if (!course) throw notFound();
    return course;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.seoTitle || `${loaderData?.title ?? "Course"} — APTCODER` },
      {
        name: "description",
        content:
          loaderData?.seoDescription ||
          loaderData?.shortDescription ||
          "Course details from APTCODER.",
      },
      {
        name: "robots",
        content: loaderData?.offeringApproved ? "index, follow" : "noindex, follow",
      },
    ],
  }),
  component: CourseDetailRoute,
});

function CourseDetailRoute() {
  return <CourseDetailPage course={Route.useLoaderData()} />;
}
