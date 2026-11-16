import { createFileRoute } from "@tanstack/react-router";
import CnatPage from "@/site/pages/CnatPage";

import { useSiteNavigate } from "@/site/useSiteNavigate";

const TITLE = "APTCODER | C-NAT Coding Olympiad";
const DESCRIPTION =
  "C-NAT is India’s Coding Olympiad by APTCODER: choose your track, take the challenge and earn recognition. Think. Code. Compete. Get Recognised.";

export const Route = createFileRoute("/c-nat")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CnatRoute,
});

function CnatRoute() {
  const navigate = useSiteNavigate();
  return <CnatPage navigate={navigate} />;
}
