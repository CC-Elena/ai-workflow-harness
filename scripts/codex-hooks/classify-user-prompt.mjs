#!/usr/bin/env node

import { classifyPrompt, readPolicy, readStdinJson } from './hook-utils.mjs';

const input = readStdinJson();
const prompt = input.prompt || '';
const classification = classifyPrompt(prompt);
const policy = readPolicy();
const levelPolicy = policy.levels.find((level) => level.id === classification.level);

const approvalItems = levelPolicy?.requiresApproval?.join(', ') || 'network, dependency change, guarded file change';
const verificationItems = levelPolicy?.requiredVerification?.join(', ') || 'relevant verification';

if (classification.level === 'Small' && classification.workMode === 'Lightweight') {
  process.exit(0);
}

process.stdout.write(`Harness: ${classification.level} / ${classification.workMode}. Verify: ${verificationItems}. Approval: ${approvalItems}. Full Spec only after explicit /spec; Harness maintenance stays lightweight by default.
`);
