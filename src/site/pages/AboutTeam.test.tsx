import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { team } from "@/site/data/team";
import { LanguageProvider } from "@/site/components/LanguageContext";
import AboutPage from "./AboutPage";

const publicFile = (url: string) => resolve(__dirname, "../../../public", url.slice(1));

describe("Meet Our Team", () => {
  it("lists only the two leaders, with photos that exist", () => {
    expect(team.map((m) => m.name)).toEqual(["Mr. Gaurav Agrawal", "Ashish Bhatt"]);
    for (const member of team) {
      expect(existsSync(publicFile(member.photo)), member.photo).toBe(true);
      expect(existsSync(publicFile(member.originalPhoto)), member.originalPhoto).toBe(true);
    }
  });

  it("renders both cards and no placeholder members, stock photos or directory button", () => {
    render(
      <LanguageProvider>
        <AboutPage navigate={vi.fn()} />
      </LanguageProvider>,
    );
    const section = screen.getByRole("heading", { name: "Meet Our Team" }).closest("section")!;
    const cards = within(section).getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    team.forEach((member, i) => {
      const card = within(cards[i]!);
      expect(card.getByRole("heading", { name: member.name })).toBeInTheDocument();
      expect(card.getByText(member.role)).toBeInTheDocument();
      expect(card.getByText(member.description)).toBeInTheDocument();
      expect(card.getByRole("img").getAttribute("src")).toBe(member.photo);
    });
    for (const old of ["Priya Sharma", "Rahul Verma", "Neha Singh", "Gaurav Aggarwal"]) {
      expect(section.textContent).not.toContain(old);
    }
    expect(section.querySelector('img[src*="unsplash"]')).toBeNull();
    expect(within(section).queryByText(/View All Team Members/)).toBeNull();
  });
});
