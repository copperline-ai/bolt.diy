import type {
  ISandboxProvider,
  SandboxCreateOptions,
  SandboxFile,
  SandboxProcessResult,
  SandboxStatus,
  SandboxProvider as SandboxProviderName,
} from "@lovable/shared";

export abstract class SandboxProvider implements ISandboxProvider {
  abstract readonly name: SandboxProviderName;
  abstract initialize(config: { apiKey: string; apiUrl?: string }): Promise<void>;
  abstract createSandbox(options: SandboxCreateOptions): Promise<string>;
  abstract destroySandbox(instanceId: string): Promise<void>;
  abstract writeFiles(instanceId: string, files: SandboxFile[]): Promise<void>;
  abstract readFile(instanceId: string, path: string): Promise<string>;
  abstract executeCommand(instanceId: string, command: string, cwd?: string): Promise<SandboxProcessResult>;
  abstract getPreviewUrl(instanceId: string, port?: number): Promise<string>;
  abstract streamLogs(instanceId: string): AsyncIterable<string>;
  abstract getStatus(instanceId: string): Promise<SandboxStatus>;
}
