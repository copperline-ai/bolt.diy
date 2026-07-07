import { pgTable, text, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { orgMetadata } from "./organizations";

export const billingEventTypeEnum = pgEnum("billing_event_type", [
  "message.sent",
  "sandbox.hour",
  "seat.added",
  "storage.gb",
]);

export const billingEvents = pgTable("billing_events", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgMetadata.orgId, { onDelete: "cascade" }),
  eventType: billingEventTypeEnum("event_type").notNull(),
  quantity: real("quantity").notNull().default(1),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
});
