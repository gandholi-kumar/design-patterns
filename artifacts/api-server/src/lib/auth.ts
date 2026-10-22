import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const vercelOrigin = vercelHost ? `https://${vercelHost.replace(/^https?:\/\//, "")}` : null;
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, "") : null;
const resolvedBaseUrl = process.env.BETTER_AUTH_URL || frontendUrl || vercelOrigin || "http://localhost:3000";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "gof_masterclass_dev_secret_key_32_chars_long_2026",
  baseURL: resolvedBaseUrl,
  trustedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(frontendUrl ? [frontendUrl] : []),
    ...(vercelOrigin ? [vercelOrigin] : []),
    ...(process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean),
  ],
  user: {
    additionalFields: {
      persona: {
        type: "string",
        defaultValue: "engineer",
        input: true,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dev-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dev-google-client-secret",
      enabled: true,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "dev-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dev-github-client-secret",
      enabled: true,
    },
  },
  plugins: [
    admin({
      defaultRole: "member",
      adminUserIds: (process.env.INITIAL_ADMIN_IDS || "").split(",").map(id => id.trim()).filter(Boolean),
    }),
  ],
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // 5-minute memory cache
    expiresIn: 60 * 60 * 24 * 14, // 14-day rolling session
  },
});
