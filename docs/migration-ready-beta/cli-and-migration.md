# CLI and Migration Guide

Run from this repository with `node bin/harness.mjs`, or through `npm run harness:cli --`.

```bash
node bin/harness.mjs inspect --root /path/to/project
node bin/harness.mjs init --root /path/to/project --dry-run
node bin/harness.mjs init --root /path/to/project
node bin/harness.mjs doctor --root /path/to/project
node bin/harness.mjs validate --root /path/to/project
node bin/harness.mjs run --root /path/to/project
node bin/harness.mjs eval --root /path/to/project
node bin/harness.mjs report --root /path/to/project --run-id RUN_ID
node bin/harness.mjs trace --root /path/to/project --run-id RUN_ID --role verifier
```

## Migration lifecycle

1. `inspect` reports `detected`, `inferred`, `needs_confirmation`, and `unsupported` without writes.
2. `init --dry-run` previews create/preserve decisions.
3. `init` creates only missing `.harness` files with exclusive-create semantics.
4. Maintainers confirm project commands, protected paths, domain invariants, authority, preset, hooks, and CI.
5. `doctor` validates schemas and confirmation state.
6. `validate` runs only commands explicitly stored in the Validation Manifest.
7. `run` executes through the process adapter and writes Trace/Evidence.
8. `eval`, `report`, and `trace` grade and inspect the result.

Ownership is part of the Project Manifest:

- Harness-owned: reusable templates and runtime implementation.
- Project-owned: commands, protected paths, CI and architecture choices.
- Domain-owned: invariants, business vocabulary and authoritative sources.
- Generated: detected candidates and reports.
- Run/Evidence: immutable-by-convention execution history.

Safe re-run preserves existing Project/Domain files. Beta has no force overwrite or destructive upgrade mode. Legacy Markdown and Codex hooks remain supported; adoption can be incremental.

## Two-target proof

`benchmarks/targets/puzzle-ab-lab` is a Node.js domain fixture with game-core, economy, experiments, features, telemetry, config, UI, tests, product/architecture documents, stale state, and ten cases. `benchmarks/targets/python-flag-service` is a Python standard-library fixture with a different structure and test runner.

The automated suite copies each target into a temporary directory and executes inspect, init dry-run, doctor, validate, run, eval, report, trace, then removes `.harness` in the temporary copy and verifies fresh init plus confirmation gating. Core never imports either target's business modules.

