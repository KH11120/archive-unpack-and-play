import { createFileRoute } from "@tanstack/react-router"
import CoursesPage from "@/site/pages/CoursesPage"

import { useSiteNavigate } from "@/site/useSiteNavigate"

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — APTCODER" },
      { name: "description", content: "Explore APTCODER coding, AI and app development courses by grade and level." },
      { property: "og:title", content: "Courses — APTCODER" },
      { property: "og:description", content: "Explore APTCODER coding, AI and app development courses by grade and level." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const navigate = useSiteNavigate()
    return <><CoursesPage navigate={navigate} /></>
  },
})
