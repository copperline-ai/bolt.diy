import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class PerplexityProvider extends BaseProvider {
  name = "Perplexity";

  config = {
    baseUrlKey: "PERPLEXITY_API_BASE_URL",
    apiTokenKey: "PERPLEXITY_API_KEY",
    baseUrl: "https://api.perplexity.ai/",
  };

  staticModels: ModelInfo[] = [
    { name: "sonar", label: "Sonar", provider: "Perplexity", maxContextTokens: 8192 },
    { name: "sonar-pro", label: "Sonar Pro", provider: "Perplexity", maxContextTokens: 8192 },
    { name: "sonar-reasoning-pro", label: "Sonar Reasoning Pro", provider: "Perplexity", maxContextTokens: 8192 },
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
