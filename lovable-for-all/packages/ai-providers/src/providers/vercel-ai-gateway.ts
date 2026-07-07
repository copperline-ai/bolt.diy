import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

interface VercelAIGatewayModel {
  id: string;
  name?: string;
  display_name?: string;
  context_window?: number;
  max_output_tokens?: number;
}

interface VercelAIGatewayModelsResponse {
  data: VercelAIGatewayModel[];
}

export default class VercelAIGatewayProvider extends BaseProvider {
  name = "Vercel AI Gateway";

  config = {
    baseUrlKey: "VERCEL_AI_GATEWAY_BASE_URL",
    apiTokenKey: "VERCEL_AI_GATEWAY_TOKEN",
    baseUrl: "https://ai-gateway.vercel.sh/v1",
  };

  staticModels: ModelInfo[] = [
    {
      name: "openai/gpt-4o",
      label: "OpenAI GPT-4o via Vercel",
      provider: "Vercel AI Gateway",
      maxContextTokens: 128000,
    },
    {
      name: "anthropic/claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet via Vercel",
      provider: "Vercel AI Gateway",
      maxContextTokens: 200000,
    },
  ];

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
        console.error(`Vercel AI Gateway API error: ${response.statusText}`);
        return [];
      }

      const res = (await response.json()) as VercelAIGatewayModelsResponse;

      if (!res.data || !Array.isArray(res.data)) {
        return [];
      }

      return res.data.map((m) => ({
        name: m.id,
        label: m.display_name || m.name || m.id,
        provider: this.name,
        maxContextTokens: m.context_window || 8000,
        maxTokenOutput: m.max_output_tokens,
      }));
    } catch (error) {
      console.error("Failed to fetch Vercel AI Gateway models:", error);
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
    const baseUrl = this.getBaseUrl(settings);
    const apiKey = this.getApiKey(apiKeys, settings);

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
