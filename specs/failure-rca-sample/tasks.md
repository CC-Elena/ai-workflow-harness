# Tasks: 失败路径与 RCA 样本

## 1. 任务列表

| ID | 任务 | 输入 | 影响范围 | 验收 | 状态 |
|----|------|------|----------|------|------|
| T1 | 新增失败样本文档 | PRD 与轻量记录 | `specs/failure-rca-sample/*` | 文件齐全 | Done |
| T2 | 新增失败证据 | 模拟验证失败说明 | `specs/failure-rca-sample/evidence/mock-verification-failure.log` | 证据文件存在 | Done |
| T3 | 新增 RCA | 失败现象与根因 | `specs/failure-rca-sample/rca.md` | RCA 引用存在 | Done |
| T4 | 新增评估摘要 | 失败样本结论 | `specs/failure-rca-sample/evaluation-summary.md` | 评估说明可读 | Done |
