#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import {
  block,
  extractTouchedPathsFromText,
  readStdinJson,
  writeJson
} from './hook-utils.mjs';

const input = readStdinJson();
const lastMessage = input.last_assistant_message || '';

if (input.stop_hook_active) {
  writeJson({ continue: true });
  process.exit(0);
}

const changedFiles = (() => {
  try {
    const tracked = execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    return Array.from(new Set(tracked)).sort();
  } catch {
    return [];
  }
})();

const messagePaths = extractTouchedPathsFromText(lastMessage);
const hasCodeChange = changedFiles.some((filePath) => !filePath.startsWith('specs/') || filePath.endsWith('run-record.md'));
const mentionsVerification = /verification|验证|npm run|harness:check|lint|typecheck|build|test|skipped|跳过/i.test(lastMessage);
const mentionsFailure = /failed|failure|失败|报错|partial|skipped|跳过/i.test(lastMessage);
const hasRunRecordChange = changedFiles.some((filePath) => /^specs\/[^/]+\/run-record\.md$/.test(filePath));
const hasSpecModeSignal = /\/spec|full spec|mini spec|run record|evaluation|harness:check/i.test(lastMessage);

if (hasCodeChange && !mentionsVerification) {
  writeJson(block('Harness Stop Gate: code or workflow files changed, but the final response does not mention verification or a skipped reason.'));
  process.exit(0);
}

if (mentionsFailure && !/rca|root cause|根因|风险|risk/i.test(lastMessage)) {
  writeJson(block('Harness Stop Gate: failed, partial, or skipped work must include risk/RCA context before stopping.'));
  process.exit(0);
}

if (hasSpecModeSignal && hasRunRecordChange) {
  const runRecord = changedFiles.find((filePath) => /^specs\/[^/]+\/run-record\.md$/.test(filePath));
  const featureDir = runRecord.split('/').slice(0, 2).join('/');
  if (fs.existsSync(featureDir)) {
    try {
      execFileSync('npm', ['run', 'harness:check', '--', featureDir], { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      const detail = error.stderr?.toString() || error.stdout?.toString() || error.message;
      writeJson(block(`Harness Stop Gate: ${featureDir} does not pass harness:check.\n${detail}`));
      process.exit(0);
    }
  }
}

writeJson({
  continue: true,
  systemMessage:
    messagePaths.length > 0
      ? `Harness Stop Gate passed. Final response references: ${messagePaths.join(', ')}.`
      : 'Harness Stop Gate passed.'
});
