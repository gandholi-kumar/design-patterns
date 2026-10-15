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
const zAny = z as any;
if (!zAny.looseObject) {
  zAny.looseObject = (shape: any) => z.object(shape).passthrough();
}
if (zAny.ZodObject && !zAny.ZodObject.prototype.loose) {
  zAny.ZodObject.prototype.loose = function () {
    return this.passthrough();
  };
}

