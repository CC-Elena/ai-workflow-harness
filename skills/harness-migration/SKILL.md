---
name: harness-migration
description: 帮助当前项目接入 AI Workflow Harness 规范。当用户要求“迁移 harness”、“初始化 AI 工作流”或“让这个代码库支持 harness”时触发此 Skill。
version: 0.1.0
---

# Harness Migration Skill

本 Skill 旨在协助 AI Agent 为一个全新的目标代码库接入 AI Workflow Harness 体系。

## 🎯 迁移目标

将标准的 AI Workflow Harness（包含标准化工作流、模板和 Prompt）从「源项目」平移到「当前项目」，并为当前项目生成专属的“工程宪法”配置。

## 📋 执行步骤

作为 AI Agent，请严格按照以下步骤顺序与用户交互并执行操作：

### Phase 1: 获取源仓库文件
由于本 Skill 运行在目标项目中，你需要源 Harness 仓库的文件。
利用系统命令将源仓库 clone 到一个临时目录：
```bash
rm -rf /tmp/ai-workflow-harness
git clone https://github.com/CC-Elena/ai-workflow-harness.git /tmp/ai-workflow-harness
```

### Phase 2: 初始化目录与复制公共资产
从临时目录 `/tmp/ai-workflow-harness`，利用系统命令完成以下拷贝操作：

1. **创建基础目录：**
   ```bash
   mkdir -p .ai/{context,evals/runs,evals/rca,prompts,templates,workflows}
   mkdir -p skills/{project,auto-rules}
   mkdir -p specs
   ```

2. **复制完全通用资产：**
   只复制无业务状态的核心资产，**严禁复制** `.ai/context/project-map.md` 或 `specs` 目录下具体的业务记录。
   执行拷贝：
   ```bash
   cp -R /tmp/ai-workflow-harness/.ai/workflows/* .ai/workflows/
   cp -R /tmp/ai-workflow-harness/.ai/templates/* .ai/templates/
   cp -R /tmp/ai-workflow-harness/.ai/prompts/* .ai/prompts/
   ```

3. **按需迁移 Skills：**
   询问用户：“除了通用的 `code-review`, `workflow-assets` 外，您需要拷贝前端（`frontend-dev`）还是后端相关的 Skill？”
   根据用户回答从 `/tmp/ai-workflow-harness/skills` 中拉取对应的核心 Skill 文件夹。

4. **清理临时文件：**
   ```bash
   rm -rf /tmp/ai-workflow-harness
   ```

### Phase 3: 重建本项目的“宪法” (核心任务)
这一步绝对不能直接 Copy，必须由你根据当前目标仓库的实际情况**实时生成**。

1. **分析当前项目结构**：读取当前项目的 `package.json`（或 equivalent）、目录结构，判断技术栈。
2. **生成 `skills/project/SKILL.md`**：
   - 使用网络读取 `https://raw.githubusercontent.com/CC-Elena/ai-workflow-harness/main/skills/harness-migration/templates/project-skill.md` 作为模板。
   - 结合你的分析，生成本仓库专属的 `project/SKILL.md`（包含专属的启动命令、代码规范等）。
3. **生成 `.ai/context/project-map.md`**：
   - 为本项目生成一份简要的目录结构说明地图。
4. **生成 `.ai/context/common-patterns.md`**：
   - 提取 1-2 个本项目现有的典型代码片段（如路由、组件或接口）作为范例。
5. **初始化 `.ai/context/skill-routing.md`**：
   - 将当前项目拥有的 Skills 与开发场景建立映射关系。

### Phase 4: 验证闭环
环境初始化完毕后，引导用户进行第一次验证测试：
1. 请建议用户构思一个小需求（例如：“修改 README 中的一句描述”）。
2. 让用户体验：要求你（AI）读取 `.ai/prompts/generate-spec.md` 生成 Spec，进而体验完整的 harness SDD 闭环。

---

> **给 Agent 的提示：**
> 切记，`project/SKILL.md` 和 `.ai/context/project-map.md` 是目标仓库的“基因”，决定了后续 AI 在该项目中操作的安全性和规范性。在 Phase 3 中，务必花费足够的精力去理解目标仓库并高质量地生成这些配置。
