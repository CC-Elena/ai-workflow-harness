#!/usr/bin/env node

import { readStdinJson } from './hook-utils.mjs';

readStdinJson();

process.stdout.write(`# AI Workflow Harness active

Before coding, use AGENTS.md as the short entrypoint, then load:
1. .ai/workflows/rule-loading-policy.md
2. .ai/workflows/command-routing.md
3. .ai/context/skill-routing-minimal.md

Default to Lightweight Flow. Harness maintenance stays lightweight by default. Suggest /spec for unclear product work and wait for confirmation before creating full Spec artifacts.
`);
