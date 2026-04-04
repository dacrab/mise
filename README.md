# mise

> *From "mise en place" — the chef's practice of preparing everything before cooking.*

A recipe sharing platform for home cooks. No ads, no algorithms — just good food shared with intention.

## Stack

| Layer | Tech |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 |
| Backend | [Convex](https://convex.dev) — database, auth, file storage, real-time |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI | [Base UI](https://base-ui.com) + [Heroicons](https://heroicons.com) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Testing | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |

## Features

- **Recipes** — create, edit, fork, import from URL, print view, ingredient scaling, cooking timers
- **Social** — likes, bookmarks, comments, star ratings, follow chefs, real-time notifications, presence ("cooking now")
- **Collections** — organise bookmarks into named collections
- **Auth** — email/password + Google OAuth, password reset, profile with custom avatar

## Getting started

```bash
bun install

# Terminal 1 — Convex backend
bunx convex dev

# Terminal 2 — dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

`VITE_CONVEX_URL` is written to `.env.local` automatically by `convex dev`.

Set these in the [Convex dashboard](https://dashboard.convex.dev) → Settings → Environment variables:

```
SITE_URL           # your production URL, e.g. https://mise.cooking
AUTH_GOOGLE_ID     # Google OAuth client ID
AUTH_GOOGLE_SECRET # Google OAuth client secret
```

## Scripts

```bash
bun dev              # development server
bun build            # production build
bun start            # preview production build locally

bun typecheck        # TypeScript — no emit
bun lint             # ESLint
bun lint:fix         # ESLint with auto-fix

bun test             # unit tests (watch)
bun test:run         # unit tests (CI)
bun test:coverage    # unit tests + coverage report
bun test:e2e         # Playwright E2E
bun test:e2e:ui      # Playwright UI mode
bun test:e2e:headed  # Playwright headed mode
bun test:all         # typecheck + lint + unit + e2e
```

## Project structure

```
src/
├── routes/
│   ├── __root.tsx              # HTML shell, fonts, analytics
│   ├── _authed.tsx             # Auth guard + layout
│   ├── _authed/
│   │   ├── dashboard/          # create.tsx, edit.$id.tsx, index.tsx
│   │   └── settings.tsx
│   ├── (auth)/                 # login, signup, forgot-password
│   ├── index.tsx               # home — browse + search
│   ├── recipe.$slug.tsx        # recipe detail
│   ├── recipe.$slug.print.tsx  # print view
│   ├── chef.$username.tsx      # chef profile
│   └── about|privacy|terms.tsx
├── components/
│   ├── auth/       # AuthForms (login, signup, forgot-password)
│   ├── dashboard/  # DashboardView, Collections, RecipeListRow, EmptyState
│   ├── layout/     # Header, PageLayout, SimpleLayout, AuthLayout, ErrorPage
│   ├── recipe/     # RecipeEditor, RecipeImporter, RecipeWidgets, RecipeActions
│   ├── social/     # Comments, Follow, Notifications, SocialActions, StarRating
│   └── ui/         # Primitives (Avatar, Spinner, ProgressBar), RecipeCard, Select, Toast
├── hooks/
│   ├── useAsyncAction.ts       # loading + toast wrapper for async ops
│   ├── useBookmarkToggle.ts    # bookmark state + mutation
│   ├── useConfirmAction.ts     # double-tap confirmation
│   ├── useDismissableLayer.ts  # click-outside / Escape dismissal
│   └── useFileUpload.ts        # upload with progress + abort
├── lib/
│   ├── auth.ts       # calculatePasswordStrength
│   ├── constants.ts  # CATEGORIES, DIFFICULTIES
│   └── utils.ts      # formatNumber, scaleIngredient, timeAgo, formatSeconds, getErrorMessage
└── styles.css        # Tailwind v4 theme + utility classes

convex/
├── schema.ts           # database schema
├── auth.ts             # Convex Auth setup
├── auth.config.ts      # auth providers (password + Google)
├── recipes.ts          # recipe CRUD, search, pagination, fork
├── social.ts           # likes, bookmarks, comments, ratings, follows
├── collections.ts      # bookmark collections
├── discovery.ts        # trending, recommendations
├── notifications.ts    # notification fan-out + read state
├── presence.ts         # real-time "cooking now"
├── recipeImport.ts     # URL recipe scraper
├── users.ts            # profiles, username lookup
├── crons.ts            # scheduled jobs (presence cleanup)
├── http.ts             # HTTP endpoints
└── lib/
    ├── auth.ts         # requireAuth helper
    ├── helpers.ts      # shared query helpers
    ├── notifications.ts # createNotification
    ├── storage.ts      # storage URL resolution
    └── validation.ts   # validateLength

tests/
├── unit/   # Vitest — utils, scaling, hooks, validation
└── e2e/    # Playwright — home, auth, accessibility
```

## License

MIT
