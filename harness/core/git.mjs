import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as fsp from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { stableId } from './ids.mjs';

function git(cwd, args, allowFailure = false) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 'Harness Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid', GIT_COMMITTER_NAME: 'Harness Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' } });
  if (!allowFailure && result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result;
}

/**
 * Public Harness API.
 */
export function diffArtifact(repo, base, head, target) {
  const result = git(repo, ['diff', '--binary', `${base}...${head}`]);
  fs.writeFileSync(target, result.stdout);
  return { path: target, bytes: Buffer.byteLength(result.stdout) };
}

/**
 * Public Harness API.
 */
export async function runGitVariants(source, variants, execute, options = {}) {
  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'harness-git-'));
  const repo = path.join(tempRoot, 'repo');
  const worktrees = path.join(tempRoot, 'worktrees');
  await fsp.cp(source, repo, { recursive: true, filter: (value) => !value.split(path.sep).some((part) => ['.git', '.harness', 'node_modules'].includes(part)) });
  fs.mkdirSync(worktrees);
  const results = [];
  try {
    git(repo, ['init', '-b', 'main']);
    git(repo, ['add', '.']);
    git(repo, ['commit', '-m', 'fixture baseline']);
    for (const [index, parameters] of variants.entries()) {
      const runId = stableId('variant');
      const branch = `harness/variant-${index + 1}`;
      const workspace = path.join(worktrees, `variant-${index + 1}`);
      git(repo, ['worktree', 'add', '-b', branch, workspace, 'main']);
      let result;
      try { result = await execute({ runId, branch, workspace, parameters }); }
      catch (error) { result = { status: 'fail', error: error.message }; }
      results.push({ runId, branch, workspace: options.keepFailed && result.status !== 'pass' ? workspace : null, parameters, ...result });
      if (!(options.keepFailed && result.status !== 'pass')) git(repo, ['worktree', 'remove', '--force', workspace], true);
    }
    return { status: results.every((result) => result.status === 'pass') ? 'pass' : 'fail', variants: results };
  } finally {
    if (!options.keepRoot) await fsp.rm(tempRoot, { recursive: true, force: true });
  }
}
