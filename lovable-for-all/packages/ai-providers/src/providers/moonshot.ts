import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class MoonshotProvider extends BaseProvider {
  name = "Moonshot";

  config = {
    baseUrlKey: "MOONSHOT_API_BASE_URL",
    apiTokenKey: "MOONSHOT_API_KEY",
    baseUrl: "https://api.moonshot.ai/v1",
  };

  staticModels: ModelInfo[] = [
    { name: "moonshot-v1-8k", label: "Moonshot v1 8K", provider: "Moonshot", maxContextTokens: 8000 },
    { name: "moonshot-v1-32k", label: "Moonshot v1 32K", provider: "Moonshot", maxContextTokens: 32000 },
    { name: "moonshot-v1-128k", label: "Moonshot v1 128K", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "moonshot-v1-auto", label: "Moonshot v1 Auto", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "moonshot-v1-8k-vision-preview", label: "Moonshot v1 8K Vision", provider: "Moonshot", maxContextTokens: 8000 },
    { name: "moonshot-v1-32k-vision-preview", label: "Moonshot v1 32K Vision", provider: "Moonshot", maxContextTokens: 32000 },
    { name: "moonshot-v1-128k-vision-preview", label: "Moonshot v1 128K Vision", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "kimi-latest", label: "Kimi Latest", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "kimi-k2-0711-preview", label: "Kimi K2 Preview", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "kimi-k2-turbo-preview", label: "Kimi K2 Turbo", provider: "Moonshot", maxContextTokens: 128000 },
    { name: "kimi-thinking-preview", label: "Kimi Thinking", provider: "Moonshot", maxContextTokens: 128000 },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Moonshot API error: ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as any;
      const staticModelIds = this.staticModels.map((m) => m.name);

      const dynamicModels =
        data.data
          ?.filter((model: any) => !staticModelIds.includes(model.id))
          .map((m: any) => ({
            name: m.id,
            label: `${m.id} (Dynamic)`,
            provider: this.name,
            maxContextTokens: 128000,
          })) || [];

      return dynamicModels;
    } catch (error) {
      console.error("Failed to fetch Moonshot models:", error);
      return [];
    }
  }

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
