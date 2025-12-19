import type { APIRoute } from "astro";

export const ALL: APIRoute = async (context) => {
	return context.locals.auth.handler(context.request);
};