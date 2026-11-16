/**
 * Shared structure for the legal pages (Privacy Policy, Terms & Conditions).
 *
 * Text is plain strings. When rendered, email addresses, www.aptcoder.com and the tokens
 * [[privacy]] / [[terms]] become links automatically (see LegalPage.tsx).
 */

/** Date this version of the pages was published on the site. */
export const LEGAL_LAST_UPDATED = "16 November 2026";

export type LegalBlock =
  { type: "p"; text: string } | { type: "ul"; items: string[] } | { type: "h3"; text: string };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  /** Shown under the title (e.g. the original effective date). */
  intro?: string;
  sections: LegalSection[];
};
