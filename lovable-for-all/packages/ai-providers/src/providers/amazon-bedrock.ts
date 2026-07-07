import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import type { LanguageModelV1 } from "ai";
import { BaseProvider } from "../base-provider";
import type { ModelInfo } from "../types";

interface AWSBedRockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export default class AmazonBedrockProvider extends BaseProvider {
  name = "AmazonBedrock";

  config = {
    apiTokenKey: "AWS_BEDROCK_CONFIG",
  };

  staticModels: ModelInfo[] = [
    { name: "anthropic.claude-3-5-sonnet-20241022-v2:0", label: "Claude 3.5 Sonnet v2 (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 200000 },
    { name: "anthropic.claude-3-5-sonnet-20240620-v1:0", label: "Claude 3.5 Sonnet (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 4096 },
    { name: "anthropic.claude-3-sonnet-20240229-v1:0", label: "Claude 3 Sonnet (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 4096 },
    { name: "anthropic.claude-3-haiku-20240307-v1:0", label: "Claude 3 Haiku (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 4096 },
    { name: "amazon.nova-pro-v1:0", label: "Amazon Nova Pro (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 5120 },
    { name: "amazon.nova-lite-v1:0", label: "Amazon Nova Lite (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 5120 },
    { name: "mistral.mistral-large-2402-v1:0", label: "Mistral Large 24.02 (Bedrock)", provider: "AmazonBedrock", maxContextTokens: 8192 },
  ];

  private _parseAndValidateConfig(apiKey: string): AWSBedRockConfig {
    let parsedConfig: AWSBedRockConfig;

    try {
      parsedConfig = JSON.parse(apiKey);
    } catch {
      throw new Error(
        "Invalid AWS Bedrock configuration format. Please provide a valid JSON string containing region, accessKeyId, and secretAccessKey.",
      );
    }

    const { region, accessKeyId, secretAccessKey, sessionToken } = parsedConfig;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing required AWS credentials. Configuration must include region, accessKeyId, and secretAccessKey.",
      );
    }

    return {
      region,
      accessKeyId,
      secretAccessKey,
      ...(sessionToken && { sessionToken }),
    };
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

    const config = this._parseAndValidateConfig(apiKey);
    const bedrock = createAmazonBedrock(config);

    return { model: bedrock(model) };
  }
}
