# AI 执行评估目录

本目录用于记录 AI 工作流的执行效果和失败复盘。

## 1. 目录说明

```text
.ai/evals/
├── runs/        # 跨需求执行记录归档
└── rca/         # RCA 复盘归档
```

如果某次执行属于具体需求，优先把 `run-record.md` 和 `rca.md` 放在：

```text
specs/{feature-name}/
```

如果是跨需求复盘或阶段性统计，则归档到 `.ai/evals/`。

## 2. 记录时机

需要记录 Run Record 的情况：

1. Codex 完成一次需求开发。
2. Codex 完成一次较大的重构或修复。
3. Codex 执行了 Planner-Executor 完整流程。

需要记录 RCA 的情况：

1. 验证失败且由本次修改引入。
2. 人工大幅修改 AI 产物。
3. Review 发现系统性问题。
4. 同类问题多次出现。
5. 线上或联调暴露出 AI 工作流缺陷。

## 3. 模板

1. Run Record：`.ai/templates/run-record-template.md`
2. RCA：`.ai/templates/rca-template.md`

## 4. Run Record 最小示例

```markdown
# Run Record: feature-name

## 1. 基本信息

- 需求名称：feature-name
- Spec 文件：specs/feature-name/spec.md
- Task 文件：specs/feature-name/tasks.md
- 执行日期：2026-05-02
- 执行工具：Codex
- 状态：Success

## 3. 执行摘要

完成 Spec 生成、任务拆解和文档更新。本次未修改业务代码。

## 4. 任务结果

| Task ID | 结果 | 修改文件 | 验证结果 | 备注 |
|---------|------|----------|----------|------|
| T1 | Done | specs/feature-name/spec.md | Pass | 文档审查 |

## 6. 验证记录

| 验证项 | 命令或方式 | 结果 | 说明 |
|--------|------------|------|------|
| 文件检查 | `find specs/feature-name -type f` | Pass | 文件存在 |
| QA | N/A | Skipped | 未修改业务代码 |
```

## 5. RCA 最小示例

```markdown
# RCA: feature-name

## 1. 基本信息

- 需求名称：feature-name
- 关联 Run Record：specs/feature-name/run-record.md
- 触发原因：验证失败

## 2. 问题现象

执行后 `pnpm run qa` 失败，错误来自本次新增组件的国际化文案。

## 4. 根因分类

1. Skill 约束不完整。
2. 代码生成不符合国际化规范。

## 7. 反哺项

| 类型 | 文件 | 建议 |
|------|------|------|
| Skill | skills/frontend-dev/SKILL.md | 强化新增文案必须同步语言资源 |
```

## 6. 常见错误

1. 只写“已完成”，不记录修改文件和验证结果。
2. 验证命令没有运行，却写成“通过”。
3. AI 产物被人工大幅修改后，没有记录人工修改原因。
4. RCA 只描述现象，没有给出可反哺的文件和动作。
5. 把一次性小失误泛化成长期规则，导致规则膨胀。
