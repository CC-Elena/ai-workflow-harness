import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { collectAiMetrics } from './collect-ai-metrics.mjs';

function makeRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'ai-metrics-'));
  mkdirSync(path.join(root, 'specs'), { recursive: true });
  return root;
}

function writeRun(root, name, body) {
  const dir = path.join(root, 'specs', name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'run-record.md'), body);
}

function baseRun(extra = '') {
  return `# Run Record: demo

## 1. 基本信息

- 需求名称：demo
- 执行日期：2026-05-29
- 执行工具：Codex
- 状态：Success

## 3. Context Pack

- 任务复杂度：Medium

## 4. 执行摘要

完成一次 AI 交付。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | src/app/page.tsx | Pass | ok |

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Lint | npm run lint | Pass | specs/demo/evidence/lint.log | |
| Build | npm run build | Pass | specs/demo/evidence/build.log | |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 决策 | 无 | 无 |

## 9. 效果评估

- CI first pass：yes
- 人工修改率：10%
- Production issue linked：no
${extra}

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
| src/app/page.tsx | 范围内 | |
`;
}

test('collects ready rates from period data and run records', () => {
  const root = makeRepo();
  writeRun(root, 'demo', baseRun());
  writeFileSync(
    path.join(root, 'period.md'),
    `# period

- 试点周期：2026-05

| 字段 | 数值 | 说明 |
|------|------|------|
| 目标研发人数 | 10 | |
| 已分配席位 | 8 | |
| 活跃 AI 用户 | 4 | |
| 总 PR | 20 | |
| AI-assisted PR | 5 | |
| 总变更行 | 1000 | |
| AI 参与变更行 | 300 | |
| AI 30 天保留行 | 210 | |
`
  );

  const snapshot = collectAiMetrics({ repoRoot: root, periodPath: 'period.md' });

  assert.equal(snapshot.runs.length, 1);
  assert.equal(snapshot.summary.seatActivationRate.display, '50%');
  assert.equal(snapshot.summary.workflowAdoptionRate.display, '25%');
  assert.equal(snapshot.summary.aiAssistedDiffShare.display, '30%');
  assert.equal(snapshot.summary.aiCodeRetention30d.display, '70%');
  assert.equal(snapshot.summary.evidenceCompletenessRate.display, '100%');
});

test('marks period based rates as N/A when denominator data is missing', () => {
  const root = makeRepo();
  writeRun(root, 'demo', baseRun());

  const snapshot = collectAiMetrics({ repoRoot: root });

  assert.equal(snapshot.summary.seatActivationRate.status, 'N/A');
  assert.equal(snapshot.summary.aiAssistedDiffShare.value, null);
  assert.match(snapshot.summary.workflowAdoptionRate.reason, /缺少/);
});

test('detects skipped rows without reason, out of scope files, manual rework, and defects', () => {
  const root = makeRepo();
  writeRun(
    root,
    'risky',
    `# Run Record: risky

## 1. 基本信息

- 需求名称：risky
- 执行工具：Codex
- 状态：Partial

## 3. Context Pack

- 任务复杂度：Risky

## 4. 执行摘要

存在风险。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Partial | src/lib/a.ts | Partial | |

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Test | | Skipped | | |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 修改 | 大幅改写 AI 输出 | 质量不足 |

## 9. 效果评估

- CI first pass：no
- 人工修改率：60%
- Production issue linked：yes

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
| src/lib/a.ts | 范围外 | 已确认 |
`
  );

  const snapshot = collectAiMetrics({ repoRoot: root });

  assert.equal(snapshot.summary.scopeDriftRate.display, '100%');
  assert.equal(snapshot.summary.largeManualReworkRate.display, '100%');
  assert.equal(snapshot.summary.postMergeDefectRate.display, '100%');
  assert.ok(snapshot.warnings.some((warning) => warning.includes('Skipped 缺少原因')));
});
