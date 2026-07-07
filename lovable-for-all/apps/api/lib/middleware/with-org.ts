import { auth } from "@/lib/auth";
import { db, setCurrentOrg } from "@hatchery/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getActiveOrgId(): Promise<string | null> {
  const session = await getSession();
  return session?.session?.activeOrganizationId ?? null;
}

export function withOrg(handler: (orgId: string, req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.session?.activeOrganizationId;

    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    await db.execute(setCurrentOrg(orgId));
    return handler(orgId, req);
  };
}
