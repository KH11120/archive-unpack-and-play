import { createServerFn } from "@tanstack/react-start";
import {
  kccRegistrationSchema,
  normaliseIndianMobile,
  type KccSubmitResult,
} from "@/site/data/kcc";

/**
 * Receives a KCC registration on the server and delivers it.
 *
 * Delivery goes to the HTTPS address in the server environment variable
 * KCC_REGISTRATION_WEBHOOK_URL (for example a Google Sheets Apps Script web app, Zapier/Make
 * webhook or your own backend), as JSON. Optionally, KCC_REGISTRATION_WEBHOOK_TOKEN is sent as
 * a Bearer token. Success is reported only when that address answers with a 2xx status, so the
 * form never shows "received" for a registration that was not delivered.
 *
 * Until the variable is set, every submission returns { ok: false, reason: "not_configured" }.
 */

function serverEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  const value = env?.[name]?.trim();
  return value ? value : undefined;
}

/**
 * Validate and deliver one registration. Kept separate from the server function so it can be
 * tested directly; `env` and `send` default to the real environment and fetch.
 */
export async function deliverKccRegistration(
  data: unknown,
  env: (name: string) => string | undefined = serverEnv,
  send: typeof fetch = fetch,
): Promise<KccSubmitResult> {
  const parsed = kccRegistrationSchema.safeParse(data);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const registration = parsed.data;

  // Spam trap: real visitors never see or fill the "website" field.
  if (registration.website) return { ok: true };

  const url = env("KCC_REGISTRATION_WEBHOOK_URL");
  if (!url) {
    console.error("KCC registration not delivered: KCC_REGISTRATION_WEBHOOK_URL is not set.");
    return { ok: false, reason: "not_configured" };
  }

  const token = env("KCC_REGISTRATION_WEBHOOK_TOKEN");
  const payload = {
    type: "kcc_registration",
    submittedAt: new Date().toISOString(),
    studentName: registration.studentName,
    parentName: registration.parentName,
    grade: registration.grade,
    school: registration.school,
    mobile: `+91${normaliseIndianMobile(registration.mobile)}`,
    email: registration.email,
    city: registration.city,
    consent: true,
  };

  try {
    const response = await send(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      console.error(`KCC registration delivery failed with HTTP ${response.status}.`);
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("KCC registration delivery failed.", error);
    return { ok: false, reason: "failed" };
  }
}

export const submitKccRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(({ data }) => deliverKccRegistration(data));
