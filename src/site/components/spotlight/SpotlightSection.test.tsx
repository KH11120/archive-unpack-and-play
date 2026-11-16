import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { newsEntries } from "@/site/data/news";
import SpotlightSection from "./SpotlightSection";

const publicFile = (url: string) =>
  resolve(__dirname, "../../../../public", decodeURIComponent(url.slice(1)));

/** Cards in the first (accessible) set; the second set is a hidden duplicate for the loop. */
function visibleCards(container: HTMLElement) {
  const groups = container.querySelectorAll(".spotlight-strip-group");
  return [...groups[0]!.querySelectorAll<HTMLElement>("[data-news-id]")];
}

describe("news data", () => {
  it("has six uniquely identified entries", () => {
    expect(newsEntries).toHaveLength(6);
    expect(new Set(newsEntries.map((entry) => entry.id)).size).toBe(6);
  });

  it("points only at files that exist", () => {
    for (const entry of newsEntries) {
      if (entry.thumbnail)
        expect(existsSync(publicFile(entry.thumbnail)), entry.thumbnail).toBe(true);
      if (entry.type === "image")
        expect(existsSync(publicFile(entry.fullImage)), entry.fullImage).toBe(true);
    }
  });

  it("gives online entries https article links and image entries a full-size image", () => {
    for (const entry of newsEntries) {
      if (entry.type === "online") expect(entry.articleUrl).toMatch(/^https:\/\//);
      else expect(entry.fullImage).toMatch(/^\/News\//);
    }
  });
});

describe("APTCODER in the Spotlight section", () => {
  it("shows the eyebrow, heading and one card per entry, duplicated once for a seamless loop", () => {
    const { container } = render(<SpotlightSection />);
    expect(screen.getByText("APTCODER IN THE SPOTLIGHT")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "From India to the World" }),
    ).toBeInTheDocument();
    expect(visibleCards(container)).toHaveLength(newsEntries.length);
    const copy = container.querySelectorAll(".spotlight-strip-group")[1]!;
    expect(copy).toHaveAttribute("aria-hidden", "true");
    for (const card of copy.querySelectorAll("[data-news-id]")) {
      expect(card).toHaveAttribute("tabindex", "-1");
    }
  });

  it("has Previous/Next arrows that move one card either way, from any position", () => {
    const { container } = render(<SpotlightSection />);
    const strip = container.querySelector<HTMLElement>("#spotlight-strip")!;
    // jsdom has no layout: give the cards and one set of them real widths.
    for (const item of container.querySelectorAll<HTMLElement>(".spotlight-strip-item"))
      Object.defineProperty(item, "offsetWidth", { value: 300 });
    for (const group of container.querySelectorAll<HTMLElement>(".spotlight-strip-group"))
      Object.defineProperty(group, "offsetWidth", { value: 1800 });
    const scrollTo = vi.fn();
    strip.scrollTo = scrollTo as unknown as typeof strip.scrollTo;

    const previous = screen.getByRole("button", { name: "Previous article" });
    const next = screen.getByRole("button", { name: "Next article" });
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();

    strip.scrollLeft = 600;
    fireEvent.click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 900, behavior: "smooth" });

    strip.scrollLeft = 600;
    fireEvent.click(previous);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: "smooth" });

    // From the very first card, "previous" continues seamlessly onto the last one.
    strip.scrollLeft = 0;
    fireEvent.click(previous);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 1500, behavior: "smooth" });
  });

  it.each(newsEntries.filter((entry) => entry.type === "online"))(
    "opens $publicationName in a new tab at its original URL",
    (entry) => {
      const { container } = render(<SpotlightSection />);
      const card = visibleCards(container).find((el) => el.dataset["newsId"] === entry.id)!;
      expect(card.tagName).toBe("A");
      expect(card).toHaveAttribute("href", entry.type === "online" ? entry.articleUrl : "");
      expect(card).toHaveAttribute("target", "_blank");
      expect(card).toHaveAttribute("rel", "noopener noreferrer");
      expect(within(card).getByText("Read Article")).toBeInTheDocument();
    },
  );

  it.each(newsEntries.filter((entry) => entry.type === "image"))(
    "opens “$headline” in the press viewer with its own full-size image",
    (entry) => {
      const { container } = render(<SpotlightSection />);
      const card = visibleCards(container).find((el) => el.dataset["newsId"] === entry.id)!;
      expect(card.tagName).toBe("BUTTON");
      fireEvent.click(card);
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("heading", { name: entry.headline })).toBeInTheDocument();
      expect(within(dialog).getByRole("img")).toHaveAttribute(
        "src",
        entry.type === "image" ? entry.fullImage : "",
      );
      fireEvent.click(within(dialog).getByRole("button", { name: "Close viewer" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );

  it("zooms in, out and resets within limits", () => {
    const { container } = render(<SpotlightSection />);
    fireEvent.click(visibleCards(container).find((el) => el.tagName === "BUTTON")!);
    const dialog = screen.getByRole("dialog");
    const level = within(dialog).getByTestId("zoom-level");
    const zoomIn = within(dialog).getByRole("button", { name: "Zoom in" });
    const zoomOut = within(dialog).getByRole("button", { name: "Zoom out" });
    const reset = within(dialog).getByRole("button", { name: "Reset zoom" });

    expect(level).toHaveTextContent("100%");
    expect(zoomOut).toBeDisabled();
    expect(reset).toBeDisabled();
    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    expect(level).toHaveTextContent("200%");
    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    expect(level).toHaveTextContent("300%");
    expect(zoomIn).toBeDisabled();
    fireEvent.click(zoomOut);
    expect(level).toHaveTextContent("250%");
    fireEvent.click(reset);
    expect(level).toHaveTextContent("100%");
  });

  it("closes the viewer with Escape", () => {
    const { container } = render(<SpotlightSection />);
    fireEvent.click(visibleCards(container).find((el) => el.tagName === "BUTTON")!);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
