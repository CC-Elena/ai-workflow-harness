# RCA: 失败路径与 RCA 样本

## 1. 基本信息

- 需求名称：失败路径与 RCA 样本
- 关联 Run Record：`specs/failure-rca-sample/run-record.md`
- 创建日期：2026-05-09
- 触发原因：验证失败

## 2. 问题现象

模拟样本中，执行记录将缺少证据的验证项视为失败。该问题如果发生在真实需求中，会导致交付结论不可审计，Review 人无法确认 AI 是否真的完成验证。

## 3. 影响范围

| 范围 | 说明 |
|------|------|
| 需求 | 失败需求不能进入成功交付 |
| 代码 | 当前样本不影响代码 |
| 测试 | 当前样本不影响测试命令 |
| 视觉 | 不涉及 |
| 流程 | 验证 Run Record、证据和 RCA 的失败路径 |

## 4. 根因分类

1. 测试覆盖不足。
2. 工程命令或环境问题。
3. 人工输入不完整。

## 5. 根因分析

失败根因不是业务代码错误，而是交付记录缺少可追溯证据。如果流程允许这种记录被标记为成功，Harness 将无法区分真实验证和口头声明。

## 6. 修复动作

| 动作 | 负责人 | 状态 |
|------|--------|------|
| 在失败样本中保留 Failed 状态 | Codex | Done |
| 引用真实失败证据文件 | Codex | Done |
| 让 Run Record 显式引用 RCA | Codex | Done |
| 增强 harness check 对失败样本的 RCA 要求 | Codex | Done |

## 7. 反哺项

| 类型 | 文件 | 建议 |
|------|------|------|
| 校验协议 | `scripts/check-harness-run.mjs` | Failed、Partial、Failure 复杂度必须引用 RCA |
| Run Record | `.ai/templates/run-record-template.md` | 失败样本保留失败状态，不改写成成功 |
| 评估 | `.ai/workflows/evaluation-metrics.md` | Controlled Rollout 前至少需要一个 RCA 闭环样本 |

## 8. 防复发规则

如果验证项没有命令或证据，不得将该验证项写为 Pass。失败或部分完成的执行必须引用 RCA，并在后续需求中验证修复动作是否有效。
