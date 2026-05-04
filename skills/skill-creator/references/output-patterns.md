# 输出模式 (Output Patterns)

当 Skill 需要产出一致、高质量的输出时，请使用这些模式。

## 模板模式 (Template Pattern)

为输出格式提供模板。根据需求匹配严格程度。

**针对严格要求（如 API 响应或数据格式）：**

```markdown
## 报告结构

务必使用此确切的模板结构：

# [分析标题]

## 执行摘要
[一段关于主要发现的概述]

## 主要发现
- 发现 1 及支持数据
- 发现 2 及支持数据
- 发现 3 及支持数据

## 建议
1. 具体的行动建议
2. 具体的行动建议
```

**针对灵活指导（当需要变通时）：**

```markdown
## 报告结构

这是一个推荐的默认格式，请根据判断使用：

# [分析标题]

## 执行摘要
[概述]

## 主要发现
[根据发现调整章节]

## 建议
[针对具体语境定制]

根据具体分析类型调整章节。
```

## 示例模式 (Examples Pattern)

对于输出质量依赖于示例的 Skill，提供输入/输出对：

```markdown
## 提交信息格式 (Commit Message)

参照以下示例生成提交信息：

**示例 1:**
输入: Added user authentication with JWT tokens
输出:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**示例 2:**
输入: Fixed bug where dates displayed incorrectly in reports
输出:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

遵循此风格：type(scope): 简短描述，然后是详细解释。
```

相比单纯的描述，示例能帮助 AI 更清晰地理解期望的风格和细节程度。
