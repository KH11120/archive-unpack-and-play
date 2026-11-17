import { createFileRoute } from "@tanstack/react-router";
import CareersPage from "@/site/pages/CareersPage";

import { useSiteNavigate } from "@/site/useSiteNavigate";

const TITLE = "APTCODER | Careers";
const DESCRIPTION =
  "Careers at APTCODER: see current openings and send us your resume to join the team making technology education accessible to every child.";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CareersRoute,
});

function CareersRoute() {
  const navigate = useSiteNavigate();
  return <CareersPage navigate={navigate} />;
}
