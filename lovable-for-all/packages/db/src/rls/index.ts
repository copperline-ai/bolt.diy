import { sql } from "drizzle-orm";

export function setCurrentOrg(orgId: string) {
  return sql`SELECT set_config('app.current_org_id', ${orgId}, true)`;
}
