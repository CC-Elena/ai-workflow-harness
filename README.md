# AI Workflow Harness

AI Workflow Harness 是一套面向 Codex、Claude Code、Cursor、Trae 等常见 Coding Agent 的 SDD（Spec-driven Development）研发流程 Harness。它把 PRD 输入、需求澄清、Spec 生成、任务拆解、代码实现、验证记录、质量门禁、复盘沉淀等环节组织成一套仓库原生的工作流资产。

目标是让 AI 从辅助写代码，扩展为辅助完成需求从产出到上线前交付的完整研发闭环。

换句话说，这个项目关注的不是“AI 能不能写代码”，而是：

```text
AI 能不能按团队规范，把一个需求稳定地推进到可验证、可审查、可复盘的交付状态。
```

## 它解决什么问题

很多团队已经在用 AI 写代码，但实际落地到工程流程时容易遇到这些问题：

1. **难复盘**：需求、任务、代码、验证结果和决策过程散落在聊天记录里，事后很难判断 AI 到底做了什么。
2. **不遵从规范**：AI 能生成代码，但不一定遵守项目结构、组件复用、验证协议、代码审查和交付规则。
3. **人工参与过多**：需求拆解、上下文选择、验证记录、Review 自查和交付说明仍然大量依赖人工串联。
4. **证据不足**：AI 常写“已完成”“已验证”，但缺少可追溯的命令输出、截图、diff 覆盖和门禁记录。
5. **上线前风险不可控**：需求边界、范围外修改、失败原因和复盘反哺没有形成稳定闭环。

AI Workflow Harness 把这些东西放回仓库中：Spec、Tasks、Run Record、Skills、上下文索引、验证协议和评估记录都成为代码库的一部分。

## 当前 Harness 做了什么

当前仓库已经具备一套可运行的 SDD + AI Coding 全流程 Harness：

1. **PRD 到 Spec 的需求协议**  
   通过 `.ai/prompts/generate-spec.md` 和 `specs/{feature}/prd.md` 将自然语言需求转成结构化 Spec，减少需求理解偏差。

2. **Spec-driven 可信源**  
   使用 `specs/{feature}/spec.md` 作为需求到代码的可信源，记录目标、范围、非目标、验收标准、风险和影响面。

3. **Planner / Executor 工作流**  
   通过 `.ai/workflows/planner-executor.md`、`.ai/prompts/planner.md` 和 `.ai/prompts/executor.md` 约束 AI 先拆任务，再按任务执行。

4. **Context Pack 与 Skill 路由**  
   通过 `.ai/context/*` 和 `skills/*` 告诉 AI 应该读取哪些项目背景、工程规范、组件复用规则、测试规则和代码审查清单。

5. **验证协议**  
   `.ai/workflows/verification.md` 定义代码修改后的验证顺序：lint、typecheck、build、测试、页面验证、Review 和 harness 门禁。

6. **Run Record 与 Evaluation Summary**  
   每次真实需求可以在 `specs/{feature}/run-record.md` 中记录输入、上下文、修改文件、验证证据、人工介入和效果评估。

7. **Harness Check 门禁**  
   `npm run harness:check -- specs/{feature}` 会检查流程不变量，例如任务是否还停留在 Pending、验证证据是否存在、实际 diff 是否被 Run Record 覆盖。CI 的 PR 模式使用 `npm run harness:check -- --changed --base <baseRef> --head <headRef>`，按真实 PR diff 自动定位并检查对应 Run Record。

8. **可视化工作台**  
   Next.js 应用提供首页工作流概览、Run Record 草稿、资产检索、文件目录树和资产文件内容预览。

## 如何保障 AI Coding 质量

这套 Harness 不替代 Codex、Claude Code、Cursor、Trae 等 Coding Agent，而是在代码库中提供一套可执行、可检查、可复盘的质量保障链路。它让 AI 产出的代码不仅“能跑”，还要做到范围清楚、证据完整、过程可追溯、失败可复盘。

### 1. 防止 AI 走错流程

`AGENTS.md` 是 Codex 的轻量入口，只负责路由，不承载完整规则。它要求 AI 先判断用户是否显式输入 `/spec` 或 `/mini-spec`：

1. 普通自然语言任务默认走 Lightweight Flow：理解目标、声明范围、读取直接相关文件、最小修改、验证、总结。
2. 只有用户显式触发 `/spec` 或 `/mini-spec` 时，才生成对应 Spec 产物。
3. Harness 自身的文档、模板、规则、hook、脚本维护默认仍走轻量流程，不能因为任务看起来复杂就自动生成完整 Spec。

这样可以避免 AI 一上来就过度设计，也避免把轻量维护任务变成沉重的流程任务。

### 2. 用 Spec 控制需求理解

完整流程由 `.ai/workflows/README.md` 和 `.ai/workflows/command-routing.md` 定义。小任务可以轻量执行；中大型需求可以通过 `/spec` 进入 SDD 流程：

```text
PRD / 用户需求
   ↓
Spec
   ↓
Tasks
   ↓
Executor 实现
   ↓
Verification
   ↓
Run Record
   ↓
Evaluation / RCA
```

Spec 会记录目标、范围、非目标、验收标准、风险和影响面，减少 AI 直接编码时的理解偏差。

### 3. 控制上下文读取，降低 token 消耗

`.ai/workflows/rule-loading-policy.md` 和 `.ai/context/skill-routing-minimal.md` 用来控制 AI 读取什么、不读取什么：

1. 每个任务只选择 1 个主 Skill，确实跨场景时最多再选 1 个辅助 Skill。
2. Small 任务只读取少量直接相关文件。
3. Evaluation、Production Gate、RCA 只在触发条件满足时读取。
4. 不因为“可能有用”就读取所有 Skills、历史 Specs 或长协议。

这让 Harness 保持轻量，避免 AI 被大量规则淹没，也减少规则之间互相干扰。

### 4. 用 Skills 固化工程经验

`skills/` 目录把团队经验拆成可复用能力。例如：

1. `frontend-dev`：前端实现规范。
2. `component-reuse`：组件复用检查。
3. `test`：测试和验收。
4. `code-review`：代码审查。
5. `ui-fidelity`：视觉还原。
6. `workflow-assets`：Harness 资产维护。

AI 不只是“会写代码”，还会按团队已有组件、样式、测试、Review 习惯来完成任务。

### 5. 接入 Codex 运行时护栏

本仓库包含 `.codex/config.toml`、`.codex/hooks.json` 和 `scripts/codex-hooks/*`，用于把 Harness 规则接入 Codex 生命周期：

1. `SessionStart`：提醒使用 `AGENTS.md` 作为入口。
2. `UserPromptSubmit`：对任务做轻量分类。
3. `PreToolUse`：拦截依赖安装和破坏性命令，提示受保护路径风险。
4. `PostToolUse`：识别验证命令结果，提醒记录证据。
5. `Stop`：最终回复前检查是否说明验证、失败风险。

`.ai/policies/codex-rule-levels.json` 提供机器可读的分级规则，供 hook 脚本使用。这样 Harness 不再只靠文档提醒，也能在 AI coding 过程中提前防错。

### 6. 修改后必须验证

`.ai/workflows/verification.md` 定义修改后的验证顺序：

```bash
npm run lint
npm run typecheck
npm run build
npm run harness:check -- specs/{feature}
```

涉及 UI 或交互时，还需要页面验证、交互验证或截图检查。验证失败不能写成成功；跳过验证必须说明原因和风险。

### 7. 用 Run Record 追溯执行过程

`specs/{feature}/run-record.md` 记录一次 AI 执行的完整过程：

1. 输入是什么。
2. 读取了哪些上下文。
3. 使用了哪些 Skills。
4. 修改了哪些文件。
5. 每个任务结果是什么。
6. 验证命令和证据在哪里。
7. 实际 diff 是否被覆盖。
8. 是否需要 RCA。

这让团队事后可以复盘 AI 到底做了什么，而不是只能翻聊天记录。

### 8. 用 Harness Check 做硬门禁

`scripts/check-harness-run.mjs` 是当前最硬的质量门禁。它会检查：

1. Full Spec 是否有 `spec.md`。
2. Mini Spec 是否有 `mini-spec.md`。
3. Run Record 是否包含必要章节。
4. Medium / Large / Risky / Failure 是否有验证记录或内联验证。
5. `tasks.md` 不能还有 Pending，但 Run Record 写 Success。
6. Pass / Success 的验证项必须有命令或真实证据文件。
7. Skipped 必须写跳过原因。
8. Failed / Partial / Failure 必须引用 RCA。
9. PR changed 模式下，真实变更文件必须出现在 Run Record 的 diff 覆盖表里。

这能防止 AI 漏记证据、把失败写成功、偷偷修改范围外文件而不说明。

### 9. 用 Evaluation 和 RCA 持续改进

Evaluation Summary 用来评估一次交付质量，RCA 用来记录失败根因，并把结论反哺到 Prompt、Skill、模板或规则中。

因此 Harness 不只检查一次需求是否通过，还会把失败经验沉淀成后续规则资产。

整体上，这套质量保障链路可以概括为：

```text
明确需求
   ↓
控制上下文
   ↓
按规则实现
   ↓
运行验证
   ↓
留下证据
   ↓
门禁检查
   ↓
失败复盘
   ↓
反哺规则
```

## 它是怎么工作的

一个中等复杂度需求的推荐流程如下，它覆盖了从 PRD 输入到代码提交前交付的主要环节：

```text
用户需求 / PRD
   ↓
生成或补全 Spec
   ↓
人工审查 Spec
   ↓
Planner 拆解 Tasks
   ↓
按 Context Pack 读取上下文和 Skills
   ↓
Executor 修改代码
   ↓
运行 lint / typecheck / build / 页面验证
   ↓
生成 Run Record 和 Evaluation Summary
   ↓
运行 harness:check 门禁
   ↓
必要时生成 RCA 并反哺规则
```

小任务可以更轻量；中等及以上任务必须留下可验证记录。这个项目强调的是“流程可审查、结果可验证、失败可复盘”，不是让 AI 自由发挥。

## Web 工作台

本仓库包含一个最小 Next.js App，用来浏览和演示 Harness 资产。

当前页面包括：

1. `/`：工作流阶段概览、MVP 状态、资产检索、Run Record 草稿。
2. `/files`：资产文件浏览器，按目录树展示文件，并在右侧预览文件内容。

`/files` 不是全仓库扫描，它只展示 `src/lib/data/workflow-data.ts` 中 `assets` 数组登记的文件。这样做是为了保持内容读取范围可控，避免网页任意读取 `.env`、依赖目录或其他敏感文件。

如果新增文件后想让它出现在文件浏览器中，请把它登记到：

```text
src/lib/data/workflow-data.ts
```

示例：

```ts
{
  title: '新功能 Spec',
  path: 'specs/new-feature/spec.md',
  category: 'Spec',
  description: '新功能的结构化需求说明。'
}
```

## 主要目录

```text
app/                  # Next.js 可视化工作台
.ai/                  # 工作流协议、Prompt、模板、上下文索引和评估规则
skills/               # 可复用 AI Skills 和工程规范
specs/                # 需求 PRD、Spec、Tasks、Run Record、评估和证据
docs/                 # 工程说明和边界文档
scripts/              # 本地检查脚本，例如 harness:check
.agents/skills/       # Codex 原生 Skill 适配层，软链接到 skills/
```

其中几个核心入口：

```text
.ai/workflows/README.md              # AI 研发工作流入口
.ai/workflows/verification.md        # 验证协议
.ai/workflows/rule-loading-policy.md # 规则加载策略
.ai/templates/spec-template.md       # Spec 模板
.ai/templates/run-record-template.md # Run Record 模板
skills/project/SKILL.md              # 项目级规范
scripts/check-harness-run.mjs        # Harness 交付门禁脚本
scripts/check-agent-skill-links.mjs  # 检查 Codex Skill 软链接是否漂移
```

`skills/` 是 Harness 的唯一 Skill 规范源。为了适配 Codex 原生 Skill 发现，本仓库在 `.agents/skills/` 下提供同名目录软链接，指向 `skills/*`。这样 Codex 可以自动根据 Skill 描述选择能力，同时避免复制两份规则导致 drift。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

常用验证命令：

```bash
npm run lint
npm run typecheck
npm run build
npm run harness:check -- specs/file-content-tree-view
```

## 示例需求记录

仓库内已经包含多组真实或模拟需求记录，可作为参考：

```text
specs/ai-run-record-entry/
specs/run-record-verification-summary/
specs/file-list-page/
specs/file-content-tree-view/
specs/evaluation-framework/
```

这些目录展示了一个需求如何从 PRD 进入 Spec，如何拆 Tasks，如何记录验证证据，以及如何写 Run Record 和 Evaluation Summary。

## 适合谁

这个项目适合：

1. 想把 AI Coding 从个人效率工具升级为团队研发流程的团队。
2. 想基于 SDD 建立从 PRD 到代码提交的 AI 交付闭环的团队。
3. 想降低人工串联成本，让 AI 更稳定遵守项目规范的工程团队。
4. 正在探索 Spec-driven development、Agent workflow、AI code review 和工程知识沉淀的开发者。
5. 希望在不引入复杂平台的前提下，先用仓库文件跑通 AI 辅助需求交付闭环的团队。

## 它不是什么

AI Workflow Harness 不是：

1. Agent Runtime。
2. CI/CD 平台。
3. 测试平台。
4. 企业知识库或 MCP 服务。
5. 替代 Codex、Cursor、Claude Code 的编码工具。

它更像是一套“仓库原生的 AI 研发操作手册 + 证据系统 + 交付门禁”：让已有 Coding Agent 有规则可读、有流程可走、有证据可查。

## 接入你的项目 (如何迁移)

我们把“迁移”本身封装成了一个 AI Skill。如果你想把这套规范应用到你的全新代码库（例如 `my-new-app`），你只需要让你的 AI 跑一次“迁移安装”。

**步骤：**
1. 告诉 AI 这句话，让它去读取迁移脚本：

```text
请读取 https://raw.githubusercontent.com/CC-Elena/ai-workflow-harness/main/skills/harness-migration/SKILL.md ，执行 harness 迁移初始化任务。
```

收到指令后，AI 会在你项目里自动完成三件事：
1. 自动将远程仓库 clone 到临时目录并创建 `.ai/` 规范目录结构。
2. 自动从临时目录拷贝通用的工作流协议（`workflows`）、模板（`templates`）和提示词（`prompts`），随后清理临时文件。
3. **最关键的一步**：它会扫描你新项目的代码特征，为你生成专属的“项目宪法”（`skills/project/SKILL.md`），确保后续 AI 在你项目里的行为合规。

更多迁移细节，可阅读完整 [迁移指南](docs/migration-guide.md)。

## 当前状态

当前项目已经完成了一套完整的 AI Workflow Harness。未来，各业务线和开发组需要在实际业务需求的开发过程中不断优化和补充这套体系：

1. 更多自动化结构检查。
2. 更细粒度的评估 Rubric。
3. 更多真实需求样本和 RCA 复盘。
4. 更完整的资产浏览、搜索和内容预览体验。

欢迎基于这个仓库 fork、裁剪、迁移到自己的项目中，把你团队的工程规范和 AI 执行经验逐步沉淀下来。
