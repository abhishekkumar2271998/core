import type { SiteConfig } from "@/types";

/**
 * Central site configuration. Edit this file to personalise the portfolio:
 * name, role, socials, navigation and availability all flow from here.
 */
export const siteConfig: SiteConfig = {
  name: "Alex Morgan",
  shortName: "Alex",
  title: "Alex Morgan — Full-Stack Engineer",
  role: "Full-Stack Engineer",
  tagline: "I design and build fast, accessible products for the web.",
  description:
    "Full-stack engineer focused on React, Next.js and TypeScript. I help teams ship polished, performant products — from first prototype to production at scale.",
  url: "https://example.com",
  location: "Remote · Based in Europe",
  timezone: "Europe/Berlin",
  email: "hello@example.com",
  availability: {
    open: true,
    message: "Available for freelance & full-time roles",
  },
  resumeUrl: "/resume.pdf",
  avatarInitials: "AM",
  nav: [
    { label: "Home", href: "/", description: "Start here" },
    { label: "About", href: "/about", description: "Who I am and how I work" },
    { label: "Projects", href: "/projects", description: "Selected work and case studies" },
    { label: "Experience", href: "/experience", description: "Career timeline" },
    { label: "Blog", href: "/blog", description: "Writing on engineering and design" },
    { label: "Uses", href: "/uses", description: "Tools and gear I rely on" },
    { label: "Contact", href: "/contact", description: "Get in touch" },
  ],
  socials: [
    { platform: "github", label: "GitHub", href: "https://github.com/", handle: "@alexmorgan" },
    { platform: "linkedin", label: "LinkedIn", href: "https://linkedin.com/", handle: "in/alexmorgan" },
    { platform: "twitter", label: "X / Twitter", href: "https://x.com/", handle: "@alexmorgan" },
    { platform: "email", label: "Email", href: "mailto:hello@example.com", handle: "hello@example.com" },
  ],
  keywords: [
    "full-stack engineer",
    "react developer",
    "next.js",
    "typescript",
    "frontend",
    "portfolio",
    "web performance",
    "accessibility",
  ],
};
