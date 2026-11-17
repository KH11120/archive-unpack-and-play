import { createServerFn } from "@tanstack/react-start";
import { normaliseIndianMobile } from "@/site/data/kcc";
import { freeClassRequestSchema, type FreeClassSubmitResult } from "@/site/data/freeClass";

/**
 * Receives a "Book a Free Class" request on the server and delivers it.
 *
 * Delivery goes to the HTTPS address in the server environment variable
 * FREE_CLASS_WEBHOOK_URL (for example a Google Sheets Apps Script web app, a Zapier/Make
 * webhook, a CRM's web-to-lead endpoint or your own backend), as JSON. Optionally,
 * FREE_CLASS_WEBHOOK_TOKEN is sent as a Bearer token. Success is reported only when that
 * address answers with a 2xx status, so the popup never says "received" for a request that was
 * not delivered.
 *
 * Until the variable is set, every request returns { ok: false, reason: "not_configured" }.
 */

function serverEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  const value = env?.[name]?.trim();
  return value ? value : undefined;
}

/**
 * Validate and deliver one request. Kept separate from the server function so it can be tested
 * directly; `env` and `send` default to the real environment and fetch.
 */
export async function deliverFreeClassRequest(
  data: unknown,
  env: (name: string) => string | undefined = serverEnv,
  send: typeof fetch = fetch,
): Promise<FreeClassSubmitResult> {
  const parsed = freeClassRequestSchema.safeParse(data);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const request = parsed.data;

  // Spam trap: real visitors never see or fill the "website" field.
  if (request.website) return { ok: true };

  const url = env("FREE_CLASS_WEBHOOK_URL");
  if (!url) {
    console.error("Free class request not delivered: FREE_CLASS_WEBHOOK_URL is not set.");
    return { ok: false, reason: "not_configured" };
  }

  const token = env("FREE_CLASS_WEBHOOK_TOKEN");
  const payload = {
    type: "free_class_request",
    submittedAt: new Date().toISOString(),
    studentName: request.studentName,
    grade: request.grade,
    parentName: request.parentName,
    mobile: `+91${normaliseIndianMobile(request.mobile)}`,
    email: request.email || null,
    city: request.city || null,
    interest: request.interest,
    language: request.language,
    preferredTime: request.preferredTime,
    message: request.message || null,
    consent: true,
    source: "homepage",
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
      console.error(`Free class request delivery failed with HTTP ${response.status}.`);
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Free class request delivery failed.", error);
    return { ok: false, reason: "failed" };
  }
}

export const submitFreeClassRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(({ data }) => deliverFreeClassRequest(data));
