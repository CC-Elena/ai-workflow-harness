# Migration-ready Beta Implementation Plan

This is a Lightweight Harness-maintenance execution record, not a user-triggered Full Spec. The Goal itself defines acceptance criteria and authorizes additive changes to Core, CLI, adapters, presets, domains, fixtures, tests, docs, package scripts, and the local CI reference.

## Milestones

| ID | Deliverable | Exit evidence |
|---|---|---|
| M1 | Audit, matrix, ADR, compatibility plan | persistent docs reviewed against repository state |
| M2 | Contract registry and validator | valid/invalid/unknown-version tests |
| M3 | Trace, artifacts, evidence, redaction | JSONL integrity/query/hash/redaction tests |
| M4 | Spec and context engines | linter, five providers, conflict/metrics cases |
| M5 | Validation harness | resolver, stale/missing evidence, anti-cheating gate |
| M6 | Evaluation | isolated runner, graders, repeats and profiles |
| M7 | Runtime and tool policy | single binding, real process handoff, fault injection |
| M8 | Git/CI | temporary repo, branches/worktrees, three variants |
| M9 | Migration CLI | inspect/init/doctor/validate/run/eval/report/trace |
| M10 | Target fixtures | Puzzle A/B eight cases and independent Python service |
| M11 | Presets | Next.js, Unity, Cocos detection/commands/static checks |
| M12 | Release verification | full local command set, run record, known limitations |

## Compatibility and upgrade policy

1. `Legacy`: existing Markdown assets and Codex hooks; preserved as-is.
2. `Current`: existing `harness:check` and Next.js workspace; receives additive script integration.
3. `Runtime v1`: machine contracts and `.harness` manifests; versioned independently.
4. Unknown contract versions fail with a diagnostic and no mutation.
5. Safe re-run: inspect and doctor are read-only; init creates missing Harness-owned/generated files and refuses overwrite.
6. Ownership classes: Harness-owned, Project-owned, Domain-owned, Generated, Run/Evidence.
7. Deprecations require one supported migration path and release-note notice before removal.

## Skill loading

- Main Skill: `feature-dev`
- Auxiliary Skill: `workflow-assets`
- Tracking: `scripts/track-skill.js` was absent; usage is recorded here and in the final Run Record.
- Skipped: UI, screenshot, skeleton, and component skills because `src/` is outside this Goal's implementation surface.

