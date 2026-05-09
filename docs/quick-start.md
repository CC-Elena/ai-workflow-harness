# AI Workflow Harness Quick Start

这份文档用于在没有完整培训的情况下，让一个新项目快速接入仓库原生 AI 研发工作流。

## 1. 适用前提

项目需要满足：

1. 代码和文档可以提交到同一个 Git 仓库。
2. 项目已有基础验证命令，例如 lint、typecheck、build 或 test。
3. 团队愿意让 AI 执行过程留下 Spec、Tasks、Run Record 和验证证据。
4. 当前不要求无人值守合并、自动发布、Agent Runtime 或独立平台。

## 2. 接入步骤

### 2.1 安装资产

将以下目录或文件复制到目标项目：

```text
.ai/
skills/
scripts/check-harness-run.mjs
```

如果目标项目已有 `skills/`，优先合并项目级规则，不要覆盖已有团队规范。

### 2.2 生成项目规则

在目标项目中补齐或生成：

```text
skills/project/SKILL.md
```

它至少需要说明：

1. 技术栈和包管理器。
2. 目录结构。
3. 组件、Hook、API、样式和测试约束。
4. 禁止修改或需要人工确认的高风险区域。
5. 项目常用验证命令。

### 2.3 创建第一个需求目录

为首个低风险需求创建：

```text
specs/{feature}/prd.md
specs/{feature}/spec.md
specs/{feature}/tasks.md
specs/{feature}/run-record.md
```

中等及以上复杂度需求还需要：

```text
specs/{feature}/verification-record.md
specs/{feature}/evaluation-summary.md
```

失败、人工大幅修改或验证不通过时还需要：

```text
specs/{feature}/rca.md
```

### 2.4 执行最小闭环

推荐第一条需求选择文档、静态页面、表单字段或资产索引调整。

执行顺序：

```text
PRD
  ↓
Spec
  ↓
Tasks
  ↓
Code or asset change
  ↓
lint / typecheck / build / UI check
  ↓
Run Record
  ↓
harness:check
```

### 2.5 添加验证命令

在目标项目的 `package.json` 中添加或确认：

```json
{
  "scripts": {
    "lint": "...",
    "typecheck": "...",
    "build": "...",
    "harness:check": "node scripts/check-harness-run.mjs"
  }
}
```

### 2.6 配置 CI

复制本仓库的 `.github/workflows/ci.yml`，并把 Harness Gate 指向目标项目已有的稳定样本：

```bash
npm run harness:check -- specs/{feature}
```

## 3. 首次验收

完成接入后，至少运行：

```bash
npm run lint
npm run typecheck
npm run build
npm run harness:check -- specs/{feature}
```

如果某条命令不存在，必须在 Run Record 中写明跳过原因和风险。

## 4. 不建议首批接入的范围

首批不要选择：

1. 权限、支付、生产数据或核心链路。
2. 数据库迁移。
3. 自动发布。
4. 无人值守合并。
5. 需要接入 MCP 或企业知识库的复杂需求。

## 5. 完成标志

新项目完成接入的最低标准：

1. `.ai/`、`skills/project/SKILL.md` 和 `scripts/check-harness-run.mjs` 存在。
2. 至少一个低风险需求有完整 Spec、Tasks、Run Record。
3. 至少一条验证证据是真实命令输出或真实文件。
4. CI 能运行基础验证和 Harness Gate。
5. 团队知道失败时要补 RCA，而不是把失败记录改成成功。
