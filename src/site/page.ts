export type Page =
  "home" | "courses" | "about" | "school" | "contact" | "vernatics" | "cnat" | "privacy" | "terms";

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
};
