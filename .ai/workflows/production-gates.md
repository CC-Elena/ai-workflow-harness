# 投产门禁与风险分级

本文档定义 AI Workflow Harness 从内部试运行到低风险投产、再到更广泛推广的门禁标准。

## 1. 投产分级

| 等级 | 使用范围 | 最低要求 |
|------|----------|----------|
| Draft | 文档草稿、Spec 初稿、任务建议 | 无代码修改，无投产判断 |
| Internal Trial | 低风险文档和页面辅助改动 | 评估分 >= 80，无阻断项 |
| Low-risk Production | 非核心 UI、文档、测试、配置小改 | 评估分 >= 90，连续 2 个低风险试点无 P1 问题 |
| Controlled Rollout | 多模块但可回滚需求 | 评估分 >= 95，连续 3 个试点无 P1 问题，至少 1 个 RCA 闭环 |
| Failed | 阻断项触发、分数不足或证据不足 | 不允许投产 |

## 2. 风险分类

| 风险 | 说明 | 处理方式 |
|------|------|----------|
| R0 | 纯文档、模板、索引更新 | Codex 可执行，记录即可 |
| R1 | 低风险 UI 或静态数据 | Codex 可执行，需验证 |
| R2 | 影响用户流程但可回滚 | 需要人工确认 Spec 和 Review |
| R3 | 跨模块、权限、数据写入 | 必须人工主导，AI 拆解和辅助实现 |
| R4 | 生产操作、资金、合规、隐私 | 不允许自动执行 |

## 3. 阻断项

出现任一阻断项，不允许进入投产判断：

1. 没有 Spec。
2. 没有任务拆解却修改多个文件。
3. 修改超出影响范围。
4. 验证未运行却记录 Pass。
5. 高风险模块没有人工确认。
6. 失败或人工大幅修改后没有 RCA。
7. 引入 MCP、平台、数据库、Agent Runtime 等当前范围外能力。
8. 自动合并、自动发布或操作生产环境。

## 4. Gate Check

每次中等及以上任务至少检查：

| Gate | 进入条件 | 退出条件 |
|------|----------|----------|
| Spec Gate | PRD 或用户需求存在 | Spec 完整、可测、边界明确 |
| Plan Gate | Spec 已确认 | Tasks 原子化并有验证方式 |
| Context Gate | Tasks 已生成 | 必要上下文和 Skill 已识别 |
| Execution Gate | Context Pack 已确认 | 修改最小且符合任务 |
| Verification Gate | 修改完成 | 应运行验证均真实记录 |
| Evaluation Gate | 验证完成 | 分数、阻断项、投产等级明确 |
| Record Gate | 评估完成 | Run Record 完整，必要时 RCA 完成 |

## 5. 发布判断

```text
有阻断项 -> Failed
无阻断项且分数 < 80 -> Failed
80 <= 分数 < 90 -> Internal Trial
90 <= 分数 < 95 -> Low-risk Production
分数 >= 95 且满足 RCA / 试点附加条件 -> Controlled Rollout
草稿或无代码修改 -> Draft
```

## 6. 人工确认清单

以下情况必须人工确认：

1. 修改核心业务链路。
2. 修改鉴权、支付、隐私、权限、数据写入逻辑。
3. 新增依赖或构建配置变化。
4. 测试或构建失败后需要跳过。
5. 评估分低于目标门槛但仍想继续。
6. AI 产物被人工大幅改写。

## 7. 证据要求

投产判断必须引用：

1. `spec.md`
2. `tasks.md`
3. `verification-record.md`
4. `evaluation-summary.md`
5. `run-record.md`
6. 必要时的 `rca.md`
