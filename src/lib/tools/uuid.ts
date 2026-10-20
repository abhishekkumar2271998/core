export interface UuidOptions {
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
}

export const UUID_PATTERN = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/** RFC 9562 version 4 UUID from the Web Crypto CSPRNG. */
export function uuidv4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // randomUUID is unavailable in insecure (http://) contexts; build it by hand.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function formatUuid(uuid: string, { uppercase, hyphens, braces }: UuidOptions): string {
  let out = hyphens ? uuid : uuid.replace(/-/g, "");
  if (uppercase) out = out.toUpperCase();
  return braces ? `{${out}}` : out;
}

export function generateUuids(count: number, options: UuidOptions): string[] {
  return Array.from({ length: count }, () => formatUuid(uuidv4(), options));
}

export interface UuidInspection {
  valid: boolean;
  version: number | null;
  variant: "NCS" | "RFC 9562" | "Microsoft" | "Future" | null;
  nil: boolean;
}

/** Reads version and variant nibbles out of any UUID string. */
export function inspectUuid(input: string): UuidInspection {
  const value = input.trim().replace(/^\{|\}$/g, "");
  if (!UUID_PATTERN.test(value)) return { valid: false, version: null, variant: null, nil: false };
  const hex = value.replace(/-/g, "").toLowerCase();
  const variantNibble = parseInt(hex[16], 16);
  const variant =
    variantNibble < 8 ? "NCS" : variantNibble < 12 ? "RFC 9562" : variantNibble < 14 ? "Microsoft" : "Future";
  return { valid: true, version: parseInt(hex[12], 16), variant, nil: /^0+$/.test(hex) };
}
