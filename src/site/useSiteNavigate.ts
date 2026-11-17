import { useNavigate } from "@tanstack/react-router"
import { pagePaths, type SiteNavigate } from "./page"

export function useSiteNavigate(): SiteNavigate {
  const nav = useNavigate()
  return (page, section) => {
    if (section) {
      // Jump straight to the section (like a normal anchor link); its scroll-margin keeps it clear of the
      // sticky header. SectionScroller (root layout) repeats this once the page has rendered.
      nav({ to: pagePaths[page], hash: section, hashScrollIntoView: { behavior: "instant" } })
      // Already on this page: scroll now, so the link also works when the URL already ends in
      // this #section (the hash does not change, so nothing else would scroll).
      document.getElementById(section)?.scrollIntoView({ behavior: "instant", block: "start" })
      return
    }
    nav({ to: pagePaths[page] })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}
