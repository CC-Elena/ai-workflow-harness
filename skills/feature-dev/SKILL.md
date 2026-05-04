---
name: feature-dev
description: 功能开发完整工作流，从 PRD 到代码。用于功能开发、需求开发、PRD、产品需求时。
version: 0.1.0
dependencies: [project, frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js feature-dev` -->

# 功能开发工作流

将产品需求文档转化为可运行代码的完整流程。

> 核心理念：结构化 PRD → 可评分任务 → 迭代实现与回归守护
> 
> **示例**：[prd.yaml](./references/sample-prd.yaml) | [tasks.md](./references/sample-tasks.md)

> **前置**：[project](../project/SKILL.md) | [frontend-dev](../frontend-dev/SKILL.md)

---

## 流程概览

```
action-extract → action-split → action-implement → action-verify
       ↓              ↓               ↓                 ↓
   prd.yaml       tasks.md       代码+progress      report.md
```

---

## 子流程

- **步骤 1**：`action-extract.md` → 产出 `prd.yaml`
- **步骤 2**：`action-split.md` → 产出 `tasks.md`
- **步骤 3**：`action-implement.md` → 产出代码 + `progress.md`（参考 `skills/frontend-dev/SKILL.md`）
- **步骤 4**：`action-verify.md` → 产出 `report.md`（参考 `skills/code-review/SKILL.md`）

---

## 过程文件

每个功能创建独立文件夹：

```
docs/prd-tasks/{功能名}/
├── prd.yaml      # 步骤一产出
├── tasks.md      # 步骤二产出
├── progress.md   # 步骤三产出
└── report.md     # 步骤四产出
```

---

## 使用方式

### 分阶段执行（推荐）

```
# 步骤一
请按照 skills/feature-dev/action-extract.md 提取 PRD：[PRD 链接]

# 人工校验 prd.yaml 后

# 步骤二
请按照 skills/feature-dev/action-split.md 拆分任务

# 步骤三
请按照 skills/feature-dev/action-implement.md 实现代码

# 步骤四
请按照 skills/feature-dev/action-verify.md 生成验收报告
```
