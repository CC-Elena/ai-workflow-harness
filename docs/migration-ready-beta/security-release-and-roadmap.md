# Security, Release Notes, Limitations, and Roadmap

## Security and privacy

- API keys, access/refresh tokens, passwords, cookies, authorization values, bearer credentials, private network URLs, and artifact content are redacted before persistence.
- Full environment variables are never recorded; only an explicit safe subset may be represented, with paths hidden.
- Direct-file access is confined to the project root.
- Untrusted repository text cannot elevate authority. Prompt-injection phrases are quarantined as data with authority zero.
- Dangerous commands, dependency changes, protected paths, timeouts, cancellation, retries, idempotency, duplicate execution, and output size are enforced by Tool Policy.
- Hidden/gold validators stay outside executor scope; changes to tests require independent review.

## Release notes: Migration-ready Beta

Added a v1 contract registry and validator; JSONL trace/artifact/evidence store; Spec and Context engines; Validation and Evaluation harnesses; agent/process adapters and physical verifier handoff; Git/worktree variants; migration CLI; Next.js/Unity/Cocos presets; Puzzle A/B and Python fixtures; security controls; local CI reference integration; and a full Node test suite.

Existing Next.js product UI, Markdown Specs, Skills, Codex hooks, and `harness:check` remain compatible. The PreToolUse deletion-token matcher was corrected from substring matching to an independent command token, eliminating false positives such as ordinary words while retaining the block.

## Known limitations

1. No real model-based Agent evaluation, token count, or cost data was collected. Those metrics are `pending` or `null`.
2. Codex capability is an adapter declaration; the deterministic benchmark uses local child processes, not a hosted Codex run.
3. JSONL is local and append-only by API/convention, not tamper-proof distributed storage.
4. Contract validation implements the registry's required subset, not every JSON Schema keyword.
5. Symbol, Codebase RAG, and MCP knowledge providers are unsupported. Current native providers showed no evaluated need for RAG.
6. Unity and Cocos Editors are unavailable; real EditMode/PlayMode/Build results are `environment_unavailable`.
7. GitHub Actions was updated as a reference and checked locally, but remote execution is unverified.
8. UI/screenshot validators, deployment adapters, and project-specific domain validators remain extension points.

## Production Validation Roadmap

Migration-ready Beta becomes Production-proven only after:

1. repeated real coding-agent runs across representative private repositories and team workflows;
2. observed pass@1/eventual-pass, false-completion, scope, context, intervention, latency, tool-call, token, and cost distributions;
3. hosted CI runs on supported operating systems with artifact retention and cancellation evidence;
4. Unity/Cocos Editor builds on licensed runners for representative targets;
5. schema upgrade/rollback drills and longer-term backward compatibility tests;
6. security review of command policy, redaction bypasses, artifact access, and prompt-injection cases;
7. maintainer review of Core/Project/Domain ownership and failure taxonomy;
8. pilot RCA feedback folded into stable policy and deprecation criteria.

## Maintainer review focus

- `harness/core/contracts.mjs` and `harness/contracts/registry.v1.json`: compatibility and required fields.
- `harness/core/tool-policy.mjs`: command authorization and retry semantics.
- `harness/core/trace.mjs`: redaction timing, event IDs, and artifact integrity.
- `harness/core/runtime.mjs`: process isolation and handoff trust.
- `harness/core/validation.mjs` and `evaluation.mjs`: anti-cheating and deterministic grading.
- `harness/core/migration.mjs` and `harness/cli.mjs`: ownership and safe re-run behavior.
- `benchmarks/targets/`: whether fixtures represent realistic migration friction.

