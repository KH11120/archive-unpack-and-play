import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pagePaths } from "@/site/page";
import CnatPage, { CNAT_REGISTER_URL } from "./CnatPage";

describe("C-NAT page", () => {
  it("lives at /c-nat with its own tab title", () => {
    expect(pagePaths.cnat).toBe("/c-nat");
    expect(readFileSync(resolve(__dirname, "../../routes/c-nat.tsx"), "utf8")).toContain(
      "APTCODER | C-NAT Coding Olympiad",
    );
  });

  it("shows the hero, the challenge, the three steps and the reasons to take part", () => {
    render(<CnatPage navigate={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("India’s Coding Olympiad");
    expect(screen.getByText("Think. Code. Compete. Get Recognised.")).toBeInTheDocument();
    for (const name of [
      "THINK",
      "CODE",
      "COMPETE",
      "Choose Your Track",
      "Take the Challenge",
      "Earn Recognition",
    ])
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    expect(screen.getByText("Showcase your skills and achievements.")).toBeInTheDocument();
  });

  it("registers through a WhatsApp chat with the team and scrolls to the challenge", () => {
    render(<CnatPage navigate={vi.fn()} />);
    const register = screen.getAllByRole("link", { name: "Register for C-NAT →" });
    expect(register).toHaveLength(2);
    for (const link of register) {
      expect(link).toHaveAttribute("href", CNAT_REGISTER_URL);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(decodeURIComponent(CNAT_REGISTER_URL)).toContain("register for C-NAT");
    const discover = screen.getByRole("link", { name: "Discover the Olympiad" });
    expect(document.getElementById(discover.getAttribute("href")!.slice(1))).toHaveTextContent(
      "More Than a Coding Competition",
    );
  });
});

describe("homepage and footer links", () => {
  it("send Explore C-NAT to /c-nat and turn Explore KCC into Join KCC", () => {
    const home = readFileSync(resolve(__dirname, "HomePage.tsx"), "utf8");
    expect(home).toMatch(/navigate\("cnat"\)\}[\s\S]{0,200}Explore C-NAT →/);
    expect(home).toMatch(/openKccJoin\}[\s\S]{0,200}Join KCC →/);
    expect(home).not.toContain("Explore KCC");
  });
});
