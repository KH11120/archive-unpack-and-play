import { createFileRoute } from "@tanstack/react-router"
import AboutPage from "@/site/pages/AboutPage"

import { useSiteNavigate } from "@/site/useSiteNavigate"

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — APTCODER" },
      { name: "description", content: "Learn about APTCODER's mission to teach kids coding and future-ready skills." },
      { property: "og:title", content: "About — APTCODER" },
      { property: "og:description", content: "Learn about APTCODER's mission to teach kids coding and future-ready skills." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const navigate = useSiteNavigate()
    return <><AboutPage navigate={navigate} /></>
  },
})
