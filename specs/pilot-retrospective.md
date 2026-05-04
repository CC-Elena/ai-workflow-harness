# 真实需求试点复盘报告

## 1. 试点概览

| 试点 | 需求 | 状态 | 结果 |
|------|------|------|------|
| P1 | 仓库资产检索支持 Evaluation 和 Skill 分类 | Done | 完成 Spec、Tasks、代码修改、构建验证和 Run Record |
| P2 | Run Record 草稿增加验证摘要字段 | Done | 完成旧草稿兼容、表单字段、验证记录 |
| P3 | 首页展示 MVP 任务完成概览 | Done | 完成概览区、阶段状态同步、截图验证 |

## 2. 本次结果

P1、P2、P3 均跑通了 `PRD -> Spec -> Tasks -> Code Change -> Verification -> Run Record` 的真实代码闭环。

本次没有新增依赖、后端接口、数据库或独立平台，也没有重复实现 Codex 已有能力。

## 3. 工作流优化清单

| 优化项 | 目标文件 | 状态 |
|--------|----------|------|
| 为验证结果提供独立模板 | `.ai/templates/verification-record-template.md` | Done |
| 明确工作流资产维护入口 | `skills/workflow-assets/SKILL.md` | Done |
| 明确 Skill 缺口与承载资产 | `.ai/context/skill-gap-map.md` | Done |
| 后续 UI 试点补充截图验证 | `specs/mvp-task-overview/verification-record.md` | Done |
| 补齐 P1 截图验证记录 | `specs/asset-catalog-evaluation-filter/verification-record.md` | Done |
| 明确下一阶段推广范围和风险边界 | `specs/next-stage-rollout-boundary.md` | Done |
| 集中维护首页工作流数据 | `app/workflow-data.ts` | Done |
| 补齐工作流评估指标与投产门槛 | `.ai/workflows/evaluation-metrics.md` | Done |
| 补齐 Rubric、Gate Check 和 Evaluation Summary 模板 | `.ai/workflows/eval-rubric.md`、`.ai/templates/*` | Done |
| 记录工作流缺陷与后续优化关注项 | `specs/workflow-defect-register.md` | Done |
| 增加轻量规则加载与最小 Skill 路由 | `.ai/workflows/rule-loading-policy.md`、`.ai/context/skill-routing-minimal.md` | Done |

## 4. 风险与建议

1. 当前首页资产列表和 MVP 概览已经集中到 `app/workflow-data.ts`，后续新增资产优先更新该数据模块。
2. 下一阶段推广应先使用 `.ai/workflows/evaluation-metrics.md` 进行评分，达到对应门槛后再扩大使用范围。
3. 下一阶段推广应遵守 `specs/next-stage-rollout-boundary.md`，继续排除 MCP、后端接口和无人值守合并。
4. 若下一阶段需要自动统计，应另开需求，不在当前 MVP 内隐式加入文件扫描或后台服务。
5. 后续业务迭代应持续复查 `specs/workflow-defect-register.md`，避免读取过重、Context Pack 缺失、指标无证据、RCA 漏触发等问题复发。
6. 后续执行应优先使用轻量规则加载策略，避免简单任务读取过多规则或 Skills。
