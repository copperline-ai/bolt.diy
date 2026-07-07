import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { orgMetadata } from "./organizations";

export const sandboxProviderEnum = pgEnum("sandbox_provider", [
  "daytona",
  "modal",
  "e2b",
  "webcontainer",
]);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgMetadata.orgId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sandboxProvider: sandboxProviderEnum("sandbox_provider").notNull().default("daytona"),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const projectFiles = pgTable("project_files", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content").notNull().default(""),
  size: text("size").notNull().default("0"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});
