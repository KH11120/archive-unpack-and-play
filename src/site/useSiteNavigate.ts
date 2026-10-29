import { useNavigate } from "@tanstack/react-router"
import { pagePaths, type Page } from "./page"

export function useSiteNavigate() {
  const nav = useNavigate()
  return (page: Page) => {
    nav({ to: pagePaths[page] })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}
