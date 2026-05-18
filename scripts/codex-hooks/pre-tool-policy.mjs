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

const destructive = policy.destructiveCommands.find((pattern) => lowerCommand.includes(pattern.toLowerCase()));
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
if (writesCode && guardedTouched.length > 0 && !/explicit approval|用户.*(确认|要求|批准)|approved/i.test(command)) {
  writeJson(
    deny(
      `Harness guarded path policy: ${guardedTouched.join(', ')} requires explicit approval or a declared Risky/Spec workflow before editing.`
    )
  );
  process.exit(0);
}

writeJson({
  systemMessage:
    writesCode && touchedPaths.length > 0
      ? `Harness pre-tool check passed. Touched paths detected: ${touchedPaths.join(', ')}.`
      : undefined
});
