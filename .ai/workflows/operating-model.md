# AI Workflow Harness 操作模型

本文档定义 AI Workflow Harness 的理论操作模型。它回答三个问题：工作流为什么成立、每一层负责什么、什么时候允许进入下一层。

## 1. 核心命题

AI Workflow Harness 不是一个独立 Agent 平台，也不是模型调度系统。它是一套仓库内协议，把 Codex / Coding IDE 已具备的读取、编辑、终端、浏览器验证和 Review 能力组织成可解释、可验证、可复盘的研发流程。

核心命题：

> 用仓库资产约束 AI 的输入、过程和输出，让 AI 从“回答问题”转为“按协议交付任务”。

## 2. 基础假设

1. AI 的长链路输出质量取决于输入结构、上下文召回、任务边界、验证反馈和复盘改进。
2. 需求必须先结构化为 Spec，再进入任务拆解和执行。
3. AI 执行过程不能只评估最终结果，还要评估中间决策、上下文选择、工具调用和验证证据。
4. 所有关键资产必须随仓库版本化，便于 Review、回滚和持续演进。
5. 高风险操作必须保留人工决策权，不做无人值守合并、发布或生产操作。

## 3. 五层操作模型

| 层级 | 名称 | 责任 | 主要产物 | 失败信号 |
|------|------|------|----------|----------|
| L1 | Intent | 将用户需求转为清晰目标 | `prd.md`、需求说明 | 目标含糊、边界缺失 |
| L2 | Contract | 建立唯一可信源 | `spec.md` | 验收标准不可测、非目标缺失 |
| L3 | Plan | 拆解可执行任务 | `tasks.md` | 任务过大、依赖不清、无法验证 |
| L4 | Execute | 最小范围修改 | code diff、文档变更 | 越界修改、重复造轮子、违反规范 |
| L5 | Learn | 验证、记录、复盘和反哺 | `verification-record.md`、`run-record.md`、`rca.md`、`evaluation-summary.md` | 验证不真实、记录缺失、同类失败复发 |

## 4. 状态机

```text
Intake
  -> SpecDraft
  -> SpecReviewed
  -> Planned
  -> Executing
  -> Verifying
  -> Evaluating
  -> Recorded
  -> Closed
```

异常状态：

```text
Blocked       # 缺输入、缺权限、缺关键上下文
Repairing     # 验证失败后可自动修复
HumanReview   # 需要人工判断范围、风险或业务语义
RCARequired   # 失败、人工大幅修改或系统性 Review 问题
```

## 5. 决策权分配

| 决策 | Codex 可执行 | 需要人工确认 |
|------|--------------|--------------|
| 读取仓库资产 | 是 | 否 |
| 生成 Spec 草稿 | 是 | 重要需求需要审查 |
| 拆解任务 | 是 | 高风险或跨模块需求需要审查 |
| 修改低风险文件 | 是 | 否 |
| 修改核心链路 | 否 | 是 |
| 运行 lint / typecheck / build | 是 | 否 |
| 启动本地页面和截图验证 | 是 | 否 |
| 合并代码或操作生产环境 | 否 | 是 |
| 生成 RCA 和改进建议 | 是 | 关键规则变更需要审查 |

## 6. 理论闭环

每次执行都必须能回答：

1. 为什么做：需求和 Spec 证据。
2. 做什么：Task List 和影响范围。
3. 依据什么做：上下文索引、Skills、工程规则。
4. 怎么做：修改摘要和关键决策。
5. 如何证明做对：验证记录和截图证据。
6. 做得多好：评估摘要和分项评分。
7. 下次如何更好：Run Record、RCA 和反哺项。

## 7. 与现有协议关系

| 本模型能力 | 对应文件 |
|------------|----------|
| Spec-driven | `.ai/prompts/generate-spec.md`、`.ai/templates/spec-template.md` |
| Planner-Executor | `.ai/workflows/planner-executor.md` |
| Verification | `.ai/workflows/verification.md` |
| Evaluation | `.ai/workflows/evaluation-metrics.md`、`.ai/workflows/eval-rubric.md` |
| RCA | `.ai/prompts/generate-rca.md`、`.ai/templates/rca-template.md` |

