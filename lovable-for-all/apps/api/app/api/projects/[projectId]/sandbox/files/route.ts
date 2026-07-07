import { withOrg } from "@/lib/middleware/with-org";
import { getSandboxProvider } from "@/lib/sandbox";
import { db, schema, setCurrentOrg } from "@hatchery/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const writeSchema = z.object({
  files: z.array(z.object({ path: z.string(), content: z.string() })),
});

export const PUT = withOrg(async (orgId: string, req: Request) => {
  const { projectId } = paramsFromUrl(req.url);
  const body = await req.json();
  const parsed = writeSchema.parse(body);

  await db.execute(setCurrentOrg(orgId));

  const instance = await db.query.sandboxInstances.findFirst({
    where: eq(schema.sandboxInstances.projectId, projectId),
  });

  if (!instance?.providerInstanceId) {
    return NextResponse.json({ error: "No running sandbox" }, { status: 400 });
  }

  const provider = await getSandboxProvider(instance.provider);
  await provider.writeFiles(instance.providerInstanceId, parsed.files);

  return NextResponse.json({ success: true });
});

export const GET = withOrg(async (orgId: string, req: Request) => {
  const { projectId } = paramsFromUrl(req.url);
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  await db.execute(setCurrentOrg(orgId));

  const instance = await db.query.sandboxInstances.findFirst({
    where: eq(schema.sandboxInstances.projectId, projectId),
  });

  if (!instance?.providerInstanceId) {
    return NextResponse.json({ error: "No running sandbox" }, { status: 400 });
  }

  const provider = await getSandboxProvider(instance.provider);
  const content = await provider.readFile(instance.providerInstanceId, path);

  return NextResponse.json({ content });
});

function paramsFromUrl(url: string) {
  const parts = new URL(url).pathname.split("/");
  return { projectId: parts[parts.indexOf("projects") + 1] };
}
