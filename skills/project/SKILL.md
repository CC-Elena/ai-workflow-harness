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

- **框架**：Next.js 15 (App Router) + React 19
- **语言**：TypeScript 5
- **代码规范**：ESLint 9 (eslint-config-next) + Husky
- **包管理**：npm

---

## 目录结构


## 核心规范

### 组件规范

- **命名**：大驼峰
- **结构**：主要采用 Next.js App Router 结构 (`app/` 目录下存放页面，`components/` 存放复用组件)
- **语言**：统一使用 TypeScript (`*.ts`, `*.tsx`)
- **路径**：使用 `@/` 别名

---

## 核心模块限制

以下模块不得随意修改，如需修改必须标注"核心模块变更"：

- `src/app/` - 核心路由与页面入口
- `src/lib/` - 核心工具与库函数
- `src/components/` - 全局复用组件

---

## 常用命令

```bash
npm run dev             # 本地开发
npm run build           # 生产构建
npm run lint            # 代码检查
npm run typecheck       # 类型检查
```

---

## AI 协作流程

1. **中等及以上复杂度需求**：先给出设计方案，待确认后再编码
2. **信息不完整时**：先明确假设，列出候选方案及利弊
3. **验证**：修改后运行 `npm run typecheck` 和 `npm run lint` 查看是否有问题，如果有立即修改
4. **规则文件修改**：修改 `skills/` 目录下的文件，禁止直接修改同步目标文件。提交后会自动同步到各 AI 工具规则目录
