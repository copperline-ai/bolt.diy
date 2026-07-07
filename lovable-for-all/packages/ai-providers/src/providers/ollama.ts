import type { LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

interface OllamaModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

export interface OllamaApiResponse {
  models: OllamaModel[];
}

export default class OllamaProvider extends BaseProvider {
  name = "Ollama";

  config = {
    baseUrlKey: "OLLAMA_API_BASE_URL",
    baseUrl: "http://localhost:11434",
  };

  staticModels: ModelInfo[] = [];

  private _resolveBaseUrl(settings: Record<string, string>): string {
    const baseUrl = this.getBaseUrl(settings);

    if (!baseUrl) {
      throw new Error("No baseUrl found for Ollama provider");
    }

    return baseUrl;
  }

  private getDefaultNumCtx(_settings: Record<string, string>): number {
    return 32768;
  }

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this._resolveBaseUrl(settings);

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaApiResponse;

      return data.models.map((model: OllamaModel) => ({
        name: model.name,
        label: `${model.name} (${model.details.parameter_size})`,
        provider: this.name,
        maxContextTokens: 8000,
      }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        console.warn("Ollama model fetch timed out — is Ollama running?");
        return [];
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn(`Ollama not reachable at ${baseUrl} — is Ollama running?`);
        return [];
      }

      console.error("Error fetching Ollama models:", error);
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
    const baseUrl = this._resolveBaseUrl(settings);

    const ollamaProvider = createOllama({
      baseURL: `${baseUrl}/api`,
    });

    return { model: ollamaProvider(model, { numCtx: this.getDefaultNumCtx(settings) }) };
  }
}
