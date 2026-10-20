import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Container, Separator } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { PostCard } from "@/components/blog/PostCard";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { getAdjacentPosts, getPost, getRelatedPosts, posts } from "@/data/posts";
import { siteConfig } from "@/data/site";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";
import { formatDate, readingTime, slugify } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [siteConfig.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug, 3);
  const minutes = readingTime(post.content);

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <Icon name="arrow-left" className="h-4 w-4" /> All posts
      </Link>

      <header className="mx-auto mt-8 max-w-3xl lg:mx-0">
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/blog/tags/${slugify(tag)}`}
                className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent hover:bg-accent/20"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2 text-fg">
            <Avatar initials={siteConfig.avatarInitials} size="sm" />
            {siteConfig.name}
          </span>
          <time dateTime={post.date} className="inline-flex items-center gap-1.5">
            <Icon name="calendar" className="h-4 w-4" /> {formatDate(post.date)}
          </time>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4" /> {minutes} min read
          </span>
          {post.updated ? <span>Updated {formatDate(post.updated)}</span> : null}
        </div>
      </header>

      <Separator className="my-10" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article className="prose-content min-w-0 max-w-3xl">{renderMarkdown(post.content)}</article>

        {headings.length ? (
          <aside className="hidden lg:block" aria-label="Table of contents">
            <nav className="sticky top-24">
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">On this page</p>
              <ul className="space-y-2 border-l text-sm">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
                    <a href={`#${h.id}`} className="text-muted transition-colors hover:text-fg">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}
      </div>

      <div className="mt-16 max-w-3xl space-y-12">
        <PostNavigation prev={prev} next={next} />

        {related.length ? (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-6 text-xl font-semibold tracking-tight text-fg">
              Related posts
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.slice(0, 2).map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Container>
  );
}
