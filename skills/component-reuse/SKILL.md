---
name: component-reuse
description: 组件与 Hook 复用规范，创建新组件前必读。用于组件复用、查找已有组件、新建组件前的检查。
version: 0.1.0
dependencies: [frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js component-reuse` -->

# 组件与 Hook 复用规范

> 详细评分算法参见 [REFERENCE.md](./REFERENCE.md)

## 复用流程

1. **解析需求意图**：抽取关键词/场景/限制
2. **搜索 catalogs**：在 `components-catalog.json` / `hooks-catalog.json` 中匹配
3. **评分与排序**：取 Top 5 候选
4. **可用性审查**：技术一致性、环境适配、i18n 要求
5. **出具建议**：导入路径、最小用法、注意事项
6. **确认后实施**

## 搜索位置

- `components-catalog.json`
- `hooks-catalog.json`
- `src/baseComponents/`
- `src/componentsUI/`
- `src/shared/components/`

## 采用阈值

- **≥ 0.70**：直接采用
- **0.60–0.69**：候选说明
- **< 0.60**：不建议复用

## 复用 vs 新建

**建议复用**：
- 匹配分 ≥ 0.70
- API/尺寸满足
- 同功能已有稳定实现

**建议新建**：
- 分数 < 0.60
- 现有实现存在明显负债
- 抽象冲突

## 示例

### 复用 Loading 组件

```jsx
import Loading from '@/components/Loading';
<Loading size="small" tip={null} inline />
```

### 复用 useLoadMore Hook

```jsx
const { loadMore, list, hasMore, loading } = useLoadMore(fetchList, {});
```

## 同义词扩展

- **loading**：loading, spin, spinner, 小菊花
- **modal**：modal, dialog, 对话框, 弹窗
- **tabs**：tabs, tab, 标签页, 选项卡
