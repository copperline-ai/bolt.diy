import { createFireworks } from "@ai-sdk/fireworks";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class FireworksProvider extends BaseProvider {
  name = "Fireworks";

  config = {
    apiTokenKey: "FIREWORKS_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "accounts/fireworks/models/qwen3-coder-480b-a35b-instruct", label: "Qwen3-Coder 480B (Best for Coding)", provider: "Fireworks", maxContextTokens: 262000 },
    { name: "accounts/fireworks/models/qwen3-coder-30b-a3b-instruct", label: "Qwen3-Coder 30B (Fast Coding)", provider: "Fireworks", maxContextTokens: 262000 },
    { name: "accounts/fireworks/models/llama-v3p1-405b-instruct", label: "Llama 3.1 405B Instruct", provider: "Fireworks", maxContextTokens: 128000 },
    { name: "accounts/fireworks/models/llama-v3p1-70b-instruct", label: "Llama 3.1 70B Instruct", provider: "Fireworks", maxContextTokens: 128000 },
    { name: "accounts/fireworks/models/llama-v3p1-8b-instruct", label: "Llama 3.1 8B Instruct", provider: "Fireworks", maxContextTokens: 128000 },
    { name: "accounts/fireworks/models/deepseek-r1", label: "DeepSeek R1 (Reasoning)", provider: "Fireworks", maxContextTokens: 64000 },
    { name: "accounts/fireworks/models/qwen2p5-72b-instruct", label: "Qwen 2.5 72B Instruct", provider: "Fireworks", maxContextTokens: 128000 },
    { name: "accounts/fireworks/models/firefunction-v2", label: "FireFunction V2", provider: "Fireworks", maxContextTokens: 8000 },
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
      const response = await fetch("https://api.fireworks.ai/v1/accounts/fireworks/models?page_size=100", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error(`Fireworks API error: ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as any;
      const staticModelIds = this.staticModels.map((m) => m.name);

      const dynamicModels =
        data.data
          ?.filter((model: any) => {
            const modelPath = `accounts/fireworks/models/${model.id}`;
            return !staticModelIds.includes(modelPath) && !staticModelIds.includes(model.id);
          })
          .map((m: any) => ({
            name: `accounts/fireworks/models/${m.id}`,
            label: `${m.id} (Dynamic)`,
            provider: this.name,
            maxContextTokens: m.context_length || 128000,
          })) || [];

      return dynamicModels;
    } catch (error) {
      console.error("Failed to fetch Fireworks models:", error);
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

    const fireworks = createFireworks({ apiKey });

    return { model: fireworks(model) };
  }
}
