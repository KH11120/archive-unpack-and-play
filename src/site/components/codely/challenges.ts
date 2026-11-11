import type { Challenge } from "./engine";

/*
 * Challenge definitions, kept apart from the engine so new ones can be added freely.
 * Rows count from the top (0) and columns from the left (0). Every challenge is checked by
 * tests: it must be solvable within MAX_INSTRUCTIONS, and its starter program must not
 * already solve it.
 */
export const challenges: readonly Challenge[] = [
  {
    id: "first-steps",
    title: "First steps",
    goal: "Move the robot forward until it reaches the star.",
    size: 4,
    start: { row: 3, col: 1, dir: 0 },
    target: { row: 0, col: 1 },
    obstacles: [
      { row: 2, col: 3 },
      { row: 1, col: 0 },
    ],
    starter: ["forward"],
  },
  {
    id: "turn-the-corner",
    title: "Turn the corner",
    goal: "The star is around a corner. Use a turn to reach it.",
    size: 4,
    start: { row: 3, col: 0, dir: 0 },
    target: { row: 1, col: 3 },
    obstacles: [
      { row: 0, col: 1 },
      { row: 2, col: 2 },
    ],
    starter: ["forward", "forward", "right"],
  },
  {
    id: "around-the-block",
    title: "Around the block",
    goal: "Blocks are in the way! Find a route around them to the star.",
    size: 4,
    start: { row: 3, col: 1, dir: 0 },
    target: { row: 0, col: 1 },
    obstacles: [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 3 },
    ],
    starter: ["forward", "forward"],
  },
];
