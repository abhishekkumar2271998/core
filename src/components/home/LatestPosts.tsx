import { getFeaturedPosts } from "@/data/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Container, Section, SectionHeader, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function LatestPosts({ limit = 3 }: { limit?: number }) {
  const posts = getFeaturedPosts(limit);

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Writing"
          title="Notes from the trenches"
          description="Long-form posts on React, performance, design systems and the craft of shipping software with small teams."
          action={
            <ButtonLink href="/blog" variant="outline" iconRight="arrow-right">
              Read the blog
            </ButtonLink>
          }
        />
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 100} className="h-full">
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="No posts yet" description="The first articles are in the oven." />
        )}
      </Container>
    </Section>
  );
}
