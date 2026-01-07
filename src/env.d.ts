/// <reference path="../.astro/types.d.ts" />

interface Env {
	DATABASE_URL: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	CLOUDFLARE_ACCOUNT_ID: string;
	CLOUDFLARE_ACCESS_KEY_ID: string;
	CLOUDFLARE_SECRET_ACCESS_KEY: string;
	R2_BUCKET_NAME: string;
	PUBLIC_R2_DOMAIN: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		session: import("better-auth").Session | null;
		user: import("better-auth").User | null;
        db: ReturnType<typeof import("./db").getDb>;
        auth: ReturnType<typeof import("./auth").getAuth>;
	}
}