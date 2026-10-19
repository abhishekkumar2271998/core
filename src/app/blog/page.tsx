import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPostTags, getFeaturedPosts, getSortedPosts, getTagCounts } from "@/data/posts";
import { groupBy, slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on React, TypeScript, web performance, accessibility and the craft of building for the web.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const featured = getFeaturedPosts(3);
  const all = getSortedPosts();
  const byYear = groupBy(all, (p) => p.date.slice(0, 4));
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
  const tags = getAllPostTags();
  const counts = getTagCounts();

  return (
    <Container>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="Blog"
          title="Notes on building for the web"
          description="Long-form writing on React, TypeScript, performance, accessibility and the craft of shipping good software."
          action={
            <ButtonLink href="/rss.xml" external variant="outline" size="sm" iconLeft="rss">
              RSS feed
            </ButtonLink>
          }
        />

        <h2 className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">Featured</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <h2 className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">
              All posts ({all.length})
            </h2>
            <div className="space-y-10">
              {years.map((year) => (
                <section key={year} aria-labelledby={`year-${year}`}>
                  <h3 id={`year-${year}`} className="mb-2 text-2xl font-semibold tracking-tight text-fg">
                    {year}
                  </h3>
                  <div className="divide-y">
                    {byYear[year].map((post) => (
                      <PostCard key={post.slug} post={post} variant="compact" />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
          <aside aria-label="Topics">
            <h2 className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">Topics</h2>
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog/tags/${slugify(tag)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {tag}
                    <span className="text-xs opacity-70">{counts[tag]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </Container>
  );
}
