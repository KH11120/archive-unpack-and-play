import { describe, expect, it } from "vitest";
import {
  emptyCatalogueFilters,
  gradeOptions,
  getCatalogueOptionCount,
  getCourseFacetValues,
  getFacetOptions,
  isPublishableCourse,
  matchesCatalogueFilters,
  catalogueCourses,
  publishedCourses,
  sortCourses,
  toPublicCourse,
  type CourseRecord,
} from "./courseCatalogue";
import {
  parseCatalogueSearch,
  serializeCatalogueSearch,
  validateCatalogueSearch,
} from "./catalogueSearch";

function testCourse(overrides: Partial<CourseRecord> = {}): CourseRecord {
  return {
    id: "test-only",
    title: "Example test record",
    slug: "example-test-record",
    routeSlug: "example-test-record",
    catalogueInclusion: "intended",
    offeringApproved: true,
    category: "Python",
    subject: "Python",
    programType: "Course",
    learningModel: "Live",
    level: "Easy",
    language: "English",
    lessons: 8,
    gradeFrom: 4,
    gradeTo: 6,
    duration: "12 weeks",
    shortDescription: "Test fixture only.",
    overview: Array.from({ length: 90 }, () => "Fixture").join(" "),
    learningOutcomes: ["Build", "Create", "Debug", "Share"],
    thumbnailReady: true,
    thumbnailUrl: "/test-only.png",
    enrolCta: "Book a Free Class",
    ...overrides,
  };
}

describe("course catalogue publication and filtering", () => {
  it("includes all intended workbook rows independently from offering approval", () => {
    expect(catalogueCourses).toHaveLength(86);
    expect(publishedCourses).toEqual([]);
    expect(catalogueCourses.every((course) => course.catalogueInclusion === "intended")).toBe(true);
    expect(catalogueCourses.some((course) => course.offeringApproved)).toBe(false);
    expect(new Set(catalogueCourses.map((course) => course.routeSlug)).size).toBe(86);
    expect(catalogueCourses[0]).toMatchObject({
      id: "COURSE-001",
      title: "Python Transition Program (Hindi/Adaptive Learning)",
      category: "Python",
      learningModel: "Assisted Learning (AL)",
    });
    expect(gradeOptions).toEqual([]);
    expect(
      catalogueCourses.filter((course) => course.title === "Programming Fundamentals with Codely"),
    ).toHaveLength(2);
    expect(catalogueCourses.find((course) => course.id === "COURSE-041")?.routeSlug).toBe(
      "programming-fundamentals-with-codely-course-041",
    );
    expect(
      catalogueCourses.some((course) =>
        Object.keys(course).some((key) =>
          ["publishStatus", "Content Notes", "Source Flags", "Owner", "LMS Record IDs"].includes(
            key,
          ),
        ),
      ),
    ).toBe(false);
  });

  it("requires Published status and all required publication fields", () => {
    expect(isPublishableCourse(testCourse(), "Published")).toBe(true);
    expect(isPublishableCourse(testCourse(), "Not started")).toBe(false);
    expect(isPublishableCourse(testCourse({ gradeFrom: 0 }), "Published")).toBe(false);
    expect(isPublishableCourse(testCourse({ thumbnailReady: false }), "Published")).toBe(false);
    expect(isPublishableCourse(testCourse({ overview: "Too short." }), "Published")).toBe(false);
  });

  it("does not require a thumbnail URL or optional detail sections to publish", () => {
    expect(isPublishableCourse(testCourse({ thumbnailUrl: null }), "Published")).toBe(true);
  });

  it("removes instructor, review, and certificate information without publication approval", () => {
    const sanitized = toPublicCourse(
      testCourse({
        certificate: "To confirm",
        instructor: {
          name: "Test-only",
          role: "Test fixture",
          background: "Test fixture",
          bio: "Test fixture",
          languages: ["English"],
          consentToPublish: false,
        },
        reviews: [
          {
            reviewerName: "Test-only",
            relationship: "Parent",
            text: "Test fixture",
            consentToPublish: false,
          },
          {
            reviewerName: "Test-only",
            relationship: "Parent",
            text: "Test fixture",
            consentToPublish: true,
            rating: 7,
          },
        ],
      }),
    );
    expect(sanitized.instructor).toBeUndefined();
    expect(sanitized.certificate).toBeUndefined();
    expect(sanitized.reviews).toHaveLength(1);
    expect(sanitized.reviews?.[0]?.rating).toBeUndefined();
  });

  it("uses search after two characters and applies OR within groups and AND across groups", () => {
    const livePython = testCourse({ id: "a", title: "Python Basics", gradeFrom: 4, gradeTo: 6 });
    const assistedPython = testCourse({
      id: "b",
      title: "Python Projects",
      learningModel: "Assisted Learning (AL)",
    });
    const liveWeb = testCourse({
      id: "c",
      title: "Web Basics",
      category: "Web Development",
      subject: "Web Development",
    });

    expect(matchesCatalogueFilters(livePython, { ...emptyCatalogueFilters, q: "p" })).toBe(true);
    expect(matchesCatalogueFilters(livePython, { ...emptyCatalogueFilters, q: "xyz" })).toBe(false);
    expect(
      matchesCatalogueFilters(livePython, {
        ...emptyCatalogueFilters,
        models: ["Live", "Assisted Learning (AL)"],
        grades: [5],
      }),
    ).toBe(true);
    expect(
      matchesCatalogueFilters(assistedPython, {
        ...emptyCatalogueFilters,
        models: ["Live", "Assisted Learning (AL)"],
        grades: [5],
      }),
    ).toBe(true);
    expect(
      matchesCatalogueFilters(liveWeb, { ...emptyCatalogueFilters, q: "python", models: ["Live"] }),
    ).toBe(false);
  });

  it("sorts by grade, level, alphabetic title, or display order", () => {
    const laterGrade = testCourse({ id: "b", title: "Second", gradeFrom: 8, displayOrder: 2 });
    const earlierGrade = testCourse({
      id: "a",
      title: "First",
      gradeFrom: 2,
      level: "Very Easy",
      displayOrder: 1,
    });
    expect(sortCourses([laterGrade, earlierGrade], "grade").map((course) => course.id)).toEqual([
      "a",
      "b",
    ]);
    expect(sortCourses([laterGrade, earlierGrade], "level").map((course) => course.id)).toEqual([
      "a",
      "b",
    ]);
    expect(sortCourses([laterGrade, earlierGrade], "az").map((course) => course.id)).toEqual([
      "a",
      "b",
    ]);
    expect(
      sortCourses([laterGrade, earlierGrade], "recommended").map((course) => course.id),
    ).toEqual(["a", "b"]);
  });

  it("round-trips shareable catalogue query state", () => {
    const filters = parseCatalogueSearch({
      q: "python",
      model: "Live,Assisted Learning (AL)",
      sort: "az",
    });
    expect(filters).toMatchObject({
      q: "python",
      models: ["Live", "Assisted Learning (AL)"],
      sort: "az",
    });
    expect(
      parseCatalogueSearch(validateCatalogueSearch(serializeCatalogueSearch(filters))),
    ).toEqual(filters);
  });

  it("normalizes approved filter values from shared URLs", () => {
    expect(
      parseCatalogueSearch({ model: " live ", level: "easy", language: "HINDI" }),
    ).toMatchObject({
      models: ["Live"],
      levels: ["Easy"],
      languages: ["Hindi"],
    });
    expect(
      parseCatalogueSearch({
        model: "ALTS (meaning to confirm)",
        level: "Not specified",
        grade: "5",
      }),
    ).toMatchObject({
      models: [],
      levels: [],
      grades: [],
    });
  });

  it("matches All Levels courses under each selected individual level", () => {
    const allLevels = testCourse({ level: "All Levels" });
    expect(matchesCatalogueFilters(allLevels, { ...emptyCatalogueFilters, levels: ["Hard"] })).toBe(
      true,
    );
    expect(
      matchesCatalogueFilters(allLevels, {
        ...emptyCatalogueFilters,
        levels: ["Not specified"],
      }),
    ).toBe(false);
  });

  it("matches values case-insensitively, ignores stray spaces and splits multi-value cells", () => {
    const course = testCourse({ language: " english ;  Hindi ", learningModel: "LIVE" });
    expect(getCourseFacetValues(course, "languages")).toEqual(["english", "Hindi"]);
    expect(
      matchesCatalogueFilters(course, { ...emptyCatalogueFilters, languages: ["English"] }),
    ).toBe(true);
    expect(
      matchesCatalogueFilters(course, { ...emptyCatalogueFilters, languages: ["Hindi"] }),
    ).toBe(true);
    expect(matchesCatalogueFilters(course, { ...emptyCatalogueFilters, models: ["Live"] })).toBe(
      true,
    );
  });

  it("builds options only from values courses use, without placeholders or duplicates", () => {
    const courses = [
      testCourse({ id: "1", language: "Hindi", level: "Not specified" }),
      testCourse({ id: "2", language: " hindi ", level: "Moderate" }),
      testCourse({
        id: "3",
        language: "English, Tamil",
        learningModel: "ALTS (meaning to confirm)",
      }),
    ];
    expect(getFacetOptions(courses, "languages")).toEqual(["English", "Hindi", "Tamil"]);
    expect(getFacetOptions(courses, "levels")).toEqual(["Easy", "Moderate"]);
    expect(getFacetOptions(courses, "models")).toEqual(["Live"]);
  });

  it("derives sidebar options from the real catalogue rows", () => {
    for (const [key, field] of [
      ["models", "learningModel"],
      ["levels", "level"],
      ["languages", "language"],
      ["programTypes", "programType"],
    ] as const) {
      const used = new Set(
        catalogueCourses
          .map((course) => String(course[field]))
          .filter((value) => !["Not specified", "ALTS (meaning to confirm)"].includes(value)),
      );
      expect(new Set(getFacetOptions(catalogueCourses, key))).toEqual(used);
    }
  });

  it("gives each option the same count as the cards shown when it is selected", () => {
    const filters = { ...emptyCatalogueFilters, programTypes: ["Course"] };
    for (const category of [undefined, "Python", "Games & Creative Coding"]) {
      for (const model of getFacetOptions(catalogueCourses, "models")) {
        const shown = catalogueCourses.filter((course) =>
          matchesCatalogueFilters(course, { ...filters, models: [model] }, category),
        );
        expect(getCatalogueOptionCount(catalogueCourses, filters, category, "models", model)).toBe(
          shown.length,
        );
      }
    }
  });

  it("counts each option after applying the other filter groups", () => {
    const courses = [
      testCourse({ id: "1", learningModel: "Live", gradeFrom: 4, gradeTo: 6 }),
      testCourse({ id: "2", learningModel: "Assisted Learning (AL)", gradeFrom: 6, gradeTo: 8 }),
      testCourse({ id: "3", learningModel: "Live", gradeFrom: 7, gradeTo: 9 }),
    ];
    const filters = { ...emptyCatalogueFilters, grades: [6] };
    expect(getCatalogueOptionCount(courses, filters, undefined, "models", "Live")).toBe(1);
    expect(
      getCatalogueOptionCount(courses, filters, undefined, "models", "Assisted Learning (AL)"),
    ).toBe(1);
    expect(getCatalogueOptionCount(courses, filters, undefined, "grades", 7)).toBe(2);
  });
});
