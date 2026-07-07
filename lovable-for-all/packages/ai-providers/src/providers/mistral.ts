import { createMistral } from "@ai-sdk/mistral";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class MistralProvider extends BaseProvider {
  name = "Mistral";

  config = {
    apiTokenKey: "MISTRAL_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "open-mistral-7b", label: "Mistral 7B", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "open-mixtral-8x7b", label: "Mistral 8x7B", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "open-mixtral-8x22b", label: "Mistral 8x22B", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "open-codestral-mamba", label: "Codestral Mamba", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "open-mistral-nemo", label: "Mistral Nemo", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "ministral-8b-latest", label: "Mistral 8B", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "mistral-small-latest", label: "Mistral Small", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "codestral-latest", label: "Codestral", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
    { name: "mistral-large-latest", label: "Mistral Large Latest", provider: "Mistral", maxContextTokens: 8000, maxTokenOutput: 8192 },
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
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const mistral = createMistral({ apiKey });

    return { model: mistral(model) };
  }
}
