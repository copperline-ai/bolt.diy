import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class AnthropicProvider extends BaseProvider {
  name = "Anthropic";

  config = {
    apiTokenKey: "ANTHROPIC_API_KEY",
  };

  staticModels: ModelInfo[] = [
    {
      name: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      maxContextTokens: 200000,
      maxTokenOutput: 128000,
    },
    {
      name: "claude-3-haiku-20240307",
      label: "Claude 3 Haiku",
      provider: "Anthropic",
      maxContextTokens: 200000,
      maxTokenOutput: 128000,
    },
    {
      name: "claude-opus-4-20250514",
      label: "Claude 4 Opus",
      provider: "Anthropic",
      maxContextTokens: 200000,
      maxTokenOutput: 32000,
    },
  ];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!apiKey) {
      throw new Error(`Missing API key configuration for ${this.name} provider`);
    }

    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": `${apiKey}`,
        "anthropic-version": "2023-06-01",
      },
    });

    const res = (await response.json()) as any;
    const staticModelIds = this.staticModels.map((m) => m.name);

    const data = res.data.filter((model: any) => model.type === "model" && !staticModelIds.includes(model.id));

    return data.map((m: any) => {
      let contextWindow = 32000;

      if (m.max_tokens) {
        contextWindow = m.max_tokens;
      } else if (m.id?.includes("claude-3-5-sonnet")) {
        contextWindow = 200000;
      } else if (m.id?.includes("claude-3-haiku")) {
        contextWindow = 200000;
      } else if (m.id?.includes("claude-3-opus")) {
        contextWindow = 200000;
      } else if (m.id?.includes("claude-3-sonnet")) {
        contextWindow = 200000;
      }

      let maxTokenOutput = 128000;

      if (m.id?.includes("claude-opus-4")) {
        maxTokenOutput = 32000;
      } else if (m.id?.includes("claude-sonnet-4")) {
        maxTokenOutput = 64000;
      } else if (m.id?.includes("claude-4")) {
        maxTokenOutput = 32000;
      }

      return {
        name: m.id,
        label: `${m.display_name} (${Math.floor(contextWindow / 1000)}k context)`,
        provider: this.name,
        maxContextTokens: contextWindow,
        maxTokenOutput,
      };
    });
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
    const anthropic = createAnthropic({
      apiKey,
      headers: { "anthropic-beta": "output-128k-2025-02-19" },
    });

    return { model: anthropic(model) };
  }
}
