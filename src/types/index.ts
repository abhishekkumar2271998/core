export type SocialPlatform =
  | "github"
  | "linkedin"
  | "twitter"
  | "email"
  | "dribbble"
  | "youtube"
  | "rss";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
  handle?: string;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  title: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  location: string;
  timezone: string;
  email: string;
  availability: {
    open: boolean;
    message: string;
  };
  resumeUrl: string;
  avatarInitials: string;
  nav: NavItem[];
  socials: SocialLink[];
  keywords: string[];
}

export type ProjectCategory = "web" | "mobile" | "open-source" | "design" | "tooling" | "ai";

export type ProjectStatus = "live" | "in-progress" | "archived";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  year: number;
  role: string;
  duration: string;
  client?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  tags: string[];
  stack: string[];
  /** Two-stop gradient used for generated cover art, e.g. ["#6366f1", "#ec4899"] */
  gradient: [string, string];
  links: {
    live?: string;
    repo?: string;
    caseStudy?: string;
  };
  metrics: ProjectMetric[];
  sections: ProjectSection[];
  highlights: string[];
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date string, e.g. "2026-03-14" */
  date: string;
  updated?: string;
  tags: string[];
  featured?: boolean;
  /** Lightweight markdown: #/##/### headings, paragraphs, - lists, 1. lists, > quotes, ``` code fences, **bold**, *italic*, `code`, [links](url) */
  content: string;
}

export type EmploymentType = "full-time" | "contract" | "freelance" | "internship";

export interface Experience {
  id: string;
  company: string;
  companyUrl?: string;
  role: string;
  type: EmploymentType;
  location: string;
  remote: boolean;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM" or null when current */
  end: string | null;
  summary: string;
  achievements: string[];
  stack: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  notes?: string;
}

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  name: string;
  level: SkillLevel;
  years: number;
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company: string;
  initials: string;
}

export interface UsesItem {
  name: string;
  description: string;
  href?: string;
}

export interface UsesCategory {
  id: string;
  title: string;
  items: UsesItem[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  icon: IconName;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export type IconName =
  | "github"
  | "linkedin"
  | "twitter"
  | "email"
  | "dribbble"
  | "youtube"
  | "rss"
  | "sun"
  | "moon"
  | "monitor"
  | "menu"
  | "close"
  | "arrow-right"
  | "arrow-up-right"
  | "arrow-left"
  | "arrow-up"
  | "external"
  | "search"
  | "check"
  | "copy"
  | "download"
  | "calendar"
  | "clock"
  | "map-pin"
  | "briefcase"
  | "code"
  | "layers"
  | "sparkles"
  | "terminal"
  | "command"
  | "filter"
  | "grid"
  | "list"
  | "star"
  | "heart"
  | "send"
  | "user"
  | "book"
  | "cpu"
  | "pen"
  | "zap"
  | "globe"
  | "smartphone"
  | "palette"
  | "tag"
  | "hash"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "info"
  | "alert"
  | "loader";
