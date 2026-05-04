# 真实需求试点候选清单

本清单用于落实 `开发计划.md` 阶段 8：选择 2-3 个真实但低风险需求验证完整流程。

## 1. 候选需求

| ID | 需求 | 影响范围 | 风险 | 状态 |
|----|------|----------|------|------|
| P1 | 仓库资产检索支持 Evaluation 和 Skill 分类 | `app/workflow-workspace.tsx` | 低 | Done |
| P2 | Run Record 草稿增加验证摘要字段 | `app/workflow-workspace.tsx` | 低 | Done |
| P3 | 首页展示 MVP 任务完成概览 | `app/workflow-workspace.tsx`、`app/globals.css` | 中 | Done |

## 2. 选择理由

P1 被选为首个真实试点，因为它具备以下特点：

1. 修改范围小，只影响资产检索数据和筛选分类。
2. 能直接展示新增的验证记录模板、Skill 缺口映射和试点复盘资产。
3. 不涉及后端、数据库、权限或外部依赖。
4. 可以通过构建和页面手工检查验证。

## 3. 后续安排

1. P1 已完成 `Spec -> Tasks -> Code Change -> Build -> Run Record` 闭环。
2. P2 已完成草稿验证摘要字段和旧草稿兼容。
3. P3 已完成首页 MVP 任务完成概览和阶段状态同步。
