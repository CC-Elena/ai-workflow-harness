# Run Record: 显式 Spec 命令路由

## 1. 基本信息

- 需求名称：显式 Spec 命令路由
- 执行日期：2026-05-12
- 执行工具：Codex
- 执行人：Codex
- 状态：Success

## 2. 输入

1. 用户需求：默认不走任何 Spec 流程；用户可用命令指示 `/spec`，不需要 `/maintenance`。
2. 使用的上下文索引：`.ai/workflows/README.md`、`.ai/workflows/rule-loading-policy.md`
3. 使用的 Skills：workflow-assets

## 3. Context Pack

- 任务复杂度：Small
- 规则预算：Minimal
- 主 Skill：workflow-assets
- 辅助 Skill：N/A
- 跳过的协议：完整 Spec、Evaluation、RCA
- 升级加载原因：N/A
- Diff 覆盖模式：Feature scope

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | `.ai/workflows/README.md` | 更新入口原则和流程 | Execute | Yes |
| P0 | `.ai/workflows/rule-loading-policy.md` | 更新默认加载策略 | Execute | Yes |

## 4. 执行摘要

本次将 Harness 入口调整为“默认轻量执行，显式进入 Spec”。新增 `.ai/workflows/command-routing.md` 定义 `/spec` 和 `/mini-spec` 路由，新增 `.ai/templates/mini-spec-template.md`。未加入 `/maintenance`，Harness 维护默认走轻量流程。

## 5. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | `.ai/workflows/README.md` | Pass | 入口原则改为显式 Spec |
| T2 | Done | `.ai/workflows/rule-loading-policy.md` | Pass | 默认不因复杂度自动进入 Spec |
| T3 | Done | `.ai/workflows/command-routing.md` | Pass | 新增命令路由 |
| T4 | Done | `.ai/templates/mini-spec-template.md` | Pass | 新增 Mini Spec 模板 |

## 6. 修改文件

| 文件 | 变更说明 |
|------|----------|
| `.ai/workflows/README.md` | 默认轻量执行，新增命令路由和 `/spec`、`/mini-spec` 流程 |
| `.ai/workflows/rule-loading-policy.md` | Spec 只由用户显式触发，Large/Risky 仅建议 `/spec` |
| `.ai/workflows/command-routing.md` | 定义默认轻量、`/mini-spec`、`/spec` 路由 |
| `.ai/templates/mini-spec-template.md` | 新增轻量 Spec 模板 |

## 7. 验证记录

| 验证项 | 命令或方式 | 结果 | 证据 | 跳过原因 / 风险 |
|--------|------------|------|------|----------------|
| Routing Text Check | `rg` 检查关键表述 | Pass | `specs/explicit-spec-command-routing/evidence/routing-check.log` | N/A |
| Harness Check | N/A | Skipped | N/A | 本次按用户要求不为 Harness 维护强制 Spec；当前门禁仍面向 Spec 目录结构 |
| Build | N/A | Skipped | N/A | 本次只修改工作流文档和模板 |

## 8. 人工介入

| 类型 | 说明 | 原因 |
|------|------|------|
| 决策 | 不新增 `/maintenance` | 用户明确不需要 |

## 9. 效果评估

- Evaluation Summary：N/A
- Gate Check：N/A
- 总分：N/A
- 投产等级：Internal Trial
- 阻断项：无
- 代码采纳率：N/A
- 人工修改率：0
- Review 问题数：0
- 是否需要 RCA：否
- 下次优化建议：后续可调整 `harness:check`，让轻量维护记录也能被门禁检查。

## 10. 实际 Diff 覆盖表

| 文件 | 范围 | 确认原因 |
|------|------|----------|
| `.ai/workflows/README.md` | 范围内 | 工作流入口更新 |
| `.ai/workflows/rule-loading-policy.md` | 范围内 | 规则加载策略更新 |
| `.ai/workflows/command-routing.md` | 范围内 | 命令路由新增 |
| `.ai/templates/mini-spec-template.md` | 范围内 | Mini Spec 模板新增 |
| `specs/explicit-spec-command-routing/run-record.md` | 范围内 | 本次轻量记录 |
| `specs/explicit-spec-command-routing/evidence/routing-check.log` | 范围内 | 验证证据 |

## 11. 证据文件表

| 证据文件 | 对应验证 | 说明 |
|----------|----------|------|
| `specs/explicit-spec-command-routing/evidence/routing-check.log` | Routing Text Check | 关键路由表述检查 |
