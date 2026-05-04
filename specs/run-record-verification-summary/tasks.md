# Task List: run-record-verification-summary

## 1. Spec 来源

- Spec 文件：`specs/run-record-verification-summary/spec.md`
- 规划日期：2026-05-03
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 扩展 RunDraft 数据结构和旧草稿兼容 | `app/workflow-workspace.tsx` | 无 | Done |
| T2 | 增加验证摘要表单字段 | `app/workflow-workspace.tsx` | T1 | Done |
| T3 | 验证并记录执行结果 | `specs/run-record-verification-summary/run-record.md` | T1-T2 | Done |

## 3. 任务详情

### T1. 扩展 RunDraft 数据结构和旧草稿兼容

#### 目标

让草稿数据支持验证摘要，并兼容旧 localStorage 数据。

#### 输入

1. Spec 相关段落：F1、F3。
2. 必读上下文：`app/workflow-workspace.tsx`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-workspace.tsx` | 修改类型、默认值和读取逻辑 |

#### 执行动作

1. 为 `RunDraft` 增加 `verificationSummary`。
2. 更新 `initialDraft`。
3. localStorage 读取时合并默认值。

#### 验收标准

1. 旧草稿不报错。
2. 新字段有默认值。

#### 验证方式

1. 命令：`npm run lint`、`npm run build`
2. 手工检查：保存刷新。

#### 风险

1. 异常 JSON 仍按现有逻辑清理。

### T2. 增加验证摘要表单字段

#### 目标

在 Run Record 草稿表单中展示并编辑验证摘要。

#### 输入

1. Spec 相关段落：F2。
2. 必读上下文：`app/workflow-workspace.tsx`、`app/globals.css`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/workflow-workspace.tsx` | 新增 textarea |

#### 执行动作

1. 在执行摘要后增加验证摘要输入区。
2. 复用现有表单样式。
3. 保存时沿用原有 `saveDraft`。

#### 验收标准

1. 字段展示正常。
2. 字段内容可保存。

#### 验证方式

1. 浏览器检查。
2. `npm run build`。

#### 风险

1. 侧栏高度增加，移动端需要确认无遮挡。

### T3. 验证并记录执行结果

#### 目标

记录 P2 的执行与验证结果。

#### 输入

1. Spec 相关段落：A1-A4。
2. 必读上下文：`.ai/templates/run-record-template.md`。
3. 必读 Skills：`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/run-record-verification-summary/run-record.md` | 执行记录 |

#### 执行动作

1. 运行验证命令。
2. 记录修改文件。
3. 记录截图验证结果。

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

