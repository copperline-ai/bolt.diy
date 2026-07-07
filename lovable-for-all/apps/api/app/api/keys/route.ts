import { withOrg } from "@/lib/middleware/with-org";
import { listApiKeys, storeApiKey, deleteApiKey } from "@/lib/keys";
import { z } from "zod";
import { NextResponse } from "next/server";

const createSchema = z.object({
  name: z.string().min(1),
  providerName: z.string().min(1),
  key: z.string().min(1),
});

export const GET = withOrg(async (orgId: string) => {
  const keys = await listApiKeys(orgId);
  return NextResponse.json({ keys });
});

export const POST = withOrg(async (orgId: string, req: Request) => {
  const body = await req.json();
  const parsed = createSchema.parse(body);

  await storeApiKey(orgId, parsed.name, parsed.providerName, parsed.key);
  return NextResponse.json({ success: true });
});

export const DELETE = withOrg(async (orgId: string, req: Request) => {
  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteApiKey(orgId, keyId);
  return NextResponse.json({ success: true });
});
