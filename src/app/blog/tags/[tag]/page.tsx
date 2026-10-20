import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPostTags, getPostsByTagSlug } from "@/data/posts";
import { cn, pluralize, slugify } from "@/lib/utils";

type Params = Promise<{ tag: string }>;

export function generateStaticParams() {
  return getAllPostTags().map((tag) => ({ tag: slugify(tag) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag } = await params;
  const result = getPostsByTagSlug(tag);
  if (!result) return { title: "Tag not found" };
  return {
    title: `Posts tagged “${result.tag}”`,
    description: `Articles about ${result.tag}.`,
    alternates: { canonical: `/blog/tags/${tag}` },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const { tag } = await params;
  const result = getPostsByTagSlug(tag);
  if (!result) notFound();

  return (
    <Container>
      <Section>
        <Link href="/blog" className="text-sm text-muted transition-colors hover:text-fg">
          ← All posts
        </Link>
        <SectionHeader
          as="h1"
          className="mt-6"
          eyebrow="Topic"
          title={`#${result.tag}`}
          description={`${pluralize(result.posts.length, "article")} tagged ${result.tag}.`}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <nav aria-label="Other topics" className="mt-16 flex flex-wrap gap-2">
          {getAllPostTags().map((t) => {
            const active = t === result.tag;
            return (
              <Link
                key={t}
                href={`/blog/tags/${slugify(t)}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active ? "border-accent bg-accent/10 text-accent" : "text-muted hover:text-fg",
                )}
              >
                {t}
              </Link>
            );
          })}
        </nav>
      </Section>
    </Container>
  );
}
