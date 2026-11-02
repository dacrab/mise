# Mise

> *From "mise en place" — the cook's habit of preparing everything before the fire.*

A quiet recipe journal for home cooks. Keep the food you actually make, share it with people who care, and skip the ads and algorithms.

## What it does

- Write recipes with a cover photo, ingredients, and steps
- Draft privately, publish when it's ready
- Browse, search, and filter what everyone else is cooking
- Save recipes you want to make again
- Share a public chef page with your own bio and avatar
- Print any recipe in a clean, ink-friendly layout

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TanStack Start, Tailwind CSS 4 |
| Components | Base UI, Heroicons |
| Backend | Convex (database, file storage, realtime) |
| Auth | Clerk |
| Tooling | Bun, Biome, Vitest, Knip |

## Run it

```bash
bun install

# Link secrets with Doppler, or copy .env.example to .env
doppler setup

# Terminal 1 — backend
bunx convex dev

# Terminal 2 — app
bun dev
```

The app opens at [http://localhost:3000](http://localhost:3000).

## Environment

`VITE_CONVEX_URL` is written for you by `convex dev`. `.env.example` lists the rest.

For production, set your public URL so canonical links, previews, and the sitemap point at the right domain:

```bash
bunx convex env set SITE_URL=https://your-site-url
VITE_SITE_URL=https://your-site-url
```

Recipes published before this version need a one-time index backfill:

```bash
bunx convex run migrations:backfill --prod
```

## Scripts

```bash
bun dev              # dev server
bun build            # production build
bun start            # preview the build

bun run validate     # types, lint, and unused-code checks
bun test             # unit tests
```

## Layout

```
src/
  components/   # layout, recipe, dashboard, auth, UI pieces
  hooks/        # theme, uploads, sign-out
  lib/          # helpers, bookmarks store, formatting
  routes/       # pages
  styles.css    # design tokens and shared classes
convex/
  schema.ts     # users, recipes, bookmarks, slug redirects, rate limits
  recipes.ts    # feed, detail, create/update/delete
  migrations.ts # one-time index backfill
  users.ts      # profile and account lifecycle
tests/unit/     # slug, scaling, rate limit, utility tests
```

## Good to know

- **Recipe links** follow the title, and old links keep working after a rename.
- **Search** matches titles, descriptions, ingredients, and steps.
- **Usernames** are lowercase letters, numbers, and underscores (3–32 characters), and can't be changed once set.
- **Autosave** kicks in after 30 seconds of editing. Limits are 10 new recipes, 120 edits, 60 bookmark toggles, and 30 uploads per hour.
- **Images** can be up to 5 MB. Replacing one deletes the old file.

## License

MIT
