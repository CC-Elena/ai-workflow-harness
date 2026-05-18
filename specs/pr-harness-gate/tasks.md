# Tasks: PR 级 Harness Gate

## 1. 任务列表

| ID | 任务 | 输入 | 输出 | 验收标准 | 状态 |
|----|------|------|------|----------|------|
| T1 | 扩展 harness check CLI | 现有脚本、优化计划 | `scripts/check-harness-run.mjs` | 支持单 feature 与 `--changed` 两种模式 | Done |
| T2 | 实现 PR diff 覆盖聚合 | `base...head` changed files | PR 模式覆盖检查 | 所有 changed files 必须被候选 Run Record 覆盖 | Done |
| T3 | 更新 CI | 现有 workflow | `.github/workflows/ci.yml` | PR 事件使用真实 diff 门禁，push 保留样例回归 | Done |
| T4 | 增加脚本级测试 | 新命令接口 | `scripts/check-harness-run.test.mjs` | 覆盖无记录、成功覆盖、多 feature 和旧命令兼容 | Done |
| T5 | 更新文档 | README、Quick Start、验证协议 | 文档说明 | 明确 PR 模式和固定样例边界 | Done |
| T6 | 记录与验证本次交付 | 本次 diff | `specs/pr-harness-gate/*` | Run Record、Verification、Evaluation 和证据齐全 | Done |
