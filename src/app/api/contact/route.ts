import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------ Rate limiting */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

/**
 * Naive in-memory sliding-window limiter keyed by IP. Good enough for a
 * portfolio; on serverless each instance has its own memory, so swap for a
 * shared store (Upstash Redis, Vercel KV, ...) if you need hard guarantees.
 */
const hits = new Map<string, number[]>();

function rateLimit(ip: string): { allowed: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return { allowed: true, retryAfter: 0, remaining: MAX_REQUESTS - recent.length };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/* ------------------------------------------------------------------ Handler */

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Expected a JSON body." }, { status: 415 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many messages — please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed JSON." }, { status: 400 });
  }

  const result = validateContact(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Please fix the highlighted fields.", errors: result.errors },
      { status: 422 },
    );
  }

  const { website, ...submission } = result.data;

  // Honeypot tripped: pretend everything worked so bots learn nothing.
  if (website) {
    console.warn(`[contact] Honeypot triggered from ${ip}; submission discarded.`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  console.info("[contact] New submission", {
    ...submission,
    ip,
    receivedAt: new Date().toISOString(),
  });

  /*
   * Plug in an email provider here, e.g. with Resend:
   *
   *   await resend.emails.send({
   *     from: "Portfolio <noreply@yourdomain.com>",
   *     to: siteConfig.email,
   *     replyTo: submission.email,
   *     subject: `[Portfolio] ${submission.subject ?? "New message"} — ${submission.name}`,
   *     text: submission.message,
   *   });
   *
   * Postmark, SendGrid, AWS SES or a Slack/Discord webhook work the same way.
   * Wrap the call in try/catch and return a 502 if the provider fails.
   */

  return NextResponse.json(
    { ok: true, message: "Thanks! Your message is on its way." },
    { status: 201, headers: { "X-RateLimit-Remaining": String(limit.remaining) } },
  );
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
