import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyCatalogueFilters, type CourseRecord } from "@/site/data/courseCatalogue";
import { FilterPanel } from "./CoursesPage";

const sampleCourses: CourseRecord[] = [
  {
    id: "one",
    title: "Live Python",
    slug: "live-python",
    routeSlug: "live-python",
    catalogueInclusion: "intended",
    offeringApproved: true,
    category: "Python",
    subject: "Python",
    programType: "Course",
    learningModel: "Live",
    level: "Easy",
    language: "English",
    lessons: 8,
    gradeFrom: 4,
    gradeTo: 6,
    duration: "12 weeks",
    shortDescription: "A test course.",
    overview: "Test overview.",
    learningOutcomes: ["Build", "Create", "Debug", "Share"],
    thumbnailReady: true,
    thumbnailUrl: null,
    enrolCta: "Book a Free Class",
  },
  {
    id: "two",
    title: "Assisted Python",
    slug: "assisted-python",
    routeSlug: "assisted-python",
    catalogueInclusion: "intended",
    offeringApproved: true,
    category: "Python",
    subject: "Python",
    programType: "Camp",
    learningModel: "Assisted Learning (AL)",
    level: "All Levels",
    language: "Hindi",
    lessons: 5,
    gradeFrom: 6,
    gradeTo: 8,
    duration: "5 weeks",
    shortDescription: "Another test course.",
    overview: "Test overview.",
    learningOutcomes: ["Build", "Create", "Debug", "Share"],
    thumbnailReady: true,
    thumbnailUrl: null,
    enrolCta: "Book a Free Class",
  },
];

describe("catalogue filter controls", () => {
  it("reports counts and sends checkbox state changes to its caller", () => {
    const onChange = vi.fn();
    render(
      <FilterPanel
        filters={emptyCatalogueFilters}
        category={undefined}
        courses={sampleCourses}
        onChange={onChange}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("checkbox", { name: /Live/ })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /Self Learning/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: /Live/ }));
    expect(onChange).toHaveBeenCalledWith({ ...emptyCatalogueFilters, models: ["Live"] });
  });

  it("omits unsupported Grade filters and keeps an active zero-count option removable", () => {
    const onChange = vi.fn();
    render(
      <FilterPanel
        filters={{ ...emptyCatalogueFilters, models: ["Self Learning (SL)"] }}
        category={undefined}
        courses={sampleCourses}
        onChange={onChange}
        onClear={vi.fn()}
      />,
    );

    expect(screen.queryByText("Grade", { selector: "summary" })).not.toBeInTheDocument();
    const selectedSelfLearning = screen.getByRole("checkbox", { name: /Self Learning/ });
    expect(selectedSelfLearning).toBeEnabled();
    fireEvent.click(selectedSelfLearning);
    expect(onChange).toHaveBeenCalledWith({
      ...emptyCatalogueFilters,
      models: [],
    });
  });

  it("wires Clear all to the page state reset", () => {
    const onClear = vi.fn();
    render(
      <FilterPanel
        filters={emptyCatalogueFilters}
        category={undefined}
        courses={sampleCourses}
        onChange={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
