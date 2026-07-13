# Migration-ready Beta Current State Audit

Date: 2026-07-13

## Scope and method

This audit compares the repository at Goal start with the Migration-ready Beta completion contract. It inspected `README.md`, `package.json`, `AGENTS.md`, `.ai/`, `.codex/`, `.agents/`, `skills/`, `scripts/`, `specs/`, `src/`, tests, and `.github/workflows/ci.yml`. Existing uncommitted Audit Cockpit UI work under `src/` is user-owned and excluded from this Goal.

## Baseline

| Area | Verified baseline | Classification |
|---|---|---|
| Next.js workspace | Next.js 15, React 19, TypeScript, lint/typecheck/build scripts | Project-specific runnable code |
| Workflow protocol | PRD/Spec/Tasks/Run Record/Verification/Evaluation/RCA assets | Repository-native documentation and templates |
| Planner/Executor | Logical roles in one coding-agent session | Documentation; not physical multi-agent execution |
| Context | Static indexes, Context Pack guidance, Skill routing | Documentation and repository-specific data |
| Codex integration | Session/UserPrompt/PreTool/PostTool/Stop hooks and policy JSON | Codex-specific runnable guards |
| Delivery gate | `check-harness-run.mjs`, tests, PR diff coverage | Runnable project-specific gate |
| Evaluation | Metrics, rubric, production gate, learning loop | Primarily manual protocol |
| Trace | Explainability Markdown guidance and Run Records | Post-hoc documentation, not runtime events |
| Migration | Migration Skill and documentation | Agent-guided copying; no generic inspect/init/doctor CLI |
| CI | One GitHub Actions workflow | Runnable reference, missing new Core/eval/migration checks |

## Confirmed gaps at Goal start

1. No versioned runtime contract registry or unknown-version rejection across the required contract set.
2. No append-only JSONL event store with run/trace/span/parent/agent/task/handoff/artifact identifiers.
3. No automatic Context Provider interface, authority/conflict engine, budgeted pack builder, or recall/precision measurement.
4. No executable Spec linter with end-to-end AC→Task→Validation→Evidence checks.
5. No generic validation resolver, evidence integrity checks, anti-cheating gate, or classifier.
6. No isolated eval runner, deterministic graders, repeated comparison, or baseline/ablation profiles.
7. No generic agent adapter or independently executing worker→handoff→verifier path.
8. No reusable Git/worktree variant runner.
9. No technology preset interface or Unity/Cocos static adapters.
10. No CLI closure for inspect/init/doctor/validate/run/eval/report/trace.
11. No two independent target fixtures proving migration.

## Boundary decisions

- **Harness Core:** dependency-free Node.js modules under `harness/`; must not import benchmark business code.
- **Project-owned:** root commands, protected paths, architecture, and CI choices discovered or confirmed during init.
- **Domain-owned:** business terms, invariants, acceptance rules, and hidden validators supplied by each target.
- **Agent-specific:** Codex hooks remain adapters and are not generalized into Core claims.
- **Technology-specific:** Next.js, Unity, and Cocos logic lives in presets, outside Core.
- **Evidence truth:** only locally executed commands may be `pass`; unavailable editors and remote CI remain `pending`/`environment_unavailable`.

## Compatibility baseline

Existing Markdown workflows, `harness:check`, Skills, Codex hooks, and Next.js UI remain supported. The runtime layer is additive. Legacy documents are not silently promoted to v1 runtime contracts; migration must parse or wrap them explicitly.

