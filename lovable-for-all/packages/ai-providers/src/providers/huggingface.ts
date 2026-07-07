import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

export default class HuggingFaceProvider extends BaseProvider {
  name = "HuggingFace";

  config = {
    baseUrlKey: "HUGGINGFACE_API_BASE_URL",
    apiTokenKey: "HuggingFace_API_KEY",
    baseUrl: "https://api-inference.huggingface.co/v1/",
  };

  staticModels: ModelInfo[] = [
    { name: "Qwen/Qwen2.5-Coder-32B-Instruct", label: "Qwen2.5-Coder-32B-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "01-ai/Yi-1.5-34B-Chat", label: "Yi-1.5-34B-Chat (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "codellama/CodeLlama-34b-Instruct-hf", label: "CodeLlama-34b-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "NousResearch/Hermes-3-Llama-3.1-8B", label: "Hermes-3-Llama-3.1-8B (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "Qwen/Qwen2.5-Coder-32B-Instruct", label: "Qwen2.5-Coder-32B-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "Qwen/Qwen2.5-72B-Instruct", label: "Qwen2.5-72B-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "meta-llama/Llama-3.1-70B-Instruct", label: "Llama-3.1-70B-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "meta-llama/Llama-3.1-405B", label: "Llama-3.1-405B (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "01-ai/Yi-1.5-34B-Chat", label: "Yi-1.5-34B-Chat (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "codellama/CodeLlama-34b-Instruct-hf", label: "CodeLlama-34b-Instruct (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
    { name: "NousResearch/Hermes-3-Llama-3.1-8B", label: "Hermes-3-Llama-3.1-8B (HuggingFace)", provider: "HuggingFace", maxContextTokens: 8000 },
  ];

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

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    return { model: BaseProvider.getOpenAILikeModel(baseUrl, apiKey, model) };
  }
}
