/**
 * Course categories that each homepage "Explore" link opens the Courses page with, selected in
 * the category strip. Names are the catalogue's own categories (courseCatalogue.generated.json).
 *
 * The catalogue has no robotics category or robotics courses, so robotics links point to the
 * coding categories children start from (Coding Foundations; Python for the Robotics tab).
 */
export const homeCourseCategories = {
  /** Hero "Enrolling Now" card: AI & Robotics Programs. */
  heroPrograms: ["AI & Data Science", "Coding Foundations"],
  /** "What Can Your Child Build?" tabs, by tab title. */
  projects: {
    Games: ["Games & Creative Coding", "Coding Foundations", "Python"],
    Websites: ["Web Development", "JavaScript"],
    Apps: ["App Development"],
    Robotics: ["Coding Foundations", "Python"],
    "Animation & Interactive Stories": ["Coding Foundations", "Games & Creative Coding"],
    "AI Projects": ["AI & Data Science"],
  } as Record<string, readonly string[]>,
  /** "More Possibilities" panel: all courses, no categories selected. */
  morePossibilities: [],
} as const;
