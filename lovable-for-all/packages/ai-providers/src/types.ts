import type { LanguageModelV1 } from "ai";

export interface ModelInfo {
  name: string;
  label: string;
  provider: string;
  maxTokenOutput?: number;
  maxContextTokens?: number;
  reasoning?: boolean;
  vision?: boolean;
}

export interface ProviderConfig {
  baseUrlKey?: string;
  baseUrl?: string;
  apiTokenKey?: string;
}

export interface IProvider {
  readonly name: string;
  readonly config: ProviderConfig;
  readonly staticModels: ModelInfo[];

  getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]>;

  getModelInstance(options: {
    model: string;
    apiKeys: Record<string, string>;
    settings: Record<string, string>;
    serverEnv?: Record<string, string>;
  }): Promise<{ model: LanguageModelV1 }>;
}
