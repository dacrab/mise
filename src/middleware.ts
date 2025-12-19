import { defineMiddleware } from "astro:middleware";
import { getAuth } from "./lib/auth";
import { getDb } from "./db";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Initialize DB from Cloudflare Bindings
    const db = getDb(context.locals.runtime.env.DATABASE_URL);
    const auth = getAuth(db, context.locals.runtime.env);

    // 2. Attach to locals for use in actions and pages
    context.locals.db = db;
    context.locals.auth = auth;

    // 3. Handle Session
    const session = await auth.api.getSession({
        headers: context.request.headers,
    });

    if (session) {
        context.locals.session = session.session;
        context.locals.user = session.user;
    } else {
        context.locals.session = null;
        context.locals.user = null;
    }

    // 4. Protect Routes
	if (context.url.pathname.startsWith("/dashboard") && !session) {
		return context.redirect("/login");
	}

	return next();
});
