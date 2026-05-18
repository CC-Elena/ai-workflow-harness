#!/usr/bin/env node

import { readStdinJson } from './hook-utils.mjs';

readStdinJson();

process.stdout.write('AI Workflow Harness active. Use AGENTS.md as the short entrypoint; default to Lightweight Flow and create full Spec artifacts only after explicit /spec.\n');
