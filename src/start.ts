import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    csrfMiddleware,
    clerkMiddleware({
      publishableKey: process.env["VITE_CLERK_PUBLISHABLE_KEY"],
      secretKey: process.env["CLERK_SECRET_KEY"],
    }),
  ],
}));
