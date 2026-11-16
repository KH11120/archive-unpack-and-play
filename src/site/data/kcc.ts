import { z } from "zod";

/**
 * Kids Coding Community (KCC) registration: the fields, their validation (shared by the form
 * and the server, so both apply exactly the same rules) and the class options.
 */

export const KCC_GRADES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;

/** Indian mobile number: 10 digits starting 6–9, optionally written with +91 / 91 / 0. */
export function normaliseIndianMobile(value: string): string | null {
  const digits = value
    .replace(/[\s\-()]/g, "")
    .replace(/^\+?91(?=\d{10}$)/, "")
    .replace(/^0(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const required = (label: string) =>
  z
    .string({ required_error: `Please enter ${label}.` })
    .trim()
    .min(1, `Please enter ${label}.`)
    .max(120, `Please shorten ${label}.`);

export const kccRegistrationSchema = z.object({
  studentName: required("the student’s full name").refine((v) => v.length >= 2, {
    message: "Please enter the student’s full name.",
  }),
  parentName: required("the parent’s or guardian’s name"),
  grade: z.enum(KCC_GRADES, {
    errorMap: () => ({ message: "Please choose the student’s class." }),
  }),
  school: required("the school name"),
  mobile: z
    .string()
    .trim()
    .min(1, "Please enter a mobile number.")
    .refine((v) => normaliseIndianMobile(v) !== null, {
      message: "Please enter a valid 10-digit Indian mobile number.",
    }),
  email: z
    .string()
    .trim()
    .min(1, "Please enter an email address.")
    .max(160)
    .email("Please enter a valid email address."),
  city: required("your city"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to be contacted so we can set up your membership." }),
  }),
  /** Hidden from people; bots that fill every field reveal themselves here. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type KccRegistration = z.infer<typeof kccRegistrationSchema>;

export type KccSubmitResult =
  | { ok: true }
  | {
      ok: false;
      /** not_configured: no delivery destination set up yet; failed: delivery attempt failed. */
      reason: "not_configured" | "failed" | "invalid";
    };
