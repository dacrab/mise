import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";

export const getAuth = (db: any, env: any) => {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
          ...schema
      }
    }),
    user: {
      additionalFields: {
          username: { type: "string" },
          bio: { type: "string" }
      }
    },
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  });
};