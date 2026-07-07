import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Better Auth owns the organization/member tables. We keep a lightweight
// metadata table for billing + limits that maps to Better Auth org IDs.
export const planEnum = pgEnum("plan", ["free", "pro", "team", "enterprise"]);

export const orgMetadata = pgTable("org_metadata", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  limits: jsonb("limits").notNull().$type<{
    maxProjects: number;
    maxSandboxHours: number;
    maxMessages: number;
    maxSeats: number;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});
