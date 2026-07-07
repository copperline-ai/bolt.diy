import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { orgMetadata } from "./organizations";

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgMetadata.orgId, { onDelete: "cascade" }),
  keyHash: text("key_hash").notNull().unique(),
  name: text("name").notNull(),
  providerName: text("provider_name").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  keyIv: text("key_iv").notNull(),
  keyTag: text("key_tag").notNull(),
  scopes: jsonb("scopes").notNull().$type<string[]>(),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
});
