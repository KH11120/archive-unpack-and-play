import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  LanguageProvider,
  LANGUAGE_STORAGE_KEY,
  useLanguage,
} from "@/site/components/LanguageContext";
import HindiTranslator from "./HindiTranslator";
import { toHindi } from "./translate";

function Toggle() {
  const { setLanguage } = useLanguage();
  return (
    <>
      <button onClick={() => setLanguage("en")}>to-en</button>
      <button onClick={() => setLanguage("hi")}>to-hi</button>
    </>
  );
}

function Page() {
  return (
    <LanguageProvider>
      <Toggle />
      <main>
        <h1>Explore Our Courses</h1>
        <p>
          Showing <span>39</span> courses
        </p>
        <input placeholder="Search courses..." />
        <select defaultValue="">
          <option value="">Select class</option>
          <option>Class 6</option>
        </select>
        <h2 data-translate="no">App Development</h2>
        <p>Something not in the dictionary</p>
      </main>
      <HindiTranslator />
    </LanguageProvider>
  );
}

const flush = () => act(async () => new Promise((r) => setTimeout(r, 0)));

describe("Hindi translation", () => {
  afterEach(() => localStorage.clear());

  it("translates exact text, patterns and keeps surrounding spaces", () => {
    expect(toHindi("Explore Our Courses")).toBe("हमारे कोर्स देखें");
    expect(toHindi(" Showing ")).toBe(" कुल ");
    expect(toHindi("12 lessons")).toBe("12 पाठ");
    expect(toHindi("Python Courses")).toBe("Python कोर्स");
    expect(toHindi("15 January 2026")).toBe("15 जनवरी 2026");
    expect(toHindi("Grade 10–12")).toBe("कक्षा 10–12");
    expect(toHindi("6 Months")).toBe("6 महीने");
    expect(toHindi("1 Week")).toBe("1 सप्ताह");
    expect(toHindi("12-15 years")).toBe("12-15 वर्ष");
    expect(toHindi("Subject: Block Coding")).toBe("विषय: ब्लॉक कोडिंग");
    expect(toHindi("Something not in the dictionary")).toBeNull();
  });

  it("shows Hindi when chosen, remembers it, and restores the exact English", async () => {
    const { container } = render(<Page />);
    const english = container.querySelector("main")!.innerHTML;
    await act(async () => fireEvent.click(screen.getByText("to-hi")));
    await flush();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("hi");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("हमारे कोर्स देखें");
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "कोर्स खोजें...");
    // Untranslated and excluded text stays English.
    expect(screen.getByText("Something not in the dictionary")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("App Development");
    // Options show Hindi but still submit their English value.
    const option = screen.getByRole("option", { name: "कक्षा 6" }) as HTMLOptionElement;
    expect(option.value).toBe("Class 6");

    await act(async () => fireEvent.click(screen.getByText("to-en")));
    await flush();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Explore Our Courses");
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Search courses...");
    expect(container.querySelector("main")!.innerHTML.replace(/ value="Class 6"/, "")).toBe(
      english,
    );
  });

  it("opens in the saved language", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "hi");
    render(<Page />);
    await flush();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("हमारे कोर्स देखें");
  });
});
