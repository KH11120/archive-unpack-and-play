import { assetUrl } from "@/site/assetUrl";
import type { CourseRecord } from "./courseCatalogue";

/**
 * Robo Star, Robo Orbit and Robo Galaxy, added by hand. They are NOT in
 * docs/Course_Catalogue_Website.xlsx (the workbook's own Vernatics courses come from Course
 * Master (2)), so they live here and are appended to the workbook courses in courseCatalogue.ts,
 * under the workbook's "Vernatics (Robotics)" subject. When they are added to the workbook,
 * delete this file.
 *
 * Only the title, subject and level were provided. Everything else is left unset or
 * "Not specified" (hidden on cards and never offered as a filter option). All three use the
 * Vernatics robot photo, the only Vernatics course imagery in the repository.
 */
/** The workbook's Vernatics subject (Course Master (2) › Subject). */
export const VERNATICS_SUBJECT = "Vernatics (Robotics)";

const vernaticsImage = assetUrl("/videos/vernatics-poster.jpg");

const levels = [
  { id: "VERN-001", title: "Robo Star", slug: "robo-star", levelLabel: "Simple Level" },
  { id: "VERN-002", title: "Robo Orbit", slug: "robo-orbit", levelLabel: "Moderate Level" },
  { id: "VERN-003", title: "Robo Galaxy", slug: "robo-galaxy", levelLabel: "Tough Level" },
];

export const vernaticsCourses: CourseRecord[] = levels.map(
  ({ id, title, slug, levelLabel }, i) => ({
    id,
    title,
    slug,
    routeSlug: slug,
    catalogueInclusion: "intended",
    offeringApproved: false,
    subject: VERNATICS_SUBJECT,
    programType: "Course",
    learningModel: "Not specified",
    level: "Not specified",
    levelLabel,
    liveLevel: null,
    language: "Not specified",
    lessons: null,
    gradeFrom: null,
    gradeTo: null,
    duration: null,
    shortDescription: null,
    overview: null,
    learningOutcomes: [],
    thumbnailReady: true,
    thumbnailUrl: vernaticsImage,
    // Listed after the workbook courses, from the simplest level to the toughest.
    displayOrder: 1000 + i,
  }),
);
