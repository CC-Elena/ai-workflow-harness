# AI Workflow Harness Migration-ready Beta

## Product positioning

AI Workflow Harness is a repository-native engineering layer for existing coding agents. It supplies contracts, orchestration, context selection, tool policy, validation, evidence, trace, evaluation, delivery gates, and migration assets. It does not implement a model, general-purpose agent runtime, CI provider, editor, knowledge base, or zero-configuration business understanding.

The Beta closure is:

```text
requirement → spec → context → controlled execution → validation → evidence
→ review/evaluation → Git/CI gate → run record → RCA/learning input
```

## Shipped architecture

The public dependency-free Node.js API is `harness/index.mjs`; the CLI is `bin/harness.mjs`; target-owned state is `.harness/`; isolated migration fixtures are under `benchmarks/targets/`.

| Layer | Responsibility | Non-responsibility | Input → output | Lifecycle / extension | Failure and security boundary |
|---|---|---|---|---|---|
| Core Contracts | versioned machine contracts and validation | business interpretation | JSON → diagnostics | registry v1; preserve `extensions` | unknown version fails closed |
| Run Orchestrator | bind roles, coordinate work and verification | model inference | task/bindings → child runs/handoff | adapter-driven | distinct IDs; cancellation propagates |
| Agent Adapters | normalize Codex or OS-process execution | claim equivalent agent quality | descriptor/request → result | `AgentAdapter` | Codex absence is environment-unavailable |
| Context Providers | discover scoped context | automatic semantic truth | request → Context Items | `ContextProvider` | path containment, trust/authority cap |
| Tool Policy | authorize and bound tool calls | OS sandbox replacement | command request → decision/result | `ToolPolicyEngine` | deny dangerous/unapproved/protected operations |
| Validators | run change-required checks | invent passing evidence | manifest/change → result | `Validator` descriptors | timeout, explicit skipped/fail, output cap |
| Trace/Artifact/Evidence | append events and hash outputs | private chain-of-thought capture | runtime actions → JSONL/files | `TraceStore` | redaction, corrupt-line and hash diagnostics |
| Evaluation/Graders | isolated deterministic scoring | replace tests with model opinion | Eval Case/run → Grader Results | deterministic map + optional ModelGrader | model grading remains pending when absent |
| Git/CI Adapters | branch/worktree variants and reference gate | push, PR, deploy | source/variants → isolated results | local Git callback | cleanup; optional failed-worktree retention |
| Technology Presets | detect stack, generate commands, static checks | embed business rules in Core | project → preset/commands/findings | `TechnologyPreset` | editors remain external |
| Domain Packs | inject confirmed invariants and authority | infer unknown business rules | domain JSON → validated domain context | `DomainPack` | unconfirmed packs cannot inject |
| CLI | inspect/init/doctor/validate/run/eval/report/trace | execute discovered commands implicitly | arguments → JSON and run directory | stable command surface | init refuses overwrite; run requires manifest |

All v1 contracts use stable IDs, `schemaVersion`, status, and an `extensions` object. Errors are data where possible; exceptions are reserved for invalid APIs, unsafe paths, or missing required runtime configuration.

## Eight engineering topics

| Topic | Runnable implementation | Success case | Failure case | Beta limitation |
|---|---|---|---|---|
| AI Coding Evaluation | isolated copies, five deterministic graders, repeat/profile comparison | behavior/scope/evidence/trace pass on both targets | forbidden scope or missing trace fails | no real model/token/cost experiment was run; values stay Pending/null |
| Spec Engineering | v1 Spec contract, linter, parameter expansion, AC graph | AC→Task→Validation→Evidence complete | missing AC, scope conflict, invariant gap, blocker, illegal parameters | legacy Markdown needs explicit conversion |
| Context Engineering | five providers, budget builder, conflicts, recall/precision/noise | trusted nested instructions and gold file selected | stale docs and injection lose authority | Symbol/RAG/MCP providers unsupported |
| Agent Runtime & Tools | Codex/process adapters, bindings, policy, worker→handoff→verifier | two OS processes with childRunId and parent spans | timeout, nonretryable, protected path, dependency, duplicate, missing handoff, cancellation | fixture-process collaboration is not a hosted-agent benchmark |
| Validation Harness | classifier, resolver, validator, evidence check, gate | required results and AC evidence pass | unrun pass claim, stale/missing evidence, hidden-test rewrite, test change without review fail | UI/domain validators are project extensions |
| Git / CI/CD | temporary repository, branches/worktrees, patch helper, three variants, Actions reference | price 3/5/10 variants pass independently | callback failure retained when configured | no push/PR/remote Actions run |
| Observability / Trace | stable IDs, append-only JSONL, artifact hashes, viewer filters, record draft | complete local run directory passes integrity | corrupt JSONL line or changed artifact is reported | local file store, not distributed telemetry |
| Unity / Cocos | detection, command generation, static resource graph fixtures | valid meta/GUID and UUID references pass | missing meta/reference fails | editors were not installed; builds are environment-unavailable |

## Core contracts

`harness/contracts/registry.v1.json` defines Project Manifest, Spec, Task, Role, Role Binding, Agent Descriptor, Handoff, Artifact, Context Item, Context Conflict, Validation Manifest/Result, Evidence, Tool Policy, Agent Run, Run Event, Evaluation Case/Result, Grader Result, Failure Category, and RCA.

Correct shared envelope:

```json
{ "schemaVersion": "1.0.0", "id": "artifact-001", "status": "pass", "extensions": {}, "kind": "log", "path": "evidence/test.log", "sha256": "...", "owner": "verifier" }
```

Incorrect envelope:

```json
{ "schemaVersion": "9.0.0", "id": "x", "status": "done" }
```

Every contract-specific field set is exercised by the registry test. Compatibility is exact-version for Beta: unknown versions fail, extension fields survive, and removal requires a migration path plus release notice.

## Adapters, presets, and domain packs

- `GenericProcessAdapter` is the controlled fixture/command path.
- `CodexAdapter` declares capability and returns `environment_unavailable` when the external CLI is absent; it never records private reasoning.
- Next.js/TypeScript supplies detected repository commands.
- Unity supplies BatchMode/EditMode/PlayMode/Build command arrays, build target, logs, scene-list policy, and GUID/meta checks.
- Cocos supplies platform build command arrays, log contract, and UUID/reference checks.
- Domain packs remain target-owned and must explicitly confirm invariants and authoritative sources.

## Runtime storage

```text
.harness/runs/{runId}/
├── run.json
├── events.jsonl
├── artifacts/
├── evidence/
├── patch.diff
├── validation.json
├── evaluation.json
├── run-record.md
└── report.md
```

Large output is stored as an Artifact and referenced by ID/hash. Query keys include run, agent, task, event type, role, and status. Events represent observable execution only, never model private reasoning.

