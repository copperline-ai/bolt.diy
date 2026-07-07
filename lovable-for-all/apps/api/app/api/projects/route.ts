import { withOrg } from "@/lib/middleware/with-org";
import { db, schema, setCurrentOrg } from "@lovable/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
});

export const GET = withOrg(async (orgId: string) => {
  await db.execute(setCurrentOrg(orgId));
  const projects = await db.query.projects.findMany({
    where: (projects, { eq }) => eq(projects.orgId, orgId),
  });
  return NextResponse.json({ projects });
});

export const POST = withOrg(async (orgId: string, req: Request) => {
  const body = await req.json();
  const parsed = createSchema.parse(body);

  await db.execute(setCurrentOrg(orgId));

  const project = await db.insert(schema.projects).values({
    id: crypto.randomUUID(),
    orgId,
    name: parsed.name,
  }).returning();

  return NextResponse.json({ project: project[0] });
});
