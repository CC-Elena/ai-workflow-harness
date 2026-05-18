---
name: task-implement
description: 按任务列表逐个实现代码
argument-hint: [tasks.md 路径]
---

# 步骤三：任务实现

按 `tasks.md` 逐个实现开发任务。

## 前置条件

- 已完成 `skills/feature-dev/action-split.md`，存在 `tasks.md`

## 编码规范

> 遵循 `skills/frontend-dev/SKILL.md`

## 执行流程

```
领取任务 → 复用检查 → 编码实现 → 本地验收 → 更新进度 → 下一任务
```

## 每个任务的执行步骤

1. **理解任务**：阅读描述和验收条款
2. **复用检查**：搜索现有代码，确认无可复用后再新建
3. **编码实现**：按 `skills/frontend-dev/SKILL.md` 规范编码
4. **自检验收**：运行 `npm run build` 确保构建通过
5. **更新进度**：在 `progress.md` 标记任务状态

## 进度更新

每个任务更新 `progress.md`：

```markdown
### T1 - 任务名称
- 状态：⬜待开始 | 🔄进行中 | ✅已完成 | ❌已阻塞
- 开始：HH:MM
- 完成：HH:MM
- 涉及文件：`src/xxx`（新增/修改）
```

## 阻塞处理

- **API 未就绪** → Mock 数据先行
- **设计稿缺失** → 询问用户
- **需求不清** → 列出问题请用户确认
- **验收失败** → 分析根因（实现/验收定义）

## 产出

- 代码文件
- 更新 `progress.md`

## 完成标志

- [ ] 所有任务标记 ✅
- [ ] 构建验证通过
- [ ] 人工确认代码质量

## 下一步

→ `skills/feature-dev/action-verify.md`
