import { Daytona, Sandbox, SandboxState } from "@daytona/sdk";
import type {
  ISandboxProvider,
  SandboxCreateOptions,
  SandboxFile,
  SandboxProcessResult,
  SandboxStatus,
} from "@lovable/shared";

export class DaytonaProvider implements ISandboxProvider {
  readonly name = "daytona" as const;
  private client: Daytona | null = null;

  async initialize(config: { apiKey: string; apiUrl?: string }): Promise<void> {
    this.client = new Daytona({
      apiKey: config.apiKey,
      apiUrl: config.apiUrl ?? "https://app.daytona.io/api",
    });
  }

  private get daytona(): Daytona {
    if (!this.client) {
      throw new Error("Daytona provider not initialized");
    }
    return this.client;
  }

  private async getSandbox(instanceId: string): Promise<Sandbox> {
    return this.daytona.get(instanceId);
  }

  async createSandbox(options: SandboxCreateOptions): Promise<string> {
    const sandbox = await this.daytona.create({
      language: options.language ?? "typescript",
      envVars: options.env,
      labels: {
        projectId: options.projectId,
      },
    });
    return sandbox.id;
  }

  async destroySandbox(instanceId: string): Promise<void> {
    const sandbox = await this.getSandbox(instanceId);
    await sandbox.delete();
  }

  async writeFiles(instanceId: string, files: SandboxFile[]): Promise<void> {
    const sandbox = await this.getSandbox(instanceId);

    for (const file of files) {
      await sandbox.fs.uploadFile(Buffer.from(file.content), file.path);
    }
  }

  async readFile(instanceId: string, path: string): Promise<string> {
    const sandbox = await this.getSandbox(instanceId);
    const buffer = await sandbox.fs.downloadFile(path);
    return buffer.toString("utf-8");
  }

  async executeCommand(
    instanceId: string,
    command: string,
    cwd?: string,
  ): Promise<SandboxProcessResult> {
    const sandbox = await this.getSandbox(instanceId);
    const result = await sandbox.process.executeCommand(command, cwd);

    return {
      exitCode: result.exitCode ?? 0,
      stdout: result.artifacts?.stdout ?? "",
      stderr: "",
    };
  }

  async getPreviewUrl(instanceId: string, port = 3000): Promise<string> {
    const sandbox = await this.getSandbox(instanceId);
    const preview = await sandbox.getPreviewLink(port);
    return preview.url;
  }

  async *streamLogs(_instanceId: string): AsyncIterable<string> {
    // Daytona SDK v0.194 does not expose a simple streaming log API.
    // Use PTY or session-based logs in production. Stub for now.
    yield "Streaming logs not yet implemented for Daytona SDK v0.194";
  }

  async getStatus(instanceId: string): Promise<SandboxStatus> {
    const sandbox = await this.getSandbox(instanceId);

    switch (sandbox.state) {
      case SandboxState.STARTED:
      case SandboxState.STARTING:
        return "running";
      case SandboxState.STOPPED:
      case SandboxState.STOPPING:
        return "stopped";
      case SandboxState.ERROR:
      case SandboxState.BUILD_FAILED:
        return "error";
      default:
        return "creating";
    }
  }
}
