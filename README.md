# AI Workflow Harness

AI Workflow Harness 是一个基于代码库的 AI 研发自动化工作流项目。

当前仓库包含两部分：

1. `.ai/`、`skills/`、`specs/`、`docs/` 中的工作流文档资产。
2. 一个最小 React + Next 应用，用于浏览工作流阶段、检索关键资产，并保存本地 Run Record 草稿。

## 功能

Next 应用当前提供：

1. 工作流阶段总览。
2. 仓库资产检索与分类筛选。
3. Run Record 草稿表单。
4. 草稿保存到浏览器 localStorage。

## 技术栈

1. React
2. Next.js App Router
3. TypeScript
4. CSS

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

## 主要目录

```text
app/                  # Next 应用
.ai/                  # AI 工作流协议、模板、上下文和评估记录
skills/               # 可复用 AI Skills
specs/                # 需求 Spec、任务拆解和执行记录
docs/                 # 工程说明和边界文档
```

## 说明

这个应用不替代 Codex、Cursor、Claude Code 等 Coding IDE 的能力。它只是为仓库内的 AI Workflow Harness 提供一个轻量可视化入口。

