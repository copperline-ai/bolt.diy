import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class GoogleProvider extends BaseProvider {
  name = "Google";

  config = {
    apiTokenKey: "GOOGLE_GENERATIVE_AI_API_KEY",
  };

  staticModels: ModelInfo[] = [
    {
      name: "gemini-1.5-pro",
      label: "Gemini 1.5 Pro",
      provider: "Google",
      maxContextTokens: 2000000,
      maxTokenOutput: 8192,
    },
    {
      name: "gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
      provider: "Google",
      maxContextTokens: 1000000,
      maxTokenOutput: 8192,
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: {
        ["Content-Type"]: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models from Google API: ${response.status} ${response.statusText}`);
    }

    const res = (await response.json()) as any;

    if (!res.models || !Array.isArray(res.models)) {
      throw new Error("Invalid response format from Google API");
    }

    const data = res.models.filter((model: any) => {
      const hasGoodTokenLimit = (model.outputTokenLimit || 0) > 8000;
      const isStable = !model.name.includes("exp") || model.name.includes("flash-exp");

      return hasGoodTokenLimit && isStable;
    });

    return data.map((m: any) => {
      const modelName = m.name.replace("models/", "");

      let contextWindow = 32000;

      if (m.inputTokenLimit && m.outputTokenLimit) {
        contextWindow = m.inputTokenLimit;
      } else if (modelName.includes("gemini-1.5-pro")) {
        contextWindow = 2000000;
      } else if (modelName.includes("gemini-1.5-flash")) {
        contextWindow = 1000000;
      } else if (modelName.includes("gemini-2.0-flash")) {
        contextWindow = 1000000;
      } else if (modelName.includes("gemini-pro")) {
        contextWindow = 32000;
      } else if (modelName.includes("gemini-flash")) {
        contextWindow = 32000;
      }

      const maxAllowed = 2000000;
      const finalContext = Math.min(contextWindow, maxAllowed);

      let completionTokens = 8192;

      if (m.outputTokenLimit && m.outputTokenLimit > 0) {
        completionTokens = Math.min(m.outputTokenLimit, 128000);
      }

      return {
        name: modelName,
        label: `${m.displayName} (${finalContext >= 1000000 ? Math.floor(finalContext / 1000000) + "M" : Math.floor(finalContext / 1000) + "k"} context)`,
        provider: this.name,
        maxContextTokens: finalContext,
        maxTokenOutput: completionTokens,
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

    const google = createGoogleGenerativeAI({ apiKey });

    return { model: google(model) };
  }
}
