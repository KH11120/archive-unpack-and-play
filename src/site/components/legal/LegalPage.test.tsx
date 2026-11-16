import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pagePaths } from "@/site/page";
import { privacyPolicy } from "@/site/data/legal/privacyPolicy";
import { termsAndConditions } from "@/site/data/legal/termsAndConditions";
import { LEGAL_LAST_UPDATED } from "@/site/data/legal/types";
import { LanguageProvider } from "@/site/components/LanguageContext";
import Footer from "@/site/components/Footer";
import LegalPage from "./LegalPage";

const PRIVACY_SECTIONS = [
  "Introduction",
  "Definition of Personal Data",
  "Collection of Information",
  "Types of Information We Collect",
  "Usage and Retention of Information",
  "Community and Publicly Shared Information",
  "Sharing and Disclosure of Personal Information",
  "Security of Personal Information",
  "Cookies and Tracking Technologies",
  "Third-Party Websites and Links",
  "Third-Party Service Providers",
  "Your Choices and Communication Preferences",
  "Ownership of Intellectual Property",
  "Consent",
  "Conditions of Use",
  "Grievance Officer",
  "Privileged and Exclusive Services",
  "Disclosure of Information",
  "Governing Law and Jurisdiction",
  "General Provisions",
];

const TERMS_SECTIONS = [
  "Introduction",
  "Definitions",
  "Terms of Service",
  "GDPR Compliance Statement",
  "Eligibility",
  "Usage of Website, Applications and Services",
  "Account Registration",
  "Course Listings",
  "No Endorsement",
  "Payment Terms",
  "Cancellations and Refunds",
  "Taxes",
  "User Conduct",
  "Child Safety Policy",
  "Privacy",
  "Intellectual Property Ownership and Rights",
  "Additional Terms",
  "Application License",
  "APTCODER Content and Member Content License",
  "Member Content",
  "Hyperlinks",
  "Feedback",
  "Copyright Policy",
  "Termination, Suspension and Other Measures",
  "Disclaimers",
  "Limitation of Liability",
  "Indemnification",
  "Entire Agreement",
  "Notices",
  "Governing Law and Jurisdiction",
  "No Waiver",
  "Miscellaneous",
];

const allText = (doc: typeof privacyPolicy) =>
  doc.sections
    .flatMap((s) => s.blocks)
    .map((b) => ("text" in b ? b.text : b.items.join(" ")))
    .join(" ");

describe("legal content", () => {
  it("has the requested sections, in order, with unique anchors", () => {
    expect(privacyPolicy.sections.map((s) => s.title)).toEqual(PRIVACY_SECTIONS);
    expect(termsAndConditions.sections.map((s) => s.title)).toEqual(TERMS_SECTIONS);
    for (const doc of [privacyPolicy, termsAndConditions]) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("keeps key provisions from the original documents", () => {
    const privacy = allText(privacyPolicy);
    for (const phrase of [
      "SNN EDUWORLD Private Limited",
      "Razorpay, CCAvenue, PayUbiz",
      "last four digits of your card",
      "European Economic Area and Switzerland to India",
      "doctrine of uberrima fides",
      "The seat and place of arbitration shall be Noida",
      "capture images (followed by analysis)",
    ])
      expect(privacy).toContain(phrase);
    const terms = allText(termsAndConditions);
    for (const phrase of [
      "3 F/166, 2nd Floor, NIT Metro Sanaik Colony Road, Faridabad",
      "within 7 working days",
      "Any access to or use of the Site, Application or Services by anyone under 18 years of age is expressly prohibited",
      "pro rata to the unconsumed portion of the tuition",
      "three (3) month period",
      "The seat of such arbitration shall be Bangalore",
      "30 days’ notice",
    ])
      expect(terms).toContain(phrase);
  });

  it("keeps the supplied text without added review notes", () => {
    expect(allText(privacyPolicy)).toMatch(
      /you explicitly agree not to sue us for any data breach/,
    );
    for (const doc of [privacyPolicy, termsAndConditions])
      expect(doc.sections.flatMap((s) => s.blocks).map((b) => b.type)).not.toContain("note");
    expect(termsAndConditions.intro).toContain("Effective 24th February 2021");
  });

  it("gives the Child Safety Policy its required subheadings", () => {
    const childSafety = termsAndConditions.sections.find((s) => s.id === "child-safety")!;
    const headings = childSafety.blocks.filter((b) => b.type === "h3").map((b) => b.text);
    expect(headings).toEqual(
      expect.arrayContaining([
        "Expected behaviour and actions",
        "Prohibited behaviour and actions",
        "Reporting misconduct",
        "Children’s privacy",
      ]),
    );
  });
});

describe("LegalPage", () => {
  it.each([privacyPolicy, termsAndConditions])(
    "renders $title as a simple page: logo, heading, date and every section",
    (doc) => {
      const { container } = render(<LegalPage document={doc} />);
      expect(screen.getByRole("heading", { level: 1, name: doc.title })).toBeInTheDocument();
      expect(screen.getByAltText(/APTCODER/)).toHaveAttribute(
        "src",
        "/images/brand/aptcoder_logo.png",
      );
      expect(container.textContent).toContain(`Last updated: ${LEGAL_LAST_UPDATED}`);
      expect(container.querySelectorAll("[data-legal-section]")).toHaveLength(doc.sections.length);
      if (doc === privacyPolicy)
        expect(container.querySelector('a[href="mailto:hello@aptcoder.com"]')).not.toBeNull();
      expect(container.textContent).not.toMatch(/Review note|Draft for legal review/);
    },
  );
});

describe("routes and footer", () => {
  it("serves both pages at their own paths with their own tab titles", () => {
    expect(pagePaths.privacy).toBe("/privacy-policy");
    expect(pagePaths.terms).toBe("/terms-and-conditions");
    for (const [file, title] of [
      ["privacy-policy.tsx", "APTCODER | Privacy Policy"],
      ["terms-and-conditions.tsx", "APTCODER | Terms & Conditions"],
    ] as const) {
      const route = readFileSync(resolve(__dirname, "../../../routes", file), "utf8");
      expect(route).toContain(title);
      expect(route).not.toContain("noindex");
    }
  });

  it("links both pages from the footer's Company column, opening in a new tab", () => {
    const navigate = vi.fn();
    render(
      <LanguageProvider>
        <Footer navigate={navigate} />
      </LanguageProvider>,
    );
    const company = within(screen.getByRole("heading", { name: "Company" }).parentElement!);
    for (const [name, page] of [
      ["Privacy Policy", "privacy"],
      ["Terms & Conditions", "terms"],
    ] as const) {
      const link = company.getByRole("link", { name });
      expect(link).toHaveAttribute("href", pagePaths[page]);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(company.queryByText("Terms of Service")).toBeNull();
  });
});
