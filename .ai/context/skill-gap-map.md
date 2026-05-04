# Skill 缺口映射

本文档用于审查 `开发计划.md` 中提到的关键能力是否已经被 `.ai/` 协议、Prompt 或 `skills/` 覆盖。

## 1. 能力覆盖表

| 计划能力 | 当前承载资产 | 覆盖状态 | 说明 |
|----------|--------------|----------|------|
| Spec 生成 Skill | `.ai/prompts/generate-spec.md`、`.ai/templates/spec-template.md`、`skills/feature-dev/SKILL.md` | Covered | Spec 生成作为工作流 Prompt 承载，不单独复制成 Skill。 |
| Planner 拆解 Skill | `.ai/prompts/planner.md`、`.ai/workflows/planner-executor.md`、`skills/feature-dev/action-split.md` | Covered | Planner 由协议和 Prompt 定义，Feature Skill 提供拆分参考。 |
| RCA 复盘 Skill | `.ai/prompts/generate-rca.md`、`.ai/templates/rca-template.md`、`skills/auto-rules/SKILL.md` | Covered | RCA 由 Prompt 生成，规则沉淀交给 auto-rules。 |
| 执行记录 Skill | `.ai/templates/run-record-template.md`、`.ai/evals/README.md`、`skills/workflow-assets/SKILL.md` | Covered | 新增 workflow-assets Skill，约束 Run Record 填写与归档。 |
| 上下文索引维护 Skill | `.ai/context/*.md`、`skills/workflow-assets/SKILL.md` | Covered | 新增 workflow-assets Skill，约束索引维护入口和验收方式。 |

## 2. 设计取舍

1. 不为每个 Prompt 复制一个同名 Skill，避免维护两套相同规则。
2. `.ai/` 目录负责协议和模板，`skills/` 目录负责可复用专项工作流。
3. 当某项能力只服务工作流资产维护时，统一归入 `skills/workflow-assets/SKILL.md`。

## 3. 后续维护规则

1. 新增 Skill 前，先检查 `.ai/prompts/`、`.ai/workflows/` 和现有 `skills/` 是否已有覆盖。
2. 如果只是补充生成格式或审查步骤，优先更新 Prompt 或模板。
3. 如果需要跨多个任务复用执行步骤，才新增或更新 Skill。
4. Skill 路由变更必须同步 `.ai/context/skill-routing.md` 和 `skills/README.md`。

