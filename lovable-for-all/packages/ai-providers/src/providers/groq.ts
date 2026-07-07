import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class GroqProvider extends BaseProvider {
  name = "Groq";

  config = {
    baseUrlKey: "GROQ_API_BASE_URL",
    apiTokenKey: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
  };

  staticModels: ModelInfo[] = [
    { name: "llama-3.1-8b-instant", label: "Llama 3.1 8B", provider: "Groq", maxContextTokens: 128000, maxTokenOutput: 8192 },
    { name: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "Groq", maxContextTokens: 128000, maxTokenOutput: 8192 },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      throw new Error(`Missing API key configuration for ${this.name} provider`);
    }

    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const res = (await response.json()) as any;

    const data = res.data.filter(
      (model: any) => model.object === "model" && model.active && model.context_window > 8000,
    );

    return data.map((m: any) => ({
      name: m.id,
      label: `${m.id} - context ${m.context_window ? Math.floor(m.context_window / 1000) + "k" : "N/A"} [ by ${m.owned_by}]`,
      provider: this.name,
      maxContextTokens: Math.min(m.context_window || 8192, 16384),
      maxTokenOutput: 8192,
    }));
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
