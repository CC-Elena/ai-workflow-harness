# Task List: workflow-data-registry

## 1. Spec 来源

- Spec 文件：`specs/workflow-data-registry/spec.md`
- 规划日期：2026-05-04
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 新增工作流数据模块 | `app/workflow-data.ts` | 无 | Done |
| T2 | 首页改为导入数据并计算指标 | `app/workflow-workspace.tsx` | T1 | Done |
| T3 | 验证并记录结果 | `specs/workflow-data-registry/run-record.md` | T1-T2 | Done |

## 3. 任务详情

### T1. 新增工作流数据模块

#### 目标

集中维护首页阶段、资产、计划任务和试点数据。

#### 输入

1. Spec 相关段落：F1。
2. 必读上下文：`app/workflow-workspace.tsx`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-data.ts` | 新增数据模块 |

#### 执行动作

1. 定义数据类型。
2. 迁移 stages 和 assets。
3. 新增 planTasks 和 pilots。

#### 验收标准

1. 数据模块可被页面导入。
2. 数据内容与现有页面一致。

#### 验证方式

1. `npm run typecheck`
2. 页面检查。

#### 风险

1. 迁移时可能遗漏资产条目。

### T2. 首页改为导入数据并计算指标

#### 目标

减少页面内重复常量，让关键指标由数据计算。

#### 输入

1. Spec 相关段落：F2、F3。
2. 必读上下文：`app/workflow-workspace.tsx`、`app/workflow-data.ts`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-workspace.tsx` | 删除重复数据，导入并计算指标 |

#### 执行动作

1. 从 `workflow-data.ts` 导入数据。
2. 计算任务和试点完成数。
3. 保持资产筛选逻辑不变。

#### 验收标准

1. 首页仍显示正确指标。
2. 资产筛选不回退。

#### 验证方式

1. `npm run lint`
2. Playwright 浏览器检查。

#### 风险

1. 静态数据仍需人工更新。

### T3. 验证并记录结果

#### 目标

记录本次可选增强的执行和验证结果。

#### 输入

1. Spec 相关段落：A1-A4。
2. 必读上下文：`.ai/templates/run-record-template.md`。
3. 必读 Skills：`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/workflow-data-registry/run-record.md` | 执行记录 |

#### 执行动作

1. 运行 lint/typecheck/build。
2. 执行桌面和移动端浏览器检查。
3. 记录验证结果。

#### 验收标准

1. Run Record 存在。
2. 验证结果真实记录。

#### 验证方式

1. 文件检查。
2. 文档审查。

#### 风险

1. 无。

## 4. 执行顺序

1. T1
2. T2
3. T3

