# 组件与 Hook 复用规范 - 详细参考

<!-- AI: 按需加载 - 仅在需要详细说明时读取此文件 -->

## 关键词匹配策略

- 中英混合，英文统一小写、单数优先，建议 4–8 个关键词
- 先应用配置 synonyms，再应用附录"推荐同义词扩展"
- 补充常见缩写/俗称（如 "小菊花"→ loading/spin）
- 鼓励加入场景词（如 "无文字""inline"）
- 常见纠错：confirm（而非 comfirm）等

## 匹配度评分算法

### 组件评分

```
score = 0.40*keyword + 0.35*category + 0.15*design + 0.10*variant − penalty
```

- **keyword**：查询词与 keywords 的 Jaccard/包含度
  - 短语精确命中 +0.1
  - 同义命中 +0.05
- **category**：查询意图映射到类目（如 loading → feedback/Loading）
- **design**：有设计规范/链接加分（+0.15 封顶）
- **variant/size**：命中 "small/inline/无文字" 等加分（+0.1 封顶）
- **penalty**：
  - 技术不符 −0.2
  - 仅适配其他环境 −0.1
  - deprecated −1

### Hook 评分

```
score = 0.50*intent + 0.30*category + 0.20*synergy − penalty
```

## 完整示例

### 示例 A：复用"小 loading"（inline、无文字）

1. **tokens**：小loading, loading, 无文字, inline, spin/spinner
2. **命中 components-catalog**：Loading（keywords 含 "小loading""没有文字的loading"；category: feedback/Loading）
3. **评分排序**：Loading 更优（短语精确命中 + 尺寸/场景吻合）
4. **最小用法**：
```jsx
import Loading from '@/components/Loading';
<Loading size="small" tip={null} inline />
```
5. **注意**：遵循 i18n；

### 示例 B：复用 useLoadMore（分页加载）

1. **tokens**：loadmore, 加载更多, 分页, 列表
2. **命中 hooks-catalog**：useLoadMore（category: data；returns 含 list/hasMore/loading）
3. **评分排序**：useLoadMore 优于通用防抖/请求 Hook
4. **最小用法**：
```jsx
const { loadMore, list, hasMore, loading } = useLoadMore(fetchList, {});
<Button onClick={loadMore} disabled={!hasMore || loading}>Load</Button>
```

## 完整同义词扩展

- **loading**：loading, spin, spinner, 小loading, 小菊花, 旋转加载, inline
- **skeleton**：skeleton, 骨架, 骨架屏, 占位加载
- **modal**：modal, dialog, 对话框, 弹窗, 确认框
- **tooltip/popover**：tooltip, popover, 提示, 气泡卡片, 说明
- **notification/message**：notification, message, 通知, 提醒, toast
- **tabs**：tabs, tab, 标签页, 选项卡
- **breadcrumb**：breadcrumb, 面包屑, 路径导航
- **upload**：upload, 上传, 导入, 选择文件
- **pagination**：pagination, 分页
