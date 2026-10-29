import { Link } from "@tanstack/react-router";
import { Clock3, Code2, GraduationCap, Languages, ListChecks } from "lucide-react";
import type { CourseRecord } from "@/site/data/courseCatalogue";

function isDisplayable(value: string | null | undefined): value is string {
  return Boolean(value?.trim() && value.trim().toLocaleLowerCase() !== "not specified");
}

function displayLearningModel(value: string): string | undefined {
  if (
    ["live", "assisted learning (al)", "self learning (sl)"].includes(value.toLocaleLowerCase())
  ) {
    return value.replace(/\s*\([^)]*\)/g, "");
  }
  return undefined;
}

export default function CourseCard({ course }: { course: CourseRecord }) {
  const gradeLabel =
    typeof course.gradeFrom === "number" && typeof course.gradeTo === "number"
      ? course.gradeFrom === course.gradeTo
        ? `Grade ${course.gradeFrom}`
        : `Grades ${course.gradeFrom}-${course.gradeTo}`
      : undefined;

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.routeSlug }}
      aria-label={`View course: ${course.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8401C]"
    >
      <div className="relative aspect-video overflow-hidden bg-[#FFF5F2]">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-[#F7F8FA] text-[#E8401C]"
          >
            <Code2 className="h-10 w-10 opacity-70" />
          </div>
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {gradeLabel && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
              {gradeLabel}
            </span>
          )}
          {displayLearningModel(course.learningModel) && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
              {displayLearningModel(course.learningModel)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
          {course.category}
        </span>
        {course.programType !== "Course" && (
          <span className="mb-2 text-xs font-bold uppercase tracking-wide text-[#E8401C]">
            {course.programType}
          </span>
        )}
        <h2 className="line-clamp-2 text-lg font-black text-gray-900">{course.title}</h2>
        {course.shortDescription && (
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-gray-600">
            {course.shortDescription}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600">
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#E8401C]" />
              <dt className="sr-only">Duration</dt>
              <dd>{course.duration}</dd>
            </div>
          )}
          {isDisplayable(course.level) && (
            <div className="flex items-center gap-1.5">
              <GraduationCap aria-hidden="true" className="h-3.5 w-3.5 text-[#E8401C]" />
              <dt className="sr-only">Level</dt>
              <dd>{course.level}</dd>
            </div>
          )}
          {isDisplayable(course.language) && (
            <div className="flex items-center gap-1.5">
              <Languages aria-hidden="true" className="h-3.5 w-3.5 text-[#E8401C]" />
              <dt className="sr-only">Language</dt>
              <dd>{course.language}</dd>
            </div>
          )}
          {typeof course.lessons === "number" && (
            <div className="flex items-center gap-1.5">
              <ListChecks aria-hidden="true" className="h-3.5 w-3.5 text-[#E8401C]" />
              <dt className="sr-only">Lessons</dt>
              <dd>{course.lessons} lessons</dd>
            </div>
          )}
        </dl>

        <span className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-[#E8401C] px-5 py-3 text-sm font-bold text-[#E8401C] transition-colors group-hover:bg-[#E8401C] group-hover:text-white">
          View Course{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
