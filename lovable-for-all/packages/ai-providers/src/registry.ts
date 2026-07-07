import AnthropicProvider from "./providers/anthropic";
import CerebrasProvider from "./providers/cerebras";
import CohereProvider from "./providers/cohere";
import DeepseekProvider from "./providers/deepseek";
import FireworksProvider from "./providers/fireworks";
import GoogleProvider from "./providers/google";
import GroqProvider from "./providers/groq";
import HuggingFaceProvider from "./providers/huggingface";
import LMStudioProvider from "./providers/lmstudio";
import MistralProvider from "./providers/mistral";
import OllamaProvider from "./providers/ollama";
import OpenRouterProvider from "./providers/open-router";
import CustomOpenAICompatibleProvider from "./providers/custom-openai-compatible";
import OpenAIProvider from "./providers/openai";
import PerplexityProvider from "./providers/perplexity";
import TogetherProvider from "./providers/together";
import XAIProvider from "./providers/xai";
import HyperbolicProvider from "./providers/hyperbolic";
import AmazonBedrockProvider from "./providers/amazon-bedrock";
import GithubProvider from "./providers/github";
import MoonshotProvider from "./providers/moonshot";
import ZaiProvider from "./providers/zai";
import VercelAIGatewayProvider from "./providers/vercel-ai-gateway";
import { llmManager } from "./manager";

const providers = [
  new VercelAIGatewayProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
  new GoogleProvider(),
  new MistralProvider(),
  new DeepseekProvider(),
  new GroqProvider(),
  new CohereProvider(),
  new CerebrasProvider(),
  new FireworksProvider(),
  new PerplexityProvider(),
  new XAIProvider(),
  new TogetherProvider(),
  new HuggingFaceProvider(),
  new OpenRouterProvider(),
  new OllamaProvider(),
  new LMStudioProvider(),
  new AmazonBedrockProvider(),
  new GithubProvider(),
  new HyperbolicProvider(),
  new MoonshotProvider(),
  new ZaiProvider(),
  new CustomOpenAICompatibleProvider(),
];

export function registerAllProviders() {
  for (const provider of providers) {
    llmManager.registerProvider(provider);
  }
}
