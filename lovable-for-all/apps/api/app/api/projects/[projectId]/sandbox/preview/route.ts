import { withOrg } from "@/lib/middleware/with-org";
import { getSandboxProvider } from "@/lib/sandbox";
import { db, schema, setCurrentOrg } from "@lovable/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = withOrg(async (orgId: string, req: Request) => {
  const parts = new URL(req.url).pathname.split("/");
  const projectId = parts[parts.indexOf("projects") + 1];
  const { searchParams } = new URL(req.url);
  const port = parseInt(searchParams.get("port") ?? "3000", 10);

  await db.execute(setCurrentOrg(orgId));

  const instance = await db.query.sandboxInstances.findFirst({
    where: eq(schema.sandboxInstances.projectId, projectId),
  });

  if (!instance?.providerInstanceId) {
    return NextResponse.json({ error: "No running sandbox" }, { status: 400 });
  }

  const provider = await getSandboxProvider(instance.provider);
  const previewUrl = await provider.getPreviewUrl(instance.providerInstanceId, port);

  await db
    .update(schema.sandboxInstances)
    .set({ previewUrl })
    .where(eq(schema.sandboxInstances.id, instance.id));

  return NextResponse.json({ previewUrl });
});
