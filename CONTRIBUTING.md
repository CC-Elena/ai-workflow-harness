# Contributing

Thanks for your interest in improving AI Workflow Harness.

## Before You Start

- Read AGENTS.md for routing and workflow defaults.
- For feature work, create or update spec files under specs/{feature}/ first.
- Keep changes minimal and scoped.

## Local Setup

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Development Workflow

1. Open or create a feature folder under specs/{feature}/.
2. Update spec.md (or mini-spec.md) and tasks.md when needed.
3. Implement changes.
4. Add verification evidence.
5. Update run-record.md with the real diff coverage.

## Required Checks

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run build
npm run harness:test
npm run harness:check -- --changed --base <baseRef> --head <headRef>
```

If your branch does not have a PR base/head context yet, run:

```bash
npm run harness:check -- specs/<feature>
```

## Pull Request Rules

- Keep PRs focused on one goal.
- Explain why the change is needed.
- Link related spec path(s).
- Include verification summary and key command outputs.
- Mention risks and rollback if applicable.

## Reporting Issues

Use GitHub Issue templates:

- Bug report: reproducible bug with expected vs actual behavior.
- Feature request: problem statement, proposal, and alternatives.

## Code of Conduct

By participating, you agree to follow CODE_OF_CONDUCT.md.
