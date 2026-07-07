import { createCerebras } from "@ai-sdk/cerebras";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class CerebrasProvider extends BaseProvider {
  name = "Cerebras";

  config = {
    apiTokenKey: "CEREBRAS_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "qwen3-coder-480b", label: "Qwen3-Coder 480B (2000 tok/s, Best for Coding)", provider: "Cerebras", maxContextTokens: 262000 },
    { name: "llama3.1-8b", label: "Llama 3.1 8B", provider: "Cerebras", maxContextTokens: 8000 },
    { name: "gpt-oss-120b", label: "GPT OSS 120B (Reasoning)", provider: "Cerebras", maxContextTokens: 8000 },
    { name: "qwen-3-235b-a22b-instruct-2507", label: "Qwen 3 235B A22B Instruct", provider: "Cerebras", maxContextTokens: 8000 },
    { name: "qwen-3-235b-a22b-thinking-2507", label: "Qwen 3 235B A22B Thinking", provider: "Cerebras", maxContextTokens: 8000 },
    { name: "zai-glm-4.6", label: "ZAI GLM 4.6 (Coding: 73.8% SWE-bench)", provider: "Cerebras", maxContextTokens: 8000 },
    { name: "zai-glm-4.7", label: "ZAI GLM 4.7 (Reasoning)", provider: "Cerebras", maxContextTokens: 8000 },
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
      const response = await fetch("https://api.cerebras.ai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Cerebras API error: ${response.statusText}`);
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
            maxContextTokens: 32000,
          })) || [];

      return dynamicModels;
    } catch (error) {
      console.error("Failed to fetch Cerebras models:", error);
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

    const cerebras = createCerebras({ apiKey });

    return { model: cerebras(model) };
  }
}
