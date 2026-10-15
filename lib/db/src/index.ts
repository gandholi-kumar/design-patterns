import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

// Ensure .env is loaded before creating Pool if DATABASE_URL is not yet in process.env
if (!process.env.DATABASE_URL) {
  for (const envFile of [".env", "../../.env", "../.env"]) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      try {
        process.loadEnvFile?.(fullPath);
        break;
      } catch {}
    }
  }
}

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "drizzle-orm";
