# Feature Spec: ai-run-record-entry

## 1. 基本信息

- 需求名称：AI 工作流执行记录入口
- 需求来源：模拟 PRD
- 负责人：Codex
- 创建日期：2026-05-02
- 状态：Reviewed

## 2. 背景与目标

AI Workflow Harness 已经具备 Spec、Task、Run Record、RCA、Prompt、上下文索引和 Skills 路由等基础资产，但首次使用者需要在多个目录之间查找记录入口。

本需求目标是为执行记录建立更清晰的入口说明，并通过一次模拟需求验证 `PRD -> Spec -> Tasks -> Run Record` 链路。

## 3. 范围

### 3.1 本次包含

1. 在 `specs/ai-run-record-entry/` 下创建模拟 PRD、Spec、Tasks 和 Run Record。
2. 补强 `.ai/evals/README.md`，让它成为执行记录和 RCA 的入口说明。
3. 记录本次模拟执行过程和验证结果。

### 3.2 本次不包含

1. 不开发 UI 页面。
2. 不修改真实业务代码。
3. 不接入数据库。
4. 不开发独立执行记录平台。
5. 不自动生成指标看板。

## 4. 用户场景

| 场景 | 用户行为 | 期望结果 |
|------|----------|----------|
| 首次记录 AI 执行 | 研发同学打开 `.ai/evals/README.md` | 能知道 Run Record 与 RCA 的填写时机和存放路径 |
| 模拟试点复盘 | 技术负责人查看 `specs/ai-run-record-entry/` | 能看到一次完整的工作流试运行链路 |
| 后续需求接入 | 接入者参考模拟记录 | 能复制目录结构并填写自己的需求记录 |

## 5. 功能要求

| 编号 | 功能点 | 说明 | 优先级 |
|------|--------|------|--------|
| F1 | 模拟 PRD | 创建可用于工作流试运行的 PRD | P0 |
| F2 | 结构化 Spec | 基于 PRD 生成符合模板的 Spec | P0 |
| F3 | 任务拆解 | 基于 Spec 拆解可执行任务 | P0 |
| F4 | 执行记录 | 记录本次模拟工作流执行结果 | P0 |
| F5 | 入口说明补强 | 优化 `.ai/evals/README.md` 的可操作性 | P1 |

## 6. 页面与组件影响

| 类型 | 名称或路径 | 变更说明 |
|------|------------|----------|
| 文档 | `.ai/evals/README.md` | 补充执行记录入口说明 |
| 文档 | `specs/ai-run-record-entry/prd.md` | 模拟 PRD |
| 文档 | `specs/ai-run-record-entry/spec.md` | 结构化 Spec |
| 文档 | `specs/ai-run-record-entry/tasks.md` | 任务拆解 |
| 文档 | `specs/ai-run-record-entry/run-record.md` | 执行记录 |

## 7. 数据与接口

| 接口或数据源 | 请求/输入 | 响应/输出 | 约束 |
|--------------|-----------|-----------|------|
| 模拟 PRD | `specs/ai-run-record-entry/prd.md` | `spec.md` | 不编造真实业务背景 |
| Spec | `spec.md` | `tasks.md` | 任务必须可执行、可验证 |
| Tasks | `tasks.md` | `run-record.md` | 明确执行结果和跳过项 |

## 8. 权限与异常场景

| 场景 | 处理方式 |
|------|----------|
| 缺少真实业务源码 | 仅执行文档链路验证，不进入代码修改 |
| 验证命令不适用 | 在 Run Record 中说明原因 |
| 任务范围扩大 | 停止，不修改与试点无关文件 |

## 9. 设计与交互约束

1. 是否有设计稿：无。
2. 是否需要截图验收：不需要。
3. 样式和组件约束：不涉及。
4. 国际化要求：不涉及用户界面文案。

## 10. 工程约束

1. 必须遵守 `docs/ai-workflow-boundary.md`。
2. 必须遵守 `.ai/workflows/planner-executor.md`。
3. 必须使用 `.ai/templates/task-template.md` 和 `.ai/templates/run-record-template.md` 的结构。
4. 不修改真实业务代码。
5. 不重复开发 Codex 已有能力。

## 11. 验收标准

| 编号 | 验收项 | 验收方式 |
|------|--------|----------|
| A1 | `prd.md`、`spec.md`、`tasks.md`、`run-record.md` 均存在 | 文件检查 |
| A2 | `spec.md` 符合 Spec 模板结构 | 文档审查 |
| A3 | `tasks.md` 至少包含 3 个可执行任务 | 文档审查 |
| A4 | `run-record.md` 记录本次执行结果和未执行代码修改的原因 | 文档审查 |
| A5 | `.ai/evals/README.md` 可作为执行记录入口说明 | 文档审查 |

## 12. 风险与待确认问题

| 类型 | 说明 | 处理方式 |
|------|------|----------|
| 风险 | 当前仓库不是完整业务源码，无法验证真实代码修改 | 本次仅验证文档链路 |
| 风险 | 模拟需求不能代表复杂业务需求 | 后续选择真实 PRD 再试点 |
| 待确认 | 后续是否需要将执行记录归档到 `.ai/evals/runs/` | 试点后根据团队习惯决定 |

