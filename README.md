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

For production, tell Convex your public URL so the sitemap and link previews work:

```bash
bunx convex env set SITE_URL=https://your-site-url
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
  schema.ts     # users, recipes, bookmarks, rate limits
  recipes.ts    # feed, detail, create/update/delete
  users.ts      # profile and account lifecycle
tests/unit/     # slug, scaling, rate limit, utility tests
```

## Good to know

- **Recipe links** follow the title. Renaming a recipe changes its URL.
- **Usernames** are lowercase letters, numbers, and underscores (3–32 characters), and can't be changed once set.
- **Autosave** kicks in after 30 seconds of editing. Limits are 10 new recipes, 120 edits, and 60 bookmark toggles per hour.
- **Images** can be up to 5 MB. Replacing one deletes the old file.

## License

MIT
