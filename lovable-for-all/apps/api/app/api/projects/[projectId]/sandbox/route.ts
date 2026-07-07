import { withOrg } from "@/lib/middleware/with-org";
import { getSandboxProvider } from "@/lib/sandbox";
import { db, schema, setCurrentOrg } from "@hatchery/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = withOrg(async (orgId: string, req: Request) => {
  const { projectId } = await req.json();

  await db.execute(setCurrentOrg(orgId));

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const provider = await getSandboxProvider(project.sandboxProvider);
  const providerInstanceId = await provider.createSandbox({ projectId: project.id, language: "typescript" });

  const instance = await db.insert(schema.sandboxInstances).values({
    id: crypto.randomUUID(),
    projectId,
    provider: project.sandboxProvider,
    status: "running",
    providerInstanceId,
  }).returning();

  return NextResponse.json({ instance: instance[0] });
});

export const GET = withOrg(async (orgId: string, req: Request) => {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  await db.execute(setCurrentOrg(orgId));

  const instances = await db.query.sandboxInstances.findMany({
    where: eq(schema.sandboxInstances.projectId, projectId),
  });

  return NextResponse.json({ instances });
});
