import { describe, expect, it } from "vitest";
import {
  emptyCatalogueFilters,
  gradeOptions,
  formatCourseGrades,
  getCourseGrades,
  getCourseLevelLabel,
  getCatalogueOptionCount,
  languageOptions,
  learningModelOptions,
  subjectOptions,
  SUBJECT_BAR_ORDER,
  getCourseFacetValues,
  getFacetOptions,
  isPublishableCourse,
  matchesCatalogueFilters,
  catalogueCourses,
  workbookCourses,
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
  it("includes every active Course, Camp and Capstone from Course Master (2), one record each", () => {
    // Counts verified against docs/Course_Catalogue_Website.xlsx › Course Master (2).
    expect(workbookCourses).toHaveLength(113);
    const byType = (type: string) => workbookCourses.filter((c) => c.programType === type).length;
    expect([byType("Course"), byType("Camp"), byType("Capstone")]).toEqual([100, 8, 5]);
    expect(new Set(workbookCourses.map((course) => course.id)).size).toBe(113);
    expect(workbookCourses.every((course) => /^CRS-\d{3}$/.test(course.id))).toBe(true);
    expect(new Set(workbookCourses.map((course) => course.routeSlug)).size).toBe(113);
    expect(publishedCourses).toEqual([]);
    expect(workbookCourses.some((course) => course.offeringApproved)).toBe(false);
    expect(workbookCourses[0]).toMatchObject({
      id: "CRS-001",
      title: "Coding Fundamentals",
      subject: "Coding",
      programType: "Course",
      learningModel: "Not specified",
      language: "Not specified",
      grades: [5],
      ageGroup: "10-11 years",
      duration: "6 Months",
    });
    expect(workbookCourses.find((course) => course.id === "CRS-028")).toMatchObject({
      title: "Block-Based Coding Applications",
      subject: "Block Coding",
      language: "English",
      grades: [10, 11, 12],
      gradeFrom: 10,
      gradeTo: 12,
      duration: "3 Months",
    });
    expect(gradeOptions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(
      workbookCourses.some((course) =>
        Object.keys(course).some((key) =>
          ["publishStatus", "Content Notes", "Source Flags", "Owner", "LMS Record IDs"].includes(
            key,
          ),
        ),
      ),
    ).toBe(false);
  });

  it("keeps the Subject column as each course's subject, with no separate category", () => {
    const counts: Record<string, number> = {};
    for (const course of workbookCourses)
      counts[course.subject ?? ""] = (counts[course.subject ?? ""] ?? 0) + 1;
    expect(counts).toEqual({
      Coding: 60,
      "Block Coding": 9,
      "Web Development": 9,
      Python: 9,
      "Programming Fundamentals (Codely)": 5,
      "Game Development": 2,
      "Creative Coding (p5.js)": 1,
      Cryptography: 2,
      "Art & Music with Coding": 3,
      Blockchain: 2,
      "Data Science": 3,
      JavaScript: 1,
      "AI & ML": 3,
      "Vernatics (Robotics)": 2,
      "Cloud Computing": 1,
      "App Development": 1,
    });
    expect(workbookCourses.some((course) => "category" in course)).toBe(false);
  });

  it("offers the workbook's subjects, learning models and languages as filter options", () => {
    // Subject bar order: robotics and AI first, then emerging technologies, then the rest.
    expect(subjectOptions).toEqual([...SUBJECT_BAR_ORDER]);
    expect(SUBJECT_BAR_ORDER.slice(0, 3)).toEqual([
      "Vernatics (Robotics)",
      "AI & ML",
      "Blockchain",
    ]);
    // Every listed name is a real workbook subject, and every workbook subject is listed once.
    expect([...SUBJECT_BAR_ORDER].sort()).toEqual(
      [...new Set(workbookCourses.map((c) => c.subject!))].sort(),
    );
    expect(learningModelOptions).toEqual(["Live", "Self Learning (SL)"]);
    expect(languageOptions).toEqual(["English", "Hindi"]);
  });

  it("shows one grade or a grade range, and finds multi-grade courses under each grade", () => {
    const byId = (id: string) => workbookCourses.find((course) => course.id === id)!;
    expect(formatCourseGrades(byId("CRS-001"))).toBe("Grade 5");
    expect(formatCourseGrades(byId("CRS-028"))).toBe("Grade 10–12");
    expect(formatCourseGrades(byId("CRS-037"))).toBe("Grade 1–12");
    expect(formatCourseGrades(testCourse({ grades: [1, 3, 5] }))).toBe("Grades 1, 3, 5");
    expect(formatCourseGrades(testCourse({ grades: [], gradeFrom: null, gradeTo: null }))).toBe(
      undefined,
    );
    const grade11 = catalogueCourses.filter((course) =>
      matchesCatalogueFilters(course, { ...emptyCatalogueFilters, grades: [11] }),
    );
    expect(grade11.map((course) => course.id)).toEqual(
      expect.arrayContaining(["CRS-007", "CRS-028", "CRS-032", "CRS-037", "CRS-093"]),
    );
    expect(grade11.every((course) => getCourseGrades(course).includes(11))).toBe(true);
    expect(grade11.some((course) => course.id === "CRS-027")).toBe(false); // Grades 7–9
  });

  it("combines subject, learning model, grade and language filters", () => {
    const shown = catalogueCourses.filter((course) =>
      matchesCatalogueFilters(course, {
        ...emptyCatalogueFilters,
        subjects: ["Block Coding"],
        models: ["Self Learning (SL)"],
        grades: [5],
        languages: ["Hindi"],
      }),
    );
    expect(shown.map((course) => course.id)).toEqual(["CRS-091"]);
  });

  it("titles every course from the Display Name column", () => {
    expect(workbookCourses.every((c) => c.source?.titleFrom === "Display Name")).toBe(true);
  });

  it("labels the card level: Live Level for Live courses, difficulty for the rest", () => {
    expect(getCourseLevelLabel(testCourse({ learningModel: "Live", liveLevel: "Level 2" }))).toBe(
      "Level 2",
    );
    // A Live course without a Live Level shows nothing, even if a difficulty exists.
    expect(getCourseLevelLabel(testCourse({ learningModel: "Live", liveLevel: null }))).toBe(
      undefined,
    );
    for (const [level, label] of [
      ["Very Easy", "Very Easy"],
      ["Easy", "Easy"],
      ["Moderate", "Moderate"],
      ["Hard", "Hard"],
      ["Not specified", undefined],
    ] as const) {
      expect(
        getCourseLevelLabel(testCourse({ learningModel: "Assisted Learning (AL)", level })),
      ).toBe(label);
    }
    // Non-live courses use difficulty even when the workbook lists a Live Level.
    expect(
      getCourseLevelLabel(
        testCourse({ learningModel: "Self Learning (SL)", level: "Hard", liveLevel: "Level 1" }),
      ),
    ).toBe("Hard");
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

  it("sorts by grade, alphabetic title, or display order", () => {
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
      subject: "Python,Block Coding",
      model: "Live,Self Learning (SL)",
      grade: "11",
      language: "Hindi",
      sort: "az",
    });
    expect(filters).toMatchObject({
      q: "python",
      subjects: ["Python", "Block Coding"],
      models: ["Live", "Self Learning (SL)"],
      grades: [11],
      languages: ["Hindi"],
      sort: "az",
    });
    expect(
      parseCatalogueSearch(validateCatalogueSearch(serializeCatalogueSearch(filters))),
    ).toEqual(filters);
  });

  it("normalizes approved filter values from shared URLs", () => {
    expect(
      parseCatalogueSearch({
        subject: "block coding",
        model: " live ",
        level: "easy",
        language: "HINDI",
      }),
    ).toMatchObject({
      subjects: ["Block Coding"],
      models: ["Live"],
      languages: ["Hindi"],
    });
    // The router hands a single number over as a number, e.g. ?grade=11.
    expect(parseCatalogueSearch({ grade: 11 }).grades).toEqual([11]);
    // The old Level filter is gone; a shared ?level= link is simply ignored.
    expect(parseCatalogueSearch({ level: "Easy" })).not.toHaveProperty("levels");
    expect(
      parseCatalogueSearch({
        model: "ALTS (meaning to confirm)",
        subject: "Robotics",
        grade: "13",
      }),
    ).toMatchObject({
      models: [],
      subjects: [],
      grades: [],
    });
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
    expect(getFacetOptions(courses, "models")).toEqual(["Live"]);
  });

  it("derives sidebar options from the real catalogue rows", () => {
    for (const [key, field] of [
      ["subjects", "subject"],
      ["models", "learningModel"],
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
    for (const subjects of [[], ["Python"], ["Coding", "Block Coding"]]) {
      for (const model of getFacetOptions(catalogueCourses, "models")) {
        const withSubjects = { ...filters, subjects };
        const shown = catalogueCourses.filter((course) =>
          matchesCatalogueFilters(course, { ...withSubjects, models: [model] }),
        );
        expect(getCatalogueOptionCount(catalogueCourses, withSubjects, "models", model)).toBe(
          shown.length,
        );
      }
    }
  });

  it("counts each option after applying the other filter groups", () => {
    const courses = [
      testCourse({ id: "1", learningModel: "Live", grades: [4, 5, 6] }),
      testCourse({ id: "2", learningModel: "Assisted Learning (AL)", grades: [6, 7, 8] }),
      testCourse({ id: "3", learningModel: "Live", grades: [7, 8, 9] }),
    ];
    const filters = { ...emptyCatalogueFilters, grades: [6] };
    expect(getCatalogueOptionCount(courses, filters, "models", "Live")).toBe(1);
    expect(getCatalogueOptionCount(courses, filters, "models", "Assisted Learning (AL)")).toBe(1);
    expect(getCatalogueOptionCount(courses, filters, "grades", 7)).toBe(2);
  });
});
