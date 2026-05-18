#!/usr/bin/env node

import { getToolCommand, readStdinJson, writeJson } from './hook-utils.mjs';

const input = readStdinJson();
const command = String(getToolCommand(input) || '');
const response = JSON.stringify(input.tool_response || {});
const lower = `${command}\n${response}`.toLowerCase();

const isVerification = /npm run (lint|typecheck|build|harness:check|harness:test)|node --test|playwright|test\b/.test(lower);
const failed = /error|failed|failures|exit code 1|status":1/.test(lower);

if (isVerification && failed) {
  writeJson({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        'Harness noticed a failing verification command. Reproduce or fix the failure, then record the result; partial or failed outcomes require RCA context.'
    }
  });
  process.exit(0);
}

if (isVerification) {
  writeJson({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        'Harness noticed verification output. Include the command and result in the final summary or Run Record.'
    }
  });
  process.exit(0);
}

writeJson({});
