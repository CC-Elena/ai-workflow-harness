# ADR-001: Dependency-free repository-native runtime

- Status: Accepted
- Date: 2026-07-13

## Context

The repository already has a Next.js product surface and strong Markdown workflow assets, but Migration-ready Beta requires executable contracts, orchestration, trace, evaluation, and migration across unrelated codebases. Adding a hosted service, database, model runtime, or broad dependency stack would violate the product boundary and make fixture migration less credible.

## Decision

Implement an additive, dependency-free Node.js runtime under `harness/` and a thin CLI under `bin/`. Store run data in `.harness/runs/{runId}`. Keep agent, Git, CI, technology, and domain behavior behind adapters or manifests. Treat independently spawned OS processes as physical execution units for the minimum worker/verifier path.

Schema version `1.0.0` is the first runtime contract. Unknown major or exact unregistered versions fail closed. Stable contract IDs, extension objects, and explicit status enums are mandatory. Legacy Markdown remains readable but is not silently declared compliant.

## Consequences

- Runs work without installing new packages and can be copied into TypeScript, JavaScript, or Python repositories.
- JSON Schema coverage is intentionally a supported subset enforced by the registry validator; a future release may adopt a standards-complete validator without changing contract documents.
- Local JSONL provides auditability, not distributed tracing guarantees.
- Process adapters demonstrate real isolation and handoff, but do not claim to reproduce hosted coding-agent semantics.
- Technology editors and remote CI remain external validation boundaries.

## Safety and compatibility

Core never executes repository-discovered commands without an explicit controlled-run manifest. Init does not overwrite files unless a future explicit force option is approved. Project/domain-owned files are never replaced during upgrade. Sensitive keys and prompt-injection patterns are redacted or downgraded before trace persistence.

