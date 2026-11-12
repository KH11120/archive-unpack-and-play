import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  OFFICE_ADDRESS_LINES,
  OFFICE_MAPS_URL,
} from "@/site/data/contact";
import { LanguageProvider } from "./LanguageContext";
import Footer from "./Footer";
import SocialLinks from "./SocialLinks";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

const EXPECTED = {
  linkedin: "https://www.linkedin.com/company/aptcoder/",
  facebook: "https://www.facebook.com/aptcoder",
  instagram: "https://www.instagram.com/aptcoder/",
  googleplay: "https://play.google.com/store/apps/details?id=com.aptcoder&hl=en_IN",
};

const withLanguage = (ui: React.ReactNode) => render(<LanguageProvider>{ui}</LanguageProvider>);

function expectSocialLinks(container: HTMLElement) {
  const links = container.querySelectorAll<HTMLAnchorElement>("a[data-social]");
  expect(links).toHaveLength(4);
  for (const link of links) {
    expect(link.href).toBe(EXPECTED[link.dataset["social"] as keyof typeof EXPECTED]);
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
    expect(link.getAttribute("aria-label")).toMatch(/APTCODER/);
    expect(link.querySelector("svg")).not.toBeNull();
  }
}

describe("social links", () => {
  it("link the four official profiles with brand icons", () => {
    const { container } = render(<SocialLinks variant="brand" />);
    expectSocialLinks(container);
  });

  it("appear in the footer, About page and Contact page", () => {
    const navigate = vi.fn();
    expectSocialLinks(withLanguage(<Footer navigate={navigate} />).container);
    expectSocialLinks(withLanguage(<AboutPage navigate={navigate} />).container);
    expectSocialLinks(withLanguage(<ContactPage navigate={navigate} />).container);
  });
});

describe("contact details", () => {
  it("show the new phone number as a tel: link and the Noida address with a Maps link", () => {
    for (const ui of [<Footer navigate={vi.fn()} />, <ContactPage navigate={vi.fn()} />]) {
      const { container, unmount } = withLanguage(ui);
      const phone = within(container).getByRole("link", { name: CONTACT_PHONE });
      expect(phone.getAttribute("href")).toBe(CONTACT_PHONE_HREF);
      const maps = container.querySelector<HTMLAnchorElement>(`a[href="${OFFICE_MAPS_URL}"]`)!;
      for (const line of OFFICE_ADDRESS_LINES) expect(maps.textContent).toContain(line);
      expect(maps.target).toBe("_blank");
      unmount();
    }
    expect(CONTACT_PHONE_HREF).toBe("tel:+919318497057");
  });

  it("no longer mention the old number or Lucknow office in the source", () => {
    for (const file of ["Footer.tsx", "../pages/ContactPage.tsx"]) {
      const src = readFileSync(resolve(__dirname, file), "utf8");
      expect(src).not.toMatch(/98765|43210|IML-INCUBATOR|Prabandh|226013/);
    }
  });

  it("Contact page has the new headline and no category cards", () => {
    withLanguage(<ContactPage navigate={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Let’s Build What’s Next, Together.",
    );
    for (const card of [
      "For Parents & Students",
      "For Schools & Institutions",
      "General Inquiries",
    ]) {
      expect(screen.queryByText(card)).toBeNull();
    }
  });
});
