import type { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class LMStudioProvider extends BaseProvider {
  name = "LMStudio";

  config = {
    baseUrlKey: "LMSTUDIO_API_BASE_URL",
    baseUrl: "http://localhost:1234/",
  };

  staticModels: ModelInfo[] = [];

  private _resolveBaseUrl(settings: Record<string, string>): string {
    const baseUrl = this.getBaseUrl(settings);

    if (!baseUrl) {
      throw new Error("No baseUrl found for LMStudio provider");
    }

    return baseUrl;
  }

  async getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    _serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const baseUrl = this._resolveBaseUrl(settings);

    try {
      const response = await fetch(`${baseUrl}/v1/models`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as { data: Array<{ id: string }> };

      return data.data.map((model) => ({
        name: model.id,
        label: model.id,
        provider: this.name,
        maxContextTokens: 8000,
      }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        console.warn("LMStudio model fetch timed out — is LM Studio running?");
        return [];
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn(`LMStudio not reachable at ${baseUrl} — is LM Studio running?`);
        return [];
      }

      console.error("Error fetching LMStudio models:", error);
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

    const lmstudio = createOpenAI({
      baseURL: `${baseUrl}/v1`,
      apiKey: "",
    });

    return { model: lmstudio(model) };
  }
}
