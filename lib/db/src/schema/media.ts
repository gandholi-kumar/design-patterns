import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const mediaAssetsTable = pgTable("media_assets", {
  id: text("id").primaryKey(), // e.g. "asset-uuid4"
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  patternId: text("pattern_id").notNull(),
  s3Key: text("s3_key").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  publicUrl: text("public_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("media_user_pattern_idx").on(table.userId, table.patternId),
]);
