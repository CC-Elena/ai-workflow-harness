---
name: task-verify
description: 验收已实现的任务并生成报告
argument-hint: [progress.md 路径]
---

# 步骤四：任务验收

验收已实现的任务，生成验收报告。

## 前置条件

- 已完成 `skills/feature-dev/action-implement.md`
- 所有任务在 `progress.md` 标记完成

## 验收检查

> 按 `skills/code-review/SKILL.md` 检查清单逐项验证

### 必做项

- [ ] 构建成功：`npm run build`
- [ ] 功能可正常使用
- [ ] 验收条款全部满足

### 可选项（如有 UI 变更）

> 执行 `skills/test/action-gen-checklist.md` 生成测试清单
> 再用 `skills/test/action-perform-tests.md` 进行 AI 浏览器测试

## 过程指标

记录以下指标用于后续分析：
- AI 对话轮次
- 新增/修改文件数
- 构建时间
- 首次成功（pass@1）

## 产出

创建 `docs/prd-tasks/{功能名}/report.md`

## 报告模板

```markdown
# [功能名称] - 验收报告

## 概览

- **PRD 来源**：[链接]
- **完成状态**：✅ 已完成 | ⚠️ 部分完成
- **完成时间**：YYYY-MM-DD

## 过程指标

| 指标 | 值 |
|------|-----|
| AI 对话轮次 | X |
| 新增文件数 | X |
| 修改文件数 | X |
| 构建时间 | Xs |
| 首次成功 | ✅/❌ |

## 验收结果

| 验收条件 | 结果 |
|----------|------|
| 条件 1 | ✅ |
| 构建验证 | ✅ |

## 实现文件

- `src/xxx` - 新增
- `src/yyy` - 修改

## 待优化

- 优化项 1
```

## 完成标志

- [ ] 已创建 `report.md`
- [ ] 过程指标已记录
- [ ] 人工确认验收通过
