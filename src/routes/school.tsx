import { createFileRoute } from "@tanstack/react-router"
import SchoolPage from "@/site/pages/SchoolPage"

import { useSiteNavigate } from "@/site/useSiteNavigate"

export const Route = createFileRoute("/school")({
  head: () => ({
    meta: [
      { title: "APTCODER | For Schools" },
      { name: "description", content: "Bring APTCODER's coding and AI curriculum to your school." },
      { property: "og:title", content: "APTCODER | For Schools" },
      { property: "og:description", content: "Bring APTCODER's coding and AI curriculum to your school." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const navigate = useSiteNavigate()
    return <><SchoolPage navigate={navigate} /></>
  },
})
