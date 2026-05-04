# 持续学习与复盘闭环

本文档定义 AI Workflow Harness 如何从每次执行中学习，并将经验反哺到 Prompt、Skill、上下文索引和模板。

## 1. 学习闭环

```text
Run Record
  -> Evaluation Summary
  -> RCA or Improvement Item
  -> Prompt / Skill / Context / Template Update
  -> Verification
  -> Retrospective
  -> Next Run
```

## 2. 触发条件

以下情况必须进入学习闭环，并判断是否需要 RCA：

1. 验证失败。
2. 构建、lint、typecheck 或截图检查失败。
3. 人工大幅修改 AI 输出。
4. Review 发现系统性问题。
5. 同类问题重复出现。
6. 评估分低于目标门槛。
7. 上下文或 Skill 路由明显遗漏。

其中 1-4 必须生成 RCA；5-7 如果影响交付质量、投产判断或同类问题防复发，也必须生成 RCA。未生成 RCA 时，必须在 Run Record 中说明未触发原因。

以下情况建议进入学习闭环：

1. 任务执行成功但耗时过长。
2. 需要多次往返澄清。
3. 生成结果可用但不够贴合本仓库风格。
4. 新增了一类稳定工程模式。

## 3. 根因分类

| 分类 | 说明 | 反哺目标 |
|------|------|----------|
| Spec Gap | 需求、边界或验收缺失 | Spec 模板、Spec 审查 Prompt |
| Context Gap | 漏读关键文件或索引不完整 | `.ai/context/*` |
| Skill Gap | 规则没有 Skill 化或路由不清 | `skills/*/SKILL.md`、`.ai/context/skill-routing.md` |
| Execution Gap | 修改方式不符合工程约束 | Executor Prompt、工程规范 |
| Verification Gap | 验证不完整或记录不真实 | Verification 协议、验证模板 |
| Evaluation Gap | 评分缺证据或门槛不清 | Evaluation 协议、Rubric |
| Human Alignment Gap | 需要人工判断但未提前确认 | Gate Check、风险边界 |

## 4. RCA 输出要求

RCA 必须包含：

1. 失败现象。
2. 影响范围。
3. 直接原因。
4. 深层原因。
5. 修复动作。
6. 反哺项。
7. 防复发验证方式。

反哺项必须是可执行的：

```markdown
| 反哺项 | 目标文件 | 修改内容 | 验证方式 | Owner |
|--------|----------|----------|----------|-------|
| 补充截图验证规则 | `.ai/workflows/verification.md` | 增加移动端检查 | Playwright | Codex |
```

## 5. 改进优先级

| 优先级 | 条件 | 处理时限 |
|--------|------|----------|
| P0 | 导致错误代码、数据风险或阻断投产 | 立即修复 |
| P1 | 导致返工、验证失败或高频 Review 问题 | 当前迭代修复 |
| P2 | 影响效率但不影响正确性 | 后续优化 |
| P3 | 文档表达或体验优化 | 有空补充 |

## 6. 学习记录格式

```markdown
## Learning Item

- 来源：
- 根因分类：
- 证据：
- 反哺目标：
- 修改内容：
- 验证方式：
- 状态：Open / Done / Deferred
```

## 7. 防止过拟合

1. 单个失败案例不能直接变成通用规则，除非可复现或影响严重。
2. 通用 Skill 只沉淀跨需求稳定规则。
3. 业务特例优先写入具体 Spec，不写入全局 Prompt。
4. RCA 反哺后必须通过下一次任务验证是否有效。
5. 如果反哺项造成执行成本明显上升，需要重新评估保留价值。

## 8. 成熟度指标

| 指标 | 目标 |
|------|------|
| RCA 触发准确率 | 100% |
| 反哺项落地率 | >= 80% |
| 同类问题复发率 | 持续下降 |
| Skill 命中率 | >= 90% |
| 上下文命中率 | >= 80% |
| 验证记录完整率 | 100% |
