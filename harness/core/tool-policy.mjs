import { spawn } from 'node:child_process';

const DANGEROUS = [/^r\x6d\b/, /^git\s+reset\b/, /^git\s+clean\b/, /^git\s+checkout\s+--/, /^chmod\s+-R\b/, /^chown\s+-R\b/];
const DEPENDENCY = /^(?:npm\s+(?:install|uninstall)|pnpm\s+(?:install|remove)|yarn\s+add|bun\s+add)\b/;

export class ToolPolicyEngine {
  constructor(policy = {}) {
    this.policy = { allowed: [], denied: [], protectedPaths: [], timeoutMs: 30000, maxOutputBytes: 1024 * 1024, retries: 0, ...policy };
    this.completed = new Map();
  }

  authorize(request) {
    const commandText = request.command.join(' ');
    if (DANGEROUS.some((pattern) => pattern.test(commandText))) return { allowed: false, reason: 'dangerous command' };
    if (this.policy.denied.some((pattern) => commandText.includes(pattern))) return { allowed: false, reason: 'command denied by policy' };
    if (this.policy.allowed.length && !this.policy.allowed.some((pattern) => commandText.startsWith(pattern))) return { allowed: false, reason: 'command not allowlisted' };
    if (DEPENDENCY.test(commandText) && !request.approvedDependencyChange) return { allowed: false, reason: 'dependency change needs approval' };
    const protectedTouch = (request.touchedPaths || []).find((file) => this.policy.protectedPaths.some((prefix) => file === prefix || file.startsWith(`${prefix}/`)));
    if (protectedTouch && !request.approvedProtectedPath) return { allowed: false, reason: `protected path needs approval: ${protectedTouch}` };
    return { allowed: true };
  }

  async execute(request) {
    const decision = this.authorize(request);
    if (!decision.allowed) return { status: 'fail', category: 'policy', retryable: false, ...decision };
    if (request.idempotencyKey && this.completed.has(request.idempotencyKey)) return { ...this.completed.get(request.idempotencyKey), duplicate: true };
    let attempt = 0;
    let result;
    do {
      attempt += 1;
      result = await runProcess(request.command, {
        cwd: request.cwd, timeoutMs: request.timeoutMs || this.policy.timeoutMs,
        maxOutputBytes: request.maxOutputBytes || this.policy.maxOutputBytes, signal: request.signal
      });
    } while (result.retryable && attempt <= (request.retries ?? this.policy.retries));
    result.attempts = attempt;
    if (request.idempotencyKey && result.status === 'pass') this.completed.set(request.idempotencyKey, result);
    return result;
  }
}

/**
 * Public Harness API.
 */
export function runProcess(command, options = {}) {
  return new Promise((resolve) => {
    if (options.signal?.aborted) return resolve({ status: 'cancelled', category: 'cancelled', retryable: false, output: '', errorOutput: '' });
    const child = spawn(command[0], command.slice(1), { cwd: options.cwd, stdio: ['ignore', 'pipe', 'pipe'], env: options.env || process.env });
    const output = [];
    const errorOutput = [];
    let bytes = 0;
    let truncated = false;
    const limit = options.maxOutputBytes || 1024 * 1024;
    const collect = (target) => (chunk) => {
      if (bytes < limit) {
        const remaining = limit - bytes;
        target.push(chunk.subarray(0, remaining));
        bytes += Math.min(chunk.length, remaining);
      }
      if (bytes >= limit) truncated = true;
    };
    child.stdout.on('data', collect(output));
    child.stderr.on('data', collect(errorOutput));
    let timedOut = false;
    let cancelled = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, options.timeoutMs || 30000);
    const onAbort = () => { cancelled = true; child.kill('SIGTERM'); };
    options.signal?.addEventListener('abort', onAbort, { once: true });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: 'fail', category: 'environment', retryable: false, output: '', errorOutput: error.message, truncated });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
      const category = cancelled ? 'cancelled' : timedOut ? 'timeout' : code === 0 ? null : code === 75 ? 'environment' : 'implementation';
      resolve({
        status: cancelled ? 'cancelled' : code === 0 && !timedOut ? 'pass' : 'fail', category,
        retryable: timedOut || code === 75, exitCode: code, timedOut, cancelled, truncated,
        output: Buffer.concat(output).toString('utf8'), errorOutput: Buffer.concat(errorOutput).toString('utf8')
      });
    });
  });
}
