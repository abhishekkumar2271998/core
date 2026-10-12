# core reviewer notes

## Architecture

This is a Next.js 15 portfolio using the App Router, React Server Components, and strict TypeScript. Routes and metadata/API endpoints live under `src/app/`; reusable UI and feature components are in `src/components/`, while site content is centralized in `src/data/`. Client-only behavior is isolated in `src/hooks/`, with shared validation/utilities in `src/lib/` and domain models in `src/types/`.

## Conventions

- Keep editable portfolio content in `src/data/*.ts`, especially `site.ts`, `projects.ts`, `posts.ts`, `experience.ts`, `skills.ts`, `testimonials.ts`, `services.ts`, and `uses.ts`; pages, sitemap, and command palette are expected to consume this data rather than duplicate content.
- Treat `src/data/site.ts` as the source of truth for identity, role, tagline, canonical URL, contact details, availability, navigation, and social links.
- Follow the App Router structure: route pages and metadata belong in `src/app/`; API handlers such as the contact endpoint belong in `src/app/api/.../route.ts`.
- Preserve strict TypeScript and use the domain types under `src/types/` for shared data shapes.
- Keep reusable UI primitives, layout, command palette, contact UI, and feature components under `src/components/`; client-specific logic should use the hooks in `src/hooks/`.
- Use the CSS custom properties in `src/app/globals.css` for theme colors. The project supports light, dark, and system themes, so avoid hard-coding colors in components when a theme token exists.
- Avoid adding runtime dependencies without strong justification: the README explicitly describes icons, hooks, and UI primitives as in-house and lists no other runtime dependencies.
- Contact submissions must continue through `src/app/api/contact/route.ts`, including input validation, IP-based rate limiting, and logging. An email provider should be added only at the marked integration point and configured via environment variables.

## Watch out for

- Flag duplicated or hard-coded site content that should be read from `src/data/site.ts` or another `src/data/*.ts` module; this can cause pages, sitemap, or command-palette entries to drift.
- Flag changes that produce incorrect canonical URLs or sitemap output when `site.url` is changed; deployment depends on that value being the production domain.
- Flag contact API changes that remove validation, IP rate limiting, or submission logging, or that expose provider credentials in source code instead of environment variables.
- Flag unnecessary client components or hooks in App Router code when the behavior does not require browser APIs or interactivity, since the architecture relies on React Server Components.
- Flag new color literals that bypass the theme variables in `src/app/globals.css`, particularly if they break light/dark/system behavior.
- Verify changes with `npm run typecheck` and `npm run build`; both are documented supported checks.