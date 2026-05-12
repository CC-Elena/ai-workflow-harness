# Run Record: 失败路径与 RCA 样本

## 1. 基本信息

- 需求名称：失败路径与 RCA 样本
- Spec 文件：N/A（失败/RCA 样本维护，已按轻量流程移除非必要 Spec）
- Task 文件：`specs/failure-rca-sample/tasks.md`
- 执行日期：2026-05-09
- 执行工具：Codex
- 执行人：Codex
- 状态：Failed

## 2. 输入

1. 用户需求或 PRD：补齐失败路径和 RCA 样本。
2. 使用的 Spec：N/A（用户未显式 `/spec`）
3. 使用的上下文索引：`.ai/workflows/evaluation-metrics.md`、`.ai/templates/rca-template.md`
4. 使用的 Skills：workflow-assets

## 3. Context Pack

- 任务复杂度：Failure
- 规则预算：Minimal
- 主 Skill：workflow-assets
- 辅助 Skill：N/A
- 跳过的协议：UI 截图验证
- 升级加载原因：失败路径需要 RCA 样本
- Diff 覆盖模式：Feature scope

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | `specs/failure-rca-sample/run-record.md` | 失败样本记录 | Record | Yes |
| P0 | `.ai/templates/rca-template.md` | RCA 结构 | Record | Yes |
| P1 | `.ai/workflows/evaluation-metrics.md` | Controlled Rollout 条件 | Record | Yes |

## 4. 执行摘要

本次构造一个受控失败样本。样本保留 Failed 状态，引用模拟失败证据和 RCA，用于验证失败路径不会被改写为成功，也不会缺少复盘文件。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | `specs/failure-rca-sample/prd.md`、`specs/failure-rca-sample/tasks.md` | Pass | 样本文档齐全 |
| T2 | Done | `specs/failure-rca-sample/evidence/mock-verification-failure.log` | Failed | 受控失败证据 |
| T3 | Done | `specs/failure-rca-sample/rca.md` | Pass | RCA 已补齐 |
| T4 | Done | `specs/failure-rca-sample/evaluation-summary.md` | Pass | 评估摘要已补齐 |

## 6. 修改文件

| 文件 | 变更说明 |
|------|----------|
| `specs/failure-rca-sample/*` | 新增失败路径样本 |

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Failure Evidence | 模拟失败记录 | Failed | `specs/failure-rca-sample/evidence/mock-verification-failure.log` | 用于验证 RCA 闭环 |
| RCA | 人工检查 | Pass | `specs/failure-rca-sample/rca.md` | N/A |
| Lint | N/A | Skipped | N/A | 样本不修改运行代码；最终总体验证会覆盖 |
| Typecheck | N/A | Skipped | N/A | 样本不修改运行代码；最终总体验证会覆盖 |
| Build | N/A | Skipped | N/A | 样本不修改运行代码；最终总体验证会覆盖 |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 决策 | 使用受控失败样本而不制造真实代码失败 | 避免破坏 CI |

## 9. 效果评估

- Evaluation Summary：`specs/failure-rca-sample/evaluation-summary.md`
- Gate Check：Pass
- 总分：87 / 100
- 投产等级：Internal Trial
- 阻断项：无未处理阻断项
- 代码采纳率：N/A
- 人工修改率：0
- Review 问题数：0
- 是否需要 RCA：是，`specs/failure-rca-sample/rca.md`
- 下次优化建议：后续补充真实失败现场样本。

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
| `specs/failure-rca-sample/prd.md` | 范围内 | 失败样本输入 |
| `specs/failure-rca-sample/tasks.md` | 范围内 | 失败样本任务 |
| `specs/failure-rca-sample/run-record.md` | 范围内 | 失败样本记录 |
| `specs/failure-rca-sample/evaluation-summary.md` | 范围内 | 失败样本评估 |
| `specs/failure-rca-sample/rca.md` | 范围内 | 失败样本 RCA |
| `specs/failure-rca-sample/evidence/mock-verification-failure.log` | 范围内 | 失败样本证据 |

## 11. 证据文件表

| 证据文件 | 对应验证 | 说明 |
|----------|----------|------|
| `specs/failure-rca-sample/evidence/mock-verification-failure.log` | Failure Evidence | 受控失败证据 |
| `specs/failure-rca-sample/rca.md` | RCA | 根因分析和反哺项 |
