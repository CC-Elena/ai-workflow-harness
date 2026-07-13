# RCA: PreToolUse dangerous-command false positive

## Symptom

An additive `apply_patch` containing ordinary prose was denied as a destructive deletion command even though the patch had no deletion operation.

## Root cause

`scripts/codex-hooks/pre-tool-policy.mjs` used `lowerCommand.includes(pattern)` for every dangerous pattern. The two-letter deletion command pattern therefore matched the same adjacent letters inside unrelated English words. This was a mechanism defect in tokenization, not a one-off spelling issue.

## Impact

Safe Harness maintenance patches could be blocked unpredictably. The deny was safe but created availability and workflow reliability failures.

## Fix and prevention

The deletion command now requires an independent shell command token boundary; longer dangerous patterns retain exact substring matching. Regression tests prove both sides: a true destructive token is denied and ordinary words containing the letters are allowed. The rule was harvested to `skills/auto-rules/RULES.md`.

## Verification

- `npm run harness:beta:test`: pass; includes the two-sided hook regression.
- Existing dependency-change denial remains covered by `npm run harness:test`.

