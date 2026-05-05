---
name: prd-extract
description: 将 PRD 提取为结构化 YAML
argument-hint: [PRD 链接] | [PRD 内容]
---

# 步骤一：PRD 结构化提取

将产品需求文档转换为结构化 YAML，避免歧义。

## 输入

- **链接**：访问链接中的内容 
- **其他内容**： 直接粘贴内容


## 产出

创建 `docs/prd-tasks/{功能名}/prd.yaml`

## Schema 规范

```yaml
prd:
  # 必填项
  title: "功能名称"
  goal: "一句话描述目标"
  
  user_stories:
    - role: "用户角色"
      want: "想要做什么"
      benefit: "获得什么收益"
  
  features:
    - id: "F1"
      name: "功能点名称"
      priority: "P0/P1/P2"
      description: "功能描述"
  
  acceptance_criteria:
    - "可量化的验收标准"
  
  # 可选项
  constraints:
    - "技术约束"
  
  non_functional:
    performance: "性能要求"
    accessibility: "可用性要求"
  
  dependencies:
    apis: ["后端接口"]
    components: ["依赖组件"]
  
  risks:
    - "潜在风险"
```

## 校验规则

- `goal`、`user_stories`、`features`、`acceptance_criteria` 必填
- 每个 feature 必须有 priority
- acceptance_criteria 必须可量化验证

## 完成标志

- [ ] 已创建 `docs/prd-tasks/{功能名}/prd.yaml`
- [ ] 通过 Schema 校验
- [ ] 人工确认需求理解正确

## 下一步

→ `skills/feature-dev/action-split.md`
