import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Better Auth will create its own users/sessions/accounts tables. We add a
// complementary profile table for any extra attributes we want to store.
export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  onboardingCompleted: text("onboarding_completed").notNull().default("false"),
  defaultOrgId: text("default_org_id"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});
