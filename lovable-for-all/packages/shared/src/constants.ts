import type { Plan, OrganizationLimits } from "./types";

export const PLAN_LIMITS: Record<Plan, OrganizationLimits> = {
  free: {
    maxProjects: 1,
    maxSandboxHours: 10,
    maxMessages: 50,
    maxSeats: 1,
  },
  pro: {
    maxProjects: 10,
    maxSandboxHours: 100,
    maxMessages: Infinity,
    maxSeats: 1,
  },
  team: {
    maxProjects: 50,
    maxSandboxHours: 500,
    maxMessages: Infinity,
    maxSeats: 5,
  },
  enterprise: {
    maxProjects: Infinity,
    maxSandboxHours: Infinity,
    maxMessages: Infinity,
    maxSeats: Infinity,
  },
};

export const STRIPE_PRICES = {
  pro: "price_pro_monthly",
  team: "price_team_monthly",
  enterprise: "price_enterprise_monthly",
} as const;

// Environment variable keys for each AI provider.
export const PROVIDER_ENV_KEYS: Record<string, string> = {
  // First-class
  vercelAIGateway: "VERCEL_AI_GATEWAY_TOKEN",
  // Major providers
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  mistral: "MISTRAL_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  cohere: "COHERE_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
  xai: "XAI_API_KEY",
  together: "TOGETHER_API_KEY",
  huggingface: "HUGGINGFACE_API_KEY",
  openrouter: "OPEN_ROUTER_API_KEY",
  ollama: "",
  lmstudio: "",
  fireworks: "FIREWORKS_API_KEY",
  bedrock: "AWS_BEDROCK_CONFIG",
  github: "GITHUB_API_KEY",
  hyperbolic: "HYPERBOLIC_API_KEY",
  moonshot: "MOONSHOT_API_KEY",
  zai: "ZAI_API_KEY",
  customOpenAICompatible: "",
};

// Default base URLs for providers that need them.
export const PROVIDER_DEFAULT_BASE_URLS: Record<string, string> = {
  vercelAIGateway: "https://ai-gateway.vercel.sh/v1",
  groq: "https://api.groq.com/openai/v1",
  perplexity: "https://api.perplexity.ai",
  xai: "https://api.x.ai/v1",
  together: "https://api.together.xyz/v1",
  huggingface: "https://huggingface.co/api/inference-proxy/huggingface",
  github: "https://models.inference.ai.azure.com",
  hyperbolic: "https://api.hyperbolic.xyz/v1",
  moonshot: "https://api.moonshot.ai/v1",
  zai: "https://open.bigmodel.cn/api/paas/v4",
};

export const MAX_TOKENS = 128_000;
export const MAX_RESPONSE_SEGMENTS = 2;
