import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { partnerSchools } from "@/site/data/schools";
import { LanguageProvider } from "@/site/components/LanguageContext";
import SchoolPage from "./SchoolPage";

const publicFile = (url: string) => resolve(__dirname, "../../../public", url.slice(1));
const renderPage = () =>
  render(
    <LanguageProvider>
      <SchoolPage navigate={vi.fn()} />
    </LanguageProvider>,
  );

describe("School page", () => {
  it("offers the sales kit as a request form, not a download", () => {
    renderPage();
    const buttons = screen.getAllByRole("button", { name: "Get School Sales Kit" });
    expect(buttons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/Download/)).toBeNull();

    fireEvent.click(buttons[0]!);
    const dialog = screen.getByRole("dialog", { name: "Get the School Sales Kit" });
    expect(
      within(dialog).getByRole("button", { name: /Email me the sales kit/ }),
    ).toBeInTheDocument();
  });

  it("shows exactly three programme highlights", () => {
    renderPage();
    const hero = within(screen.getByRole("heading", { level: 1 }).closest("section")!);
    for (const label of ["Structured Curriculum", "Teacher Enablement", "Hands-on Learning"]) {
      expect(hero.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText("Measurable Impact")).toBeNull();
  });

  it("shows the five real school logos and no placeholder names", () => {
    expect(partnerSchools).toHaveLength(5);
    for (const school of partnerSchools) {
      expect(existsSync(publicFile(school.logo)), school.logo).toBe(true);
      expect(existsSync(publicFile(school.originalLogo)), school.originalLogo).toBe(true);
    }
    renderPage();
    const section = screen.getByRole("heading", { name: "Trusted by Schools" }).closest("section")!;
    const logos = within(section).getAllByRole("img");
    expect(logos.map((img) => img.getAttribute("src"))).toEqual(partnerSchools.map((s) => s.logo));
    for (const placeholder of [
      "Ryan International School",
      "Mount Carmel School",
      "St. Xavier's School",
      "Army International School",
    ]) {
      expect(section.textContent).not.toContain(placeholder);
    }
  });
});
