---
name: skill-creator
description: 创建高效 Skill 的指南。当用户想要创建新的 Skill（或更新现有 Skill）以扩展 AI 的专业知识、工作流或工具集成能力时，请使用此 Skill。
version: 0.1.0
---

# Skill Creator

本 Skill 提供创建高效 AI Skill 的指南。

## 关于 Skill

Skill 是模块化、独立的包，通过提供专业知识、工作流和工具来扩展 AI 的能力。可以把它们看作特定领域或任务的“入职指南”——它们将通用 AI 转化为具备专业知识的专家。

### Skill 提供什么

1. **专业工作流** - 特定领域的多步骤流程
2. **工具集成** - 处理特定文件格式或 API 的指令
3. **领域专长** - 公司特定的知识、Schema、业务逻辑
4. **捆绑资源** - 用于复杂和重复任务的脚本、参考资料和资产

## 核心原则

### 简洁至上

上下文窗口是公共资源。
**默认假设：AI 已经非常聪明。** 只添加它不知道的上下文。对每条信息都要质疑：“AI 真的需要这个解释吗？”

### 设定适当的自由度

根据任务的脆弱性匹配特异性水平：

- **高自由度 (纯文本)**：当有多种可行方法时。
- **中自由度 (伪代码/引导)**：当存在首选模式但允许变通时。
- **低自由度 (特定脚本)**：当操作脆弱且一致性至关重要时。

### Skill 解剖

每个 Skill 由一个必需的 `SKILL.md` 文件和可选的捆绑资源组成：

```
skill-name/
├── SKILL.md (必需)
│   ├── YAML frontmatter 元数据
│   └── Markdown 指令正文
├── REFERENCE.md (可选)
├── references/       - 按需加载的文档
└── scripts/          - 辅助脚本
```

## 渐进式披露设计原则

Skill 使用分层加载系统来高效管理上下文：

1. **元数据 (description)** - 始终在上下文中 (用于触发)
2. **SKILL.md 正文** - 仅在 Skill 触发时加载
3. **捆绑资源** - 按需加载 (由 SKILL.md 引用)

**关键原则**：保持 `SKILL.md` 精简。将详细参考资料、Schema 和大量示例移至 `REFERENCE.md` 或 `references/` 目录。

## Skill 创建流程

### 第一步：理解 Skill

清晰理解 Skill 将被如何使用的具体案例。
- 它应该支持什么功能？
- 用户说什么话应该触发这个 Skill？

### 第二步：规划复用内容

识别哪些脚本或参考资料会有帮助。
- 需要重复代码？-> `scripts/`
- 需要查询 Schema？-> `references/`
- 需要样板文件？-> `assets/` (如果支持)

### 第三步：初始化 Skill

使用 `create-skill` 命令生成新的 Skill 模板。

```bash
# 使用 npm 脚本 (推荐)
npm run create-skill <skill-name>

# 直接执行
node skills/skill-creator/scripts/init-skill.js <skill-name>

# 选项
npm run create-skill <skill-name> --path skills
```

### 第四步：编辑 Skill

#### 更新 SKILL.md

**Frontmatter**
```yaml
---
name: skill-name
description: 描述 Skill 做什么以及【何时】使用。在此自然地包含触发关键词。
version: 0.1.0
---
```

**正文**
使用祈使语气编写指令。

#### 学习成熟的设计模式

- **多步骤流程**：参见 [references/workflows.md](./references/workflows.md)
- **特定输出格式**：参见 [references/output-patterns.md](./references/output-patterns.md)

### 第五步：更新索引

运行同步命令以更新中心索引：

```bash
npm run sync
```

### 第六步：迭代

1. 在真实任务中使用 Skill
2. 注意遇到的困难
3. 更新 SKILL.md 或资源
4. 再次测试

---

## 参考资料

- [workflows.md](./references/workflows.md) - 多步骤工作流设计模式
- [output-patterns.md](./references/output-patterns.md) - 输出格式设计模式
