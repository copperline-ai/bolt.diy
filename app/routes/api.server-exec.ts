import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

// Static import works in wrangler pages dev (Node.js). Unenv polyfills execSync but not exec.
let execSync: typeof import('child_process').execSync | null = null;
let isServerSideAvailable = false;

try {
  const cp = await import('child_process');
  execSync = cp.execSync;
  isServerSideAvailable = !!execSync && typeof execSync === 'function';
} catch {
  isServerSideAvailable = false;
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
  if (!isServerSideAvailable || !execSync) {
    return json(
      {
        error: 'Server-side execution is not available in this environment',
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
    const shellCommand = command.startsWith('export ') || command.startsWith('cd ')
      ? command
      : `/bin/bash -c ${JSON.stringify(command)}`;

    const output = execSync(shellCommand, {
      cwd: workDir,
      timeout: COMMAND_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf-8',
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return json({
      success: true,
      output: output.trim() || '(no output)',
      available: true,
    });
  } catch (error: any) {
    const message = error?.message || error?.toString() || 'Unknown error';
    const killed = error?.killed || false;
    const stdout = error?.stdout?.toString() || '';
    const stderr = error?.stderr?.toString() || '';

    return json(
      {
        success: false,
        error: message,
        output: stdout || stderr || message,
        exitCode: error?.status || error?.code || null,
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
  const toolCheck = execSync
    ? {
        node: tryCommand('node --version'),
        npm: tryCommand('npm --version'),
        pnpm: tryCommand('pnpm --version'),
        yarn: tryCommand('yarn --version'),
        bun: tryCommand('bun --version'),
        python3: tryCommand('python3 --version'),
        git: tryCommand('git --version'),
        curl: tryCommand('curl --version'),
      }
    : null;

  return json({
    available: isServerSideAvailable,
    workDir: WORK_DIR,
    toolCheck,
  });
}

function tryCommand(cmd: string): string | null {
  if (!execSync) return null;
  try {
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] });
    return output.trim();
  } catch {
    return null;
  }
}
