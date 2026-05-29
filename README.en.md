<div align="center">

# AI Workflow Harness

**A repository-native AI development workflow framework — keep your Coding Agent on-spec, on-process, and producing verifiable, reviewable, retrospectable deliveries.**

[![CI](https://github.com/CC-Elena/ai-workflow-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/CC-Elena/ai-workflow-harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-active-success)](#status)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](./CONTRIBUTING.md)

English | [简体中文](./README.md)

[10-Minute Validation](#quick-10) · [What It Does](#what-it-does) · [What You Get](#what-you-get) · [Fit](#fit) · [Decision Guide](#decision) · [Examples](#examples)

</div>

---

## One-Line Positioning

Think of AI Workflow Harness as a repo-native operating layer that upgrades AI Coding from "code generation" to "engineering-grade delivery."

It optimizes for three outcomes:

1. **Verifiable** delivery with explicit command/evidence traces.
2. **Reviewable** changes with scope and risk visibility.
3. **Retrospectable** execution with RCA and rule feedback loops.

## The Problem It Solves

Mainstream Coding Agents (Codex, Claude Code, Cursor, Trae, …) can write code, but real engineering workflows still suffer from:

- low traceability from request to merged code;
- missing or weak verification evidence;
- out-of-scope changes discovered too late;
- no durable learning loop from failures.

In short: teams usually do not lack model capability, they lack a durable **workflow + evidence system**.

<a id="what-it-does"></a>

## What It Actually Does

AI Workflow Harness puts demand-to-delivery assets directly in the repository and links them with enforceable checks:

- Requirement protocol: PRD -> Spec -> Tasks
- Execution protocol: Planner / Executor + Context Pack + Skills
- Verification protocol: lint / typecheck / build / test / page checks
- Evidence protocol: Run Record + Evaluation Summary + Diff coverage
- Quality gate: `harness:check` blocks missing evidence, failure-as-success, and undeclared out-of-scope edits

This is not a prompt bundle. It is a versioned, reviewable, evolvable engineering asset system.

<a id="what-you-get"></a>

## What You Get

After adoption, you get three practical asset layers:

1. **Flow assets**: Spec, Tasks, Run Record, Verification templates.
2. **Rule assets**: Skills, context routing, workflow protocols.
3. **Gate assets**: delivery check scripts and auditable evidence trails.

<a id="quick-10"></a>

## 10-Minute Validation

Goal: decide fit quickly without reading every deep document.

### Step 1: Initialize

```bash
npx ai-workflow-harness@latest init
```

Expected output: `.ai/`, `skills/`, `specs/`, and `scripts/check-harness-run.mjs` are created.

### Step 2: Create a minimal feature unit

```bash
mkdir -p specs/hello
touch specs/hello/spec.md
touch specs/hello/tasks.md
touch specs/hello/run-record.md
```

Expected output: one minimal unit the gate can evaluate.

### Step 3: Run validation and gate

```bash
npm run lint
npm run typecheck
npx ai-workflow-harness check specs/hello
```

Expected output: clear pass/fail reasons and explicit next fixes.

<a id="fit"></a>

## Fit and Non-Fit

Good fit if your team needs:

- auditable AI-assisted delivery,
- engineering governance and quality gates,
- lower collaboration uncertainty at scale.

Likely non-fit if you only need:

- one-off code generation,
- zero process assets,
- solo experimentation without review/audit constraints.

Non-goals: this project is not an Agent Runtime, CI/CD platform, or replacement for Codex / Cursor / Claude Code.

<a id="decision"></a>

## Why Choose This Over Others

If your goal is only speed of generation, many tools work.

If your goal is repository-level evidence closure with rejectable delivery gates, this project is purpose-built.

Decision heuristic:

- widest ecosystem + standard CLI: [Spec Kit](https://github.com/github/spec-kit)
- multi-role agile orchestration: [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- lightweight Claude template: [Context Engineering](https://github.com/coleam00/context-engineering-intro)
- approval flow + dashboard: [Spec Workflow MCP](https://github.com/Pimzino/spec-workflow-mcp)
- evidence-driven repo governance: **AI Workflow Harness**

<a id="whats-inside"></a>

## Deep Dive Assets

| Asset | Why it matters | Entry |
| --- | --- | --- |
| Workflow protocols | Defines planner/executor/verification behavior | [.ai/workflows/](.ai/workflows/) |
| Prompt set | Standardized task prompting | [.ai/prompts/](.ai/prompts/) |
| Templates | Reusable spec/record/checklist structures | [.ai/templates/](.ai/templates/) |
| Context routing | Controls what the agent should read | [.ai/context/](.ai/context/) |
| Skills library | Reusable engineering capabilities | [skills/](skills/) |
| Runtime guardrails | Codex lifecycle hooks | [.codex/](.codex/) |
| Delivery gate | Rejects incomplete/unsafe deliveries | [scripts/check-harness-run.mjs](scripts/check-harness-run.mjs) |
| Visual workbench | Browse workflow and assets | [src/app/](src/app/) |

## Quick Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run harness:test
npm run harness:check -- --changed --base <baseRef> --head <headRef>
```

<a id="adoption"></a>

## Adopt in Your Project

### Option A: one-line CLI (recommended)

From the root of your project:

```bash
npx ai-workflow-harness@latest init
```

The CLI will:

1. Copy generic workflow assets: `.ai/{workflows,templates,prompts,policies}` + `AGENTS.md` + `scripts/check-harness-run.mjs`;
2. Copy the core Skill set (`project`, `auto-rules`, `code-review`, `workflow-assets`, `feature-dev`, `harness-migration`, `skill-creator`);
3. Drop a skeleton `skills/project/SKILL.md` for you to fill in;
4. Create empty `specs/`, `.ai/evals/runs`, `.ai/evals/rca` directories.

Common flags:

```bash
npx ai-workflow-harness init ./my-app --with-skills=frontend-dev,test
npx ai-workflow-harness init --all-skills --force      # copy every Skill, overwrite existing
npx ai-workflow-harness init --dry-run                 # print, don't write
npx ai-workflow-harness check specs/my-feature         # run the harness:check gate
```

After install, fill in the `[AI to generate]` placeholders in `skills/project/SKILL.md` (stack, commands, protected paths), or ask your AI to read `skills/harness-migration/SKILL.md` and execute Phase 3 for you.

### Option B: ask AI to run the install Skill (one-shot install + migrate + validate)

The install Skill orchestrates the full lifecycle and internally delegates the migration phase to `skills/harness-migration/SKILL.md`.

```text
Please follow skills/package-install/SKILL.md to install, migrate, and validate ai-workflow-harness. Return fix commands on failure.
```

Step-by-step: [docs/migration-guide.md](docs/migration-guide.md) and [docs/adoption-checklist.md](docs/adoption-checklist.md).

<a id="examples"></a>

## Example Learning Path

Recommended order:

1. Success path first:
   - [specs/file-content-tree-view/](specs/file-content-tree-view/)
2. Failure recovery next:
   - [specs/failure-rca-sample/](specs/failure-rca-sample/)
3. Team-level evaluation last:
   - [specs/evaluation-framework/](specs/evaluation-framework/)

More examples:

- [specs/ai-run-record-entry/](specs/ai-run-record-entry/)
- [specs/run-record-verification-summary/](specs/run-record-verification-summary/)
- [specs/file-list-page/](specs/file-list-page/)

## Repository Structure (Quick View)

```text
.
├── AGENTS.md
├── .ai/
├── .codex/
├── skills/
├── specs/
├── scripts/
└── src/
```

## Community

If you want to contribute or discuss adoption:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Issue Templates](.github/ISSUE_TEMPLATE)
- [PR Template](.github/pull_request_template.md)

<a id="status"></a>

## Status & Roadmap

The repo already provides a runnable end-to-end SDD + AI Coding Harness. Next:

- [ ] More automated structure checks
- [ ] Finer-grained evaluation rubrics
- [ ] More real-world samples and RCA retrospectives
- [ ] Richer asset browsing / search / preview

- [ ] Runtime adapters for more Coding Agents (Claude Code, Cursor, Trae)

## Further Reading

- [AGENTS.md](AGENTS.md)
- [.ai/workflows/verification.md](.ai/workflows/verification.md)
- [.ai/workflows/planner-executor.md](.ai/workflows/planner-executor.md)
- [skills/workflow-assets/SKILL.md](skills/workflow-assets/SKILL.md)
- [docs/quick-start.md](docs/quick-start.md)

## License

[MIT](./LICENSE) © 2026 CC-Elena

## Acknowledgements

Thanks to Codex, Claude Code, Cursor, Trae, Next.js, and the Spec-driven Development community practices behind this work.
