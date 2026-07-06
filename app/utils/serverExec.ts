interface ServerExecResult {
  success: boolean;
  output: string;
  stdout: string;
  stderr: string;
  available: boolean;
  error?: string;
  exitCode?: number | null;
  killed?: boolean;
  signal?: string | null;
}

interface ServerExecStatus {
  available: boolean;
  workDir: string;
  toolCheck: Record<string, string | null> | null;
}

let _cachedStatus: ServerExecStatus | null = null;

export async function getServerExecStatus(): Promise<ServerExecStatus> {
  if (_cachedStatus) {
    return _cachedStatus;
  }

  try {
    const response = await fetch('/api/server-exec');
    _cachedStatus = await response.json();
    return _cachedStatus;
  } catch {
    return { available: false, workDir: '', toolCheck: null };
  }
}

export async function executeServerCommand(
  command: string,
  options?: { cwd?: string; env?: Record<string, string> },
): Promise<ServerExecResult> {
  try {
    const response = await fetch('/api/server-exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        cwd: options?.cwd,
        env: options?.env,
      }),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      output: '',
      stdout: '',
      stderr: '',
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function isServerExecAvailable(): Promise<boolean> {
  const status = await getServerExecStatus();
  return status.available;
}
