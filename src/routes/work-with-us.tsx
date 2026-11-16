import { createFileRoute } from "@tanstack/react-router";
import WorkWithUsPage from "@/site/pages/WorkWithUsPage";

import { useSiteNavigate } from "@/site/useSiteNavigate";

const TITLE = "APTCODER | Work with Us";
const DESCRIPTION =
  "Interested in working with APTCODER? Educators, creators and partners can get in touch to help make technology education accessible to every child.";

export const Route = createFileRoute("/work-with-us")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WorkWithUsRoute,
});

function WorkWithUsRoute() {
  const navigate = useSiteNavigate();
  return <WorkWithUsPage navigate={navigate} />;
}
