#!/usr/bin/env node

import { classifyPrompt, readPolicy, readStdinJson } from './hook-utils.mjs';

const input = readStdinJson();
const prompt = input.prompt || '';
const classification = classifyPrompt(prompt);
const policy = readPolicy();
const levelPolicy = policy.levels.find((level) => level.id === classification.level);

const approvalItems = levelPolicy?.requiresApproval?.join(', ') || 'network, dependency change, guarded file change';
const verificationItems = levelPolicy?.requiredVerification?.join(', ') || 'relevant verification';

process.stdout.write(`Harness classification: ${classification.level} (${classification.workMode}).
Required verification: ${verificationItems}.
Requires approval for: ${approvalItems}.
Do not create full Spec artifacts unless the user explicitly requests /spec. Harness maintenance stays lightweight by default, even when Risky.
`);
