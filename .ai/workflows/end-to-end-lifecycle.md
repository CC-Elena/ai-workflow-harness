# AI 工作流端到端生命周期

本文档定义从需求进入到工作流关闭的完整生命周期，确保每个阶段都有输入、输出、进入条件、退出条件和失败回退路径。

## 1. 生命周期总览

```text
PRD / 用户需求
  -> Intake
  -> Spec
  -> Review
  -> Plan
  -> Context Pack
  -> Execute
  -> Verify
  -> Evaluate
  -> Record
  -> Improve
  -> Close
```

## 2. 阶段定义

| 阶段 | 输入 | 动作 | 输出 | 退出条件 |
|------|------|------|------|----------|
| Intake | 用户需求、PRD、背景说明 | 澄清目标、范围、非目标 | `prd.md` 或需求摘要 | 目标和验收方向清楚 |
| Spec | PRD、Spec 模板 | 生成结构化 Spec | `spec.md` | 必填章节完整 |
| Review | `spec.md`、审查协议 | 审查歧义、风险和验收 | 审查意见或确认记录 | 无 P0/P1 需求缺口 |
| Plan | `spec.md`、上下文索引 | 拆解任务和依赖 | `tasks.md` | 每个任务可独立执行和验证 |
| Context Pack | Tasks、项目索引、Skills 路由 | 选择必要上下文 | 上下文清单 | 关键 P0/P1 上下文已覆盖 |
| Execute | 单个 Task、上下文、Skill | 最小范围修改 | code diff / docs diff | 修改满足任务验收 |
| Verify | diff、验证协议 | 运行静态、构建、测试、截图 | `verification-record.md` | 应运行验证均真实记录 |
| Evaluate | 验证记录、Run Record 草稿 | 评分、检查阻断项 | `evaluation-summary.md` | 达到目标门槛或明确失败 |
| Record | 全部过程证据 | 归档执行记录 | `run-record.md` | 输入、输出、验证、评估完整 |
| Improve | Run Record / RCA | 反哺 Prompt、Skill、上下文 | 改进项或变更 | 改进项有 owner 和文件 |
| Close | 全部产物 | 总结状态和风险 | 关闭结论 | 无未说明风险 |

## 3. 门禁顺序

1. 没有 Spec，不进入 Plan。
2. 没有 Tasks，不进入 Execute。
3. 没有 Context Pack，不执行中等及以上任务。
4. 没有 Verification，不记录 Success。
5. 没有 Evaluation，中等及以上任务不判断投产。
6. 出现失败或人工大幅修改，没有 RCA 不关闭。

## 4. 失败回退路径

| 失败位置 | 回退动作 | 触发产物 |
|----------|----------|----------|
| Intake 不清 | 向用户澄清或补 PRD | 更新 `prd.md` |
| Spec 缺口 | 回到 Spec 生成或审查 | 更新 `spec.md` |
| Task 过大 | 回到 Planner 重新拆解 | 更新 `tasks.md` |
| 上下文不足 | 更新 Context Pack 或索引 | 更新 `.ai/context/*` |
| 执行失败 | 修复或拆小任务 | 更新代码和任务备注 |
| 验证失败 | 使用修复 Prompt，必要时 RCA | `verification-record.md`、`rca.md` |
| 评估不达标 | 补验证、补记录或回退实现 | `evaluation-summary.md` |
| 复盘无改进项 | 补充可执行反哺动作 | `run-record.md`、`rca.md` |

## 5. 产物最小集

小任务：

```text
spec.md
run-record.md
```

中等任务：

```text
prd.md
spec.md
tasks.md
verification-record.md
run-record.md
evaluation-summary.md
```

失败或人工大幅修改：

```text
prd.md
spec.md
tasks.md
verification-record.md
run-record.md
evaluation-summary.md
rca.md
```

## 6. 关闭标准

工作流关闭必须满足：

1. 需求验收状态明确。
2. 验证命令和截图结果真实记录。
3. 未完成项、跳过项和风险有解释。
4. 评估结论与证据一致。
5. 失败路径已触发 RCA。
6. 后续改进项指向具体文件或明确说明无需改进。

