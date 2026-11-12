import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  testimonials,
  type QuoteTestimonial,
  type VideoTestimonial,
} from "@/site/data/testimonials";
import TestimonialsSection from "./TestimonialsSection";

const publicFile = (url: string) =>
  resolve(__dirname, "../../../../public", decodeURIComponent(url.slice(1)));
const videos = testimonials.filter((t): t is VideoTestimonial => t.type === "video");
const quotes = testimonials.filter((t): t is QuoteTestimonial => t.type === "quote");
const card = (container: HTMLElement, id: string) =>
  container.querySelector<HTMLElement>(`[data-testimonial-id="${id}"]`)!;

describe("testimonial data", () => {
  it("has two video and two written testimonials with unique ids", () => {
    expect(videos).toHaveLength(2);
    expect(quotes).toHaveLength(2);
    expect(new Set(testimonials.map((t) => t.id)).size).toBe(testimonials.length);
  });

  it("points at video and poster files that exist", () => {
    for (const video of videos) {
      expect(existsSync(publicFile(video.video)), video.video).toBe(true);
      expect(existsSync(publicFile(video.poster)), video.poster).toBe(true);
    }
  });
});

describe("Voices from the APTCODER Ecosystem", () => {
  it("renders one card per testimonial with its label", () => {
    const { container } = render(<TestimonialsSection />);
    for (const testimonial of testimonials) {
      expect(
        within(card(container, testimonial.id)).getByText(testimonial.label),
      ).toBeInTheDocument();
    }
  });

  it("does not load any video until one is played", () => {
    const { container } = render(<TestimonialsSection />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByTestId("testimonial-video")).toBeNull();
  });

  it.each(videos)("plays “$label” in a modal with native controls and no autoplay", (video) => {
    const { container } = render(<TestimonialsSection />);
    fireEvent.click(card(container, video.id));
    const dialog = screen.getByRole("dialog");
    const player = within(dialog).getByTestId("testimonial-video") as HTMLVideoElement;
    expect(player.getAttribute("src")).toBe(video.video);
    expect(player.controls).toBe(true);
    expect(player.autoplay).toBe(false);
    expect(player.hasAttribute("playsinline")).toBe(true);
    expect(document.querySelectorAll("video")).toHaveLength(1);

    fireEvent.click(within(dialog).getByRole("button", { name: "Close video" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.querySelector("video")).toBeNull();
  });

  it("closes the video on Escape", () => {
    const { container } = render(<TestimonialsSection />);
    fireEvent.click(card(container, videos[0]!.id));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each(quotes)("shows the written testimonial “$label”", (quote) => {
    const { container } = render(<TestimonialsSection />);
    const el = card(container, quote.id);
    expect(within(el).getByText(quote.quote)).toBeInTheDocument();
    if (quote.attributionApproved) {
      expect(within(el).getByText(quote.name)).toBeInTheDocument();
    } else {
      // Unapproved: neither the name nor the role appears anywhere on the page.
      expect(container.textContent).not.toContain(quote.name);
      expect(within(el).getByText(quote.anonymousAttribution)).toBeInTheDocument();
    }
  });
});
