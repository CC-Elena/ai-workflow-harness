# AI Workflow Harness 迁移指南

AI Workflow Harness 的核心设计理念是**“仓库原生”**。这意味着它不依赖特定的外部平台，而是作为一组标准化文件存在于你的代码库中。

要将这套 Harness 迁移到其他团队或项目中，你需要区分哪些是“公共通用资产”，哪些是“项目特定资产”。

---

## 1. 资产区分：公共可用 vs 业务特定

### 🟢 1.1 完全公共可用（直接 Copy 过去即可使用）

这些资产是通用的工作流协议、模板和思维链提示词，与具体的业务代码无关，可以直接复用。

*   **`.ai/workflows/` (工作流协议)**：如 `planner-executor.md`, `verification.md`, `end-to-end-lifecycle.md`。它们定义了 AI 在任何项目中应该遵循的做事标准。
*   **`.ai/templates/` (标准化模板)**：如 `spec-template.md`, `task-template.md`, `run-record-template.md`。
*   **`.ai/prompts/` (标准 Prompt)**：如 `generate-spec.md`, `generate-rca.md`。
*   **部分通用 `skills/`**：
    *   `skills/code-review/`
    *   `skills/feature-dev/`
    *   `skills/workflow-assets/`
    *   `skills/skill-creator/`

### 🟡 1.2 需要轻度调整（保留骨架，修改细节）

这些资产提供了很好的范例，但需要根据目标代码库的技术栈和规范进行调整。

*   **`.ai/context/common-patterns.md`**：你需要把当前项目的 React/Next.js 规范，替换为目标项目的技术规范（例如 Vue, Java, Go 等）。
*   **`.ai/context/skill-routing.md`**：根据目标项目拥有的 Skill 进行路由映射修改。
*   **技术栈相关的 `skills/`**：
    *   `skills/frontend-dev/` （如果是后端项目，需要改成 `backend-dev`）
    *   `skills/test/` （测试框架的命令需要修改）
*   **`app/` (可视化 Dashboard 目录)**：如果你希望在目标项目也有一个这样的看板，你需要迁移 Next.js 相关代码，并且需要把 `workflow-data.ts` 替换为目标项目的实际资产。

### 🔴 1.3 完全业务特定（不要 Copy，需要在新项目中重建）

这些是当前业务的实际产出和环境特有的上下文。

*   **`.ai/context/project-map.md`**：记录了当前代码库的目录结构和受保护的模块，必须在新项目中重新编写。
*   **`skills/project/SKILL.md`**：作为整个项目的“最高宪法”，记录了特定项目的安装命令、启动命令、全局架构和严格限制。必须在新项目重写。
*   **`specs/`**：包含当前项目真实落地的需求和评估记录（如 `asset-catalog-evaluation-filter/`），不需要迁移到新项目，但可以挑一两个作为 Example 供新项目的 AI 参考。

---

## 2. 迁移到其他代码库的具体步骤

如果你要在另一个新项目（假设叫 `my-new-project`）中落地这套 Harness，请按以下 5 步执行：

### 第一步：初始化核心目录结构
在新项目的根目录下，复制公共可用的核心框架：
```bash
# 在 my-new-project 中创建目录
mkdir -p .ai/{context,evals/runs,evals/rca,prompts,templates,workflows}
mkdir -p skills/{project,auto-rules}
mkdir -p specs
```
然后将原项目中的 `.ai/workflows/`, `.ai/templates/`, `.ai/prompts/` 完整复制过来。

### 第二步：编写新项目的“宪法” (P0 任务)
这是让 AI 认识新项目的最关键一步。
1.  **创建 `skills/project/SKILL.md`**：写明新项目的技术栈、安装命令（如 `npm run dev` 还是 `mvn spring-boot:run`）、代码规范限制、以及最重要的：**AI 必须先读哪些文件**。
2.  **创建 `.ai/context/project-map.md`**：告诉 AI 这个新项目的目录是怎么划分的，哪些是核心路由/模块，绝对不能碰。
3.  **创建 `.ai/context/common-patterns.md`**：给 AI 一些现成的代码示例，例如“本项目如何发网络请求”、“如何写组件”。

### 第三步：挑选并安装需要的 Skills
不要一次性把所有 Skill 搬过去，按需迁移：
1.  如果新项目是前端，复制 `frontend-dev` 和 `ui-fidelity`。
2.  如果不涉及发版复盘，可以先不复制 `workflow-assets`。
3.  确保修改 `.ai/context/skill-routing.md`，让它准确反映新项目拥有的 Skills。

### 第四步：试运行第一个需求
在新项目中找一个边缘、低风险的小需求（例如：改一个文案，加一个字段）：
1.  要求 AI 读取 `.ai/prompts/generate-spec.md` 生成 Spec。
2.  要求 AI 根据 Spec 生成 Task。
3.  要求 AI 执行，并生成 `Run Record`。
通过这个闭环，观察新项目的 `project-map` 或 `common-patterns` 是否有遗漏，如果有，立刻补充进去。

### 第五步：（可选）迁移 Dashboard
如果你希望新项目也有 `http://localhost:3000/files` 这样的可视化面板：
1.  需要新项目支持 Next.js App Router 或你将其改写为新项目支持的路由（如 Vue Router / React Router）。
2.  迁移 `app/` 目录和 `globals.css`。
3.  清除 `app/workflow-data.ts` 中的旧数据，并编写脚本自动扫描新项目的 `.ai` 目录，或者手动维护资产列表。
