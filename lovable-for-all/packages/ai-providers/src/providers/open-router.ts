import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

interface OpenRouterModel {
  name: string;
  id: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export default class OpenRouterProvider extends BaseProvider {
  name = "OpenRouter";

  config = {
    apiTokenKey: "OPEN_ROUTER_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", provider: "OpenRouter", maxContextTokens: 200000 },
    { name: "openai/gpt-4o", label: "GPT-4o", provider: "OpenRouter", maxContextTokens: 128000 },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Content-Type": "application/json" },
      });

      const data = (await response.json()) as OpenRouterModelsResponse;

      return data.data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((m) => {
          const contextWindow = m.context_length || 32000;
          const maxAllowed = 1000000;
          const finalContext = Math.min(contextWindow, maxAllowed);

          return {
            name: m.id,
            label: `${m.name} - in:$${(m.pricing.prompt * 1_000_000).toFixed(2)} out:$${(m.pricing.completion * 1_000_000).toFixed(2)} - context ${finalContext >= 1000000 ? Math.floor(finalContext / 1000000) + "M" : Math.floor(finalContext / 1000) + "k"}`,
            provider: this.name,
            maxContextTokens: finalContext,
          };
        });
    } catch (error) {
      console.error("Error getting OpenRouter models:", error);
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

    const openRouter = createOpenRouter({ apiKey });
    const instance = openRouter.chat(model) as LanguageModelV1;

    return { model: instance };
  }
}
