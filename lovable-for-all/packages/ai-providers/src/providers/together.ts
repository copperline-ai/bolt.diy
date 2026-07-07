import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class TogetherProvider extends BaseProvider {
  name = "Together";

  config = {
    baseUrlKey: "TOGETHER_API_BASE_URL",
    apiTokenKey: "TOGETHER_API_KEY",
    baseUrl: "https://api.together.xyz/v1",
  };

  staticModels: ModelInfo[] = [
    {
      name: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      label: "Llama 3.2 90B Vision",
      provider: "Together",
      maxContextTokens: 128000,
      maxTokenOutput: 8192,
    },
    {
      name: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      label: "Mixtral 8x7B Instruct",
      provider: "Together",
      maxContextTokens: 32000,
      maxTokenOutput: 8192,
    },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!baseUrl || !apiKey) {
      return [];
    }

    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const res = (await response.json()) as any;
    const data = (res || []).filter((model: any) => model.type === "chat");

    return data.map((m: any) => ({
      name: m.id,
      label: `${m.display_name} - in:$${m.pricing.input.toFixed(2)} out:$${m.pricing.output.toFixed(2)} - context ${Math.floor(m.context_length / 1000)}k`,
      provider: this.name,
      maxContextTokens: 8000,
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

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
