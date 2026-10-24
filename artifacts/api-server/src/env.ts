import fs from "node:fs";
import path from "node:path";

// Automatically load .env file if present before any other module imports
for (const envFile of [".env", "../../.env", "../.env"]) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    try {
      process.loadEnvFile?.(fullPath);
      break;
    } catch {
      // Continue if unreadable
    }
  }
}

// Polyfill Zod 4 loose/looseObject methods if using Zod 3 catalog
import * as z from "zod";

type ZodPolyfillTarget = typeof z & {
  looseObject?: <T extends z.ZodRawShape>(shape: T) => z.ZodObject<T, "passthrough">;
  ZodObject?: {
    prototype: {
      loose?: () => unknown;
      passthrough: () => unknown;
    };
  };
};

const zPoly = z as unknown as ZodPolyfillTarget;
if (!zPoly.looseObject) {
  zPoly.looseObject = <T extends z.ZodRawShape>(shape: T) => z.object(shape).passthrough();
}
if (zPoly.ZodObject && !zPoly.ZodObject.prototype.loose) {
  zPoly.ZodObject.prototype.loose = function () {
    return (this as unknown as { passthrough: () => unknown }).passthrough();
  };
}

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;

