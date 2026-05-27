# 通用 Coding Agent 规则模板

本文件提供跨工具规则模板。团队应保持同一份语义规则，再分别映射到 Claude Code、Codex / Qwen Code、Cursor、Windsurf、Trae 等工具。

## 1. 通用团队规则

适用于所有 Coding Agent。

```md
# Team AI Frontend Development Rules

## Goal

You help the team deliver frontend requirements with repository-native evidence.

## Required flow

1. Restate the requirement goal, scope, non-goals, and acceptance criteria.
2. Identify files and similar implementations before editing.
3. Check component, Hook, API, and style reuse candidates.
4. Produce a Tech Plan and Done Contract for Medium or larger tasks.
5. Make the smallest safe change.
6. Run relevant verification.
7. Record evidence, skipped checks, and risks.
8. Trigger RCA when verification fails, review finds systemic issues, or the AI output is heavily changed by humans.

## Frontend quality rules

- Do not create a new component before checking reuse candidates.
- Read adjacent or same-domain implementations before changing style or structure.
- Follow existing naming, state management, API, i18n, and styling patterns.
- UI changes must cover interaction, empty, loading, error, desktop, and mobile states when applicable.
- Do not mark failed or skipped verification as passed.
- Do not modify core or out-of-scope files without explicit confirmation.
```

## 2. Claude Code 映射

### `CLAUDE.md`

```md
# Project Instructions

Read this before handling frontend tasks.

## Workflow

- Small tasks: restate goal, declare file scope, implement, verify, record.
- Medium+ tasks: create Tech Plan / Done Contract before editing.
- Risky tasks: ask for approval before modifying core files.

## Required project assets

- Requirements: `specs/{feature}/spec.md`
- Tasks: `specs/{feature}/tasks.md`
- Verification: `specs/{feature}/verification-record.md`
- Run record: `specs/{feature}/run-record.md`
- RCA: `specs/{feature}/rca.md`

## Stop gate

Before final response, confirm:

1. Diff matches declared scope.
2. Verification is run or explicitly skipped with reason.
3. Run Record contains evidence.
4. Failed or partial work has RCA.
```

### Suggested hooks

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/check-edit-scope.mjs"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npm run harness:check -- specs/${FEATURE_NAME}"
          }
        ]
      }
    ]
  }
}
```

## 3. Codex / Qwen Code 映射

### `AGENTS.md`

```md
# Agent Instructions

Use this repository as the source of truth for frontend AI delivery.

## Read order

1. `.ai/workflows/rule-loading-policy.md`
2. `.ai/context/skill-routing-minimal.md`
3. `.ai/context/project-map.md`
4. `skills/frontend-dev/SKILL.md`
5. `skills/component-reuse/SKILL.md` when creating or selecting components
6. Current feature `spec.md`
7. Directly affected files and similar implementations

## Execution rules

- Plan before editing.
- Keep changes scoped.
- Prefer existing components, hooks, API clients, style tokens, and state patterns.
- Run verification and record evidence.
- Do not rewrite unrelated files.
```

## 4. Cursor Rules 映射

```md
---
description: AI frontend delivery workflow
globs:
  - "src/**/*"
  - "app/**/*"
alwaysApply: true
---

For frontend tasks:

1. Restate goal and scope before editing.
2. Search for similar components, hooks, API calls, and styles.
3. Prefer existing design system and local patterns.
4. For Medium+ tasks, create Tech Plan and Done Contract.
5. Verify with lint/typecheck/build and UI interaction checks where relevant.
6. Record evidence in the feature Run Record.
```

## 5. Windsurf / Cascade 映射

```md
# Frontend AI Workflow Rule

When Cascade handles frontend changes:

- Use repository specs as the source of truth.
- Load only relevant rules and context for the current task.
- Check component reuse before creating new files.
- Keep a visible plan for Medium+ tasks.
- Validate behavior, not just compilation.
- Preserve evidence and update Run Record.
```

## 6. Trae / 通义灵码映射

```md
# Workspace AI Development Rule

The AI assistant must follow repository-native delivery:

1. Requirement -> Spec -> Plan -> Execute -> Verify -> Record.
2. Frontend code must match existing component, style, API, i18n, and state patterns.
3. Risky or core module changes require human approval.
4. Failed verification requires RCA.
```
