import { describe, expect, it } from "vitest";
import { challenges } from "./challenges";
import {
  MAX_INSTRUCTIONS,
  applyCommand,
  explainOutcome,
  runProgram,
  shortestSolution,
  type Challenge,
  type Command,
} from "./engine";

const open: Challenge = {
  id: "test",
  title: "Test",
  goal: "Test",
  size: 4,
  start: { row: 3, col: 0, dir: 0 },
  target: { row: 0, col: 3 },
  obstacles: [{ row: 1, col: 0 }],
  starter: [],
};

describe("robot movement", () => {
  it("moves exactly one cell in the facing direction", () => {
    const north = applyCommand(open, { row: 3, col: 0, dir: 0 }, "forward");
    expect(north.state).toEqual({ row: 2, col: 0, dir: 0 });
    const east = applyCommand(open, { row: 3, col: 0, dir: 1 }, "forward");
    expect(east.state).toEqual({ row: 3, col: 1, dir: 1 });
    const south = applyCommand(open, { row: 2, col: 2, dir: 2 }, "forward");
    expect(south.state).toEqual({ row: 3, col: 2, dir: 2 });
    const west = applyCommand(open, { row: 2, col: 2, dir: 3 }, "forward");
    expect(west.state).toEqual({ row: 2, col: 1, dir: 3 });
  });

  it("turns 90 degrees in place, including several turns in a row", () => {
    const start = { row: 2, col: 2, dir: 0 as const };
    expect(applyCommand(open, start, "right").state).toEqual({ ...start, dir: 1 });
    expect(applyCommand(open, start, "left").state).toEqual({ ...start, dir: 3 });
    const fourRights = runProgram(open, ["right", "right", "right", "right"]);
    expect(fourRights.final).toEqual(open.start);
    expect(runProgram(open, ["left", "left"]).final.dir).toBe(2);
  });

  it("never moves through a block or off the grid", () => {
    const intoBlock = runProgram(open, ["forward", "forward"]);
    expect(intoBlock.outcome).toMatchObject({ kind: "blocked", reason: "obstacle", index: 1 });
    expect(intoBlock.final).toEqual({ row: 2, col: 0, dir: 0 });

    const offEdge = runProgram(open, ["left", "forward"]);
    expect(offEdge.outcome).toMatchObject({ kind: "blocked", reason: "edge", index: 1 });
    // The turn happened; the blocked move left the robot in place, now facing west.
    expect(offEdge.final).toEqual({ ...open.start, dir: 3 });
  });

  it("stops at the first blocked move without running later instructions", () => {
    const result = runProgram(open, ["left", "forward", "right", "forward"]);
    expect(result.frames).toHaveLength(2);
  });
});

describe("success detection", () => {
  it("succeeds only when the robot lands on the star", () => {
    const solution: Command[] = [
      "right",
      "forward",
      "forward",
      "forward",
      "left",
      "forward",
      "forward",
      "forward",
    ];
    expect(runProgram(open, solution).outcome).toMatchObject({
      kind: "success",
      stepsRun: 8,
      moves: 6,
    });
    expect(runProgram(open, solution.slice(0, 7)).outcome.kind).toBe("incomplete");
  });

  it("stops as soon as the star is reached and counts unused instructions", () => {
    const result = runProgram(open, [
      "right",
      "forward",
      "forward",
      "forward",
      "left",
      "forward",
      "forward",
      "forward",
      "forward",
    ]);
    expect(result.outcome).toMatchObject({ kind: "success", unused: 1 });
    expect(result.frames).toHaveLength(8);
  });

  it("reports an empty program instead of running it", () => {
    expect(runProgram(open, []).outcome).toEqual({ kind: "empty" });
  });

  it("changes the result when the same instructions are reordered", () => {
    expect(runProgram(open, ["right", "forward"]).final).toEqual({ row: 3, col: 1, dir: 1 });
    expect(runProgram(open, ["forward", "right"]).final).toEqual({ row: 2, col: 0, dir: 1 });
  });
});

describe("learning feedback", () => {
  it("explains blocks, walls, empty programs and running out of instructions", () => {
    const say = (program: Command[]) => explainOutcome(open, program, runProgram(open, program));
    expect(say(["forward", "forward"])?.message).toMatch(/block in the way/);
    expect(say(["left", "forward"])?.title).toMatch(/wall/);
    expect(say([])?.hint).toMatch(/first instruction/);
    expect(say(["right", "forward"])?.message).toMatch(/ran out of instructions/);
  });

  it("points out a turn in the wrong direction", () => {
    const feedback = explainOutcome(open, ["left"], runProgram(open, ["left"]));
    expect(feedback?.hint).toBe(
      "The robot turned left, but it needed to turn right. Try swapping that turn.",
    );
  });

  it("tells the child how many squares are left when the star is straight ahead", () => {
    const almost: Command[] = ["right", "forward", "forward", "forward", "left", "forward"];
    expect(explainOutcome(open, almost, runProgram(open, almost))?.hint).toBe(
      "The star is 2 squares straight ahead. Add 2 Move Forwards!",
    );
  });
});

describe("homepage challenges", () => {
  it.each(challenges.map((challenge) => [challenge.title, challenge] as const))(
    "%s is solvable, well formed and not already solved by its starter",
    (_title, challenge) => {
      const solution = shortestSolution(challenge);
      expect(solution).not.toBeNull();
      expect(solution!.length).toBeLessThanOrEqual(MAX_INSTRUCTIONS);
      expect(runProgram(challenge, solution!).outcome.kind).toBe("success");
      expect(runProgram(challenge, challenge.starter).outcome.kind).not.toBe("success");
      const cells = [challenge.start, challenge.target, ...challenge.obstacles];
      expect(new Set(cells.map((cell) => `${cell.row},${cell.col}`)).size).toBe(cells.length);
    },
  );

  it("gets harder from one challenge to the next", () => {
    const lengths = challenges.map((challenge) => shortestSolution(challenge)!.length);
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
  });
});
