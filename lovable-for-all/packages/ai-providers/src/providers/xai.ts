import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class XAIProvider extends BaseProvider {
  name = "xAI";

  config = {
    baseUrlKey: "XAI_API_BASE_URL",
    apiTokenKey: "XAI_API_KEY",
    baseUrl: "https://api.x.ai/v1",
  };

  staticModels: ModelInfo[] = [
    { name: "grok-4", label: "xAI Grok 4", provider: "xAI", maxContextTokens: 256000 },
    { name: "grok-4-07-09", label: "xAI Grok 4 (07-09)", provider: "xAI", maxContextTokens: 256000 },
    { name: "grok-3-mini", label: "xAI Grok 3 Mini", provider: "xAI", maxContextTokens: 131000 },
    { name: "grok-3-mini-fast", label: "xAI Grok 3 Mini Fast", provider: "xAI", maxContextTokens: 131000 },
    { name: "grok-code-fast-1", label: "xAI Grok Code Fast 1", provider: "xAI", maxContextTokens: 131000 },
  ];

  async getModelInstance({
    model,
    apiKeys,
    settings,
  }: {
    model: string;
    apiKeys: Record<string, string>;
    settings: Record<string, string>;
    serverEnv?: Record<string, string>;
  }): Promise<{ model: LanguageModelV1 }> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
