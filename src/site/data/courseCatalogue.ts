import workbookPublicCourses from "./courseCatalogue.generated.json";
import courseThumbnails from "./courseThumbnails.json";

export const sortOptions = ["recommended", "grade", "level", "az"] as const;

export type LearningModel = (typeof learningModelOptions)[number];
export type CourseLevel = (typeof levelOptions)[number] | "All Levels";
export type ProgramType = (typeof programTypeOptions)[number];
export type EnrolCta = "Enrol Now" | "Book a Free Class" | "Contact Us" | "Price TBD";
export type PublishStatus =
  "Not started" | "Content drafting" | "In review" | "Approved" | "Published" | "On hold";

export interface SyllabusLesson {
  moduleNumber: number;
  moduleTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  outcome: string;
  projectLesson?: boolean;
}

export interface CourseProject {
  title: string;
  description: string;
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseInstructor {
  name: string;
  role: string;
  background: string;
  bio: string;
  languages: string[];
  photoUrl?: string;
  consentToPublish: boolean;
}

export interface CourseReview {
  reviewerName: string;
  relationship: string;
  text: string;
  rating?: number;
  consentToPublish: boolean;
}

/** Safe catalogue projection. Administrative workbook fields are never exported. */
export interface CourseRecord {
  id: string;
  title: string;
  /** Original workbook suggestion; preserved even when a collision needs routeSlug. */
  slug: string;
  routeSlug: string;
  catalogueInclusion: "intended";
  /** True only when workbook publication status and required-field rules pass. */
  offeringApproved: boolean;
  category: string;
  subject?: string;
  programType: ProgramType | string;
  learningModel: LearningModel | string;
  level: CourseLevel | string;
  language: string;
  lessons?: number | null;
  gradeFrom?: number | null;
  gradeTo?: number | null;
  duration?: string | null;
  shortDescription?: string | null;
  overview?: string | null;
  learningOutcomes: string[];
  thumbnailReady: boolean;
  thumbnailUrl: string | null;
  displayOrder?: number;
  projects?: CourseProject[];
  prerequisites?: string;
  instructor?: CourseInstructor;
  certificate?: "Yes - verified" | "No" | "To confirm";
  enrolCta?: EnrolCta | string | null;
  priceDisplay?: string | null;
  syllabus?: SyllabusLesson[];
  reviews?: CourseReview[];
  faqs?: CourseFaq[];
  relatedCourseIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  /** Approved reusable explanatory copy for this learning model. */
  learningModelOverview?: string;
}

export interface CatalogueFilters {
  q: string;
  models: string[];
  grades: number[];
  levels: string[];
  languages: string[];
  programTypes: string[];
  sort: (typeof sortOptions)[number];
}

export type CatalogueFilterKey = "models" | "grades" | "levels" | "languages" | "programTypes";
export type CatalogueFilterValue = string | number;

/** Web path of a mapped course thumbnail (built by scripts/build-course-thumbnails.py). */
export function getCourseThumbnailPath(courseId: string): string | null {
  const mapped = (courseThumbnails.thumbnails as Record<string, unknown>)[courseId];
  return mapped ? `/course-thumbnails/${courseId.toLowerCase()}.jpg` : null;
}

/** Generated from intended Website Courses rows through an explicit safe-field whitelist. */
export const catalogueCourses: readonly CourseRecord[] = (
  workbookPublicCourses.courses as unknown as CourseRecord[]
).map((course) => {
  const thumbnailUrl = course.thumbnailUrl ?? getCourseThumbnailPath(course.id);
  return {
    ...course,
    thumbnailUrl,
    thumbnailReady: course.thumbnailReady || Boolean(thumbnailUrl),
  };
});

/*
 * Filter options, counts and results are all derived from the course records below, so the
 * sidebar can never offer a value the catalogue does not contain.
 */
type FacetKey = Exclude<CatalogueFilterKey, "grades">;

const FACET_FIELDS: Record<FacetKey, "learningModel" | "level" | "language" | "programType"> = {
  models: "learningModel",
  levels: "level",
  languages: "language",
  programTypes: "programType",
};

/** Placeholders meaning "value unknown"; they never become filter options. */
const UNRESOLVED_VALUES = new Set(["", "not specified", "alts (meaning to confirm)", "recorded"]);

/** Several values in one workbook cell may be separated by ; | , or a line break. */
const MULTI_VALUE_SEPARATOR = /[;|,\n]/;

/** Display order only. An option still appears only when a course actually uses it. */
const PREFERRED_ORDER: Record<FacetKey, readonly string[]> = {
  models: ["Live", "Assisted Learning (AL)", "Self Learning (SL)"],
  levels: ["Very Easy", "Easy", "Moderate", "Hard", "All Levels"],
  languages: ["English", "Hindi"],
  programTypes: ["Course", "Camp", "Capstone"],
};

export function normalizeCatalogueValue(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function valueKey(value: string): string {
  return normalizeCatalogueValue(value).toLocaleLowerCase();
}

function sameValue(a: string, b: string): boolean {
  return valueKey(a) === valueKey(b);
}

export function isResolvedCatalogueValue(value: string | null | undefined): boolean {
  return !UNRESOLVED_VALUES.has(valueKey(value ?? ""));
}

/** The known values a course has for one filter group (multi-value cells are split). */
export function getCourseFacetValues(course: CourseRecord, key: FacetKey): string[] {
  const raw = course[FACET_FIELDS[key]];
  const values: string[] = [];
  for (const part of String(raw ?? "").split(MULTI_VALUE_SEPARATOR)) {
    const value = normalizeCatalogueValue(part);
    if (isResolvedCatalogueValue(value) && !values.some((item) => sameValue(item, value))) {
      values.push(value);
    }
  }
  return values;
}

/** Distinct values used by the given courses, spelled as first seen in the catalogue. */
export function getFacetOptions(courses: readonly CourseRecord[], key: FacetKey): string[] {
  const options: string[] = [];
  for (const course of courses) {
    for (const value of getCourseFacetValues(course, key)) {
      if (!options.some((option) => sameValue(option, value))) options.push(value);
    }
  }
  const rank = (value: string) => {
    const index = PREFERRED_ORDER[key].findIndex((preferred) => sameValue(preferred, value));
    return index < 0 ? PREFERRED_ORDER[key].length : index;
  };
  return options
    .map((value, index) => ({ value, index }))
    .sort((a, b) => rank(a.value) - rank(b.value) || a.index - b.index)
    .map(({ value }) => value);
}

export function getGradeOptions(courses: readonly CourseRecord[]): number[] {
  const grades = new Set<number>();
  for (const course of courses) {
    if (typeof course.gradeFrom === "number" && typeof course.gradeTo === "number") {
      for (let grade = course.gradeFrom; grade <= course.gradeTo; grade += 1) grades.add(grade);
    }
  }
  return [...grades].sort((a, b) => a - b);
}

/** Courses visible on a category page before any sidebar filter is applied. */
export function getCoursesInCategory(
  courses: readonly CourseRecord[],
  category: string | undefined,
): CourseRecord[] {
  return courses.filter((course) => !category || sameValue(course.category, category));
}

function distinctValues(values: readonly string[]): string[] {
  const result: string[] = [];
  for (const value of values.map(normalizeCatalogueValue)) {
    if (value && !result.some((item) => sameValue(item, value))) result.push(value);
  }
  return result;
}

export const categoryOptions: readonly string[] = distinctValues(
  catalogueCourses.map((course) => course.category),
);
export const learningModelOptions: readonly string[] = getFacetOptions(catalogueCourses, "models");
export const levelOptions: readonly string[] = getFacetOptions(catalogueCourses, "levels");
export const languageOptions: readonly string[] = getFacetOptions(catalogueCourses, "languages");
export const programTypeOptions: readonly string[] = getFacetOptions(
  catalogueCourses,
  "programTypes",
);
export const gradeOptions: readonly number[] = getGradeOptions(catalogueCourses);

export function isPublishableCourse(
  course: CourseRecord,
  publishStatus: PublishStatus | string,
): boolean {
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.slug);
  const validCategory = Boolean(course.category && categoryOptions.includes(course.category));
  const validLearningModel =
    learningModelOptions.some(
      (model) => model.toLocaleLowerCase() === course.learningModel?.trim().toLocaleLowerCase(),
    ) &&
    !["not specified", "alts (meaning to confirm)", "recorded"].includes(
      course.learningModel.trim().toLocaleLowerCase(),
    );
  const validLevel =
    [...levelOptions, "All Levels"].some(
      (level) => level.toLocaleLowerCase() === course.level?.trim().toLocaleLowerCase(),
    ) && course.level.trim().toLocaleLowerCase() !== "not specified";
  const validLanguage =
    languageOptions.some(
      (language) => language.toLocaleLowerCase() === course.language?.trim().toLocaleLowerCase(),
    ) && course.language.trim().toLocaleLowerCase() !== "not specified";
  const validGrades =
    Number.isInteger(course.gradeFrom) &&
    Number.isInteger(course.gradeTo) &&
    (course.gradeFrom ?? 0) >= 1 &&
    (course.gradeTo ?? 13) <= 12 &&
    (course.gradeFrom ?? 13) <= (course.gradeTo ?? 0);
  const validOutcomes =
    (course.learningOutcomes?.length ?? 0) >= 4 &&
    (course.learningOutcomes?.length ?? 0) <= 6 &&
    (course.learningOutcomes ?? []).every((outcome) => outcome.trim().length > 0);
  const validCta = ["Enrol Now", "Book a Free Class", "Contact Us", "Price TBD"].includes(
    course.enrolCta ?? "",
  );
  const overviewWords = (course.overview ?? "").trim().split(/\s+/).filter(Boolean).length;

  return (
    publishStatus.trim().toLocaleLowerCase() === "published" &&
    validSlug &&
    course.title.trim().length > 0 &&
    course.title.length <= 60 &&
    validCategory &&
    Boolean(course.subject?.trim()) &&
    Boolean(course.programType && programTypeOptions.includes(course.programType)) &&
    validLearningModel &&
    validLevel &&
    validLanguage &&
    Number.isInteger(course.lessons) &&
    (course.lessons ?? 0) > 0 &&
    validGrades &&
    Boolean(course.duration?.trim()) &&
    Boolean(course.shortDescription?.trim()) &&
    (course.shortDescription?.length ?? 121) <= 120 &&
    overviewWords >= 80 &&
    overviewWords <= 120 &&
    validOutcomes &&
    course.thumbnailReady &&
    validCta
  );
}

export function toPublicCourse(course: CourseRecord): CourseRecord {
  const { instructor, certificate, ...safeFields } = course;
  const consentedReviews = (course.reviews ?? [])
    .filter((review) => review.consentToPublish && review.reviewerName.trim() && review.text.trim())
    .map((review) => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) return review;
      const { rating: _rating, ...withoutUnverifiedRating } = review;
      return withoutUnverifiedRating;
    });
  return {
    ...safeFields,
    ...(instructor?.consentToPublish && instructor.name.trim() && instructor.bio.trim()
      ? { instructor }
      : {}),
    reviews: consentedReviews,
    ...(certificate === "Yes - verified" ? { certificate } : {}),
  };
}

export const publishedCourses: readonly CourseRecord[] = catalogueCourses.filter(
  (course) => course.offeringApproved,
);

export const emptyCatalogueFilters: CatalogueFilters = {
  q: "",
  models: [],
  grades: [],
  levels: [],
  languages: [],
  programTypes: [],
  sort: "recommended",
};

/** OR within one group: no selection matches everything; otherwise any selected value matches. */
function matchesFacet(course: CourseRecord, key: FacetKey, selected: readonly string[]): boolean {
  const wanted = selected.filter(isResolvedCatalogueValue);
  if (selected.length === 0) return true;
  const values = getCourseFacetValues(course, key);
  if (values.some((value) => wanted.some((item) => sameValue(item, value)))) return true;
  // A course for every ability appears under each specific level a parent selects.
  return key === "levels" && wanted.length > 0 && values.some((v) => sameValue(v, "All Levels"));
}

function matchesGrades(course: CourseRecord, grades: readonly number[]): boolean {
  return (
    grades.length === 0 ||
    grades.some(
      (grade) =>
        typeof course.gradeFrom === "number" &&
        typeof course.gradeTo === "number" &&
        course.gradeFrom <= grade &&
        course.gradeTo >= grade,
    )
  );
}

/** AND across groups, OR within a group. The single matching rule for cards and counts. */
export function matchesCatalogueFilters(
  course: CourseRecord,
  filters: CatalogueFilters,
  category?: string,
): boolean {
  const query = normalizeCatalogueValue(filters.q).toLocaleLowerCase();
  const matchesQuery =
    query.length < 2 ||
    [course.title, course.subject ?? "", course.category ?? ""].some((value) =>
      normalizeCatalogueValue(value).toLocaleLowerCase().includes(query),
    );

  return (
    (!category || sameValue(course.category ?? "", category)) &&
    matchesQuery &&
    matchesFacet(course, "models", filters.models) &&
    matchesGrades(course, filters.grades) &&
    matchesFacet(course, "levels", filters.levels) &&
    matchesFacet(course, "languages", filters.languages) &&
    matchesFacet(course, "programTypes", filters.programTypes)
  );
}

/**
 * How many courses would be listed if this option were the only one selected in its group,
 * with every other active filter (search, other groups, category) still applied.
 */
export function getCatalogueOptionCount(
  courses: readonly CourseRecord[],
  filters: CatalogueFilters,
  category: string | undefined,
  key: CatalogueFilterKey,
  value: CatalogueFilterValue,
): number {
  const onlyThisOption = { ...filters, [key]: [value] } as CatalogueFilters;
  return courses.filter((course) => matchesCatalogueFilters(course, onlyThisOption, category))
    .length;
}

export function sortCourses(
  courses: readonly CourseRecord[],
  sort: CatalogueFilters["sort"],
): CourseRecord[] {
  const levelOrder = ["Very Easy", "Easy", "Moderate", "Hard", "All Levels"];
  return [...courses].sort((a, b) => {
    if (sort === "grade")
      return (
        (a.gradeFrom ?? Number.MAX_SAFE_INTEGER) - (b.gradeFrom ?? Number.MAX_SAFE_INTEGER) ||
        a.title.localeCompare(b.title)
      );
    if (sort === "level") {
      return (
        (levelOrder.indexOf(a.level ?? "") < 0
          ? Number.MAX_SAFE_INTEGER
          : levelOrder.indexOf(a.level ?? "")) -
          (levelOrder.indexOf(b.level ?? "") < 0
            ? Number.MAX_SAFE_INTEGER
            : levelOrder.indexOf(b.level ?? "")) || a.title.localeCompare(b.title)
      );
    }
    if (sort === "az") return a.title.localeCompare(b.title);
    return (
      (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.title.localeCompare(b.title)
    );
  });
}

export function getCourseCategorySlug(category: string): string {
  return category
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCatalogueCategories(): string[] {
  return [...categoryOptions];
}

export function getCategoryBySlug(slug: string): string | undefined {
  return getCatalogueCategories().find((category) => getCourseCategorySlug(category) === slug);
}

export function getCatalogueCourseByRouteSlug(slug: string): CourseRecord | undefined {
  return catalogueCourses.find((course) => course.routeSlug === slug);
}
