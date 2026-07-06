import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

let _execSync: typeof import('child_process').execSync | null = null;
let _exec: typeof import('child_process').exec | null = null;

async function getChildProcess() {
  if (_execSync && _exec) {
    return { execSync: _execSync, exec: _exec };
  }

  try {
    const cp = await import('child_process');
    _execSync = cp.execSync;
    _exec = cp.exec;
    return { execSync: _execSync, exec: _exec };
  } catch {
    return null;
  }
}

const WORK_DIR = process.env.WORK_DIR || '/app/project';
const COMMAND_TIMEOUT = parseInt(process.env.SERVER_EXEC_TIMEOUT || '120000', 10);

const ALLOWED_COMMANDS: RegExp[] = [
  /^(npm|npx|pnpm|yarn|bun)\s/,
  /^(node|python3|python)\s/,
  /^(ls|cat|mkdir|rm|cp|mv|touch|chmod)\s/,
  /^(git|curl|wget)\s/,
  /^echo\s/,
  /^which\s/,
  /^(export|cd)\s/,
];

function isCommandAllowed(command: string): boolean {
  const trimmed = command.trim();
  return ALLOWED_COMMANDS.some((pattern) => pattern.test(trimmed));
}

export async function action({ request }: ActionFunctionArgs) {
  const cp = await getChildProcess();

  if (!cp) {
    return json(
      {
        error: 'Server-side execution is not available in this environment (Cloudflare Workers)',
        available: false,
      },
      { status: 501 },
    );
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { command?: string; cwd?: string; env?: Record<string, string> };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { command, cwd, env } = body;

  if (!command || typeof command !== 'string') {
    return json({ error: 'Missing or invalid "command" field' }, { status: 400 });
  }

  if (command.length > 10000) {
    return json({ error: 'Command too long (max 10,000 chars)' }, { status: 400 });
  }

  if (!isCommandAllowed(command)) {
    return json(
      {
        error: `Command not allowed: "${command.split(/\s+/)[0]}". Allowed: npm, npx, pnpm, yarn, bun, node, python3, ls, cat, mkdir, rm, cp, mv, touch, chmod, git, curl, wget, echo, which, export, cd`,
        available: true,
      },
      { status: 403 },
    );
  }

  const workDir = cwd || WORK_DIR;

  try {
    const options: any = {
      cwd: workDir,
      timeout: COMMAND_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024,
      shell: '/bin/bash',
      env: { ...process.env, ...env },
    };

    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      cp.exec(command, options, (error, stdout, stderr) => {
        if (error && !stdout && !stderr) {
          reject(error);
          return;
        }

        resolve({ stdout: stdout || '', stderr: stderr || '' });
      });
    });

    return json({
      success: true,
      output: result.stdout || result.stderr,
      stdout: result.stdout,
      stderr: result.stderr,
      available: true,
    });
  } catch (error: any) {
    const message = error?.message || error?.toString() || 'Unknown error';
    const killed = error?.killed || false;

    return json(
      {
        success: false,
        error: message,
        output: error?.stdout || error?.stderr || message,
        exitCode: error?.code || null,
        killed,
        signal: error?.signal || null,
        available: true,
      },
      {
        status: killed ? 408 : 500,
      },
    );
  }
}

export async function loader() {
  const cp = await getChildProcess();

  const toolCheck = cp
    ? {
        node: tryCommand(cp.execSync, 'node --version'),
        npm: tryCommand(cp.execSync, 'npm --version'),
        pnpm: tryCommand(cp.execSync, 'pnpm --version'),
        yarn: tryCommand(cp.execSync, 'yarn --version'),
        bun: tryCommand(cp.execSync, 'bun --version'),
        python3: tryCommand(cp.execSync, 'python3 --version'),
        git: tryCommand(cp.execSync, 'git --version'),
        curl: tryCommand(cp.execSync, 'curl --version'),
      }
    : null;

  return json({
    available: !!cp,
    workDir: WORK_DIR,
    toolCheck,
  });
}

function tryCommand(execSync: typeof import('child_process').execSync, cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim();
  } catch {
    return null;
  }
}
