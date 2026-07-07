import { streamText as vercelStreamText, convertToCoreMessages, type Message } from "ai";
import { llmManager } from "@lovable/ai-providers";
import type { ChatMode } from "@lovable/shared";

export interface StreamChatOptions {
  messages: Message[];
  providerName: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  chatMode: ChatMode;
  systemPrompt?: string;
}

export async function streamChat(options: StreamChatOptions) {
  const { model } = await llmManager.getModelInstance(
    options.providerName,
    options.modelName,
    { [getEnvKey(options.providerName)]: options.apiKey },
    options.baseUrl ? { [getBaseUrlKey(options.providerName)]: options.baseUrl } : {},
  );

  return vercelStreamText({
    model,
    system: options.systemPrompt ?? getDefaultSystemPrompt(options.chatMode),
    messages: convertToCoreMessages(options.messages),
  });
}

function getEnvKey(providerName: string): string {
  const mapping: Record<string, string> = {
    OpenAI: "OPENAI_API_KEY",
    Anthropic: "ANTHROPIC_API_KEY",
    "Vercel AI Gateway": "VERCEL_AI_GATEWAY_TOKEN",
  };
  return mapping[providerName] ?? "OPENAI_API_KEY";
}

function getBaseUrlKey(providerName: string): string {
  const mapping: Record<string, string> = {
    "Vercel AI Gateway": "VERCEL_AI_GATEWAY_BASE_URL",
  };
  return mapping[providerName] ?? "";
}

function getDefaultSystemPrompt(chatMode: ChatMode): string {
  if (chatMode === "discuss") {
    return "You are a helpful coding assistant. Answer questions, explain concepts, and help the user think through problems.";
  }

  return `You are an expert full-stack web developer. Build complete, working applications.
When generating code, prefer modern best practices, TypeScript, and clear file structure.
Output file changes using the artifact format when appropriate.`;
}
