import { defineMiddleware } from "astro:middleware";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { config } from "./config";

export const onRequest = defineMiddleware(async (context, next) => {
    const env = context.locals.env;
    
    if (!env || !env.DATABASE_URL) {
        return new Response(
            "Configuration Error: DATABASE_URL is missing in the Cloudflare Dashboard. Please add it to your Pages settings.", 
            { status: 500 }
        );
    }

    const db = getDb(env.DATABASE_URL);
    const auth = getAuth(db, env);

    context.locals.db = db;
    context.locals.auth = auth;

    try {
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

        const isProtected = config.protectedRoutes.some(route => context.url.pathname.startsWith(route));
        if (isProtected && !session) {
            return context.redirect("/login");
        }
    } catch (e) {
        console.error("Auth Error:", e);
        context.locals.session = null;
        context.locals.user = null;
    }

	return next();
});
