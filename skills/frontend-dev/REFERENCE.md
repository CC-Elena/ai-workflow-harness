# 前端开发规范 - 详细参考

<!-- AI: 按需加载 - 仅在需要详细说明时读取此文件 -->

> 此文件是 SKILL.md 的详细补充，包含完整规范说明

## 组件组织规范

### 组件层级与依赖方向

```
components/layouts (基础布局)  →  components/views (页面容器)
     ↓                           ↓
  无业务逻辑                  组合基础组件、包含业务逻辑
```

**依赖规则**
- `components/layouts/` → 仅依赖基础 UI、hooks、utils
- `components/views/` → 可依赖 layouts、hooks、services、utils
- **禁止** `components/layouts/` 引用 `components/views/`（单向依赖）

**索引文件**
- `components-catalog.json` - 基础组件索引
- 新增组件时同步更新对应的 json 文件

---

## Props 类型显式化

**必须**为组件 Props 添加 JSDoc 或 TypeScript 类型定义：

```javascript
/**
 * DocTab 标签页组件
 * @param {Object} props
 * @param {'line' | 'top' | 'pills'} [props.variant='line'] - 视觉变体
 * @param {'small' | 'default' | 'large'} [props.size='default'] - 尺寸
 * @param {string} [props.activeKey] - 受控模式下的当前 key
 * @param {string} [props.defaultActiveKey] - 非受控模式下的默认 key
 * @param {(key: string) => void} [props.onChange] - 切换回调
 * @param {React.ReactNode} props.children - TabPane 子元素
 */
const DocTab = ({ variant = 'line', size = 'default', ...props }) => {
  // ...
};
```

**类型定义要点**
- 列举所有合法的枚举值
- 标注默认值
- 区分受控/非受控 Props
- 说明回调函数签名

---

## 基础组件设计原则

**变体驱动**
- 通过 `variant`/`size`/`orientation` props 控制外观
- 禁止在页面层覆盖组件状态样式

**Tokens 统一**
- 颜色、间距、字号使用 `globals.css` 语义变量
- 禁止硬编码颜色值（如 `#333`）

**作用域隔离**
- 根类 + CSS Modules
- `:global(.ant-*)` 仅在根类作用域内使用

**受控/非受控成对**
- `value` + `onChange`（受控）
- `defaultValue`（非受控）

---

## 组件开发规范

### 核心原则
- 遵循 **单一职责原则**，一个文件只对应一个组件
- 优先使用 **Functional Components + Hooks**
- 避免直接修改 Props，复杂状态逻辑使用 `useReducer` 或 React Context
- 避免在组件外直接操作 DOM，使用 `useRef`

### 副作用处理
- 使用 `useEffect` 处理副作用，明确依赖项
- 避免在渲染函数中执行复杂计算，使用 `useMemo` 或 `useCallback`

---

## 状态管理规范

- 遵循 **单向数据流**
- **Models** 位于 `src/model/`
- **Effects** 处理异步逻辑，**Reducers** 处理同步状态更新
- 避免在组件中直接处理复杂业务逻辑，尽量下沉到 Model

---

## API 调用规范

- API 调用封装在 **Service 层**（`src/service/`）
- 使用全局封装的 `request` 实例
- 错误处理统一在拦截器或 Service 层处理
- 禁止在组件中直接调用 `axios`

---

## 样式规范

- 使用 **CSS Modules** (`*.module.css`)
- 已引入基础变量，可直接使用样式变量：`@import '~@/assets/style/globals.css';`
- 避免全局样式污染，使用 `:global` 需谨慎
- 遵循设计系统的色系 (@blueGray-1 等)

### CSS Modules 使用

```javascript
import classBind from 'classnames/bind';
const cx = classBind.bind(styles);

// 使用方式
<div className={cx('root', `s-${size}`, { 'has-divider': showDivider }, className)}>
```

---

## 性能优化

- 使用 `React.memo` 避免无关渲染
- 大列表使用虚拟滚动 (`rc-virtual-list`)
- 图片懒加载 (`react-lazyload`)

---

## 安全规范

- 对用户输入进行 **XSS 过滤** (`dompurify`)
- 避免直接使用 `dangerouslySetInnerHTML`

---

## 样式模板

```css

.container {
  // 样式
  .main {

    .content{
      
    }
  }
}

---

## 国际化 (i18n) 详细指南

### 基本用法

```javascript
// import { useTranslations } from "next-intl"; // Next.js i18n example

// 简单文案
t('保存')

// 带参数
t('已删除 {count} 条记录', { count: 5 })
```

### Key 命名规范

- **使用中文作为 Key**
- **场景后缀**：当中文相同但英文不同时，使用后缀区分
  - `删除-file` (Delete file)
  - `删除-member` (Remove member)
- **动态参数**：使用 `{name}` 形式
  - `欢迎 {name}` (Welcome {name})

### 流程
1. 在 `zh-CN.json` 添加中文
2. 在 `en-US.json` 添加英文
3. 代码中使用 `t()`

---

## 安全与合规指南

### 敏感信息处理

- **禁止提交**：密钥、Token、Cookie、API Key、DB 密码
- **已忽略文件**：`src/cookie.js`

### 外部 API 调用

- **本地开发**：必须使用 Mock 或开发环境 API，禁止直连生产环境
- **代码示例**：
  ```javascript
  const API_URL = process.env.NODE_ENV === 'development' ? '/mock' : '/api';
  ```

### 依赖安全

- 升级前运行 `npm outdated` 和 `npm audit`
- 关注体积变化和兼容性

### XSS 防护

- 禁止直接使用 `dangerouslySetInnerHTML`
- 必须使用 `dompurify`：
  ```javascript
  import DOMPurify from 'dompurify';
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(input) }} />
  ```
```
