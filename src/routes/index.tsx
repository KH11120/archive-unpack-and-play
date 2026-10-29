import { createFileRoute } from "@tanstack/react-router"
import HomePage from "@/site/pages/HomePage"
import CredibilityStrip from "@/site/components/CredibilityStrip"
import { useSiteNavigate } from "@/site/useSiteNavigate"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APTCODER — Coding & AI Classes for Kids" },
      { name: "description", content: "Live coding, AI and app development classes for school students, in English and Hindi." },
      { property: "og:title", content: "APTCODER — Coding & AI Classes for Kids" },
      { property: "og:description", content: "Live coding, AI and app development classes for school students, in English and Hindi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const navigate = useSiteNavigate()
    return <><CredibilityStrip /><HomePage navigate={navigate} /></>
  },
})
