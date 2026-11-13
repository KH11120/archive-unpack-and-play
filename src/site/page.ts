export type Page = "home" | "courses" | "about" | "school" | "contact" | "vernatics";

export const pagePaths: Record<
  Page,
  "/" | "/courses" | "/about" | "/school" | "/contact" | "/vernatics"
> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  school: "/school",
  contact: "/contact",
  vernatics: "/vernatics",
};
