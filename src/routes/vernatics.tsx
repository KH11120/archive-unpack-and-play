import { createFileRoute } from "@tanstack/react-router";
import VernaticsPage from "@/site/pages/VernaticsPage";

import { useSiteNavigate } from "@/site/useSiteNavigate";

const TITLE = "Vernatics Robotics by APTCODER — Meet Your First Coding Robot";
const DESCRIPTION =
  "With Vernatics by APTCODER, children learn coding by programming a real robot: make it move, explore sensors, light up its LED matrix and watch their instructions come to life.";

export const Route = createFileRoute("/vernatics")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/videos/vernatics-poster.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VernaticsRoute,
});

function VernaticsRoute() {
  const navigate = useSiteNavigate();
  return <VernaticsPage navigate={navigate} />;
}
