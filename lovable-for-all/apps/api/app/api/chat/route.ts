import { withOrg, getSession } from "@/lib/middleware/with-org";
import { getDecryptedApiKey } from "@/lib/keys";
import { streamChat } from "@/lib/chat/stream";
import { db, schema, setCurrentOrg } from "@hatchery/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Message } from "ai";

const chatSchema = z.object({
  messages: z.array(z.any()),
  sessionId: z.string().optional(),
  projectId: z.string(),
  providerName: z.string(),
  modelName: z.string(),
  chatMode: z.enum(["build", "discuss"]).default("build"),
});

export const POST = withOrg(async (orgId: string, req: Request) => {
  const body = await req.json();
  const parsed = chatSchema.parse(body);
  const session = await getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db.execute(setCurrentOrg(orgId));

  const apiKey = await getDecryptedApiKey(orgId, parsed.providerName);

  if (!apiKey) {
    return new Response(JSON.stringify({ error: `No API key configured for ${parsed.providerName}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Ensure session exists
  let sessionId = parsed.sessionId;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    const title = parsed.messages[0]?.content?.slice(0, 50) ?? "New Chat";

    await db.insert(schema.chatSessions).values({
      id: sessionId,
      projectId: parsed.projectId,
      userId: session.user.id,
      title,
      mode: parsed.chatMode,
    });
  }

  // Persist user message if it's the last one
  const lastMessage = parsed.messages[parsed.messages.length - 1];

  if (lastMessage?.role === "user") {
    await db.insert(schema.chatMessages).values({
      id: crypto.randomUUID(),
      sessionId,
      role: "user",
      content: typeof lastMessage.content === "string" ? lastMessage.content : JSON.stringify(lastMessage.content),
      tokenCount: 0,
    });
  }

  const result = await streamChat({
    messages: parsed.messages as Message[],
    providerName: parsed.providerName,
    modelName: parsed.modelName,
    apiKey,
    chatMode: parsed.chatMode,
  });

  return result.toDataStreamResponse();
});
