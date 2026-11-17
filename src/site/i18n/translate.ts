import { hi, hiPatterns } from "./hi";

/** Collapse whitespace the same way the dictionary keys are written. */
export const normalise = (value: string) => value.replace(/\s+/g, " ").trim();

/** Hindi for one piece of English text, keeping its surrounding spaces; null if none. */
export function toHindi(english: string): string | null {
  const key = normalise(english);
  if (!key) return null;
  let hindi: string | undefined = hi[key];
  if (hindi === undefined) {
    for (const [pattern, build] of hiPatterns) {
      const match = key.match(pattern);
      if (match) {
        hindi = build(...match.slice(1).map((group) => group ?? ""));
        break;
      }
    }
  }
  if (hindi === undefined || hindi === key) return null;
  const lead = english.match(/^\s*/)![0];
  const trail = english.match(/\s*$/)![0];
  return lead + hindi + trail;
}
