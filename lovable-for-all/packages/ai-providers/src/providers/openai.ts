import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class OpenAIProvider extends BaseProvider {
  name = "OpenAI";

  config = {
    apiTokenKey: "OPENAI_API_KEY",
  };

  staticModels: ModelInfo[] = [
    { name: "gpt-4o", label: "GPT-4o", provider: "OpenAI", maxContextTokens: 128000, maxTokenOutput: 4096 },
    { name: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", maxContextTokens: 128000, maxTokenOutput: 4096 },
    { name: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", maxContextTokens: 16000, maxTokenOutput: 4096 },
    { name: "o1-preview", label: "o1-preview", provider: "OpenAI", maxContextTokens: 128000, maxTokenOutput: 32000 },
    { name: "o1-mini", label: "o1-mini", provider: "OpenAI", maxContextTokens: 128000, maxTokenOutput: 65000 },
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

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const res = (await response.json()) as any;
    const staticModelIds = this.staticModels.map((m) => m.name);

    const data = res.data.filter(
      (model: any) =>
        model.object === "model" &&
        (model.id.startsWith("gpt-") || model.id.startsWith("o") || model.id.startsWith("chatgpt-")) &&
        !staticModelIds.includes(model.id),
    );

    return data.map((m: any) => {
      let contextWindow = 32000;

      if (m.context_length) {
        contextWindow = m.context_length;
      } else if (m.id?.includes("gpt-4o")) {
        contextWindow = 128000;
      } else if (m.id?.includes("gpt-4-turbo") || m.id?.includes("gpt-4-1106")) {
        contextWindow = 128000;
      } else if (m.id?.includes("gpt-4")) {
        contextWindow = 8192;
      } else if (m.id?.includes("gpt-3.5-turbo")) {
        contextWindow = 16385;
      }

      let maxTokenOutput = 4096;

      if (m.id?.startsWith("o1-preview")) {
        maxTokenOutput = 32000;
      } else if (m.id?.startsWith("o1-mini")) {
        maxTokenOutput = 65000;
      } else if (m.id?.startsWith("o1")) {
        maxTokenOutput = 32000;
      } else if (m.id?.includes("o3") || m.id?.includes("o4")) {
        maxTokenOutput = 100000;
      } else if (m.id?.includes("gpt-4o")) {
        maxTokenOutput = 4096;
      } else if (m.id?.includes("gpt-4")) {
        maxTokenOutput = 8192;
      } else if (m.id?.includes("gpt-3.5-turbo")) {
        maxTokenOutput = 4096;
      }

      return {
        name: m.id,
        label: `${m.id} (${Math.floor(contextWindow / 1000)}k context)`,
        provider: this.name,
        maxContextTokens: Math.min(contextWindow, 128000),
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

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const openai = createOpenAI({ apiKey });

    return { model: openai(model) };
  }
}
