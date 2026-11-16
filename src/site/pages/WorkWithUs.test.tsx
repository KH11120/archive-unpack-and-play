import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pageHref, pagePaths } from "@/site/page";
import { CONTACT_EMAIL, CONTACT_PHONE_HREF } from "@/site/data/contact";
import {
  catalogueCourses,
  emptyCatalogueFilters,
  matchesCatalogueFilters,
} from "@/site/data/courseCatalogue";
import { parseCatalogueSearch, serializeCatalogueSearch } from "@/site/data/catalogueSearch";
import { LanguageProvider } from "@/site/components/LanguageContext";
import { KccJoinProvider } from "@/site/components/kcc/KccContext";
import Footer from "@/site/components/Footer";
import Navbar from "@/site/components/Navbar";
import WorkWithUsPage, { WORK_WITH_US_EMAIL, WORK_WITH_US_WHATSAPP } from "./WorkWithUsPage";

vi.mock("@/site/api/kcc", () => ({ submitKccRegistration: vi.fn() }));
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  useLocation: () => ({ pathname: "/", hash: "" }),
}));

const withProviders = (ui: React.ReactNode) =>
  render(
    <LanguageProvider>
      <KccJoinProvider>{ui}</KccJoinProvider>
    </LanguageProvider>,
  );

describe("category multi-select", () => {
  it("reads and writes several categories in the URL as slugs", () => {
    const filters = parseCatalogueSearch({ category: "ai-data-science,python,not-a-category" });
    expect(filters.categories).toEqual(["AI & Data Science", "Python"]);
    expect(serializeCatalogueSearch(filters)).toEqual({ category: "ai-data-science,python" });
  });

  it("matches courses in any selected category, together with other filters", () => {
    const filters = { ...emptyCatalogueFilters, categories: ["AI & Data Science", "Python"] };
    const matched = catalogueCourses.filter((c) => matchesCatalogueFilters(c, filters));
    const expected = catalogueCourses.filter((c) =>
      ["AI & Data Science", "Python"].includes(c.category),
    );
    expect(matched).toEqual(expected);
    const liveOnly = catalogueCourses.filter((c) =>
      matchesCatalogueFilters(c, { ...filters, models: ["Live"] }),
    );
    expect(liveOnly.every((c) => c.learningModel === "Live")).toBe(true);
    expect(liveOnly.length).toBeLessThan(matched.length);
  });

  it("puts AI & Data Science first in the category strip", async () => {
    const { getCatalogueCategories } = await import("@/site/data/courseCatalogue");
    expect(getCatalogueCategories()[0]).toBe("AI & Data Science");
  });
});

describe("Work with Us", () => {
  it("is in the header between About and Contact Us", () => {
    const navigate = vi.fn();
    withProviders(<Navbar currentPage="home" navigate={navigate} />);
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.textContent?.trim())
      .filter((t) =>
        ["Courses", "School", "About", "Work with Us", "Contact Us"].includes(t ?? ""),
      );
    expect(labels.slice(0, 5)).toEqual([
      "Courses",
      "School",
      "About",
      "Work with Us",
      "Contact Us",
    ]);
    fireEvent.click(screen.getAllByRole("button", { name: "Work with Us" })[0]!);
    expect(navigate).toHaveBeenCalledWith("work");
  });

  it("is in the footer's Company column", () => {
    const navigate = vi.fn();
    withProviders(<Footer navigate={navigate} />);
    const company = within(screen.getByRole("heading", { name: "Company" }).parentElement!);
    const link = company.getByRole("link", { name: "Work with Us" });
    expect(link).toHaveAttribute("href", pageHref("work"));
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("work", undefined);
  });

  it("offers only the site's real contact channels and lists no openings", () => {
    const { container } = render(<WorkWithUsPage navigate={vi.fn()} />);
    expect(pagePaths.work).toBe("/work-with-us");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(WORK_WITH_US_EMAIL).toContain(`mailto:${CONTACT_EMAIL}`);
    expect(container.querySelector(`a[href="${WORK_WITH_US_EMAIL}"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="${WORK_WITH_US_WHATSAPP}"]`)).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(container.querySelector(`a[href="${CONTACT_PHONE_HREF}"]`)).not.toBeNull();
    expect(container.textContent).not.toMatch(/vacanc|opening|salary|benefit|apply now/i);
  });
});
