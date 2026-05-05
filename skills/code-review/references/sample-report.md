# 代码审查报告示例

## 变更概览

- **修改文件**：5 个
- **新增文件**：2 个
- **删除文件**：0 个

---

## 🔴 严重问题

### 1. 硬编码中文字符串

**文件**：`src/pages/Example/index.js:45`

```diff
-<span>保存成功</span>
+<span>{intl.t('保存成功')}</span>
```

### 2. 未声明环境影响范围

**问题**：PR 未说明影响哪些环境

---

## 🟡 警告

### 1. 未使用 React.memo

**文件**：`src/components/List/index.js`

```diff
-export default List;
+export default React.memo(List);
```

### 2. 缺少异步错误处理

**文件**：`src/pages/User/index.js:23`

```diff
-const data = await fetchUser();
+try {
+  const data = await fetchUser();
+} catch (error) {
+  message.error(intl.t('获取用户信息失败'));
+}
```

---

## 🟢 建议

1. 建议将 `formatDate` 逻辑提取到 `src/utils/date.js`
2. 考虑使用 `useMemo` 缓存排序结果

---

## 总结

- **变更概览**：新增用户列表功能，支持搜索和分页
- **风险评估**：中（涉及多环境共享组件）
- **是否可合并**：修复 P0 问题后可合并
