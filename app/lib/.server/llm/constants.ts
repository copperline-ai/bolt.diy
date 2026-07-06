/*
 * Maximum tokens for response generation (updated for modern model capabilities)
 * This serves as a fallback when model-specific limits are unavailable
 * Modern models like Claude 3.5, GPT-4o, and Gemini Pro support 128k+ tokens
 */
export const MAX_TOKENS = 128000;

/*
 * Provider-specific default completion token limits
 * Used as fallbacks when model doesn't specify maxCompletionTokens
 */
export const PROVIDER_COMPLETION_LIMITS: Record<string, number> = {
  OpenAI: 4096, // Standard GPT models (o1 models have much higher limits)
  Github: 4096, // GitHub Models use OpenAI-compatible limits
  Anthropic: 64000, // Conservative limit for Claude 4 models (Opus: 32k, Sonnet: 64k)
  Google: 8192, // Gemini 1.5 Pro/Flash standard limit
  Cohere: 4000,
  DeepSeek: 8192,
  Groq: 8192,
  HuggingFace: 4096,
  Mistral: 8192,
  Ollama: 8192,
  OpenRouter: 8192,
  Perplexity: 8192,
  Together: 8192,
  xAI: 8192,
  LMStudio: 8192,
  OpenAILike: 8192,
  AmazonBedrock: 8192,
  Hyperbolic: 8192,
};

/*
 * Reasoning models that require maxCompletionTokens instead of maxTokens
 * These models use internal reasoning tokens and have different API parameter requirements
 */
export function isReasoningModel(modelName: string): boolean {
  return /o[134]|gpt-5|deepseek-r1|deepseek-reasoner|reasoning|thinking|qwq/i.test(modelName);
}

/*
 * Build providerOptions for passing maxCompletionTokens to reasoning models.
 * 
 * The AI SDK drops top-level `maxCompletionTokens` (only `maxTokens` is extracted
 * from CallSettings). The correct path is through `providerOptions`, which the SDK
 * maps to `providerMetadata` and passes to the model's doGenerate/doStream.
 *
 * - OpenAI-based SDKs map `providerOptions.openai.maxCompletionTokens` → API body
 * - DeepSeek SDK spreads `providerOptions.deepseek.*` directly into the API body
 * - Non-OpenAI providers (Anthropic, Google, etc.) don't need this
 */
export function getReasoningProviderOptions(
  isReasoning: boolean,
  providerName: string,
  completionTokens: number,
): Record<string, unknown> | undefined {
  if (!isReasoning) return undefined;

  const openaiProviders = [
    'OpenAI', 'OpenAILike', 'Github', 'Groq', 'Perplexity',
    'xAI', 'Hyperbolic', 'Moonshot', 'HuggingFace', 'LMStudio',
    'Zai', 'Together',
  ];

  if (openaiProviders.includes(providerName)) {
    return { providerOptions: { openai: { maxCompletionTokens: completionTokens } } };
  }

  // DeepSeek uses @ai-sdk/deepseek which wraps @ai-sdk/openai-compatible.
  // Properties under the provider key are spread directly into the API body,
  // so we use snake_case to match the raw API parameter name.
  if (providerName === 'Deepseek') {
    return { providerOptions: { deepseek: { max_completion_tokens: completionTokens } } };
  }

  return undefined;
}

// limits the number of model responses that can be returned in a single request
export const MAX_RESPONSE_SEGMENTS = 2;

export interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
  isLocked?: boolean;
  lockedByFolder?: string;
}

export interface Folder {
  type: 'folder';
  isLocked?: boolean;
  lockedByFolder?: string;
}

type Dirent = File | Folder;

export type FileMap = Record<string, Dirent | undefined>;

export const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
  '**/*lock.json',
  '**/*lock.yml',
];
