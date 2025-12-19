/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		session: import("better-auth").Session | null;
		user: import("better-auth").User | null;
        db: ReturnType<typeof import("./db").getDb>;
        auth: ReturnType<typeof import("./lib/auth").getAuth>;
	}
}