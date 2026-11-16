export type Page =
  | "home"
  | "courses"
  | "about"
  | "school"
  | "contact"
  | "vernatics"
  | "cnat"
  | "privacy"
  | "terms"
  | "work";

export const pagePaths: Record<
  Page,
  | "/"
  | "/courses"
  | "/about"
  | "/school"
  | "/contact"
  | "/vernatics"
  | "/c-nat"
  | "/privacy-policy"
  | "/terms-and-conditions"
  | "/work-with-us"
> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  school: "/school",
  contact: "/contact",
  vernatics: "/vernatics",
  cnat: "/c-nat",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  work: "/work-with-us",
};

/**
 * Site navigation: go to a page, optionally to a section on it by its element id
 * (e.g. navigate("about", "meet-our-team") → /about#meet-our-team).
 */
export type SiteNavigate = (page: Page, section?: string) => void;

/** Section anchors that links point to; the matching elements carry these ids. */
export const sectionIds = {
  meetOurTeam: "meet-our-team",
  contactForm: "contact-form",
  courseSearch: "course-search",
} as const;

/** URL for a page, optionally with a section anchor. */
export const pageHref = (page: Page, section?: string) =>
  section ? `${pagePaths[page]}#${section}` : pagePaths[page];
