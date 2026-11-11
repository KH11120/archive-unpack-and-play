import { existsSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CredibilityStrip from "@/site/components/CredibilityStrip";
import { aptcoderLogo } from "./brand";
import { partners } from "./partners";

const publicDir = path.resolve(__dirname, "../../../public");

describe("brand and partner assets", () => {
  it("lists all 12 partners once, in order, with web-ready logo files on disk", () => {
    expect(partners.map((partner) => partner.name)).toEqual([
      "FITT, IIT Delhi",
      "Microsoft",
      "IIM Lucknow EIC",
      "IIT Ropar",
      "Kotak BizLabs",
      "DST",
      "EXIM Bank",
      "Cyran AI Solutions",
      "SIDBI",
      "NSDC",
      "AICTE",
      "Startup Punjab",
    ]);
    expect(partners.map((partner) => partner.order)).toEqual(partners.map((_, index) => index + 1));
    for (const partner of partners) {
      expect(partner.src).toMatch(/\.png$/);
      expect(existsSync(path.join(publicDir, partner.src)), partner.src).toBe(true);
      expect(partner.width).toBeGreaterThan(0);
      expect(partner.height).toBeGreaterThan(0);
    }
    expect(existsSync(path.join(publicDir, aptcoderLogo.src))).toBe(true);
  });

  it("homepage strip shows logos only, with the looping copy hidden from screen readers", () => {
    const { container } = render(<CredibilityStrip />);
    const section = within(container);
    expect(section.getAllByRole("img")).toHaveLength(partners.length);
    expect(container.querySelectorAll("img")).toHaveLength(partners.length * 2);
    for (const partner of partners) {
      expect(screen.getByAltText(partner.fullName)).toHaveAttribute("src", partner.src);
      expect(section.queryByText(partner.name)).not.toBeInTheDocument();
    }
  });
});
