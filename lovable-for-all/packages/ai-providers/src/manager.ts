import type { BaseProvider } from "./base-provider";
import type { IProvider, ModelInfo } from "./types";

export class LLMManager {
  private static _instance: LLMManager | undefined;
  private _providers: Map<string, IProvider> = new Map();

  private constructor() {}

  static getInstance(): LLMManager {
    if (!LLMManager._instance) {
      LLMManager._instance = new LLMManager();
    }
    return LLMManager._instance;
  }

  registerProvider(provider: IProvider) {
    if (this._providers.has(provider.name)) {
      console.warn(`Provider ${provider.name} is already registered. Skipping.`);
      return;
    }

    this._providers.set(provider.name, provider);
  }

  getProvider(name: string): IProvider | undefined {
    return this._providers.get(name);
  }

  getAllProviders(): IProvider[] {
    return Array.from(this._providers.values());
  }

  getStaticModelList(): ModelInfo[] {
    return this.getAllProviders().flatMap((p) => p.staticModels || []);
  }

  async updateModelList(options: {
    apiKeys: Record<string, string>;
    settings: Record<string, string>;
    serverEnv?: Record<string, string>;
  }): Promise<ModelInfo[]> {
    const { apiKeys, settings, serverEnv } = options;

    const dynamicModels = await Promise.all(
      this.getAllProviders()
        .filter((provider): provider is IProvider & Required<Pick<IProvider, "getDynamicModels">> => !!provider.getDynamicModels)
        .map(async (provider) => {
          try {
            const models = await provider.getDynamicModels(apiKeys, settings, serverEnv);
            return models;
          } catch (err) {
            console.error(`Error getting dynamic models for ${provider.name}:`, err);
            return [];
          }
        }),
    );

    const staticModels = this.getStaticModelList();
    const dynamicModelsFlat = dynamicModels.flat();
    const dynamicModelKeys = new Set(dynamicModelsFlat.map((d) => `${d.name}-${d.provider}`));
    const filteredStaticModels = staticModels.filter((m) => !dynamicModelKeys.has(`${m.name}-${m.provider}`));

    const modelList = [...dynamicModelsFlat, ...filteredStaticModels];
    modelList.sort((a, b) => a.name.localeCompare(b.name));

    return modelList;
  }

  async getModelInstance(
    providerName: string,
    modelName: string,
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    serverEnv?: Record<string, string>,
  ) {
    const provider = this._providers.get(providerName);

    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return provider.getModelInstance({ model: modelName, apiKeys, settings, serverEnv });
  }
}

export const llmManager = LLMManager.getInstance();
