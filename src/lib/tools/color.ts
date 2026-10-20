import { clamp } from "@/lib/utils";
import { fail, ok, type Result } from "./types";

export interface Rgb {
  r: number;
  g: number;
  b: number;
  /** 0..1 */
  a: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
  a: number;
}

const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

function parseHex(input: string): Rgb | null {
  const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input);
  if (!m) return null;
  let hex = m[1];
  if (hex.length <= 4) hex = hex.replace(/./g, (c) => c + c);
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? round(n(6) / 255, 3) : 1 };
}

/** Parses a channel like "50%" or "128" into the 0..max range. */
function channel(value: string, max: number): number {
  return value.endsWith("%") ? (parseFloat(value) / 100) * max : parseFloat(value);
}

function alpha(value: string | undefined): number {
  if (value === undefined) return 1;
  return clamp(value.endsWith("%") ? parseFloat(value) / 100 : parseFloat(value), 0, 1);
}

/** Splits both legacy `rgb(1, 2, 3, .5)` and modern `rgb(1 2 3 / 50%)` syntax. */
function args(body: string): string[] {
  return body
    .replace(/\s*\/\s*/, " ")
    .split(/[\s,]+/)
    .filter(Boolean);
}

export function hslToRgb({ h, s, l, a }: Hsl): Rgb {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) => light - sat * Math.min(light, 1 - light) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255), a };
}

export function rgbToHsl({ r, g, b, a }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100), a };
}

/** Accepts hex (#rgb, #rgba, #rrggbb, #rrggbbaa), rgb()/rgba() and hsl()/hsla(). */
export function parseColor(input: string): Result<Rgb> {
  const value = input.trim().toLowerCase();
  if (!value) return fail("Enter a color.");

  const hex = parseHex(value);
  if (hex) return ok(hex);

  const fn = /^(rgba?|hsla?)\((.*)\)$/.exec(value);
  if (!fn) return fail("Unrecognised color. Try #6366f1, rgb(99 102 241) or hsl(239 84% 67%).");
  const parts = args(fn[2]);
  if (parts.length < 3 || parts.length > 4) return fail(`${fn[1]}() expects 3 values plus optional alpha.`);
  if (parts.slice(0, 3).some((p) => Number.isNaN(parseFloat(p)))) return fail("Color channels must be numbers.");

  if (fn[1].startsWith("rgb")) {
    const [r, g, b] = parts.slice(0, 3).map((p) => Math.round(clamp(channel(p, 255), 0, 255)));
    return ok({ r, g, b, a: alpha(parts[3]) });
  }
  const h = ((parseFloat(parts[0]) % 360) + 360) % 360;
  const s = clamp(parseFloat(parts[1]), 0, 100);
  const l = clamp(parseFloat(parts[2]), 0, 100);
  return ok(hslToRgb({ h, s, l, a: alpha(parts[3]) }));
}

export function toHex({ r, g, b, a }: Rgb): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}${a < 1 ? hex(Math.round(a * 255)) : ""}`;
}

export function toRgbString({ r, g, b, a }: Rgb): string {
  return a < 1 ? `rgb(${r} ${g} ${b} / ${round(a, 3)})` : `rgb(${r} ${g} ${b})`;
}

export function toHslString(rgb: Rgb): string {
  const { h, s, l, a } = rgbToHsl(rgb);
  return a < 1 ? `hsl(${h} ${s}% ${l}% / ${round(a, 3)})` : `hsl(${h} ${s}% ${l}%)`;
}

/** WCAG 2.x relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Composites a translucent color over an opaque backdrop. */
export function flatten(fg: Rgb, bg: Rgb): Rgb {
  const mix = (f: number, b: number) => Math.round(f * fg.a + b * (1 - fg.a));
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a: 1 };
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const solidBg = { ...bg, a: 1 };
  const l1 = luminance(flatten(fg, solidBg));
  const l2 = luminance(solidBg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return round((hi + 0.05) / (lo + 0.05), 2);
}

export interface WcagCheck {
  label: string;
  threshold: number;
  pass: boolean;
}

export function wcagChecks(ratio: number): WcagCheck[] {
  return [
    { label: "AA normal text", threshold: 4.5 },
    { label: "AA large text", threshold: 3 },
    { label: "AAA normal text", threshold: 7 },
    { label: "AAA large text", threshold: 4.5 },
    { label: "UI components", threshold: 3 },
  ].map((c) => ({ ...c, pass: ratio >= c.threshold }));
}

/** Black or white, whichever reads better on the given background. */
export function readableTextOn(bg: Rgb): Rgb {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  return contrastRatio(black, bg) >= contrastRatio(white, bg) ? black : white;
}
