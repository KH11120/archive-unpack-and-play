import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import CourseCard from "./CourseCard";
import type { CourseRecord } from "@/site/data/courseCatalogue";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string;
    params?: { slug: string };
    children?: ReactNode;
  }) => (
    <a href={to === "/courses/$slug" ? `/courses/${params?.slug ?? ""}` : to} {...props}>
      {children}
    </a>
  ),
}));

function fixture(overrides: Partial<CourseRecord> = {}): CourseRecord {
  return {
    id: "test-course",
    title: "Approved test course",
    slug: "approved-test-course",
    routeSlug: "approved-test-course",
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
    shortDescription: "A test description.",
    overview: "Test-only overview.",
    learningOutcomes: ["Build", "Create", "Debug", "Share"],
    thumbnailReady: true,
    thumbnailUrl: "/images/courses/approved-test-course.webp",
    enrolCta: "Book a Free Class",
    ...overrides,
  };
}

describe("CourseCard", () => {
  it("shows approved metadata and links the full card to its course detail", () => {
    render(<CourseCard course={fixture({ programType: "Camp" })} />);

    expect(screen.getByRole("link", { name: "View course: Approved test course" })).toHaveAttribute(
      "href",
      "/courses/approved-test-course",
    );
    expect(screen.getByRole("img", { name: "Approved test course" })).toBeInTheDocument();
    expect(screen.getByText("Grades 4-6")).toBeInTheDocument();
    expect(screen.getByText("Camp")).toBeInTheDocument();
    expect(screen.getByText("8 lessons")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("View Course")).toBeInTheDocument();
  });

  it("uses a neutral fallback when the optional thumbnail file is absent", () => {
    render(<CourseCard course={fixture({ thumbnailUrl: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View course: Approved test course" }),
    ).toBeInTheDocument();
  });

  it("keeps sparse workbook records useful without showing unresolved placeholder values", () => {
    render(
      <CourseCard
        course={fixture({
          gradeFrom: null,
          gradeTo: null,
          level: "Not specified",
          language: "Not specified",
          learningModel: "ALTS (meaning to confirm)",
          duration: null,
          lessons: null,
          shortDescription: null,
          thumbnailUrl: null,
        })}
      />,
    );

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Approved test course")).toBeInTheDocument();
    expect(screen.queryByText("Not specified")).not.toBeInTheDocument();
    expect(screen.queryByText("ALTS (meaning to confirm)")).not.toBeInTheDocument();
    expect(screen.queryByText(/lessons$/)).not.toBeInTheDocument();
    expect(screen.getByText("View Course")).toBeInTheDocument();
  });
});
