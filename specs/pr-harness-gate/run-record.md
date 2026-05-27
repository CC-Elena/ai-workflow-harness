# Run Record: PR 级 Harness Gate

## 1. 基本信息

- 需求名称：PR 级 Harness Gate
- Spec 文件：`specs/pr-harness-gate/spec.md`
- Task 文件：`specs/pr-harness-gate/tasks.md`
- 执行日期：2026-05-18
- 执行工具：Codex
- 执行人：Codex
- 状态：Success

## 2. 输入

1. 用户需求或 PRD：将 CI 中固定检查 `specs/failure-rca-sample` 的 Harness Gate 升级为按当前 PR 真实 diff 检查对应 Run Record 的门禁。
2. 使用的 Spec：`specs/pr-harness-gate/spec.md`
3. 使用的上下文索引：`.github/workflows/ci.yml`、`scripts/check-harness-run.mjs`、`.ai/workflows/verification.md`
4. 使用的 Skills：project

## 3. Context Pack

- 任务复杂度：Medium
- 规则预算：Standard
- 主 Skill：project
- 辅助 Skill：N/A
- 跳过的协议：无
- 升级加载原因：涉及 CI、门禁脚本、测试、文档和本次交付记录

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | `scripts/check-harness-run.mjs` | PR 级门禁实现目标 | Execute | Yes |
| P0 | `.github/workflows/ci.yml` | CI 接线目标 | Execute | Yes |
| P1 | `.ai/workflows/verification.md` | 验证协议更新 | Record | Yes |
| P1 | `docs/quick-start.md` | 接入文档更新 | Record | Yes |
| P2 | `README.md` | 总览说明更新 | Record | Yes |

## 4. 执行摘要

本次将 Harness Gate 从固定样例检查扩展为真实 PR diff 门禁：脚本新增 `--changed --base --head` 模式，CI 在 PR 事件中使用 base/head SHA 运行 changed-file gate，push 事件保留失败样本回归。新增 Node 内置 test runner 的脚本级测试，覆盖无 Run Record、成功覆盖、多 feature 结构校验和旧命令兼容，并同步更新 README、Quick Start 和验证协议。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | `scripts/check-harness-run.mjs` | Pass | 新增参数解析和 changed-file 模式 |
| T2 | Done | `scripts/check-harness-run.mjs` | Pass | PR 模式聚合候选 Run Record 覆盖表 |
| T3 | Done | `.github/workflows/ci.yml` | Pass | PR 使用真实 diff，push 保留样例回归 |
| T4 | Done | `scripts/check-harness-run.test.mjs`、`package.json` | Pass | 新增 `npm run harness:test` |
| T5 | Done | `README.md`、`docs/quick-start.md`、`.ai/workflows/verification.md` | Pass | 文档说明 PR 模式 |
| T6 | Done | `specs/pr-harness-gate/*` | Pass | 本次记录和证据齐全 |

## 6. 修改文件

| 文件 | 变更说明 |
|------|----------|
| `.ai/workflows/verification.md` | 说明 CI PR changed-file gate |
| `.github/workflows/ci.yml` | PR 事件使用真实 diff 门禁，push 保留样例回归 |
| `README.md` | 总览说明新增 PR 模式 |
| `docs/quick-start.md` | CI 配置说明改为 PR diff gate |
| `package.json` | 新增 `harness:test` 脚本 |
| `scripts/check-harness-run.mjs` | 新增 changed-file 模式和覆盖聚合 |
| `scripts/check-harness-run.test.mjs` | 新增脚本级测试 |
| `specs/pr-harness-gate/*` | 新增本次 Spec、Tasks、Run Record、Evaluation、Verification 和证据 |

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Harness Script Tests | `npm run harness:test` | Pass | `specs/pr-harness-gate/evidence/harness-test.log` | N/A |
| Legacy Sample Gate | `npm run harness:check -- specs/failure-rca-sample` | Pass | `specs/pr-harness-gate/evidence/legacy-sample.log` | N/A |
| Lint | `npm run lint` | Pass | `specs/pr-harness-gate/evidence/lint.log` | N/A |
| Typecheck | `npm run typecheck` | Pass | `specs/pr-harness-gate/evidence/typecheck.log` | N/A |
| Build | `npm run build` | Pass | `specs/pr-harness-gate/evidence/build.log` | N/A |
| Harness Check | `npm run harness:check -- specs/pr-harness-gate` | Pass | `specs/pr-harness-gate/evidence/harness-check.log` | N/A |
| Changed Mode Smoke | `npm run harness:check -- --changed --base HEAD --head HEAD` | Pass | `specs/pr-harness-gate/evidence/changed-mode.log` | N/A |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 决策 | PR 模式通过 changed `specs/<feature>` 自动发现候选 Run Record | 保持命令轻量，避免新增必填参数 |
| 决策 | push 到 main 保留固定失败样本回归 | main push 不是 PR 审查入口，样例回归可作为兜底 |

## 9. 效果评估

- Evaluation Summary：`specs/pr-harness-gate/evaluation-summary.md`
- Gate Check：Pass
- 总分：97 / 100
- 投产等级：Low-risk Production
- 阻断项：无
- 代码采纳率：100%
- 人工修改率：0
- Review 问题数：0
- 是否需要 RCA：否
- 下次优化建议：观察真实 PR 使用后，再评估是否增加显式 `--feature` 参数以支持更复杂的映射场景。

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
| `.ai/workflows/verification.md` | 范围内 | 验证协议需说明 PR 模式 |
| `.github/workflows/ci.yml` | 范围内 | CI 接线目标 |
| `README.md` | 范围内 | 总览说明需同步 |
| `docs/quick-start.md` | 范围内 | 接入文档需说明 PR gate |
| `package.json` | 范围内 | 新增脚本级测试命令 |
| `scripts/check-harness-run.mjs` | 范围内 | 门禁脚本实现 |
| `scripts/check-harness-run.test.mjs` | 范围内 | 门禁脚本测试 |
| `specs/failure-rca-sample/spec.md` | 范围内 | 旧样例兼容检查需要完整 Spec |
| `specs/failure-rca-sample/run-record.md` | 范围内 | 旧样例引用补齐后的 Spec |
| `specs/pr-harness-gate/spec.md` | 范围内 | 本次需求 Spec |
| `specs/pr-harness-gate/tasks.md` | 范围内 | 本次任务拆解 |
| `specs/pr-harness-gate/evaluation-summary.md` | 范围内 | 本次效果评估 |
| `specs/pr-harness-gate/verification-record.md` | 范围内 | 本次验证记录 |
| `specs/pr-harness-gate/run-record.md` | 范围内 | 本次执行记录 |
| `specs/pr-harness-gate/evidence/harness-test.log` | 范围内 | 脚本级测试证据 |
| `specs/pr-harness-gate/evidence/legacy-sample.log` | 范围内 | 旧样例兼容证据 |
| `specs/pr-harness-gate/evidence/lint.log` | 范围内 | lint 证据 |
| `specs/pr-harness-gate/evidence/typecheck.log` | 范围内 | typecheck 证据 |
| `specs/pr-harness-gate/evidence/build.log` | 范围内 | build 证据 |
| `specs/pr-harness-gate/evidence/harness-check.log` | 范围内 | 本需求 harness check 证据 |
| `specs/pr-harness-gate/evidence/changed-mode.log` | 范围内 | PR 模式空 diff smoke 证据 |

## 11. 证据文件表

| 证据文件 | 对应验证 | 说明 |
|----------|----------|------|
| `specs/pr-harness-gate/evidence/harness-test.log` | Harness Script Tests | `npm run harness:test` 输出 |
| `specs/pr-harness-gate/evidence/legacy-sample.log` | Legacy Sample Gate | `npm run harness:check -- specs/failure-rca-sample` 输出 |
| `specs/pr-harness-gate/evidence/lint.log` | Lint | `npm run lint` 输出 |
| `specs/pr-harness-gate/evidence/typecheck.log` | Typecheck | `npm run typecheck` 输出 |
| `specs/pr-harness-gate/evidence/build.log` | Build | `npm run build` 输出 |
| `specs/pr-harness-gate/evidence/harness-check.log` | Harness Check | `npm run harness:check -- specs/pr-harness-gate` 输出 |
| `specs/pr-harness-gate/evidence/changed-mode.log` | Changed Mode Smoke | `npm run harness:check -- --changed --base HEAD --head HEAD` 输出 |
