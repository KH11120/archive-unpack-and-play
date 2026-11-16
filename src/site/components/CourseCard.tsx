import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock3, Code2, GraduationCap, Languages, ListChecks } from "lucide-react";
import { getCourseLevelLabel, type CourseRecord } from "@/site/data/courseCatalogue";

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

/** One detail in its fixed slot; an empty slot keeps its place so columns stay aligned. */
function CardDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string | undefined;
}) {
  if (!value) return <div aria-hidden="true" />;
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <Icon aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-[#E8401C]" />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0 break-words leading-snug">{value}</dd>
    </div>
  );
}

export default function CourseCard({ course }: { course: CourseRecord }) {
  // If an image file is missing, fall back to the neutral placeholder instead of a broken image.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const levelLabel = getCourseLevelLabel(course);
  const language = isDisplayable(course.language) ? course.language : undefined;
  const lessons = typeof course.lessons === "number" ? `${course.lessons} lessons` : undefined;
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
        {course.thumbnailUrl && failedSrc !== course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(course.thumbnailUrl ?? null)}
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
        {course.programType && (
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

        {/* Footer: pinned to the bottom of the card, so the details line up across a row of
            cards and always keep a fixed gap above the button. Each detail has a fixed slot:
            level left and language right; lessons left and duration right. */}
        <div className="mt-auto pt-5">
          {(levelLabel || language || lessons || course.duration) && (
            <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
              {(levelLabel || language) && (
                <>
                  <CardDetail icon={GraduationCap} label="Level" value={levelLabel} />
                  <CardDetail icon={Languages} label="Language" value={language} />
                </>
              )}
              {(lessons || course.duration) && (
                <>
                  <CardDetail icon={ListChecks} label="Lessons" value={lessons} />
                  <CardDetail icon={Clock3} label="Duration" value={course.duration ?? undefined} />
                </>
              )}
            </dl>
          )}
          <span className="flex min-h-11 w-full items-center justify-center rounded-full border border-[#E8401C] px-5 py-3 text-sm font-bold text-[#E8401C] transition-colors group-hover:bg-[#E8401C] group-hover:text-white">
            View Course{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
