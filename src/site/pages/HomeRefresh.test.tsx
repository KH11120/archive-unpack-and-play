import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { aptcoderLogo } from "@/site/data/brand";
import { LanguageProvider } from "@/site/components/LanguageContext";
import Footer from "@/site/components/Footer";

const src = (path: string) => readFileSync(resolve(__dirname, "../..", path), "utf8");

describe("logo", () => {
  it("points at the logo file that exists, with its real size so it is never stretched", () => {
    expect(existsSync(resolve(__dirname, "../../../public", aptcoderLogo.src.slice(1)))).toBe(true);
    expect(aptcoderLogo.src).toBe("/images/brand/aptcoder_logo.png");
    expect([aptcoderLogo.width, aptcoderLogo.height]).toEqual([1463, 413]);
  });
});

describe("browser tab titles", () => {
  it.each([
    ["routes/index.tsx", "APTCODER | Home"],
    ["routes/about.tsx", "APTCODER | About Us"],
    ["routes/courses/index.tsx", "APTCODER | Courses"],
    ["routes/school.tsx", "APTCODER | For Schools"],
    ["routes/contact.tsx", "APTCODER | Contact Us"],
    ["routes/vernatics.tsx", "APTCODER | Vernatics Robotics"],
  ])("%s uses “%s”", (file, title) => {
    expect(src(file)).toContain(`"${title}"`);
  });
});

describe("homepage hero and final CTA", () => {
  const home = src("site/pages/HomePage.tsx");
  it("has the new card, subheading, description and a single hero CTA", () => {
    expect(home).toContain("AI &amp; Robotics Programs");
    expect(home).not.toContain("Robotics Learning Programs");
    expect(home).toMatch(/Explore Programs\s*<span aria-hidden="true"[^>]*>\s*→/);
    expect(home).toContain('className="enrolling-dot"');
    expect(home).not.toMatch(/Summer Coding Camp|Explore Camp|Explore How We Teach/);
    expect(home).toContain("AI, Robotics & Coding — Made Understandable for Every Child.");
    expect(home).toContain("Children explore AI, robotics and coding through a language");
    expect(home).toContain("Turn Curiosity Into Something Your Child Can Build.");
  });
});

describe("footer", () => {
  it("describes the full offering and lists Our Offerings with the Codely portal link", () => {
    const { container } = render(
      <LanguageProvider>
        <Footer navigate={vi.fn()} />
      </LanguageProvider>,
    );
    expect(container.textContent).toContain(
      "Helping children across India explore AI, robotics and coding in a language they understand best.",
    );
    const heading = screen.getByRole("heading", { name: "Our Offerings" });
    const list = within(heading.parentElement!);
    expect(list.getByRole("link", { name: "Our Courses" })).toBeInTheDocument();
    expect(list.queryByText("Coding Courses")).toBeNull();
    const codely = list.getByRole("link", { name: /Codely Platform/ });
    expect(codely).toHaveAttribute("href", "https://portal.aptcoder.com/dist/home.html");
    expect(codely).toHaveAttribute("target", "_blank");
    expect(codely).toHaveAttribute("rel", "noopener noreferrer");
  });
});
