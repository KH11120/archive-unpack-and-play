import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { freeClassRequestSchema } from "@/site/data/freeClass";
import { deliverFreeClassRequest } from "@/site/api/freeClass";

const submit = vi.fn();
vi.mock("@/site/api/freeClass", async (original) => ({
  ...(await original<typeof import("@/site/api/freeClass")>()),
  submitFreeClassRequest: (args: unknown) => submit(args),
}));

const { default: FreeClassModal } = await import("./FreeClassModal");

const valid = {
  studentName: "Asha Verma",
  grade: "Class 6",
  parentName: "Ravi Verma",
  mobile: "+91 98765 12345",
  email: "",
  city: "",
  interest: "Python",
  language: "Hindi",
  preferredTime: "Weekends",
  message: "",
  consent: true,
  website: "",
};

describe("free class validation rules", () => {
  it("needs the student, class, parent, mobile, language and consent; email and city are optional", () => {
    expect(freeClassRequestSchema.safeParse(valid).success).toBe(true);
    const result = freeClassRequestSchema.safeParse({
      ...valid,
      studentName: "",
      grade: "",
      parentName: " ",
      mobile: "12345",
      language: "",
      consent: false,
      email: "nope",
    });
    const fields = result.success ? [] : result.error.issues.map((i) => i.path[0]);
    expect(fields).toEqual(
      expect.arrayContaining([
        "studentName",
        "grade",
        "parentName",
        "mobile",
        "language",
        "consent",
        "email",
      ]),
    );
    expect(fields).not.toContain("city");
  });
});

describe("free class delivery (server side)", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("refuses to report success when no destination is configured", async () => {
    const send = vi.fn();
    expect(await deliverFreeClassRequest(valid, () => undefined, send)).toEqual({
      ok: false,
      reason: "not_configured",
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("delivers the request as JSON and succeeds only on a 2xx answer", async () => {
    const send = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    const env = (name: string) =>
      ({
        FREE_CLASS_WEBHOOK_URL: "https://hooks.example.test/free-class",
        FREE_CLASS_WEBHOOK_TOKEN: "t0ken",
      })[name];
    expect(await deliverFreeClassRequest(valid, env, send)).toEqual({ ok: true });
    const [url, init] = send.mock.calls[0]!;
    expect(url).toBe("https://hooks.example.test/free-class");
    expect(init.headers.authorization).toBe("Bearer t0ken");
    expect(JSON.parse(init.body)).toMatchObject({
      type: "free_class_request",
      studentName: "Asha Verma",
      grade: "Class 6",
      mobile: "+919876512345",
      email: null,
      interest: "Python",
      language: "Hindi",
      preferredTime: "Weekends",
    });

    send.mockResolvedValue(new Response("nope", { status: 500 }));
    expect(await deliverFreeClassRequest(valid, env, send)).toEqual({
      ok: false,
      reason: "failed",
    });
    send.mockRejectedValue(new Error("offline"));
    expect(await deliverFreeClassRequest(valid, env, send)).toEqual({
      ok: false,
      reason: "failed",
    });
  });

  it("rejects invalid data on the server too", async () => {
    expect(
      await deliverFreeClassRequest({ ...valid, mobile: "123" }, () => "https://x.test", vi.fn()),
    ).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("Book a Free Class popup", () => {
  afterEach(() => submit.mockReset());

  const fill = () => {
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText(/Student’s Name/), {
      target: { value: valid.studentName },
    });
    fireEvent.change(dialog.getByLabelText(/Class\/Grade/), { target: { value: valid.grade } });
    fireEvent.change(dialog.getByLabelText(/Parent’s\/Guardian’s Name/), {
      target: { value: valid.parentName },
    });
    fireEvent.change(dialog.getByLabelText(/Mobile Number/), { target: { value: valid.mobile } });
    fireEvent.change(dialog.getByLabelText(/Interested In/), { target: { value: valid.interest } });
    fireEvent.click(dialog.getByLabelText("Hindi"));
    fireEvent.change(dialog.getByLabelText(/Preferred Time/), {
      target: { value: valid.preferredTime },
    });
    fireEvent.click(dialog.getByRole("checkbox"));
    return dialog;
  };
  const send = (dialog: ReturnType<typeof within>) =>
    act(async () => fireEvent.click(dialog.getByRole("button", { name: /Request My Free Class/ })));

  it("blocks submission and explains each problem when fields are missing or invalid", async () => {
    render(<FreeClassModal open onOpenChange={() => {}} />);
    const dialog = within(screen.getByRole("dialog"));
    fireEvent.change(dialog.getByLabelText(/Mobile Number/), { target: { value: "12345" } });
    await send(dialog);
    expect(
      await dialog.findByText("Please enter a valid 10-digit Indian mobile number."),
    ).toBeInTheDocument();
    expect(dialog.getByText("Please choose the student’s class.")).toBeInTheDocument();
    expect(dialog.getByText("Please choose a class language.")).toBeInTheDocument();
    expect(dialog.getByText(/Please agree to be contacted/)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("shows a loading state, sends once, and confirms only after delivery succeeded", async () => {
    let resolveSubmit!: (v: unknown) => void;
    submit.mockReturnValue(new Promise((r) => (resolveSubmit = r)));
    render(<FreeClassModal open onOpenChange={() => {}} />);
    const dialog = fill();
    await send(dialog);
    const sending = await dialog.findByRole("button", { name: /Sending/ });
    expect(sending).toBeDisabled();
    fireEvent.click(sending);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0]![0].data).toMatchObject({
      studentName: "Asha Verma",
      language: "Hindi",
      consent: true,
    });
    expect(screen.queryByText("Your Free Class Request Is In!")).toBeNull();
    await act(async () => resolveSubmit({ ok: true }));
    expect(await screen.findByText("Your Free Class Request Is In!")).toBeInTheDocument();
    expect(screen.getByText(/contact you on \+91 98765 12345/)).toBeInTheDocument();
  });

  it.each([
    [{ ok: false, reason: "not_configured" }, /isn’t switched on yet/],
    [{ ok: false, reason: "failed" }, /couldn’t send your request/],
  ])(
    "shows an error with a WhatsApp fallback, not a confirmation, for %o",
    async (result, message) => {
      submit.mockResolvedValue(result);
      render(<FreeClassModal open onOpenChange={() => {}} />);
      const dialog = fill();
      await send(dialog);
      const alert = await dialog.findByRole("alert");
      expect(alert).toHaveTextContent(message);
      const whatsapp = within(alert).getByRole("link", { name: /Send these details on WhatsApp/ });
      expect(decodeURIComponent(whatsapp.getAttribute("href")!)).toContain("Student: Asha Verma");
      expect(screen.queryByText("Your Free Class Request Is In!")).toBeNull();
    },
  );

  it("shows the connection error when the request itself fails", async () => {
    submit.mockRejectedValue(new Error("network"));
    render(<FreeClassModal open onOpenChange={() => {}} />);
    const dialog = fill();
    await send(dialog);
    await waitFor(() => expect(dialog.getByRole("alert")).toHaveTextContent(/couldn’t send/));
  });
});

describe("homepage Book a Free Class buttons", () => {
  it("both open the popup instead of going to Courses", () => {
    const home = readFileSync(resolve(__dirname, "../../pages/HomePage.tsx"), "utf8");
    const opens = home.match(/onClick=\{\(\) => setFreeClassOpen\(true\)\}/g) ?? [];
    expect(opens).toHaveLength(2);
    expect(home).toContain(
      "<FreeClassModal open={freeClassOpen} onOpenChange={setFreeClassOpen} />",
    );
  });
});
