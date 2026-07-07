import { withOrg } from "@/lib/middleware/with-org";
import { getSandboxProvider } from "@/lib/sandbox";
import { db, schema, setCurrentOrg } from "@hatchery/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const executeSchema = z.object({
  command: z.string().min(1),
});

export const POST = withOrg(async (orgId: string, req: Request) => {
  const parts = new URL(req.url).pathname.split("/");
  const projectId = parts[parts.indexOf("projects") + 1];
  const body = await req.json();
  const parsed = executeSchema.parse(body);

  await db.execute(setCurrentOrg(orgId));

  const instance = await db.query.sandboxInstances.findFirst({
    where: eq(schema.sandboxInstances.projectId, projectId),
  });

  if (!instance?.providerInstanceId) {
    return NextResponse.json({ error: "No running sandbox" }, { status: 400 });
  }

  const provider = await getSandboxProvider(instance.provider);
  const result = await provider.executeCommand(instance.providerInstanceId, parsed.command);

  return NextResponse.json(result);
});
