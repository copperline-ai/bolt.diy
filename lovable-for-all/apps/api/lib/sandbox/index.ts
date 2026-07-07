import { DaytonaProvider } from "./daytona";
import type { ISandboxProvider, SandboxProvider as SandboxProviderName } from "@lovable/shared";

const providers = new Map<SandboxProviderName, ISandboxProvider>();

export async function getSandboxProvider(
  name: SandboxProviderName,
): Promise<ISandboxProvider> {
  if (providers.has(name)) {
    return providers.get(name)!;
  }

  let provider: ISandboxProvider;

  switch (name) {
    case "daytona":
      provider = new DaytonaProvider();
      await provider.initialize({
        apiKey: process.env.DAYTONA_API_KEY!,
        apiUrl: process.env.DAYTONA_API_URL,
      });
      break;
    default:
      throw new Error(`Sandbox provider ${name} not implemented`);
  }

  providers.set(name, provider);
  return provider;
}

export * from "./provider";
