import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
	const isProtectedRoute = context.url.pathname.startsWith("/dashboard");

    // Check for session on every request to populate locals
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

	if (isProtectedRoute && !session) {
		return context.redirect("/login");
	}

	return next();
});