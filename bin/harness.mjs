#!/usr/bin/env node
import { main } from '../harness/cli.mjs';

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
