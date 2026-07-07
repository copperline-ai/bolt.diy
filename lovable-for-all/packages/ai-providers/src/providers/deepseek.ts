import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class DeepseekProvider extends BaseProvider {
  name = "Deepseek";

  config = {
    apiTokenKey: "DEEPSEEK_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "deepseek-coder", label: "Deepseek-Coder", provider: "Deepseek", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "deepseek-chat", label: "Deepseek-Chat", provider: "Deepseek", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "deepseek-reasoner", label: "Deepseek-Reasoner", provider: "Deepseek", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "deepseek-v3.2", label: "DeepSeek V3.2 (Coding + Tool Use)", provider: "Deepseek", maxContextTokens: 64000, maxTokenOutput: 8192 },
    { name: "deepseek-v3.2-speciale", label: "DeepSeek V3.2 Speciale (High-Compute)", provider: "Deepseek", maxContextTokens: 64000, maxTokenOutput: 8192 },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      return [];
    }

    try {
      const response = await fetch("https://api.deepseek.com/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`DeepSeek API error: ${response.statusText}`);
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
            maxContextTokens: 64000,
            maxTokenOutput: 8192,
          })) || [];

      return dynamicModels;
    } catch (error) {
      console.error("Failed to fetch DeepSeek models:", error);
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
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const deepseek = createDeepSeek({ apiKey });

    return { model: deepseek(model) };
  }
}
