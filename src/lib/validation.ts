/**
 * Tiny, dependency-free validators shared by the client form and the API route.
 * Keep this file free of browser- or server-only APIs so it runs anywhere.
 */

export const CONTACT_SUBJECTS = [
  "New project",
  "Full-time role",
  "Consulting / advice",
  "Speaking or podcast",
  "Just saying hi",
] as const;

export const CONTACT_BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+", "Not sure yet"] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
export type ContactBudget = (typeof CONTACT_BUDGETS)[number];

export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 254,
  messageMin: 20,
  messageMax: 2000,
} as const;

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  budget?: string;
  message: string;
  /** Honeypot: real users never see or fill this field. */
  website: string;
}

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

export type ContactValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; errors: ContactErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidEmail(email: string): boolean {
  return email.length <= CONTACT_LIMITS.emailMax && EMAIL_RE.test(email);
}

/** Validates a single field — handy for on-blur validation in the form. */
export function validateContactField(field: keyof ContactPayload, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case "name":
      if (!value) return "Please tell me your name.";
      if (value.length < 2) return "That name looks a little short.";
      if (value.length > CONTACT_LIMITS.nameMax) return `Please keep it under ${CONTACT_LIMITS.nameMax} characters.`;
      return undefined;
    case "email":
      if (!value) return "An email address is required so I can reply.";
      if (!isValidEmail(value)) return "That doesn't look like a valid email address.";
      return undefined;
    case "subject":
      if (value && !(CONTACT_SUBJECTS as readonly string[]).includes(value)) return "Please pick a subject from the list.";
      return undefined;
    case "budget":
      if (value && !(CONTACT_BUDGETS as readonly string[]).includes(value)) return "Please pick one of the budget options.";
      return undefined;
    case "message":
      if (!value) return "Please write a short message.";
      if (value.length < CONTACT_LIMITS.messageMin)
        return `A little more detail helps — at least ${CONTACT_LIMITS.messageMin} characters.`;
      if (value.length > CONTACT_LIMITS.messageMax)
        return `Please keep it under ${CONTACT_LIMITS.messageMax} characters.`;
      return undefined;
    case "website":
      return undefined;
  }
}

/** Validates an untrusted contact payload (e.g. a parsed JSON request body). */
export function validateContact(input: unknown): ContactValidationResult {
  if (!isRecord(input)) {
    return { ok: false, errors: { message: "Invalid submission." } };
  }

  const data: ContactPayload = {
    name: str(input.name),
    email: str(input.email).toLowerCase(),
    subject: str(input.subject) || undefined,
    budget: str(input.budget) || undefined,
    message: str(input.message),
    website: str(input.website),
  };

  const errors: ContactErrors = {};
  const fields: (keyof ContactPayload)[] = ["name", "email", "subject", "budget", "message"];
  for (const field of fields) {
    const error = validateContactField(field, data[field] ?? "");
    if (error) errors[field] = error;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}
