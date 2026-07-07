import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { orgMetadata } from "./organizations";

export const githubAppInstallations = pgTable("github_app_installations", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgMetadata.orgId, { onDelete: "cascade" })
    .unique(),
  installationId: integer("installation_id").notNull(),
  accountId: integer("account_id").notNull(),
  accountLogin: text("account_login").notNull(),
  encryptedToken: text("encrypted_token").notNull(),
  tokenIv: text("token_iv").notNull(),
  tokenTag: text("token_tag").notNull(),
  tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }).notNull(),
  permissions: jsonb("permissions").notNull().$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});
