/*
 * Codely robot game engine. Pure functions only: no React, no timers, no DOM.
 * The component animates the frames this engine produces, so animation can never change
 * where the robot really is.
 */

export type Command = "forward" | "left" | "right";

/** 0 = north (up), 1 = east (right), 2 = south (down), 3 = west (left). */
export type Direction = 0 | 1 | 2 | 3;

export interface Cell {
  row: number;
  col: number;
}

export interface RobotState extends Cell {
  dir: Direction;
}

export interface Challenge {
  id: string;
  title: string;
  /** One short sentence telling the child what to do. */
  goal: string;
  size: number;
  start: RobotState;
  target: Cell;
  obstacles: Cell[];
  /** Program loaded when the challenge opens: a starting point, never a full solution. */
  starter: Command[];
}

export const MAX_INSTRUCTIONS = 10;

export const DIRECTION_NAMES = ["north", "east", "south", "west"] as const;

const STEPS: readonly Cell[] = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
];

export function sameCell(a: Cell, b: Cell): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isObstacle(challenge: Challenge, cell: Cell): boolean {
  return challenge.obstacles.some((obstacle) => sameCell(obstacle, cell));
}

export function isInside(challenge: Challenge, cell: Cell): boolean {
  return cell.row >= 0 && cell.col >= 0 && cell.row < challenge.size && cell.col < challenge.size;
}

export function turn(dir: Direction, side: "left" | "right"): Direction {
  return ((dir + (side === "right" ? 1 : 3)) % 4) as Direction;
}

export function cellAhead(state: RobotState): Cell {
  const step = STEPS[state.dir]!;
  return { row: state.row + step.row, col: state.col + step.col };
}

export type StepEvent =
  | { kind: "turn"; side: "left" | "right" }
  | { kind: "move" }
  | { kind: "blocked"; reason: "obstacle" | "edge"; attempted: Cell };

/** Apply one instruction. A blocked move leaves the robot exactly where it was. */
export function applyCommand(
  challenge: Challenge,
  state: RobotState,
  command: Command,
): { state: RobotState; event: StepEvent } {
  if (command === "left" || command === "right") {
    return {
      state: { ...state, dir: turn(state.dir, command) },
      event: { kind: "turn", side: command },
    };
  }
  const next = cellAhead(state);
  if (!isInside(challenge, next)) {
    return { state, event: { kind: "blocked", reason: "edge", attempted: next } };
  }
  if (isObstacle(challenge, next)) {
    return { state, event: { kind: "blocked", reason: "obstacle", attempted: next } };
  }
  return { state: { ...state, ...next }, event: { kind: "move" } };
}

export interface Frame {
  /** Position of the instruction in the program. */
  index: number;
  command: Command;
  before: RobotState;
  after: RobotState;
  event: StepEvent;
}

export type Outcome =
  | { kind: "empty" }
  | { kind: "success"; stepsRun: number; moves: number; unused: number }
  | {
      kind: "blocked";
      reason: "obstacle" | "edge";
      index: number;
      attempted: Cell;
      stepsRun: number;
    }
  | { kind: "incomplete"; stepsRun: number };

export interface RunResult {
  frames: Frame[];
  outcome: Outcome;
  final: RobotState;
}

/**
 * Run a whole program. Stops at the first blocked move, or as soon as the robot reaches the
 * target (success). Finishing every instruction without reaching the target is "incomplete".
 */
export function runProgram(challenge: Challenge, program: readonly Command[]): RunResult {
  let state = challenge.start;
  const frames: Frame[] = [];
  if (program.length === 0) return { frames, outcome: { kind: "empty" }, final: state };

  let moves = 0;
  for (const [index, command] of program.entries()) {
    const { state: after, event } = applyCommand(challenge, state, command);
    frames.push({ index, command, before: state, after, event });
    if (event.kind === "blocked") {
      return {
        frames,
        final: state,
        outcome: {
          kind: "blocked",
          reason: event.reason,
          index,
          attempted: event.attempted,
          stepsRun: index + 1,
        },
      };
    }
    if (event.kind === "move") moves += 1;
    state = after;
    if (sameCell(state, challenge.target)) {
      return {
        frames,
        final: state,
        outcome: {
          kind: "success",
          stepsRun: index + 1,
          moves,
          unused: program.length - index - 1,
        },
      };
    }
  }
  return { frames, final: state, outcome: { kind: "incomplete", stepsRun: program.length } };
}

/** Where the target is from the robot's point of view (squares ahead and to its right). */
export function targetRelativeToRobot(
  challenge: Challenge,
  state: RobotState,
): { ahead: number; right: number } {
  const dRow = challenge.target.row - state.row;
  const dCol = challenge.target.col - state.col;
  const forward = STEPS[state.dir]!;
  const rightward = STEPS[turn(state.dir, "right")]!;
  return {
    ahead: dRow * forward.row + dCol * forward.col,
    right: dRow * rightward.row + dCol * rightward.col,
  };
}

export function manhattanToTarget(challenge: Challenge, cell: Cell): number {
  return Math.abs(challenge.target.row - cell.row) + Math.abs(challenge.target.col - cell.col);
}

/** Fewest instructions that solve the challenge (breadth-first search), or null if impossible. */
export function shortestSolution(
  challenge: Challenge,
  maxLength = MAX_INSTRUCTIONS,
): Command[] | null {
  const key = (s: RobotState) => `${s.row},${s.col},${s.dir}`;
  const seen = new Set([key(challenge.start)]);
  let layer: { state: RobotState; path: Command[] }[] = [{ state: challenge.start, path: [] }];
  for (let depth = 0; depth < maxLength; depth += 1) {
    const next: typeof layer = [];
    for (const { state, path } of layer) {
      for (const command of ["forward", "left", "right"] as const) {
        const { state: after, event } = applyCommand(challenge, state, command);
        if (event.kind === "blocked") continue;
        const nextPath = [...path, command];
        if (sameCell(after, challenge.target)) return nextPath;
        if (!seen.has(key(after))) {
          seen.add(key(after));
          next.push({ state: after, path: nextPath });
        }
      }
    }
    layer = next;
  }
  return null;
}

export interface Feedback {
  title: string;
  message: string;
  hint: string;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function directionHint(challenge: Challenge, state: RobotState): string {
  const { ahead, right } = targetRelativeToRobot(challenge, state);
  if (right === 0 && ahead > 0) {
    return `The star is ${plural(ahead, "square")} straight ahead. Add ${ahead === 1 ? "a Move Forward" : `${ahead} Move Forwards`}!`;
  }
  if (right === 0 && ahead < 0)
    return "The star is behind the robot. It needs to turn around first.";
  if (right > 0) return "The star is on the robot's right side. Try a Turn Right.";
  return "The star is on the robot's left side. Try a Turn Left.";
}

/** Child-friendly explanation of a run that did not reach the star. */
export function explainOutcome(
  challenge: Challenge,
  program: readonly Command[],
  result: RunResult,
): Feedback | null {
  const { outcome, final } = result;
  switch (outcome.kind) {
    case "success":
      return null;
    case "empty":
      return {
        title: "Your program is empty",
        message: "The robot is waiting for instructions.",
        hint: "Click Move Forward, Turn Left or Turn Right to add your first instruction.",
      };
    case "blocked":
      return outcome.reason === "obstacle"
        ? {
            title: "Oops! A block is in the way",
            message: `Instruction ${outcome.index + 1}: the robot cannot move forward because there is a block in the way!`,
            hint: "Robots can't pass through blocks. Can you turn and find a way around it?",
          }
        : {
            title: "The robot reached a wall",
            message: `Instruction ${outcome.index + 1}: the robot is at the edge of the playground and can't go any further that way.`,
            hint: "Can you find another route? Check which way the robot is facing.",
          };
    case "incomplete": {
      const last = program[program.length - 1];
      const { ahead, right } = targetRelativeToRobot(challenge, final);
      let hint = directionHint(challenge, final);
      if (last === "left" && (right > 0 || (right === 0 && ahead < 0))) {
        hint = "The robot turned left, but it needed to turn right. Try swapping that turn.";
      } else if (last === "right" && (right < 0 || (right === 0 && ahead < 0))) {
        hint = "The robot turned right, but it needed to turn left. Try swapping that turn.";
      }
      return {
        title: "So close! Keep going",
        message: "You ran out of instructions before reaching the star.",
        hint,
      };
    }
  }
}
