import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { pageHref, pagePaths, sectionIds } from "@/site/page";
import { CODELY_PORTAL_URL } from "@/site/data/contact";
import { LanguageProvider } from "./LanguageContext";
import { KccJoinProvider } from "./kcc/KccContext";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SchoolPage from "../pages/SchoolPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

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

const column = (name: string) => within(screen.getByRole("heading", { name }).parentElement!);

describe("footer links", () => {
  it.each([
    ["Our Offerings", "Our Courses", "courses", undefined],
    ["Our Offerings", "Vernatics (Robotics)", "vernatics", undefined],
    ["Our Offerings", "C-NAT Olympiad", "cnat", undefined],
    ["Our Offerings", "School Partnership", "school", undefined],
    ["Company", "About Us", "about", undefined],
    ["Company", "Our Team", "about", sectionIds.meetOurTeam],
    ["Company", "Partner With Us", "contact", sectionIds.contactForm],
    ["Company", "Contact Us", "contact", undefined],
  ] as const)("%s → %s goes to %s %s", (col, label, page, section) => {
    const navigate = vi.fn();
    withProviders(<Footer navigate={navigate} />);
    const link = column(col).getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", pageHref(page, section));
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith(page, section);
  });

  it("opens the KCC registration popup from Kids Coding Community", () => {
    withProviders(<Footer navigate={vi.fn()} />);
    fireEvent.click(column("Our Offerings").getByRole("button", { name: "Kids Coding Community" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Become a KCC Member");
  });

  it("opens the legal pages and Codely in new tabs", () => {
    withProviders(<Footer navigate={vi.fn()} />);
    for (const [name, href] of [
      ["Privacy Policy", pagePaths.privacy],
      ["Terms & Conditions", pagePaths.terms],
      [/Codely Platform/, CODELY_PORTAL_URL],
    ] as const) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("has no placeholder links and no association line", () => {
    const { container } = withProviders(<Footer navigate={vi.fn()} />);
    for (const a of container.querySelectorAll("a"))
      expect(a.getAttribute("href"), a.textContent ?? "").not.toMatch(/^#?$/);
    expect(container.textContent).not.toContain("Supported & Associated with");
    expect(screen.queryByText("School Programs")).toBeNull();
  });
});

describe("navbar", () => {
  it("search opens the course search, Sign In opens the learning platform", () => {
    const navigate = vi.fn();
    withProviders(<Navbar currentPage="home" navigate={navigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Search courses" }));
    expect(navigate).toHaveBeenCalledWith("courses", sectionIds.courseSearch);
    const signIn = screen.getByRole("link", { name: "Sign In" });
    expect(signIn).toHaveAttribute("href", CODELY_PORTAL_URL);
    expect(signIn).toHaveAttribute("target", "_blank");
  });
});

describe("section targets and page buttons", () => {
  it("About has the Meet Our Team section and Contact has the contact form", () => {
    const { container, unmount } = withProviders(<AboutPage navigate={vi.fn()} />);
    expect(container.querySelector(`#${sectionIds.meetOurTeam}`)).toHaveTextContent(
      "Meet Our Team",
    );
    unmount();
    const contact = withProviders(<ContactPage navigate={vi.fn()} />);
    expect(contact.container.querySelector(`#${sectionIds.contactForm}`)).toHaveTextContent(
      "Send Us a Message",
    );
  });

  it("School page Partner with Us buttons go to the contact form", () => {
    const navigate = vi.fn();
    withProviders(<SchoolPage navigate={navigate} />);
    const buttons = screen.getAllByRole("button", { name: "Partner with Us →" });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      fireEvent.click(button);
      expect(navigate).toHaveBeenLastCalledWith("contact", sectionIds.contactForm);
    }
    expect(screen.queryByText(/View Detailed Process/)).toBeNull();
  });
});
