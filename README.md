<div align="center">

# AI Workflow Harness

**仓库原生的 AI 研发流程框架：让 Coding Agent 不只会写代码，还能按团队规范交付可验证、可审查、可复盘的结果。**

[![CI](https://github.com/CC-Elena/ai-workflow-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/CC-Elena/ai-workflow-harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-active-success)](#status)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](./CONTRIBUTING.md)

[English](./README.en.md) | 简体中文

[10 分钟快速验证](#quick-10) · [项目在做什么](#what-it-does) · [你会得到什么](#what-you-get) · [适用场景](#fit) · [决策对比](#decision) · [样例路径](#examples)

</div>

---

## 一句话定位

你可以把它理解为：

> 把 AI Coding 从“能写代码”升级成“可工程化交付”的仓库内基础设施。

它聚焦三件事：

1. **可验证**：结果不是口头完成，而是有命令与证据。
2. **可审查**：变更范围、验证过程、风险说明都可被 Review。
3. **可复盘**：失败能形成 RCA，并反哺下一次执行。

## 你会遇到的问题

主流 Coding Agent（Codex、Claude Code、Cursor、Trae 等）已经很会写代码，但落地到真实研发流程常见这几类问题：

- **难复盘**：需求、任务、代码、验证结果散落在聊天记录里。
- **不遵从规范**：能生成代码，但不一定遵守项目结构、组件复用、验证协议、Review 规则。
- **人工串联多**：需求拆解、上下文选择、验证记录仍大量依赖人工。
- **证据不足**：常写"已完成 / 已验证"，但缺命令输出、截图、diff 覆盖。
- **风险不可控**：范围外修改、失败原因、复盘反哺没有闭环。

一句话说，你不是缺模型能力，而是缺**可持续的工程流程与证据系统**。

<a id="what-it-does"></a>

## 这个项目具体在做什么

**AI Workflow Harness** 把需求到交付的关键环节全部落在仓库里，并通过规则与门禁把它们连接起来：

- 需求协议：PRD -> Spec -> Tasks
- 执行协议：Planner / Executor + Context Pack + Skills
- 验证协议：lint / typecheck / build / 测试 / 页面验证
- 证据协议：Run Record + Evaluation Summary + Diff 覆盖表
- 质量门禁：`harness:check` 拒绝“漏证据、失败写成功、范围外改动未声明”

它不是提示词集合，而是一套**可版本化、可审查、可演进**的工程资产体系。

<a id="what-you-get"></a>

## 你最终会得到什么

接入后，你会在仓库中得到一套可落地产物：

1. **流程资产**：Spec 模板、任务模板、Run Record 模板、验证模板。
2. **规则资产**：Skills 库、上下文路由、工作流协议。
3. **门禁资产**：交付检查脚本与可追溯证据链。
4. **运行时护栏**：Codex hooks（SessionStart / PreToolUse / PostToolUse / Stop）。

<a id="quick-10"></a>

## 10 分钟快速验证

目标：不看长文档，只用一次最小路径判断“这套东西是否适合你的团队”。

### 步骤 1：初始化

在你的项目根目录执行：

```bash
npx ai-workflow-harness@latest init
```

预期结果：出现 `.ai/`、`skills/`、`specs/`、`scripts/check-harness-run.mjs`。

### 步骤 2：创建最小需求

```bash
mkdir -p specs/hello
touch specs/hello/spec.md
touch specs/hello/tasks.md
touch specs/hello/run-record.md
```

预期结果：你有一个可被门禁识别的最小执行单元。

### 步骤 3：跑验证与门禁

```bash
npm run lint
npm run typecheck
npx ai-workflow-harness check specs/hello
```

预期结果：你能看到明确的通过/失败原因，并知道下一步该补哪类证据。

## 迁移到你的项目

### 方式 A：一行 CLI（推荐）

```bash
npx ai-workflow-harness@latest init
```

常用参数：

```bash
npx ai-workflow-harness init ./my-app --with-skills=frontend-dev,test
npx ai-workflow-harness init --all-skills --force
npx ai-workflow-harness init --dry-run
```

### 方式 B：让 AI 跑迁移 Skill

```text
请读取 https://raw.githubusercontent.com/CC-Elena/ai-workflow-harness/main/skills/harness-migration/SKILL.md ，执行 harness 迁移初始化任务。
```

详见 [docs/migration-guide.md](docs/migration-guide.md) 与 [docs/adoption-checklist.md](docs/adoption-checklist.md)。

<a id="fit"></a>

## 适用与不适用场景

**适合你，如果你在意：**

- 团队协作中的 AI 输出一致性；
- 从需求到代码的可追溯证据；
- 把 AI 交付纳入工程治理与门禁。

**不适合你，如果你只需要：**

- 一次性代码生成，不关心流程资产沉淀；
- 不愿维护 Spec / Run Record / 验证记录；
- 个人试验型项目且没有协作审计需求。

**非目标声明**：本项目不是 Agent Runtime、CI/CD 平台、测试平台，也不是 Codex / Cursor / Claude Code 的替代品。

<a id="decision"></a>

## 为什么不是其他方案（决策型对比）

你可以用下面的决策方式快速选型：

- 想要官方背书 + 最广 Agent 适配：选 [Spec Kit](https://github.com/github/spec-kit)
- 想要多角色 Agile 协作：选 [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- 只用 Claude Code 且偏轻量模板：选 [Context Engineering](https://github.com/coleam00/context-engineering-intro)
- 需要审批流 + Dashboard：选 [Spec Workflow MCP](https://github.com/Pimzino/spec-workflow-mcp)
- 需要仓库内证据闭环 + 可拒绝门禁：选 **AI Workflow Harness**

本项目的核心差异：

1. Run Record + `harness:check` 硬门禁
2. Codex 生命周期 hooks
3. Lightweight / SDD 双路径
4. 每任务 1 主 + 1 辅 Skill 的最小路由
5. PR diff 反向匹配 Run Record 覆盖表

<a id="examples"></a>

## 真实样例与学习路径

建议阅读顺序：

1. 先看一个成功样例，理解最小闭环：
   - [specs/file-content-tree-view/](specs/file-content-tree-view/)
2. 再看一个失败复盘样例，理解纠偏机制：
   - [specs/failure-rca-sample/](specs/failure-rca-sample/)
3. 最后看评估框架，理解团队级指标：
   - [specs/evaluation-framework/](specs/evaluation-framework/)

更多样例：

- [specs/ai-run-record-entry/](specs/ai-run-record-entry/)
- [specs/run-record-verification-summary/](specs/run-record-verification-summary/)
- [specs/file-list-page/](specs/file-list-page/)

## 项目结构（速览）

```text
.
├── AGENTS.md
├── .ai/
├── .codex/
├── skills/
├── specs/
├── scripts/
└── src/
```

## 常用命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run harness:test
npm run harness:check -- --changed --base <baseRef> --head <headRef>
```

## Contributing

欢迎贡献流程资产、模板、脚本、样例与文档。

社区协作入口：

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Issue Templates](.github/ISSUE_TEMPLATE)
- [PR Template](.github/pull_request_template.md)

<a id="status"></a>

## Status & Roadmap

当前已具备可运行的 SDD + AI Coding 全流程 Harness。下一步重点：

- [ ] 更多自动化结构检查
- [ ] 更细粒度的评估 Rubric
- [ ] 更多真实需求样本与 RCA
- [ ] 更完整的资产浏览与搜索体验
- [ ] 更多 Coding Agent 运行时适配

## Further Reading

- [AGENTS.md](AGENTS.md)
- [.ai/workflows/verification.md](.ai/workflows/verification.md)
- [.ai/workflows/planner-executor.md](.ai/workflows/planner-executor.md)
- [skills/workflow-assets/SKILL.md](skills/workflow-assets/SKILL.md)
- [docs/quick-start.md](docs/quick-start.md)

## License

[MIT](./LICENSE) © 2026 CC-Elena

## Acknowledgements

感谢 Codex、Claude Code、Cursor、Trae、Next.js 以及 Spec-driven Development 社区实践。
