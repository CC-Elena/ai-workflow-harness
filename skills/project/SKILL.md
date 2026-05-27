---
name: project
description: AI Workflow Harness 项目上下文和规范
version: 0.1.0
---

# AI Workflow Harness 协作规范

本文件是所有 AI Coding 工具的全局上下文和规范。

> **重要**: AI 工具在执行任务时，应先读取 `.ai/workflows/rule-loading-policy.md` 和 `.ai/context/skill-routing-minimal.md`，再按需读取相关 Skill。
> **提示**: 只有失败复盘、规则反哺、高风险变更或明确避坑检查时，才读取 `skills/auto-rules/SKILL.md` 和 `skills/auto-rules/RULES.md`。

---

> [!CAUTION]
> ## ⚠️ Skill 调用追踪（必须执行）
>
> **每次读取并执行任何 skill 文件时，如 tracking 脚本存在且可运行，应立即运行追踪脚本：**
>
> ```bash
> node scripts/track-skill.js <skill-name> --status=completed
> ```
>
> 这是推荐要求，用于统计 skill 使用效果。若脚本不存在或当前环境不允许运行，应在 Run Record 中记录已使用的主 Skill / 辅助 Skill。

---

## 🔍 Skill 自动触发规则

**当用户请求匹配某个 skill 的 `description` 中的关键词时，必须自动触发该 skill。**

> 触发关键词融入在各 skill 的 frontmatter `description` 字段中，AI 应根据描述内容自动识别并触发相应的 skill。

**可触发的 Skill 列表**

- **code-review** - 代码审查
- **frontend-dev** - 前端开发
- **feature-dev** - 功能开发工作流
- **component-reuse** - 组件复用查询
- **ui-fidelity** - UI 还原度校验
- **screenshot-based-dev** - 截图开发
- **test** - 测试流程

- **skeleton** - 骨架屏开发

> [!IMPORTANT]
> 当用户请求匹配某个 skill 的场景时，按 `.ai/context/skill-routing-minimal.md` 选择主 Skill / 辅助 Skill：
> 1. 如 tracking 脚本存在且可运行，运行 `node scripts/track-skill.js <skill-name>`
> 2. 读取 `skills/<skill-name>/SKILL.md`
> 3. 按 skill 指引执行任务

---

## 技术栈

- **框架**：Next.js 15 App Router
- **运行时**：React 19 + TypeScript
- **样式**：全局 CSS，入口为 `app/globals.css`
- **数据来源**：静态 TypeScript 数据模块，主要入口为 `app/workflow-data.ts` 和 `app/files/file-data.ts`
- **API**：Next.js Route Handler，例如 `app/api/files/content/route.ts`
- **代码规范**：ESLint 9 + `eslint-config-next`
- **包管理**：npm，锁文件为 `package-lock.json`

---

## 目录结构


## 核心规范

### 组件规范

- 页面入口位于 `app/**/page.tsx`。
- 交互组件使用客户端组件，并在文件顶部声明 `'use client';`。
- 共享工作流数据优先集中维护在 `app/workflow-data.ts`。
- 文件浏览器数据优先集中维护在 `app/files/file-data.ts`。
- 新增页面或 API 时遵循 Next.js App Router 目录约定。

### 样式规范

- 全局样式集中维护在 `app/globals.css`。
- 优先复用已有 class、布局节奏和响应式断点。
- 不引入新的 UI 库或图标库，除非需求明确且经过确认。

### 文案规范

- 当前仓库没有接入国际化系统。
- 文案可以直接写中文或英文，但同一页面内保持语气和命名一致。

---

## 核心模块限制

以下模块不得随意修改，如需修改必须标注"核心模块变更"：

- `scripts/check-harness-run.mjs` - Harness 门禁逻辑
- `.ai/templates/` - 工作流模板，会影响后续所有需求记录
- `.ai/workflows/` - 工作流协议
- `skills/project/SKILL.md` - 项目级最高规则
- `app/api/files/content/route.ts` - 文件读取白名单和安全边界

---

## 常用命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run harness:check -- specs/{feature}
```

---

## AI 协作流程

1. **中等及以上复杂度需求**：先给出设计方案，待确认后再编码
2. **信息不完整时**：先明确假设，列出候选方案及利弊
3. **验证**：修改后按风险运行 `npm run lint`、`npm run typecheck`、`npm run build` 或 `npm run harness:check -- specs/{feature}`；无法运行时必须记录原因和风险
4. **规则文件修改**：修改 `skills/` 目录下的文件，禁止直接修改同步目标文件。提交后会自动同步到各 AI 工具规则目录
