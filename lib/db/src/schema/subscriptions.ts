import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const subscriptionsTable = pgTable("subscriptions", {
  id: text("id").primaryKey(), // Stripe or internal subscription ID
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  tier: text("tier").notNull().default("premium"), // 'premium' | 'enterprise'
  status: text("status").notNull().default("active"), // 'active' | 'trialing' | 'past_due' | 'canceled'
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("subscription_user_idx").on(table.userId),
]);
