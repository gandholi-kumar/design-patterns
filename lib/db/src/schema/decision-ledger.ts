import { pgTable, text, integer, timestamp, serial, index } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const decisionLedgerTable = pgTable("decision_ledger", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  problemStatement: text("problem_statement").notNull(),
  primaryPattern: text("primary_pattern").notNull(),
  runnerUpPattern: text("runner_up_pattern"),
  confidence: integer("confidence").notNull(),
  tradeOffs: text("trade_offs").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("decision_ledger_user_idx").on(table.userId),
]);
