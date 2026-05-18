---
name: project
description: 核心项目指南和规范。在为该项目编写任何代码、运行命令或规划架构更改之前，务必首先阅读此文件。这包含了对于正确理解项目至关重要的不可破坏的规则和约定。
version: 0.1.0
---

# Project Master Skill

这是本项目的“最高宪法”。作为 AI 助手，你在本仓库中执行任何任务时都必须严格遵守以下规则。

## 1. 核心架构与技术栈

- **框架/语言**：[由 AI 自动生成，例如：React 19 / Vue 3 / Spring Boot]
- **构建工具**：[由 AI 自动生成，例如：Vite / Webpack / Maven]
- **包管理器**：[由 AI 自动生成，例如：npm / npm / yarn / gradle]

## 2. 环境操作指令

绝对禁止盲目猜测命令。对于本项目，仅允许使用以下命令进行环境交互：

- **安装依赖**：`[命令，例如 npm install]`
- **本地开发**：`[命令，例如 npm run dev]`
- **构建生产包**：`[命令，例如 npm run build]`
- **运行测试**：`[命令，例如 npm run test]`
- **静态检查**：`[命令，例如 npm run lint]`

*(如果上述某项在本仓库不适用，请将其标记为 N/A)*

## 3. 核心目录与保护区

在修改以下任何文件或目录之前，你**必须**向用户发出严重警告并获得明确授权：

- `[保护目录 1，例如 src/core/]`
- `[保护文件 1，例如 package.json]`

有关完整的目录结构和模块说明，请参阅：`[link to .ai/context/project-map.md]`。

## 4. 专属工程约定

- **代码风格**：[例如：总是使用 TypeScript 的严格模式，不使用 any]
- **命名规范**：[例如：文件使用 kebab-case，组件使用 PascalCase]
- **数据流转**：[例如：所有的网络请求必须通过统一的 API Client 发送]

关于具体的代码模式和范例，请参阅：`[link to .ai/context/common-patterns.md]`。

## 5. AI Harness 工作流约束

本项目已接入 AI Workflow Harness。你必须遵守 SDD（Spec-Driven Development）流程：
1. 没有 PRD/Spec，不写代码。
2. 任何重大实现前，必须先写 Implementation Plan 并获得 approval。
3. 执行结束后，必须输出 `Run Record`。
