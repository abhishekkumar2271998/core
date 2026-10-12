"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site";
import { projects } from "@/data/projects";
import { getSortedPosts } from "@/data/posts";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { IconName } from "@/types";
import type { CommandItem } from "./types";

const NAV_ICONS: Record<string, IconName> = {
  "/": "sparkles",
  "/about": "user",
  "/projects": "layers",
  "/experience": "briefcase",
  "/blog": "book",
  "/uses": "cpu",
  "/contact": "email",
};

const REPO_URL = (() => {
  const github = siteConfig.socials.find((s) => s.platform === "github");
  return github ? github.href : "https://github.com/";
})();

interface Options {
  /** Called after "Copy email" succeeds/fails so the palette can show feedback. */
  onCopy: (ok: boolean) => void;
}

/** Builds the full list of palette commands from site data and runtime context. */
export function useCommands({ onCopy }: Options): CommandItem[] {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return useMemo<CommandItem[]>(() => {
    const openExternal = (href: string) => {
      window.open(href, "_blank", "noopener,noreferrer");
    };

    const navigation: CommandItem[] = siteConfig.nav.map((item) => ({
      id: `nav:${item.href}`,
      group: "navigation",
      label: item.label,
      description: item.description,
      keywords: [item.href],
      icon: NAV_ICONS[item.href] ?? "arrow-right",
      perform: () => router.push(item.href),
    }));

    const projectItems: CommandItem[] = projects.map((project) => ({
      id: `project:${project.slug}`,
      group: "projects",
      label: project.title,
      description: project.summary,
      keywords: [...project.tags, project.category],
      icon: "layers",
      perform: () => router.push(`/projects/${project.slug}`),
    }));

    const postItems: CommandItem[] = getSortedPosts().map((post) => ({
      id: `post:${post.slug}`,
      group: "posts",
      label: post.title,
      description: post.excerpt,
      keywords: post.tags,
      icon: "pen",
      perform: () => router.push(`/blog/${post.slug}`),
    }));

    const themeItems: CommandItem[] = (
      [
        { value: "light", label: "Light", icon: "sun" },
        { value: "dark", label: "Dark", icon: "moon" },
        { value: "system", label: "System", icon: "monitor" },
      ] as const
    ).map((t) => ({
      id: `theme:${t.value}`,
      group: "actions",
      label: `Switch to ${t.label.toLowerCase()} theme`,
      keywords: ["theme", "appearance", "mode", t.value],
      icon: t.icon,
      active: theme === t.value,
      perform: () => {
        setTheme(t.value);
        return "keep-open";
      },
    }));

    const socialItems: CommandItem[] = siteConfig.socials
      .filter((s) => s.platform !== "email")
      .map((s) => ({
        id: `social:${s.platform}`,
        group: "actions",
        label: `Open ${s.label}`,
        description: s.handle,
        keywords: ["social", "profile", s.platform],
        icon: s.platform,
        hint: "↗",
        perform: () => openExternal(s.href),
      }));

    const actions: CommandItem[] = [
      ...themeItems,
      {
        id: "action:copy-email",
        group: "actions",
        label: "Copy email address",
        description: siteConfig.email,
        keywords: ["email", "contact", "clipboard", "mail"],
        icon: "copy",
        perform: () => {
          navigator.clipboard
            .writeText(siteConfig.email)
            .then(() => onCopy(true))
            .catch(() => onCopy(false));
        },
      },
      {
        id: "action:email",
        group: "actions",
        label: "Send an email",
        keywords: ["mailto", "contact", "message"],
        icon: "send",
        perform: () => {
          window.location.href = `mailto:${siteConfig.email}`;
        },
      },
      {
        id: "action:resume",
        group: "actions",
        label: "Download résumé",
        keywords: ["resume", "cv", "pdf"],
        icon: "download",
        perform: () => openExternal(siteConfig.resumeUrl),
      },
      ...socialItems,
      {
        id: "action:source",
        group: "actions",
        label: "View source code",
        description: "See how this site is built",
        keywords: ["github", "repository", "code", "open source"],
        icon: "code",
        hint: "↗",
        perform: () => openExternal(REPO_URL),
      },
    ];

    return [...navigation, ...projectItems, ...postItems, ...actions];
  }, [router, theme, setTheme, onCopy]);
}
