import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class HyperbolicProvider extends BaseProvider {
  name = "Hyperbolic";

  config = {
    baseUrlKey: "HYPERBOLIC_API_BASE_URL",
    apiTokenKey: "HYPERBOLIC_API_KEY",
    baseUrl: "https://api.hyperbolic.xyz/v1",
  };

  staticModels: ModelInfo[] = [
    { name: "Qwen/Qwen2.5-Coder-32B-Instruct", label: "Qwen 2.5 Coder 32B Instruct", provider: "Hyperbolic", maxContextTokens: 8192 },
    { name: "Qwen/Qwen2.5-72B-Instruct", label: "Qwen2.5-72B-Instruct", provider: "Hyperbolic", maxContextTokens: 8192 },
    { name: "deepseek-ai/DeepSeek-V2.5", label: "DeepSeek-V2.5", provider: "Hyperbolic", maxContextTokens: 8192 },
    { name: "Qwen/QwQ-32B-Preview", label: "QwQ-32B-Preview", provider: "Hyperbolic", maxContextTokens: 8192 },
    { name: "Qwen/Qwen2-VL-72B-Instruct", label: "Qwen2-VL-72B-Instruct", provider: "Hyperbolic", maxContextTokens: 8192 },
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

    const data = res.data.filter((model: any) => model.object === "model" && model.supports_chat);

    return data.map((m: any) => ({
      name: m.id,
      label: `${m.id} - context ${m.context_length ? Math.floor(m.context_length / 1000) + "k" : "N/A"}`,
      provider: this.name,
      maxContextTokens: m.context_length || 8000,
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
      throw new Error(`Missing API key configuration for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
