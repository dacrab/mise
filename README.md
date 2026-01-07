# Mise 🍳

> *From "mise en place" — the chef's practice of preparing everything before cooking.*

A modern recipe sharing platform built with Astro 5, React, and Cloudflare. Share your culinary creations with the world.

**This is a complete rewrite of [RecipeSwap](https://github.com/dacrab/RecipeSwap)**, my original HTML/CSS/JS school project, now rebuilt as a full-stack application.

## Tech Stack

- **Framework:** [Astro 5](https://astro.build/) with React islands
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Better Auth](https://better-auth.com/) (Google OAuth + Email/Password)
- **Storage:** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## Features

- Recipe CRUD with image uploads
- Social interactions (likes, bookmarks, comments)
- Chef profiles and dashboards
- Category filtering and search
- Optimistic UI updates

## Quick Start

```bash
# Install
bun install

# Setup database
bun run db:push

# Run dev server
bun dev
```

## Environment Variables

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
PUBLIC_R2_DOMAIN=
```

## License

MIT
