# core reviewer notes

## Architecture

This is a Next.js 15 portfolio using the App Router, React Server Components, strict TypeScript, and Tailwind CSS. Routes and metadata live under `src/app`, reusable UI and feature components under `src/components`, while site content is centralized in `src/data`. Shared client hooks, utilities, validation, and domain types are separated into `src/hooks`, `src/lib`, and `src/types`.

## Conventions

- Keep editable portfolio content in `src/data/*.ts`, especially `src/data/site.ts`; pages, the sitemap, and the command palette are expected to consume this data rather than duplicate it.
- Use CSS-variable theme tokens defined in `src/app/globals.css` instead of hard-coded theme colors. Existing components use semantic Tailwind classes such as `bg-surface`, `text-fg`, and `text-muted` (`src/components/ui/Card.tsx`).
- Build UI from in-house primitives. `src/components/ui/Card.tsx` provides `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`; new components should preserve this compositional style and support `className` overrides where appropriate.
- Component props extend native element props when practical. For example, `CardProps` extends `ComponentPropsWithoutRef<"div">`, and section primitives spread remaining props onto their underlying elements (`src/components/ui/Card.tsx`).
- Use the local `cx` helper for conditional Tailwind classes rather than manually concatenating strings. It filters falsey values and is used for every card primitive in `src/components/ui/Card.tsx`.
- Preserve the existing formatting/style: double-quoted imports and strings, trailing commas, named component exports, and typed props (`src/components/ui/Card.tsx`).
- Keep server/client boundaries intentional: the project is designed around App Router and React Server Components; client-only behavior belongs in `src/hooks` and client components rather than being added broadly.
- The contact endpoint is responsible for input validation, IP-based rate limiting, and submission logging (`src/app/api/contact/route.ts`, as documented in `README.md`).

## Watch out for

- Flag duplicated portfolio content in route components instead of `src/data/*.ts`; centralized data is intended to drive pages, sitemap generation, and command-palette entries.
- Flag new runtime dependencies when an in-house hook, icon, utility, or primitive would suffice; `README.md` explicitly states there are no other runtime dependencies.
- Flag hard-coded colors that bypass the CSS theme variables and semantic classes described in `README.md` and used by `src/components/ui/Card.tsx`.
- Flag UI primitives that discard native props or `className`; the existing card components forward props and merge classes.
- Flag contact-form changes that omit validation or IP rate limiting, since both are explicit responsibilities of `src/app/api/contact/route.ts`.
- Avoid treating `Card`’s default `padded = false` as accidental: padding is opt-in, while `CardHeader` and `CardContent` define their own spacing (`src/components/ui/Card.tsx`).