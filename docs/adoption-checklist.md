# Harness 迁移验收清单

这份清单用于判断一个项目是否已经具备使用 AI Workflow Harness 的最低条件。

## 1. 仓库资产

| 检查项 | 标准 | 状态 |
|--------|------|------|
| `.ai/workflows/README.md` | 存在工作流入口 | Todo |
| `.ai/templates/spec-template.md` | 存在 Spec 模板 | Todo |
| `.ai/templates/run-record-template.md` | 存在 Run Record 模板 | Todo |
| `.ai/templates/rca-template.md` | 存在 RCA 模板 | Todo |
| `skills/project/SKILL.md` | 已按目标项目生成 | Todo |
| `scripts/check-harness-run.mjs` | 可在本地执行 | Todo |

## 2. 项目规则

| 检查项 | 标准 | 状态 |
|--------|------|------|
| 技术栈说明 | 明确框架、语言和包管理器 | Todo |
| 目录结构说明 | 标注页面、组件、API、测试目录 | Todo |
| 高风险区域 | 明确哪些模块需要人工授权 | Todo |
| 验证命令 | lint、typecheck、build 或 test 至少覆盖一项 | Todo |
| UI 验证规则 | UI 改动必须截图或浏览器检查 | Todo |

## 3. 首个试点

| 检查项 | 标准 | 状态 |
|--------|------|------|
| PRD | 需求背景和目标清楚 | Todo |
| Spec | 包含范围、验收标准和风险 | Todo |
| Tasks | 任务可独立验证 | Todo |
| Run Record | 记录输入、修改、验证和结论 | Todo |
| 证据 | Pass 项引用真实命令或真实文件 | Todo |
| Harness Gate | `npm run harness:check -- specs/{feature}` 通过 | Todo |

## 4. CI 与治理

| 检查项 | 标准 | 状态 |
|--------|------|------|
| CI | 至少运行 lint、typecheck、build 和 harness gate | Todo |
| 失败记录 | 失败或人工大幅修改时生成 RCA | Todo |
| 推广边界 | 明确暂不接入高风险链路 | Todo |
| 资产维护人 | 明确谁维护 `.ai/`、`skills/`、`specs/` | Todo |

## 5. 准入结论

| 结论 | 条件 |
|------|------|
| Not Ready | 缺少项目规则或无法运行验证命令 |
| Internal Trial | 能完成一个低风险需求闭环 |
| Low-risk Production | CI 通过，Run Record 和证据稳定 |
| Controlled Rollout | 至少有成功和失败样本各一个，并完成 RCA 反哺 |
