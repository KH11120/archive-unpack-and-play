import { CONTACT_EMAIL } from "./contact";

/**
 * Open positions shown on the Careers page, in the order listed here.
 *
 * There are no open positions at the moment, so the list is empty and the page shows a
 * "no open positions" message. To publish a role, add an entry, for example:
 *
 *   {
 *     id: "python-instructor",            // unique; also the anchor #job-python-instructor
 *     title: "Python Instructor",
 *     team: "Academics",                  // optional
 *     location: "Noida",                  // optional
 *     employmentType: "Full-time",        // optional
 *     summary: "One or two sentences about the role.",
 *   },
 *
 * Each role gets an "Apply" button that opens an email with the role in the subject line.
 */
export type JobOpening = {
  id: string;
  title: string;
  team?: string;
  location?: string;
  employmentType?: string;
  summary: string;
};

export const jobOpenings: JobOpening[] = [];

/** Address candidates write to. */
export const CAREERS_EMAIL = CONTACT_EMAIL;

const mailto = (subject: string, body: string) =>
  `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Email for a specific role. */
export const applyHref = (job: JobOpening) =>
  mailto(
    `Application: ${job.title}`,
    `Hello APTCODER team,\n\nI would like to apply for the ${job.title} role.\n\nName:\nPhone:\nLinkedIn / portfolio (optional):\n\nMy resume is attached.\n`,
  );

/** Email for candidates who are not applying to a listed role. */
export const CAREERS_INTEREST_HREF = mailto(
  "Career interest: APTCODER",
  "Hello APTCODER team,\n\nI would like to be considered for future roles at APTCODER.\n\nName:\nPhone:\nRole / area of interest:\nLinkedIn / portfolio (optional):\n\nMy resume is attached.\n",
);
