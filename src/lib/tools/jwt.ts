import { decodeBase64 } from "./base64";
import { fail, ok, type Result } from "./types";

export type JsonObject = Record<string, unknown>;

export type JwtTimeStatus = "valid" | "expired" | "not-yet-valid" | "no-expiry";

export interface JwtTimeClaim {
  claim: "iat" | "nbf" | "exp";
  label: string;
  date: Date;
}

export interface DecodedJwt {
  header: JsonObject;
  payload: JsonObject;
  /** Raw base64url signature — shown, never verified. */
  signature: string;
  times: JwtTimeClaim[];
  status: JwtTimeStatus;
}

const TIME_CLAIMS: { claim: JwtTimeClaim["claim"]; label: string }[] = [
  { claim: "iat", label: "Issued at" },
  { claim: "nbf", label: "Not before" },
  { claim: "exp", label: "Expires" },
];

/** Registered claim names (RFC 7519 §4.1) with human descriptions. */
export const REGISTERED_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration time",
  nbf: "Not before",
  iat: "Issued at",
  jti: "JWT ID",
  alg: "Signing algorithm",
  typ: "Token type",
  kid: "Key ID",
};

function decodeSegment(segment: string, name: string): Result<JsonObject> {
  const text = decodeBase64(segment);
  if (!text.ok) return fail(`The ${name} is not valid base64url.`);
  try {
    const value: unknown = JSON.parse(text.value);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return fail(`The ${name} must be a JSON object.`);
    }
    return ok(value as JsonObject);
  } catch {
    return fail(`The ${name} is not valid JSON.`);
  }
}

export function decodeJwt(token: string, now: Date = new Date()): Result<DecodedJwt> {
  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  if (!trimmed) return fail("Paste a JWT to decode it.");

  const parts = trimmed.split(".");
  if (parts.length === 5) return fail("This looks like an encrypted JWE (5 parts); only signed JWTs can be decoded.");
  if (parts.length !== 3) return fail(`A JWT has 3 dot-separated parts; found ${parts.length}.`);

  const header = decodeSegment(parts[0], "header");
  if (!header.ok) return header;
  const payload = decodeSegment(parts[1], "payload");
  if (!payload.ok) return payload;

  const times: JwtTimeClaim[] = [];
  for (const { claim, label } of TIME_CLAIMS) {
    const raw = payload.value[claim];
    if (typeof raw === "number" && Number.isFinite(raw)) times.push({ claim, label, date: new Date(raw * 1000) });
  }

  const exp = times.find((t) => t.claim === "exp");
  const nbf = times.find((t) => t.claim === "nbf");
  let status: JwtTimeStatus = "no-expiry";
  if (nbf && nbf.date > now) status = "not-yet-valid";
  else if (exp) status = exp.date <= now ? "expired" : "valid";

  return ok({ header: header.value, payload: payload.value, signature: parts[2], times, status });
}
