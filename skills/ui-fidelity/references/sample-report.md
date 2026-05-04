# UI 还原度报告示例

## 总体还原度: 87%

**各维度得分**

- 📐 布局间距: 90%
- 🎨 颜色主题: 95%
- ✍️ 字体文本: 85%
- 🖼️ 图标图片: 80%
- 🔲 组件样式: 90%
- 🎭 交互状态: 82%

---

## 🔴 严重问题

### 1. 标题字号不一致

**位置**：页面标题

**设计稿**：20px, font-weight: 600

**实际实现**：18px, font-weight: 500

**修复建议**：

```less
// src/pages/Permission/style.module.less
.pageTitle {
  font-size: 20px;      // 原 18px
  font-weight: 600;     // 原 500
}
```

---

### 2. 图标尺寸偏小

**位置**：操作按钮图标

**设计稿**：16x16px

**实际实现**：14x14px

**修复建议**：

```jsx
<IconEdit style={{ fontSize: 16 }} />  // 原 14
```

---

## 🟡 中等问题

### 1. Hover 状态颜色偏淡

**位置**：列表行 hover

**设计稿**：`#F5F7FA`

**实际实现**：`#FAFAFA`

**修复建议**：

```less
.listItem:hover {
  background: #F5F7FA;  // 原 #FAFAFA
}
```

### 2. 间距误差

**位置**：卡片内边距

**设计稿**：padding: 16px 20px

**实际实现**：padding: 16px

**修复建议**：

```less
.card {
  padding: 16px 20px;  // 原 16px
}
```

---

## 🟢 轻微问题

### 1. 边框圆角

**位置**：搜索框

**设计稿**：border-radius: 6px

**实际实现**：border-radius: 4px

---

## 修复清单

- [ ] `.pageTitle` 字号改为 20px - `style.module.less:12`
- [ ] `.pageTitle` 字重改为 600 - `style.module.less:13`
- [ ] 图标尺寸改为 16px - `index.js:45`
- [ ] hover 背景色改为 #F5F7FA - `style.module.less:28`
- [ ] 卡片内边距改为 16px 20px - `style.module.less:8`
- [ ] 搜索框圆角改为 6px - `style.module.less:52`

---

## 对比截图

| 设计稿 | 实现 |
|--------|------|
| ![设计稿](./design.png) | ![实现](./impl.png) |
