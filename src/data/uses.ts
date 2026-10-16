import type { UsesCategory } from "@/types";

/**
 * The /uses page. Add, remove or reorder categories and items freely —
 * the page and its jump navigation are generated from this list.
 */
export const usesCategories: UsesCategory[] = [
  {
    id: "hardware",
    title: "Hardware",
    items: [
      {
        name: "MacBook Pro 14″ (M3 Pro, 36GB)",
        description:
          "My daily driver. Silent, fast and the battery comfortably lasts a full day of builds, Docker and a dozen browser tabs.",
      },
      {
        name: "LG UltraFine 27″ 5K",
        description: "Crisp text at 2x scaling makes long reading and code review sessions far less tiring.",
      },
      {
        name: "Keychron Q1 Pro",
        description: "Gasket-mounted 75% keyboard with Gateron Brown switches. Quiet enough for calls, satisfying enough to type all day.",
      },
      {
        name: "Logitech MX Master 3S",
        description: "Horizontal scroll wheel and per-app gestures. Hard to go back to anything else.",
      },
      {
        name: "Shure MV7+",
        description: "USB microphone for calls, pairing sessions and the occasional conference talk recording.",
      },
      {
        name: "Fully Jarvis standing desk",
        description: "I alternate sitting and standing every hour or so. My back has thanked me ever since.",
      },
    ],
  },
  {
    id: "editor-terminal",
    title: "Editor & Terminal",
    items: [
      {
        name: "VS Code",
        description:
          "Minimal setup: Vim keybindings, Error Lens, GitLens, Tailwind IntelliSense and Pretty TypeScript Errors.",
        href: "https://code.visualstudio.com",
      },
      {
        name: "Ghostty",
        description: "A fast, native, GPU-accelerated terminal with sensible defaults and great font rendering.",
        href: "https://ghostty.org",
      },
      {
        name: "zsh + Starship",
        description: "Starship keeps the prompt informative without being noisy — git status, runtime versions, nothing more.",
        href: "https://starship.rs",
      },
      {
        name: "JetBrains Mono",
        description: "My coding font everywhere: editor, terminal and the code blocks on this very site.",
        href: "https://www.jetbrains.com/lp/mono/",
      },
      {
        name: "GitHub Dark Dimmed",
        description: "Low-contrast dark theme that's easy on the eyes late at night, with a light variant for sunny days.",
      },
      {
        name: "tmux",
        description: "Session per project, so jumping between client work is a single keystroke away.",
        href: "https://github.com/tmux/tmux",
      },
    ],
  },
  {
    id: "dev-tools",
    title: "Dev Tools",
    items: [
      {
        name: "pnpm",
        description: "Fast, disk-efficient package manager with excellent monorepo workspaces support.",
        href: "https://pnpm.io",
      },
      {
        name: "Docker / OrbStack",
        description: "OrbStack runs containers on macOS with a fraction of the memory and battery cost.",
        href: "https://orbstack.dev",
      },
      {
        name: "TablePlus",
        description: "Native database GUI for Postgres, Redis and SQLite. Fast and pleasant to use.",
        href: "https://tableplus.com",
      },
      {
        name: "Bruno",
        description: "Offline-first API client that stores collections as plain files right inside the repo.",
        href: "https://www.usebruno.com",
      },
      {
        name: "GitHub CLI",
        description: "Reviewing, checking out and merging pull requests without leaving the terminal.",
        href: "https://cli.github.com",
      },
      {
        name: "Chrome DevTools",
        description: "Performance panel, Lighthouse and the accessibility tree — my go-to for shipping fast, inclusive UIs.",
      },
    ],
  },
  {
    id: "design",
    title: "Design",
    items: [
      {
        name: "Figma",
        description: "Wireframes, high-fidelity mocks and design system libraries shared with the teams I work with.",
        href: "https://figma.com",
      },
      {
        name: "Excalidraw",
        description: "Hand-drawn style diagrams for architecture discussions and blog post illustrations.",
        href: "https://excalidraw.com",
      },
      {
        name: "Rive",
        description: "Interactive, state-driven animations that ship as tiny runtime files.",
        href: "https://rive.app",
      },
      {
        name: "Contrast",
        description: "Menu-bar app for quick WCAG contrast checks while picking colours.",
      },
      {
        name: "CleanShot X",
        description: "Screenshots, annotated screen recordings and scrolling captures for bug reports and docs.",
        href: "https://cleanshot.com",
      },
    ],
  },
  {
    id: "apps",
    title: "Apps",
    items: [
      {
        name: "Raycast",
        description: "Launcher, clipboard history, window management and snippets — replaced half a dozen utilities.",
        href: "https://raycast.com",
      },
      {
        name: "Arc",
        description: "Spaces per client keep work tabs neatly separated from personal browsing.",
        href: "https://arc.net",
      },
      {
        name: "Obsidian",
        description: "Plain-markdown notes, daily journals and the drafts for every article on this blog.",
        href: "https://obsidian.md",
      },
      {
        name: "Linear",
        description: "Issue tracking that's fast enough to not get in the way. Keyboard-driven everything.",
        href: "https://linear.app",
      },
      {
        name: "1Password",
        description: "Passwords, SSH keys and secrets, with CLI integration for local environment variables.",
        href: "https://1password.com",
      },
      {
        name: "Things 3",
        description: "Personal to-dos and a weekly review ritual that keeps side projects moving.",
        href: "https://culturedcode.com/things/",
      },
    ],
  },
  {
    id: "stack",
    title: "Stack",
    items: [
      {
        name: "Next.js",
        description: "The React framework I reach for first — this site is built with the App Router.",
        href: "https://nextjs.org",
      },
      {
        name: "TypeScript",
        description: "Strict mode on, always. Types are the cheapest documentation you'll ever write.",
        href: "https://www.typescriptlang.org",
      },
      {
        name: "Tailwind CSS",
        description: "Utility-first styling with design tokens as CSS variables for effortless theming.",
        href: "https://tailwindcss.com",
      },
      {
        name: "PostgreSQL + Drizzle",
        description: "A boring, reliable database paired with a type-safe, SQL-first ORM.",
        href: "https://orm.drizzle.team",
      },
      {
        name: "Vercel",
        description: "Preview deployments for every pull request make reviews with designers effortless.",
        href: "https://vercel.com",
      },
      {
        name: "Playwright",
        description: "End-to-end tests across browsers, plus visual regression checks for critical flows.",
        href: "https://playwright.dev",
      },
      {
        name: "Sentry",
        description: "Error tracking and performance monitoring so I hear about bugs before users do.",
        href: "https://sentry.io",
      },
    ],
  },
];
