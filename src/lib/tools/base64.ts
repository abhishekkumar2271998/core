import { fail, ok, type Result } from "./types";

export interface Base64Options {
  /** Use the URL-safe alphabet (`-_`) and drop `=` padding. */
  urlSafe: boolean;
}

/** UTF-8 safe: `btoa` only understands Latin-1, so encode to bytes first. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Accepts standard or URL-safe input, with or without padding or whitespace. */
export function normalizeBase64(input: string): string {
  const cleaned = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const remainder = cleaned.length % 4;
  return remainder ? cleaned + "=".repeat(4 - remainder) : cleaned;
}

export function encodeBase64(text: string, { urlSafe }: Base64Options): string {
  const encoded = bytesToBase64(new TextEncoder().encode(text));
  return urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : encoded;
}

export function decodeBase64(input: string): Result<string> {
  const normalized = normalizeBase64(input);
  if (!normalized) return ok("");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) || normalized.length % 4 === 1) {
    return fail("Input contains characters that are not valid Base64.");
  }
  try {
    const bytes = base64ToBytes(normalized);
    return ok(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return fail("Decoded bytes are not valid UTF-8 text (is this binary data?).");
  }
}
