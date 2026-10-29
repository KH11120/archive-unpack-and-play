import { createFileRoute } from "@tanstack/react-router"
import ContactPage from "@/site/pages/ContactPage"

import { useSiteNavigate } from "@/site/useSiteNavigate"

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — APTCODER" },
      { name: "description", content: "Get in touch with APTCODER to book a class or partner with us." },
      { property: "og:title", content: "Contact — APTCODER" },
      { property: "og:description", content: "Get in touch with APTCODER to book a class or partner with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const navigate = useSiteNavigate()
    return <><ContactPage navigate={navigate} /></>
  },
})
