# 代码审查 - 详细参考

<!-- AI: 按需加载 - 仅在需要详细说明时读取此文件 -->

> 此文件是 SKILL.md 的详细补充，包含检查项说明和示例

## P0 检查项详解

### 未修改核心模块

**核心模块列表**：
- `src/model/index.js` - 状态管理入口
- `src/routes/route-*.js` - 路由配置
- `src/utils/request/` - 网络请求封装
- `src/assets/style/globals.css` - 全局样式变量

**修改核心模块时必须**：
- 在 PR 描述中标注"核心模块变更"
- 说明变更原因和影响范围
- 确认已在所有环境测试

---

### 编译通过

**执行命令**：
```bash
npm run lint
```

**常见编译错误**：
- **import 路径错误**：使用 `@/` 别名
- **未定义变量**：检查是否正确导入
- **环境变量差异**：检查 4 个环境入口

---

### 无硬编码字符串

**错误示例**：
```javascript
// ❌ 错误
<button>保存</button>
<span>Delete</span>
```

**正确示例**：
```javascript
// ✅ 正确
<button>{t('保存')}</button>
<span>{t('删除')}</span>
```

---

**PR 描述模板**：
```markdown

```

---

### 无硬编码密钥/Token

**禁止提交**：
- API Key
- 数据库密码
- Cookie/Token
- 私钥文件

**检查方式**：
```bash
git diff HEAD~1 | grep -E "(password|token|secret|key|api_key)"
```

---

### XSS/CSRF 防护

**用户输入处理**：
```javascript
import DOMPurify from 'dompurify';

// 必须使用 DOMPurify 清洗
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## P1 检查项详解

### 复用已有组件/Hook

**查询命令**：
```bash
# 搜索组件
grep -r "ComponentName" src/components/layouts/ src/components/views/

# 查看索引
cat components-catalog.json | jq '.[] | select(.name | contains("Loading"))'
```

---

### 使用 CSS Modules

**文件命名**：`style.module.css`

**正确用法**：
```javascript
import classNames from 'classnames/bind';
import styles from './style.module.css';

const cx = classNames.bind(styles);

<div className={cx('container', { active: isActive })} />
```

---

### 异步错误处理

**正确示例**：
```javascript
try {
  const data = await fetchData();
  // 处理数据
} catch (error) {
  console.error('获取数据失败:', error);
  message.error(t('获取数据失败'));
}
```

---

## P2 检查项详解

### React 性能优化

**React.memo**：
```javascript
export default React.memo(MyComponent);
```

**useMemo**：
```javascript
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
```

**useCallback**：
```javascript
const handleClick = useCallback(() => {
  // 处理点击
}, []);
```

---

### 路由懒加载

**正确示例**：
```javascript
const MyPage = React.lazy(() => import('@/pages/MyPage'));

<Suspense fallback={<Loading />}>
  <MyPage />
</Suspense>
```

---

## 审查报告示例

```markdown
# 代码审查报告

## 变更概览
- 修改文件：5 个
- 新增文件：2 个
- 删除文件：0 个

### 🔴 严重问题
1. **src/pages/Example/index.js:45** - 硬编码中文字符串
   ```javascript
   // 当前
   <span>保存成功</span>
   // 建议
   <span>{t('保存成功')}</span>
   ```

### 🟡 警告
1. **src/components/List/index.js** - 未使用 React.memo

### 🟢 建议
1. 建议将重复逻辑提取到自定义 Hook

## 总结
1. 变更概览：新增用户列表功能
2. 风险评估：低
3. 是否可合并：修复 P0 问题后可合并
```
