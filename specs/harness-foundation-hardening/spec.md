# Feature Spec: Harness 基础设施强化

## 1. 基本信息

- 需求名称：Harness 基础设施强化
- 需求来源：用户要求按顺序完成无具体业务需求前的五项完善
- 负责人：Codex
- 创建日期：2026-05-09
- 状态：Done

## 2. 背景与目标

当前项目已经具备轻量 MVP 和成功试点。为了进入更稳定的受控推广阶段，需要补齐 CI、结构门禁、失败/RCA 样本、迁移接入文档和工作台浏览增强。

## 3. 范围

### 3.1 本次包含

1. 新增 GitHub Actions CI。
2. 增强 `scripts/check-harness-run.mjs` 对结构、扩展资产和 RCA 的检查。
3. 新增 `specs/failure-rca-sample/` 失败路径样本。
4. 新增 `docs/quick-start.md` 和 `docs/adoption-checklist.md`。
5. 在 `/files` 页面增加分类概览入口。
6. 更新 `app/workflow-data.ts`，让新增资产可在工作台检索。

### 3.2 本次不包含

1. 不新增运行时依赖。
2. 不实现自动文件扫描。
3. 不接入 MCP、数据库或独立平台。
4. 不修改用户已有 README 和开发计划状态描述。

## 4. 用户场景

| 场景 | 用户行为 | 期望结果 |
|------|----------|----------|
| 查看 CI | 用户打开 GitHub Actions | 能看到 lint、typecheck、build 和 Harness Gate |
| 运行门禁 | 用户执行 harness check | 能检查结构、证据和 RCA 引用 |
| 接入新项目 | 用户阅读 Quick Start | 能按步骤迁移资产并跑通首个需求 |
| 浏览资产 | 用户打开 `/files` | 能按分类快速理解资产分布 |

## 5. 功能要求

| 编号 | 功能点 | 说明 | 优先级 |
|------|--------|------|--------|
| F1 | CI | 使用 npm ci、lint、typecheck、build、harness gate | P0 |
| F2 | 结构门禁 | 检查 Spec、Tasks、Evaluation Summary、RCA 等结构 | P0 |
| F3 | 失败样本 | 提供 Failed Run Record、RCA 和失败证据 | P0 |
| F4 | 接入文档 | 提供 Quick Start 和验收清单 | P1 |
| F5 | 工作台增强 | 文件浏览器展示分类统计并支持点击筛选 | P1 |

## 6. 页面与组件影响

| 类型 | 名称或路径 | 变更说明 |
|------|------------|----------|
| 页面 | `app/files/file-workspace.tsx` | 新增分类概览 |
| 样式 | `app/globals.css` | 新增分类概览样式 |
| 数据 | `app/workflow-data.ts` | 登记新增资产与任务状态 |
| 脚本 | `scripts/check-harness-run.mjs` | 增强结构校验 |

## 7. 数据与接口

| 接口或数据源 | 请求/输入 | 响应/输出 | 约束 |
|--------------|-----------|-----------|------|
| `/api/files/content` | 资产路径 | 文件内容 | 仍只允许 `assets` 白名单路径 |

## 8. 权限与异常场景

| 场景 | 处理方式 |
|------|----------|
| 失败样本 | 保留 Failed 状态并引用 RCA |
| 旧记录格式 | CI 使用新样本作为稳定门禁目标 |
| 用户已有文档修改 | 不覆盖，仅在本次 Run Record 中标注范围外 |

## 9. 设计与交互约束

1. 是否有设计稿：否。
2. 是否需要截图验收：需要本地构建和页面可用性检查。
3. 样式和组件约束：复用现有 `/files` 页面视觉语言。
4. 国际化要求：延续现有中英文混排。

## 10. 工程约束

1. 不新增依赖。
2. 不放开文件预览 API 白名单。
3. CI 必须使用 `npm ci`。
4. 新增门禁规则不能要求旧临时截图路径在 CI 中存在。

## 11. 验收标准

| 编号 | 验收项 | 验收方式 |
|------|--------|----------|
| A1 | CI 文件存在且包含四类验证 | 人工检查 `.github/workflows/ci.yml` |
| A2 | `harness:check` 能通过失败样本 | `npm run harness:check -- specs/failure-rca-sample` |
| A3 | 新文档可被工作台检索 | `app/workflow-data.ts` 登记 |
| A4 | `/files` 分类概览可编译 | `npm run build` |
| A5 | 本次变更有 Run Record 和证据 | `npm run harness:check -- specs/harness-foundation-hardening` |

## 12. 风险与待确认问题

| 类型 | 说明 | 处理方式 |
|------|------|----------|
| 风险 | 旧样本格式与新门禁规则不完全一致 | CI 先使用新失败样本，旧样本后续单独迁移 |
| 风险 | 当前工作区存在用户已有文档修改 | 不回滚，在 Diff 覆盖表中标注范围外 |
| 待确认 | 是否需要后续自动生成资产索引 | 另开需求 |
