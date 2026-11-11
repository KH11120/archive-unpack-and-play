import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CodelyDemo from "./CodelyDemo";

const robot = () => screen.getByTestId("codely-robot");
const position = () => ({
  row: Number(robot().dataset["row"]),
  col: Number(robot().dataset["col"]),
  rotation: Number(robot().dataset["rotation"]),
});
const program = () => within(screen.getByRole("list", { name: "Your program" }));
const add = (label: "Move Forward" | "Turn Left" | "Turn Right") =>
  fireEvent.click(screen.getByRole("button", { name: label }));
const run = () => fireEvent.click(screen.getByRole("button", { name: /Run (Program|Again)/ }));
const finish = () => act(() => vi.advanceTimersByTimeAsync(20_000));

describe("Codely homepage game", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("skips the confetti for reduced-motion users but still celebrates", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: query.includes("prefers-reduced-motion"),
    })) as typeof window.matchMedia;
    try {
      const { container } = render(<CodelyDemo />);
      add("Move Forward");
      add("Move Forward");
      run();
      await act(() => vi.advanceTimersByTimeAsync(1_500));
      expect(container.querySelector(".codely-confetti")).toBeNull();
      await finish();
      expect(screen.getByText("AMAZING! YOU DID IT!")).toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });

  it("starts challenge 1 with a short starter program and the robot at its start", () => {
    render(<CodelyDemo />);
    expect(program().getAllByRole("listitem")).toHaveLength(1);
    expect(position()).toEqual({ row: 3, col: 1, rotation: 0 });
  });

  it("explains running out of instructions and how far the star is", async () => {
    render(<CodelyDemo />);
    run();
    await finish();
    expect(
      screen.getByText("You ran out of instructions before reaching the star."),
    ).toBeInTheDocument();
    expect(screen.getByText(/The star is 2 squares straight ahead/)).toBeInTheDocument();
    expect(position()).toEqual({ row: 2, col: 1, rotation: 0 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("celebrates only when the star is reached, and again after Play Again", async () => {
    render(<CodelyDemo />);
    add("Move Forward");
    add("Move Forward");
    run();
    await finish();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("AMAZING! YOU DID IT!")).toBeInTheDocument();
    expect(within(dialog).getByText("Instructions").nextSibling).toHaveTextContent("3");
    expect(position()).toEqual({ row: 0, col: 1, rotation: 0 });

    fireEvent.click(within(dialog).getByRole("button", { name: "Play Again" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(position()).toEqual({ row: 3, col: 1, rotation: 0 });
    add("Move Forward");
    add("Move Forward");
    run();
    await finish();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ignores a second Run click while a program is running", async () => {
    render(<CodelyDemo />);
    add("Move Forward");
    const runButton = screen.getByRole("button", { name: "Run Program" });
    fireEvent.click(runButton);
    fireEvent.click(runButton);
    expect(runButton).toBeDisabled();
    await finish();
    expect(position()).toEqual({ row: 1, col: 1, rotation: 0 });
  });

  it("turns in place and stops at a block with a child-friendly message", async () => {
    render(<CodelyDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Challenge 3: Around the block" }));
    run();
    await finish();
    expect(
      screen.getByText(/cannot move forward because there is a block in the way/),
    ).toBeInTheDocument();
    expect(position()).toEqual({ row: 2, col: 1, rotation: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    add("Turn Left");
    add("Turn Left");
    add("Turn Right");
    run();
    await finish();
    expect(position()).toEqual({ row: 3, col: 1, rotation: -90 });
  });

  it("reorders and deletes instructions, which changes what the robot does", async () => {
    render(<CodelyDemo />);
    add("Turn Right");
    fireEvent.click(screen.getByRole("button", { name: "Move instruction 2 (Turn Right) up" }));
    expect(program().getAllByRole("listitem")[0]).toHaveTextContent("Turn Right");
    run();
    await finish();
    expect(position()).toEqual({ row: 3, col: 2, rotation: 90 });

    fireEvent.click(screen.getByRole("button", { name: "Delete instruction 1 (Turn Right)" }));
    expect(program().getAllByRole("listitem")).toHaveLength(1);
    expect(position()).toEqual({ row: 3, col: 1, rotation: 0 });
  });

  it("stops a running program and returns the robot to the start", async () => {
    render(<CodelyDemo />);
    add("Move Forward");
    run();
    await act(() => vi.advanceTimersByTimeAsync(1_300));
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    await finish();
    expect(position()).toEqual({ row: 3, col: 1, rotation: 0 });
    expect(screen.getByRole("button", { name: "Run Program" })).toBeEnabled();
  });

  it("explains an empty program instead of running it", () => {
    render(<CodelyDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    run();
    expect(screen.getByText("Your program is empty", { selector: "p" })).toBeInTheDocument();
  });
});
