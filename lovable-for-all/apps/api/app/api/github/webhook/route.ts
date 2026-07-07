import { createGitHubAppAuth, storeInstallation } from "@/lib/github-app";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const signature = req.headers.get("x-hub-signature-256");
  const body = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const auth = createGitHubAppAuth();
  const event = JSON.parse(body);

  if (event.action === "created" && event.installation) {
    const { installation, sender } = event;
    const orgId = event.requested ?? sender?.login ?? "unknown";

    const { token } = await auth({
      type: "installation",
      installationId: installation.id,
    });

    await storeInstallation(
      orgId,
      installation.id,
      installation.account.id,
      installation.account.login,
      token,
      installation.permissions,
    );
  }

  return NextResponse.json({ success: true });
}
