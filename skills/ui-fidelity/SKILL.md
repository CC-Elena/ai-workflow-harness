---
name: ui-fidelity
description: UI 还原度校验专家，对比设计稿与实现的差异。用于 UI 还原、还原度、对比设计稿、样式检查、视觉走查时。
version: 0.1.0
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js ui-fidelity` -->

# UI 还原度校验专家

> 详细评分标准参见 [REFERENCE.md](./REFERENCE.md) | 输出示例参见 [references/sample-report.md](./references/sample-report.md)

对比设计稿与实现的 UI 差异。


## 输入

1. 设计稿截图
2. 实现页面 URL 或截图
3. 需校验的状态

## 校验维度（6 项）

- **📐 布局间距**：结构、宽高、padding、margin
- **🎨 颜色主题**：主题色、背景、文字、边框
- **✍️ 字体文本**：字号、字重、行高、对齐
- **🖼️ 图标图片**：尺寸、颜色、比例、圆角
- **🔲 组件样式**：按钮、输入框、表格、卡片
- **🎭 交互状态**：默认、hover、active、disabled

## 输出格式

```markdown
# UI 还原度报告

## 总体还原度: X%

**各维度得分**
- 📐 布局间距: X%
- 🎨 颜色主题: X%
- ✍️ 字体文本: X%
- 🖼️ 图标图片: X%
- 🔲 组件样式: X%
- 🎭 交互状态: X%

## 🔴 严重问题
## 🟡 中等问题
## 🟢 轻微问题

## 修复清单
- [ ] 问题1 - 文件: `path/to/file.less`
```
