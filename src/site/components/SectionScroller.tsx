import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/**
 * Makes "#section" links dependable: whenever the URL's hash changes (a link from another page,
 * opening /about#meet-our-team directly, or refreshing), scroll that element into view once it
 * exists, below the sticky header (targets use a scroll-margin). A search box target is focused.
 */
export default function SectionScroller() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id) return;
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "instant", block: "start" });
        if (element instanceof HTMLInputElement) element.focus({ preventScroll: true });
        return;
      }
      // The target may be on a page that is still loading.
      if (tries++ < 20) timer = window.setTimeout(attempt, 100);
    };
    timer = window.setTimeout(attempt, 50);
    return () => window.clearTimeout(timer);
  }, [hash, pathname]);

  return null;
}
