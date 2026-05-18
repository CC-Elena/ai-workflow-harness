import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const sourceScript = path.resolve('scripts/check-harness-run.mjs');

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function writeFile(cwd, filePath, content) {
  const absolutePath = path.join(cwd, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function createRepo() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-check-'));
  fs.mkdirSync(path.join(cwd, 'scripts'), { recursive: true });
  fs.copyFileSync(sourceScript, path.join(cwd, 'scripts/check-harness-run.mjs'));

  run('git', ['init'], cwd);
  run('git', ['config', 'user.email', 'test@example.com'], cwd);
  run('git', ['config', 'user.name', 'Harness Test'], cwd);
  writeFile(cwd, 'README.md', '# fixture\n');
  run('git', ['add', '.'], cwd);
  run('git', ['commit', '-m', 'initial'], cwd);

  return cwd;
}

function commitAll(cwd, message) {
  run('git', ['add', '.'], cwd);
  run('git', ['commit', '-m', message], cwd);
}

function baseSpec(featureName) {
  return `# Spec: ${featureName}

## 1. 基本信息

- 需求名称：${featureName}

## 2. 背景与目标

验证 harness gate。

## 3. 范围

包含脚本测试 fixture。

## 11. 验收标准

1. 门禁可判断 PR diff。

## 12. 风险与待确认问题

无。
`;
}

function baseTasks() {
  return `# Tasks

## 1. 任务列表

| ID | 任务 | 状态 |
|----|------|------|
| T1 | 更新文件 | Done |
`;
}

function baseEvaluation(featureName) {
  return `# Evaluation: ${featureName}

## 1. 基本信息

- 需求名称：${featureName}

## 2. 阻断项检查

| 检查项 | 是否阻断 | 说明 |
|--------|----------|------|
| Diff 覆盖 | No | 已覆盖 |

## 3. 总分

90 / 100

## 4. 结论

通过。
`;
}

function baseVerification(featureName) {
  return `# Verification: ${featureName}

## 1. 基本信息

- 需求名称：${featureName}

## 2. 验证记录

| 验证项 | 命令 | 结果 | 证据 |
|--------|------|------|------|
| Fixture | node | Pass | specs/${featureName}/evidence/check.log |
`;
}

function runRecord(featureName, files) {
  const rows = files.map((filePath) => `| \`${filePath}\` | 范围内 | fixture |`).join('\n');

  return `# Run Record: ${featureName}

## 1. 基本信息

- 需求名称：${featureName}
- Spec 文件：\`specs/${featureName}/spec.md\`
- Task 文件：\`specs/${featureName}/tasks.md\`
- 执行日期：2026-05-18
- 执行工具：Codex
- 执行人：Codex
- 状态：Success

## 2. 输入

1. 用户需求或 PRD：fixture
2. 使用的 Spec：\`specs/${featureName}/spec.md\`
3. 使用的上下文索引：N/A
4. 使用的 Skills：N/A

## 3. Context Pack

- 任务复杂度：Medium
- 规则预算：Standard
- 主 Skill：N/A
- 辅助 Skill：N/A
- 跳过的协议：无
- 升级加载原因：测试 PR diff

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | \`scripts/check-harness-run.mjs\` | fixture | Verify | Yes |

## 4. 执行摘要

完成 fixture 变更。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | fixture | Pass | 无 |

## 6. 修改文件

| 文件 | 变更说明 |
|------|----------|
${rows}

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Fixture | \`node --version\` | Pass | \`specs/${featureName}/evidence/check.log\` | N/A |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 决策 | N/A | N/A |

## 9. 效果评估

- Evaluation Summary：\`specs/${featureName}/evaluation-summary.md\`
- Gate Check：Pass
- 总分：90 / 100
- 投产等级：Internal Trial
- 阻断项：无
- 代码采纳率：N/A
- 人工修改率：0
- Review 问题数：0
- 是否需要 RCA：否
- 下次优化建议：无

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
${rows}

## 11. 证据文件表

| 证据文件 | 对应验证 | 说明 |
|----------|----------|------|
| \`specs/${featureName}/evidence/check.log\` | Fixture | 命令输出 |
`;
}

function addFeature(cwd, featureName, coveredFiles) {
  writeFile(cwd, `specs/${featureName}/spec.md`, baseSpec(featureName));
  writeFile(cwd, `specs/${featureName}/tasks.md`, baseTasks());
  writeFile(cwd, `specs/${featureName}/evaluation-summary.md`, baseEvaluation(featureName));
  writeFile(cwd, `specs/${featureName}/verification-record.md`, baseVerification(featureName));
  writeFile(cwd, `specs/${featureName}/evidence/check.log`, 'fixture\n');
  writeFile(cwd, `specs/${featureName}/run-record.md`, runRecord(featureName, coveredFiles));
}

function harnessChanged(cwd, base, head) {
  return spawnSync(
    process.execPath,
    ['scripts/check-harness-run.mjs', '--changed', '--base', base, '--head', head],
    {
      cwd,
      encoding: 'utf8'
    }
  );
}

test('changed mode fails when PR files have no Run Record candidate', () => {
  const cwd = createRepo();
  const base = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  writeFile(cwd, 'src/app.js', 'console.log("missing record");\n');
  commitAll(cwd, 'change without run record');
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();

  const result = harnessChanged(cwd, base, head);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires at least one specs\/\{feature\}\/run-record\.md change/);
});

test('changed mode passes when a Run Record covers real PR files', () => {
  const cwd = createRepo();
  const base = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  const changedFiles = [
    'src/app.js',
    'specs/pr-gate/spec.md',
    'specs/pr-gate/tasks.md',
    'specs/pr-gate/evaluation-summary.md',
    'specs/pr-gate/verification-record.md',
    'specs/pr-gate/evidence/check.log',
    'specs/pr-gate/run-record.md'
  ];

  writeFile(cwd, 'src/app.js', 'console.log("covered");\n');
  addFeature(cwd, 'pr-gate', changedFiles);
  commitAll(cwd, 'covered change');
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();

  const result = harnessChanged(cwd, base, head);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Harness changed-file check passed/);
});

test('changed mode checks every changed feature Run Record', () => {
  const cwd = createRepo();
  const base = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  const alphaFiles = [
    'specs/alpha/spec.md',
    'specs/alpha/tasks.md',
    'specs/alpha/evaluation-summary.md',
    'specs/alpha/verification-record.md',
    'specs/alpha/evidence/check.log',
    'specs/alpha/run-record.md'
  ];
  const betaFiles = [
    'specs/beta/spec.md',
    'specs/beta/tasks.md',
    'specs/beta/evaluation-summary.md',
    'specs/beta/verification-record.md',
    'specs/beta/evidence/check.log',
    'specs/beta/run-record.md'
  ];

  addFeature(cwd, 'alpha', [...alphaFiles, ...betaFiles]);
  addFeature(cwd, 'beta', betaFiles);
  writeFile(cwd, 'specs/beta/tasks.md', baseTasks().replace('Done', 'Pending'));
  commitAll(cwd, 'two changed features');
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();

  const result = harnessChanged(cwd, base, head);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /tasks\.md still contains Pending rows/);
});

test('single feature mode remains backward compatible', () => {
  const cwd = createRepo();
  const featureFiles = [
    'specs/failure-rca-sample/spec.md',
    'specs/failure-rca-sample/tasks.md',
    'specs/failure-rca-sample/evaluation-summary.md',
    'specs/failure-rca-sample/verification-record.md',
    'specs/failure-rca-sample/evidence/check.log',
    'specs/failure-rca-sample/run-record.md'
  ];
  addFeature(cwd, 'failure-rca-sample', featureFiles);

  const result = spawnSync(process.execPath, ['scripts/check-harness-run.mjs', 'specs/failure-rca-sample'], {
    cwd,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Harness check passed for specs\/failure-rca-sample/);
});
