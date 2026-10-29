export type Page = "home" | "courses" | "about" | "school" | "contact"

export const pagePaths: Record<Page, "/" | "/courses" | "/about" | "/school" | "/contact"> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  school: "/school",
  contact: "/contact",
}
