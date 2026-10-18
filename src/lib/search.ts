import { z } from "zod";

/** Shared `?redirect=` search param for the auth routes. */
export const redirectSearchSchema = z.object({ redirect: z.string().optional() });
