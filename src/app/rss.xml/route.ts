import { getSortedPosts } from "@/data/posts";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 9)).toUTCString();
}

export function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const posts = getSortedPosts();

  const items = posts
    .map((post) => {
      const url = `${base}/blog/${post.slug}`;
      const categories = post.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} — Blog`)}</title>
    <link>${escapeXml(`${base}/blog`)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${posts[0] ? toRfc822(posts[0].updated ?? posts[0].date) : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
