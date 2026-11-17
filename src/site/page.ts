import { assetUrl } from "./assetUrl";

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
  | "careers";

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
  | "/careers"
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
  careers: "/careers",
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
  openPositions: "open-positions",
} as const;

/** URL for a page (including the site base path), optionally with a section anchor. */
export const pageHref = (page: Page, section?: string) =>
  assetUrl(section ? `${pagePaths[page]}#${section}` : pagePaths[page]);
