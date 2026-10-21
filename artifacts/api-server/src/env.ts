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

