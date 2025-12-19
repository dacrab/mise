# RecipeSwap V2 🍳

A modern, full-stack recipe platform built with Astro 5, React, and Cloudflare. Features social interactions, R2 media storage, and high-performance hybrid rendering.

## 🚀 Tech Stack

- **Framework:** [Astro 5](https://astro.build/) (Static + Hybrid Rendering)
- **UI/Components:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/) (Google & Email/Password)
- **Storage:** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible object storage)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)

## ✨ Features

- **Hybrid Architecture:**
  - **Public Pages:** Statically generated/cached for maximum performance (Homepage, Recipe View).
  - **Chef Dashboard:** Client-rendered React islands for interactivity.
- **Authentication:** Secure login via Email and Password or Google OAuth.
- **Recipe Management:**
  - Create, Update, and Delete recipes.
  - Category tagging and video tutorial support.
- **Social Interactions:** Like, bookmark, and comment on recipes.
- **Image Optimization:** Automated WebP conversion and resizing via Astro's Image component.
- **Search:** Server-side filtering by title, description, and category.

## 🛠️ Project Structure

```bash
/
├── src/
│   ├── actions/        # Server Actions (CRUD, Social, Uploads)
│   ├── components/     # React & Astro Components
│   ├── db/             # Database Schema & Client
│   ├── layouts/        # Page Layouts
│   ├── lib/            # Auth Configuration
│   ├── pages/          # File-based Routing
│   │   ├── api/        # Auth API Routes
│   │   ├── dashboard/  # User Kitchen/Dashboard
│   │   └── recipe/     # Recipe Details
│   └── middleware.ts   # Route Protection
├── drizzle.config.ts   # ORM Config
└── astro.config.mjs    # Framework Config
```

## ⚡ Getting Started

### Prerequisites

- **Bun** (Recommended)
- **Cloudflare Account** (for R2 & Pages)
- **Neon Database** (Postgres)
- **Google Cloud Console Project** (for OAuth)

### 1. Clone & Install

```bash
git clone https://github.com/dacrab/recipeswap-v2.git
cd recipeswap-v2
bun install
```

### 2. Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL`: Your Neon Postgres connection string.
- `BETTER_AUTH_SECRET`: A random string for encryption.
- `BETTER_AUTH_URL`: Your site's base URL (e.g., `http://localhost:4321` or your production domain).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
- `CLOUDFLARE_ACCOUNT_ID`: From Cloudflare Dashboard.
- `CLOUDFLARE_ACCESS_KEY_ID` / `SECRET_ACCESS_KEY`: R2 API Tokens.
- `R2_BUCKET_NAME`: Your bucket name.
- `PUBLIC_R2_DOMAIN`: The public domain for your R2 bucket.

### 3. Database Setup

Push the Drizzle schema to your Neon database:

```bash
bun run db:push
```

### 4. Run Locally

Start the development server:

```bash
bun dev
```

Visit `http://localhost:4321` to see the app.

## 📦 Deployment

This project is configured for **Cloudflare Pages**.

1. Connect your repository to Cloudflare Pages (e.g., `dacrab/recipeswap-v2`).
2. Set the build command: `bun run build`.
3. Set the output directory: `dist`.
4. Add all environment variables from your `.env` to the Cloudflare Pages settings.
5. Enable the `nodejs_compat` compatibility flag in Settings > Functions.

## 🛡️ License

MIT