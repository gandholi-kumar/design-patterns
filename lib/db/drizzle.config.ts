import fs from "fs";
import path from "path";
import { defineConfig } from "drizzle-kit";

for (const envFile of [".env", "../../.env", "../.env"]) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    try {
      process.loadEnvFile?.(fullPath);
      break;
    } catch {}
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
