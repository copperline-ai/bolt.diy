import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import type { IProvider, ModelInfo, ProviderConfig } from "./types";

export abstract class BaseProvider implements IProvider {
  abstract name: string;
  abstract config: ProviderConfig;
  abstract staticModels: ModelInfo[];

  async getDynamicModels(
    _apiKeys: Record<string, string>,
    _settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    return [];
  }

  abstract getModelInstance(options: {
    model: string;
    apiKeys: Record<string, string>;
    settings: Record<string, string>;
    serverEnv?: Record<string, string>;
  }): Promise<{ model: LanguageModelV1 }>;

  protected getApiKey(apiKeys: Record<string, string>, settings: Record<string, string>): string {
    const key = apiKeys[this.config.apiTokenKey ?? ""];

    if (!key) {
      throw new Error(`Missing API key: ${this.config.apiTokenKey}`);
    }

    return key;
  }

  protected getBaseUrl(settings: Record<string, string>): string {
    if (this.config.baseUrlKey && settings[this.config.baseUrlKey]) {
      return settings[this.config.baseUrlKey];
    }

    return this.config.baseUrl ?? "";
  }

  static getOpenAILikeModel(baseURL: string, apiKey: string, model: string): LanguageModelV1 {
    const openai = createOpenAI({ baseURL, apiKey });
    return openai(model);
  }
}
