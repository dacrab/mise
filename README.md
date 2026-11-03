# Mise

*From "mise en place" — everything cut, weighed and ready before the fire.*

A recipe journal for the food you actually cook.

**Live demo:** https://mise-tan.vercel.app

Write a recipe once, with a photo, ingredients and steps. Keep it private while it's rough, publish when it's good, and let other cooks find it. No ads, no feed ranking, no "you might also like" — just recipes with a name attached. You can save the ones worth repeating, share a chef page of your own, and print anything on one clean page.

## What you can do there

- Draft in private and publish on your own schedule
- Search across titles, descriptions, ingredients and steps
- Filter by category when you know roughly what you want
- Bookmark recipes for later
- Set up a chef page with a bio and a photo
- Print a recipe without the site furniture

## Getting it running

Two terminals — Convex does the data, Vite serves the app. Convex is started first so the frontend has somewhere to talk to.

```bash
bun install
doppler setup        # or copy .env.example to .env

bunx convex dev      # terminal 1
bun dev              # terminal 2 → http://localhost:3000
```

`VITE_CONVEX_URL` writes itself when Convex starts. The rest of what you need — Clerk keys, Convex deployment, site URL — is listed in `.env.example`.

## Details worth knowing

- Links follow the title, and a rename leaves the old URL working.
- Usernames are 3–32 characters of lowercase letters, numbers and underscores. Pick carefully; they don't change.
- Autosave waits 30 seconds after you stop typing. Hourly ceilings: 10 new recipes, 120 edits, 60 bookmark toggles, 30 uploads.
- Cover images top out at 5 MB, and replacing one deletes the old file.

React, TanStack Start, Convex and Clerk, with Tailwind for the styling.

## License

MIT
