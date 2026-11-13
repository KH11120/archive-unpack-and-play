import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pagePaths } from "@/site/page";
import VernaticsPage from "./VernaticsPage";

class IdleObserver {
  observe() {}
  disconnect() {}
}

describe("Vernatics page", () => {
  afterEach(() => vi.unstubAllGlobals());

  const renderPage = () => {
    vi.stubGlobal("IntersectionObserver", IdleObserver);
    const navigate = vi.fn();
    render(<VernaticsPage navigate={navigate} />);
    return navigate;
  };

  it("is registered at /vernatics", () => {
    expect(pagePaths.vernatics).toBe("/vernatics");
  });

  it("shows the hero with the highlighted heading and the robot video", () => {
    renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Meet Your First Coding Robot.");
    expect(h1.querySelector("span")).toHaveTextContent("Coding Robot.");
    const video = screen.getByTestId("vernatics-video") as HTMLVideoElement;
    expect(video.muted && video.loop && video.hasAttribute("playsinline")).toBe(true);
  });

  it("has working buttons", () => {
    const navigate = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start Learning →" }));
    expect(navigate).toHaveBeenLastCalledWith("contact");
    fireEvent.click(screen.getByRole("button", { name: "Explore APTCODER Classes →" }));
    expect(navigate).toHaveBeenLastCalledWith("courses");
    const features = screen.getByRole("link", { name: "Explore Its Features" });
    const target = features.getAttribute("href")!.slice(1);
    expect(document.getElementById(target)).toHaveTextContent("What Can Children Explore?");
  });

  it("shows the three experience cards, four explore cards and three steps", () => {
    renderPage();
    for (const text of [
      "CODE",
      "CONTROL",
      "CREATE",
      "Make It Move",
      "See It Sense",
      "Bring It to Life",
      "Experiment & Discover",
      "Discover",
      "Program",
      "Experiment",
    ]) {
      expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
    }
  });
});

describe("homepage Vernatics panel", () => {
  it("links Explore Vernatics to the new page and drops Watch it in action", () => {
    const home = readFileSync(resolve(__dirname, "HomePage.tsx"), "utf8");
    expect(home).toMatch(/navigate\("vernatics"\)\}[\s\S]{0,200}Explore Vernatics →/);
    expect(home).not.toContain("Watch it in action");
  });
});
