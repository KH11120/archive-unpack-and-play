import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VernaticsVideo, { VERNATICS_POSTER_SRC, VERNATICS_VIDEO_SRC } from "./VernaticsVideo";

let trigger: ((visible: boolean) => void) | null = null;

class FakeObserver {
  constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
    trigger = (visible) => cb([{ isIntersecting: visible }]);
  }
  observe() {}
  disconnect() {}
}

function mockMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe("Vernatics panel video", () => {
  const originalMatch = window.matchMedia;
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });
  afterEach(() => {
    window.matchMedia = originalMatch;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    trigger = null;
  });

  it("uses the supplied video and poster files", () => {
    const publicDir = resolve(__dirname, "../../../public");
    expect(existsSync(resolve(publicDir, decodeURIComponent(VERNATICS_VIDEO_SRC.slice(1))))).toBe(
      true,
    );
    expect(existsSync(resolve(publicDir, VERNATICS_POSTER_SRC.slice(1)))).toBe(true);
  });

  it("is muted, looping, inline and has no controls", () => {
    mockMotion(false);
    const { getByTestId } = render(<VernaticsVideo />);
    const video = getByTestId("vernatics-video") as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.controls).toBe(false);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.getAttribute("poster")).toBe(VERNATICS_POSTER_SRC);
  });

  it("loads and plays only once the panel comes into view", () => {
    mockMotion(false);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const { getByTestId } = render(<VernaticsVideo />);
    const video = getByTestId("vernatics-video");
    expect(video.getAttribute("src")).toBeNull();
    expect(play).not.toHaveBeenCalled();

    act(() => trigger!(true));
    expect(video.getAttribute("src")).toBe(VERNATICS_VIDEO_SRC);
    expect(play).toHaveBeenCalled();
  });

  it("keeps the still poster for visitors who prefer reduced motion", () => {
    mockMotion(true);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    render(<VernaticsVideo />);
    act(() => trigger!(true));
    expect(play).not.toHaveBeenCalled();
  });
});
