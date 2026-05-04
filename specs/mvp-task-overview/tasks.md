# Task List: mvp-task-overview

## 1. Spec 来源

- Spec 文件：`specs/mvp-task-overview/spec.md`
- 规划日期：2026-05-03
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 增加 MVP 概览数据和 UI | `app/workflow-workspace.tsx`、`app/globals.css` | 无 | Done |
| T2 | 同步工作流阶段状态 | `app/workflow-workspace.tsx` | T1 | Done |
| T3 | 验证并记录执行结果 | `specs/mvp-task-overview/run-record.md` | T1-T2 | Done |

## 3. 任务详情

### T1. 增加 MVP 概览数据和 UI

#### 目标

在首页展示 MVP 任务、试点和最近完成项。

#### 输入

1. Spec 相关段落：F1、F2。
2. 必读上下文：`app/workflow-workspace.tsx`、`app/globals.css`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-workspace.tsx` | 新增静态数据和区块 |
| 文件 | `app/globals.css` | 新增概览样式 |

#### 执行动作

1. 新增 `MvpMetric` 类型。
2. 新增 `mvpMetrics` 常量。
3. 在阶段区块后插入概览区。
4. 补充桌面和移动端样式。

#### 验收标准

1. 页面显示 4 个指标。
2. 移动端单列展示。

#### 验证方式

1. `npm run lint`
2. `npm run build`
3. 浏览器截图检查。

#### 风险

1. 静态数值需要后续人工维护。

### T2. 同步工作流阶段状态

#### 目标

避免页面显示 Executor 和 Verify 仍未完成。

#### 输入

1. Spec 相关段落：F3。
2. 必读上下文：`specs/development-plan-tasks.md`。
3. 必读 Skills：无。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-workspace.tsx` | 更新 stage 状态和 hero 文案 |

#### 执行动作

1. 将 Planner、Executor、Verify 状态设置为 Ready。
2. 更新 hero panel 文案。

#### 验收标准

1. MVP readiness 为 100%。
2. 阶段卡片均显示 Ready。

#### 验证方式

1. 浏览器检查。
2. `npm run build`。

#### 风险

1. 后续新增未完成阶段时需同步更新。

### T3. 验证并记录执行结果

#### 目标

记录 P3 的执行与验证结果。

#### 输入

1. Spec 相关段落：A1-A4。
2. 必读上下文：`.ai/templates/run-record-template.md`。
3. 必读 Skills：`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/mvp-task-overview/run-record.md` | 执行记录 |

#### 执行动作

1. 运行 lint 和 build。
2. 完成浏览器截图检查。
3. 记录验证结果。

#### 验收标准

1. Run Record 存在。
2. 验证结果真实记录。

#### 验证方式

1. 文件检查。
2. 文档审查。

#### 风险

1. 截图验证依赖本地浏览器环境。

## 4. 执行顺序

1. T1
2. T2
3. T3

