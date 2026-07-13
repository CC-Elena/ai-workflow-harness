# Capability Matrix

Legend: **Implemented** is executable and tested locally; **Reference** is a checked artifact but needs an external runtime; **Pending** has no truthful execution in this environment.

| Capability | Before | Beta target | Proof surface |
|---|---|---|---|
| Versioned contracts | Markdown templates | Implemented | `harness/contracts/registry.v1.json`, contract tests |
| Spec engineering | Human workflow | Implemented | Spec linter and traceability tests |
| Context engineering | Static indexes | Implemented | Five providers, authority/conflict, budget metrics |
| Validation | Project scripts + Markdown evidence | Implemented | classifier, resolver, evidence/gate tests |
| Evaluation | Rubric documentation | Implemented | isolated runner, deterministic graders, reports |
| Agent runtime | Logical roles only | Implemented | process adapter and worker→verifier handoff fixture |
| Tool policy | Codex pre-tool hook | Implemented + adapter-specific | generic policy/retry/timeout/cancel/idempotency tests |
| Trace | Post-hoc Markdown | Implemented | append-only JSONL store, query, integrity, report draft |
| Git variants | CI diff gate | Implemented | temporary repo, branches/worktrees, three variants |
| Migration CLI | Agent-guided Skill | Implemented | eight CLI commands tested on two targets |
| Next.js preset | Repository convention | Implemented | detection and command manifest |
| Unity preset | None | Static adapter implemented | command generation and GUID/meta fixtures |
| Cocos preset | None | Static adapter implemented | command generation and UUID/reference fixtures |
| Unity/Cocos real builds | No editors in scope | Pending | explicitly `environment_unavailable` |
| GitHub remote CI | Workflow exists | Reference | local syntax/contract validation; remote run unverified |
| Codex hooks | Five hooks | Implemented, Codex-specific | hook tests and capability declaration |
| Symbol/RAG/MCP providers | None | Unsupported extension points | no implementation claim |

## Codex hook observability

| Hook | Observable input/output | Stable runtime IDs | Limitation |
|---|---|---|---|
| SessionStart | session event and textual guidance | No | cannot guarantee provider-specific session ID |
| UserPromptSubmit | prompt classification | No | classification only; prompt content is untrusted |
| PreToolUse | command/tool name and allow/block response | No | provider payload varies |
| PostToolUse | command result summary | No | not a complete tool transcript |
| Stop | final-response gate and optional feature check | No | cannot expose private reasoning |

Core runtime events therefore use Harness-generated identifiers. Codex hook observations can be imported as adapter events, but are not represented as a complete model trace.

