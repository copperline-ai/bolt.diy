import { createCohere } from "@ai-sdk/cohere";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class CohereProvider extends BaseProvider {
  name = "Cohere";

  config = {
    apiTokenKey: "COHERE_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "command-r-plus-08-2024", label: "Command R plus Latest", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-r-08-2024", label: "Command R Latest", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-r-plus", label: "Command R plus", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-r", label: "Command R", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command", label: "Command", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-nightly", label: "Command Nightly", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-light", label: "Command Light", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "command-light-nightly", label: "Command Light Nightly", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "c4ai-aya-expanse-8b", label: "c4AI Aya Expanse 8b", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
    { name: "c4ai-aya-expanse-32b", label: "c4AI Aya Expanse 32b", provider: "Cohere", maxContextTokens: 4096, maxTokenOutput: 4000 },
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

    const cohere = createCohere({ apiKey });

    return { model: cohere(model) };
  }
}
