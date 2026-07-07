import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

interface OpenAIModelsResponse {
  data: Array<{ id: string }>;
}

export default class CustomOpenAICompatibleProvider extends BaseProvider {
  name = "OpenAI-Compatible API";

  config = {
    baseUrlKey: "OPENAI_LIKE_API_BASE_URL",
    apiTokenKey: "OPENAI_LIKE_API_KEY",
    modelsKey: "OPENAI_LIKE_API_MODELS",
  };

  staticModels: ModelInfo[] = [];

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!baseUrl || !apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = (await response.json()) as OpenAIModelsResponse;

      return res.data.map((model) => ({
        name: model.id,
        label: model.id,
        provider: this.name,
        maxContextTokens: 8000,
      }));
    } catch (error) {
      console.warn(`${this.name}: Could not fetch /models endpoint, checking fallback env`, error);

      const modelsEnv = settings[this.config.modelsKey ?? ""];

      if (modelsEnv) {
        console.info(`${this.name}: Using OPENAI_LIKE_API_MODELS fallback`);
        return this._parseModelsFromEnv(modelsEnv);
      }

      return [];
    }
  }

  private _parseModelsFromEnv(modelsEnv: string): ModelInfo[] {
    if (!modelsEnv) {
      return [];
    }

    try {
      const models: ModelInfo[] = [];
      const modelEntries = modelsEnv.split(";");

      for (const entry of modelEntries) {
        const trimmedEntry = entry.trim();

        if (!trimmedEntry) {
          continue;
        }

        const [modelPath, limitStr] = trimmedEntry.split(":");

        if (!modelPath) {
          continue;
        }

        const limit = limitStr ? parseInt(limitStr.trim(), 10) : 8000;
        const modelName = modelPath.trim();
        const label = this._generateModelLabel(modelName);

        models.push({
          name: modelName,
          label,
          provider: this.name,
          maxContextTokens: limit,
        });
      }

      console.info(`${this.name}: Parsed ${models.length} models from env`);

      return models;
    } catch (error) {
      console.error(`${this.name}: Error parsing OPENAI_LIKE_API_MODELS:`, error);
      return [];
    }
  }

  private _generateModelLabel(modelPath: string): string {
    const parts = modelPath.split("/");
    const lastPart = parts[parts.length - 1];

    let label = lastPart
      .replace(/^accounts\//, "")
      .replace(/^fireworks\/models\//, "")
      .replace(/^models\//, "")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\s+/g, "-");

    if (!label.includes("Fireworks") && !label.includes("OpenAI")) {
      label += " (OpenAI Compatible)";
    }

    return label;
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
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
