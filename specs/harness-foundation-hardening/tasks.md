# Tasks: Harness 基础设施强化

## 1. 任务列表

| ID | 任务 | 输入 | 影响范围 | 验收 | 状态 |
|----|------|------|----------|------|------|
| T1 | 新增 GitHub Actions CI | 现有 npm scripts | `.github/workflows/ci.yml` | CI 包含 lint、typecheck、build、harness gate | Done |
| T2 | 增强 harness check | Run Record 与 Evaluation 模板 | `scripts/check-harness-run.mjs` | 可检查结构、扩展资产和 RCA 引用 | Done |
| T3 | 补失败样本 | RCA 模板和评估框架 | `specs/failure-rca-sample/*` | Failed 样本引用证据和 RCA | Done |
| T4 | 补接入文档 | README 和迁移指南 | `docs/quick-start.md`、`docs/adoption-checklist.md` | 文档说明接入和验收路径 | Done |
| T5 | 增强文件工作台 | 现有 `/files` 页面 | `app/files/file-workspace.tsx`、`app/globals.css` | 分类概览可筛选 | Done |
| T6 | 登记新增资产 | 工作台数据模块 | `app/workflow-data.ts` | 新资产可检索，指标同步 | Done |
| T7 | 记录本次执行 | 本次实际 diff | `specs/harness-foundation-hardening/*` | Run Record、Verification、Evaluation 齐全 | Done |
