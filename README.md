# Alex Morgan — Developer Portfolio

A fast, accessible personal portfolio built with the Next.js App Router. Projects with case studies, a blog, an experience timeline, a `/uses` page, a contact form, and a ⌘K command palette.

## Tech stack

- **Next.js 15** (App Router, React Server Components)
- **React 19** and **TypeScript** (strict)
- **Tailwind CSS 3**, with theme tokens stored as CSS variables (light/dark/system)
- No other runtime dependencies. Icons, hooks and UI primitives are all in-house.

## Scripts

```bash
npm install        # install dependencies
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Folder structure

```
src/
  app/            routes, metadata files (sitemap, robots, manifest, icon), API routes
  components/     ui primitives, layout, command palette, contact, feature components
  data/           all site content: site.ts, projects, posts, experience, skills, uses...
  hooks/          client hooks (scroll, hotkeys, clipboard, local storage...)
  lib/            utilities and shared validation
  types/          domain types
```

## Customizing

1. **`src/data/site.ts`**: name, role, tagline, URL, email, timezone, availability, navigation and socials. Most of the site reads from this file.
2. **`src/data/*.ts`**: edit `projects.ts`, `posts.ts`, `experience.ts`, `skills.ts`, `testimonials.ts`, `services.ts` and `uses.ts` to change the content. Pages, the sitemap and the command palette update automatically.
3. **Colors**: change the CSS variables in `src/app/globals.css`.
4. **Contact form**: `src/app/api/contact/route.ts` validates input, rate-limits by IP and logs submissions. Add your email provider (Resend, Postmark, ...) where the comment marks it.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). The defaults for Next.js work as-is.
3. Set `url` in `src/data/site.ts` to your production domain so canonical URLs and the sitemap are correct.
4. If you wire up an email provider, add its API key as an environment variable in the Vercel project settings.
