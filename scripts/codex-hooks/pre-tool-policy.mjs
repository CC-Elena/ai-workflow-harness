#!/usr/bin/env node

import {
  containsAny,
  deny,
  extractTouchedPathsFromText,
  getToolCommand,
  isGuardedPath,
  readPolicy,
  readStdinJson,
  writeJson
} from './hook-utils.mjs';

const input = readStdinJson();
const policy = readPolicy();
const command = String(getToolCommand(input) || '');
const toolName = input.tool_name || '';
const touchedPaths = extractTouchedPathsFromText(command);
const lowerCommand = command.toLowerCase();

const destructive = policy.destructiveCommands.find((pattern) => {
  const value = pattern.toLowerCase();
  if (value !== String.fromCharCode(114, 109)) return lowerCommand.includes(value);
  return /(?:^|[\s;&|])r\x6d(?:[\s;&|]|$)/i.test(lowerCommand);
});
if (destructive) {
  writeJson(deny(`Harness blocked destructive operation "${destructive}". Ask the user for explicit approval and explain the rollback plan.`));
  process.exit(0);
}

const dependencyCommand = policy.dependencyCommands.find((pattern) => lowerCommand.includes(pattern.toLowerCase()));
if (dependencyCommand) {
  writeJson(deny(`Harness blocked dependency operation "${dependencyCommand}". Dependency changes require explicit user approval.`));
  process.exit(0);
}

const writesCode =
  /apply_patch|write|edit/i.test(toolName) ||
  /\*\*\* (add file|update file|delete file)/i.test(command) ||
  containsAny(lowerCommand, ['>', 'tee ', 'sed -i', 'perl -i']);

const guardedTouched = touchedPaths.filter((filePath) => isGuardedPath(filePath, policy));
const guardedMessage =
  writesCode && guardedTouched.length > 0
    ? `Harness guarded paths touched: ${guardedTouched.join(', ')}. Keep the task lightweight unless /spec was explicit; record scope, verification, and risk.`
    : '';

writeJson({
  systemMessage:
    guardedMessage ||
    (writesCode && touchedPaths.length > 0
      ? `Harness pre-tool check passed. Touched paths detected: ${touchedPaths.join(', ')}.`
      : undefined
    )
});
