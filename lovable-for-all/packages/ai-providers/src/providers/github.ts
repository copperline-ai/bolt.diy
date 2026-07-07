import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class GithubProvider extends BaseProvider {
  name = "Github";

  config = {
    baseUrlKey: "GITHUB_API_BASE_URL",
    apiTokenKey: "GITHUB_API_KEY",
    baseUrl: "https://models.github.ai/inference",
  };

  staticModels: ModelInfo[] = [
    { name: "openai/gpt-4o", label: "GPT-4o", provider: "Github", maxContextTokens: 131072, maxTokenOutput: 4096 },
    { name: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "Github", maxContextTokens: 131072, maxTokenOutput: 4096 },
    { name: "openai/o1-preview", label: "o1-preview", provider: "Github", maxContextTokens: 128000, maxTokenOutput: 32000 },
    { name: "openai/o1-mini", label: "o1-mini", provider: "Github", maxContextTokens: 128000, maxTokenOutput: 65000 },
    { name: "openai/o1", label: "o1", provider: "Github", maxContextTokens: 200000, maxTokenOutput: 100000 },
    { name: "openai/gpt-4.1", label: "GPT-4.1", provider: "Github", maxContextTokens: 1048576, maxTokenOutput: 32768 },
    { name: "openai/gpt-4.1-mini", label: "GPT-4.1-mini", provider: "Github", maxContextTokens: 1048576, maxTokenOutput: 32768 },
    { name: "deepseek/deepseek-r1", label: "DeepSeek-R1", provider: "Github", maxContextTokens: 128000, maxTokenOutput: 4096 },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      console.warn("GitHub: No API key found. Make sure GITHUB_API_KEY is set.");
      return this.staticModels;
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (response.ok) {
        const data = (await response.json()) as { data?: any[] };

        if (data.data && Array.isArray(data.data)) {
          return data.data.map((model: any) => ({
            name: model.id,
            label: model.name || model.id.split("/").pop() || model.id,
            provider: "Github",
            maxContextTokens: model.limits?.max_input_tokens || 128000,
            maxTokenOutput: model.limits?.max_output_tokens || 16384,
          }));
        }
      } else {
        console.warn("GitHub: API request failed with status:", response.status, response.statusText);
      }
    } catch (error) {
      console.warn("GitHub: Failed to fetch models, using static models:", error);
    }

    return this.staticModels;
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
      console.error("GitHub: No API key found");
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
