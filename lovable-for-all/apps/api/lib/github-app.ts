import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { db, schema, setCurrentOrg } from "@lovable/db";
import { decrypt, encrypt } from "./encryption";
import { eq } from "drizzle-orm";

export function createGitHubAppAuth() {
  return createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    oauth: {
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    },
  });
}

export async function getInstallationToken(orgId: string): Promise<string | null> {
  await db.execute(setCurrentOrg(orgId));

  const installation = await db.query.githubAppInstallations.findFirst({
    where: eq(schema.githubAppInstallations.orgId, orgId),
  });

  if (!installation) {
    return null;
  }

  // Refresh if expired
  if (installation.tokenExpiresAt < new Date()) {
    const auth = createGitHubAppAuth();
    const { token } = await auth({
      type: "installation",
      installationId: installation.installationId,
    });

    const { encrypted, iv, tag } = encrypt(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(schema.githubAppInstallations)
      .set({
        encryptedToken: encrypted,
        tokenIv: iv,
        tokenTag: tag,
        tokenExpiresAt: expiresAt,
      })
      .where(eq(schema.githubAppInstallations.id, installation.id));

    return token;
  }

  return decrypt(installation.encryptedToken, installation.tokenIv, installation.tokenTag);
}

export async function storeInstallation(
  orgId: string,
  installationId: number,
  accountId: number,
  accountLogin: string,
  token: string,
  permissions: Record<string, string>,
) {
  await db.execute(setCurrentOrg(orgId));

  const { encrypted, iv, tag } = encrypt(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(schema.githubAppInstallations).values({
    id: crypto.randomUUID(),
    orgId,
    installationId,
    accountId,
    accountLogin,
    encryptedToken: encrypted,
    tokenIv: iv,
    tokenTag: tag,
    tokenExpiresAt: expiresAt,
    permissions,
  });
}

export async function createInstallationOctokit(orgId: string): Promise<Octokit | null> {
  const token = await getInstallationToken(orgId);

  if (!token) {
    return null;
  }

  return new Octokit({ auth: token });
}
