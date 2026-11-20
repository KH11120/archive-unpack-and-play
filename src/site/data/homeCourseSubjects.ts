/**
 * Subjects that each homepage "Explore" link opens the Courses page with, selected in the
 * subject bar. Names are the workbook's own subjects (Course Master (2) › Subject).
 */
export const homeCourseSubjects = {
  /** Hero "Enrolling Now" card: AI & Robotics Programs. */
  heroPrograms: ["AI & ML", "Data Science", "Vernatics (Robotics)"],
  /** "What Can Your Child Build?" tabs, by tab title. */
  projects: {
    Games: ["Game Development", "Creative Coding (p5.js)"],
    Websites: ["Web Development", "JavaScript"],
    Apps: ["App Development"],
    Robotics: ["Vernatics (Robotics)"],
    "Animation & Interactive Stories": ["Creative Coding (p5.js)", "Art & Music with Coding"],
    "AI Projects": ["AI & ML", "Data Science"],
  } as Record<string, readonly string[]>,
  /** "More Possibilities" panel: all courses, no subjects selected. */
  morePossibilities: [],
} as const;
