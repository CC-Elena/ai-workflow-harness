# 组件索引

本文件是轻量组件索引入口。真实代码位置以仓库搜索结果为准。

## 1. 搜索优先级

创建新组件前，按以下顺序搜索：

1. `components-catalog.json`
2. `src/baseComponents/`
3. `src/componentsUI/`
4. `src/shared/components/`
5. `src/components/`

## 2. 复用判断

参考 `skills/component-reuse/SKILL.md`：

| 匹配分 | 建议 |
|--------|------|
| >= 0.70 | 直接采用 |
| 0.60-0.69 | 作为候选说明 |
| < 0.60 | 不建议复用，可新建 |

## 3. 常见组件意图关键词

| 意图 | 关键词 |
|------|--------|
| 加载 | loading, spin, spinner, 小菊花 |
| 弹窗 | modal, dialog, 对话框, 弹窗 |
| 标签页 | tabs, tab, 标签页, 选项卡 |
| 表格 | table, list, grid, 列表 |
| 上传 | upload, uploader, import, 导入 |
| 空态 | empty, blank, 空数据 |

## 4. Codex 使用方式

1. 先读取 `skills/component-reuse/SKILL.md`。
2. 用 `rg` 搜索关键词和同义词。
3. 找到候选组件后读取实现和调用示例。
4. 如果新建组件，说明为什么无法复用。
5. 新增组件后按项目规则更新索引。

