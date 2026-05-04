# AI Skills 索引

本目录包含可被多个 AI 编辑器共享的 skill。

> 最后同步: 2026-01-29

---

## Skill 列表

- **auto-rules** (v0.1.0) - 自愈免疫系统。既是项目避坑指南（Read），也是尸检根因分析专家（Write）。
- **code-review** (v0.1.0) - 代码审查专家，按 P0/P1/P2 清单逐项检查。用于 CR、code review、代码审查、代码评审时。 📚
- **component-reuse** (v0.1.0) - 组件与 Hook 复用规范，创建新组件前必读。用于组件复用、查找已有组件、新建组件前的检查。 📚
- **doc-coauthoring** (v0.0.0) - 引导用户完成结构化的文档共创工作流。当用户想要编写文档、提案、技术规范、决策文档或类似结构化内容时使用。此工作流帮助用户高效地传递上下文、通过迭代完善内容，并验证文档对读者是否有效。当用户提到写文档、创建提案、起草规范或类似文档任务时触发。
- **feature-dev** (v0.1.0) - 功能开发完整工作流，从 PRD 到代码。用于功能开发、需求开发、PRD、产品需求时。
- **frontend-design** (v0.0.0) - 创建独特、生产级且具有高设计质量的前端界面。当用户要求构建 Web 组件、页面、制品、海报或应用程序（例如网站、着陆页、仪表板、React 组件、HTML/CSS 布局，或美化任何 Web UI）时使用此 Skill。生成具有创造性、打磨精良的代码和 UI 设计，避免通用的 AI 美学。
- **frontend-dev** (v0.1.0) - 前端开发规范。用于前端开发、写代码、编码、实现功能、新增组件时；按最小 Skill 路由命中后读取。 📚
- **project** (v0.1.0) - AI Workflow Harness 项目上下文和规范
- **screenshot-based-dev** (v0.1.0) - 基于截图的功能开发规范，从设计稿到代码的 SOP。用于截图开发、按设计稿实现。
- **skeleton** (v0.1.0) - 为页面/组件创建或更新骨架屏。用于骨架屏、skeleton、加载占位、首屏优化时。
- **skill-creator** (v0.1.0) - 创建高效 Skill 的指南。当用户想要创建新的 Skill（或更新现有 Skill）以扩展 AI 的专业知识、工作流或工具集成能力时，请使用此 Skill。
- **test** (v0.1.0) - 测试流程，支持 E2E 脚本或 AI 浏览器测试。用于测试、E2E、端到端、自动化测试时。
- **ui-fidelity** (v0.1.0) - UI 还原度校验专家，对比设计稿与实现的差异。用于 UI 还原、还原度、对比设计稿、样式检查、视觉走查时。 📚
- **workflow-assets** (v0.1.0) - 维护 AI Workflow Harness 的仓库资产。用于更新 Run Record、RCA、验证记录、上下文索引、Skill 路由、试点复盘和工作流文档时。

---

## 目录结构

```
skills/
├── auto-rules/
│   ├── RULES.md
│   └── SKILL.md
├── code-review/
│   ├── REFERENCE.md
│   └── SKILL.md
├── component-reuse/
│   ├── REFERENCE.md
│   └── SKILL.md
├── doc-coauthoring/
│   └── SKILL.md
├── feature-dev/
│   ├── SKILL.md
│   ├── action-extract.md
│   ├── action-implement.md
│   ├── action-split.md
│   └── action-verify.md
├── frontend-design/
│   └── SKILL.md
├── frontend-dev/
│   ├── REFERENCE.md
│   └── SKILL.md
├── project/
│   └── SKILL.md
├── screenshot-based-dev/
│   └── SKILL.md
├── skeleton/
│   └── SKILL.md
├── skill-creator/
│   └── SKILL.md
├── test/
│   ├── SKILL.md
│   ├── action-gen-checklist.md
│   ├── action-gen-e2e-script.md
│   └── action-perform-tests.md
├── ui-fidelity/
│   ├── REFERENCE.md
│   └── SKILL.md
├── workflow-assets/
│   └── SKILL.md
```

---

## 使用方式

### AI 闭环研发工作流

本仓库已新增 `.ai/` 工作流资产，用于把现有 Skills 串成 Spec-driven 的闭环研发流程。

- 工作流入口：`.ai/workflows/README.md`
- Planner-Executor 协议：`.ai/workflows/planner-executor.md`
- 验证协议：`.ai/workflows/verification.md`
- Skills 路由：`.ai/context/skill-routing.md`
- Skill 缺口映射：`.ai/context/skill-gap-map.md`
- Spec 模板：`.ai/templates/spec-template.md`
- 验证记录模板：`.ai/templates/verification-record-template.md`

推荐流程：

```
PRD/需求描述 → 生成 Spec → Planner 拆任务 → Executor 执行 → 验证 → Run Record/RCA
```

### 必读 Skill

- **默认策略**：先读取 `.ai/context/skill-routing-minimal.md`，只选择 1 个主 Skill，最多 1 个辅助 Skill。
- **前端代码编写/修改**：命中前端场景时读取 `skills/frontend-dev/SKILL.md`。
- **工作流资产维护**：命中工作流资产场景时读取 `skills/workflow-assets/SKILL.md`。
- **失败复盘 / 规则反哺**：触发 RCA 或学习闭环时读取 `skills/auto-rules/SKILL.md`。

### 直接引用

```
请按照 skills/code-review/SKILL.md 审查这个 PR
请按照 skills/feature-dev/SKILL.md 实现以下 PRD
```

---

## SKILL.md 格式

符合 Claude 官方标准：

```yaml
---
name: skill-name          # 必需：小写+连字符，≤64字符
description: 简短描述      # 必需：一句话，≤1024字符
version: 1.0.0            # 必需：语义化版本号
---

# Skill 标题

详细指令内容...
```

---

## 编辑器兼容性

- **Cursor** - `.cursor/rules/project.mdc`
- **Antigravity** - `.agent/workflows/README.md`
- **Trae** - `.trae/rules/project_rules.md`
- **灵码** - `.lingma/rules/project.md`
- **Augment** - 直接读取 `skills/project/SKILL.md`

---

## 命令

```bash
pnpm lint:skills   # 校验格式
pnpm sync:skills   # 同步索引
```
