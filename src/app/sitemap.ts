import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { projects } from "@/data/projects";
import { getSortedPosts } from "@/data/posts";
import { slugify, unique } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  const posts = getSortedPosts();

  const staticRoutes: MetadataRoute.Sitemap = siteConfig.nav.map((item) => ({
    url: `${base}${item.href === "/" ? "" : item.href}`,
    lastModified: now,
    changeFrequency: item.href === "/" || item.href === "/blog" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: project.featured ? 0.7 : 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = unique(posts.flatMap((post) => post.tags.map(slugify))).map((tag) => ({
    url: `${base}/blog/tags/${tag}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...tagRoutes];
}
