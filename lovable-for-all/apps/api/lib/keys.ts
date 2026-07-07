import { db, schema, setCurrentOrg } from "@lovable/db";
import { decrypt, encrypt, hashKey } from "./encryption";
import { eq } from "drizzle-orm";

export async function storeApiKey(
  orgId: string,
  name: string,
  providerName: string,
  plaintextKey: string,
  scopes: string[] = ["chat"],
) {
  await db.execute(setCurrentOrg(orgId));

  const { encrypted, iv, tag } = encrypt(plaintextKey);
  const keyHash = hashKey(plaintextKey);

  await db.insert(schema.apiKeys).values({
    id: crypto.randomUUID(),
    orgId,
    keyHash,
    name,
    providerName,
    encryptedKey: encrypted,
    keyIv: iv,
    keyTag: tag,
    scopes,
  });
}

export async function getDecryptedApiKey(orgId: string, providerName: string): Promise<string | null> {
  await db.execute(setCurrentOrg(orgId));

  const keys = await db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.orgId, orgId));

  const match = keys.find((k) => k.providerName === providerName);

  if (!match) {
    return null;
  }

  return decrypt(match.encryptedKey, match.keyIv, match.keyTag);
}

export async function listApiKeys(orgId: string) {
  await db.execute(setCurrentOrg(orgId));

  return db
    .select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      providerName: schema.apiKeys.providerName,
      scopes: schema.apiKeys.scopes,
      lastUsedAt: schema.apiKeys.lastUsedAt,
      createdAt: schema.apiKeys.createdAt,
      expiresAt: schema.apiKeys.expiresAt,
    })
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.orgId, orgId));
}

export async function deleteApiKey(orgId: string, keyId: string) {
  await db.execute(setCurrentOrg(orgId));

  await db
    .delete(schema.apiKeys)
    .where(eq(schema.apiKeys.id, keyId));
}
