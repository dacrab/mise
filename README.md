# Mise

A quiet recipe journal for home cooks.

**Live demo:** https://mise-tan.vercel.app

Write down the food you actually make, keep the ones worth repeating, and share the rest with people who care. There are no ads and no algorithm — just recipes, photos, and the cooks behind them. You can browse what everyone else is making, save favourites, and print anything in a clean, ink-friendly layout.

## Features

- Write recipes with a cover photo, ingredients, and steps
- Keep drafts private and publish when you're ready
- Browse, search, and filter recipes by category
- Search inside ingredients and steps, not just titles
- Save recipes you want to make again
- Share a public chef page with your own bio and photo
- Print any recipe on a single tidy page

## Run it locally

You'll need [Bun](https://bun.sh) and a Convex deployment.

```bash
bun install
doppler setup        # link secrets, or copy .env.example to .env and fill it in
bunx convex dev      # terminal 1 — backend
bun dev              # terminal 2 — app
```

The app opens at [http://localhost:3000](http://localhost:3000).

## Good to know

- Recipe links follow the title, and old links keep working after a rename.
- Usernames are lowercase letters, numbers, and underscores (3–32 characters) and can't be changed once set.
- Edits autosave after 30 seconds. There are hourly limits: 10 new recipes, 120 edits, 60 saves, and 30 uploads.
- Images can be up to 5 MB; replacing one deletes the old file.
- Accounts and sign-in are handled by Clerk.

## Built with

React, TanStack Start, Convex, Clerk, and Tailwind CSS.

## License

MIT
