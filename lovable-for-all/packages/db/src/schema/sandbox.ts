import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const sandboxStatusEnum = pgEnum("sandbox_status", [
  "creating",
  "running",
  "stopped",
  "error",
]);

export const sandboxInstances = pgTable("sandbox_instances", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: ["daytona", "modal", "e2b", "webcontainer"] }).notNull(),
  status: sandboxStatusEnum("status").notNull().default("creating"),
  providerInstanceId: text("provider_instance_id"),
  previewUrl: text("preview_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
});
