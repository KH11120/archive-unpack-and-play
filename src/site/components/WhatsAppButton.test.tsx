import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WhatsAppButton, { WHATSAPP_MESSAGE, WHATSAPP_URL } from "./WhatsAppButton";

describe("WhatsApp button", () => {
  it("opens a chat with +91 93184 97057 in a new tab, with the message prefilled", () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole("link", { name: /Chat with us on WhatsApp/ });
    const url = new URL(link.getAttribute("href")!);
    expect(url.origin + url.pathname).toBe("https://wa.me/919318497057");
    expect(url.searchParams.get("text")).toBe(WHATSAPP_MESSAGE);
    expect(link.getAttribute("href")).toBe(WHATSAPP_URL);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent(
      "Chat with us on WhatsApp",
    );
  });

  it("is mounted once in the root layout, so every route shows it", () => {
    const root = readFileSync(resolve(__dirname, "../../routes/__root.tsx"), "utf8");
    expect(root.match(/<WhatsAppButton \/>/g)).toHaveLength(1);
  });
});
