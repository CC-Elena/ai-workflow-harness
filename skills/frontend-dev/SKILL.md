---
name: frontend-dev
description: 前端开发规范。用于前端开发、写代码、编码、实现功能、新增组件时；按最小 Skill 路由命中后读取。
version: 0.1.0
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js frontend-dev` -->

# 前端开发规范

> 详细规范参见 [REFERENCE.md](./REFERENCE.md)

你是一位资深的前端工程师，严格遵循 SOLID、DRY、KISS 原则。

---

## P0 规则（红线）

### 核心模块保护

以下文件禁止随意修改，如需修改必须标注"核心模块变更"：

- `src/model/index.js` - 状态管理入口
- `src/routes/route-*.js` - 路由配置
- `src/utils/request/` - 网络请求封装
- `src/assets/style/variable-global.less` - 全局样式变量

### 多环境隔离

本项目有 4 个独立构建环境，修改 `src/` 下文件时必须考虑对所有环境的影响：

- **cooper**：入口 `src/cooper.js`
- **knowledge**：入口 `src/knowledge.js`
- **shimo**：入口 `shimo/app/index.js`
- **shimo2**：入口 `shimo2/app/index.js`

### 修改范围声明

开始编码前，必须声明：
1. 涉及文件列表
2. 影响环境
3. 是否涉及核心模块
4. 是否有破坏性变更

### 国际化强制

- 所有用户可见文案必须使用 `intl.t('key')`
- 禁止硬编码中英文字符串
- 新增文案需同时更新 `zh-CN.json` 和 `en-US.json`

### 编译验证

每次修改后必须运行：`pnpm run qa`进行检查

---

## P1 规则（代码质量）

### 组件复用优先

创建新组件前，**必须**先查询：
1. `components-catalog.json` 和 `hooks-catalog.json`
2. `src/baseComponents/`、`src/componentsUI/`、`src/shared/components/`

新增组件后运行 `pnpm run cmate` 更新索引。

---

## 快速参考

### 组件命名

- 基础 UI：`Doc*` 前缀（如 `DocButton`）
- 业务组件：描述性命名（如 `FileList`）
- 页面容器：按业务域命名（如 `Knowledge`）

### 文件结构

```
ComponentName/
├── index.js
└── style.module.less
```

### 代码模板

```javascript
import React, { useState } from 'react';
import { intl } from 'di18n-react';
import classNames from 'classnames/bind';
import styles from './style.module.less';

const cx = classNames.bind(styles);

const ComponentName = ({ title }) => {
  return <div className={cx('container')}>{title}</div>;
};

export default React.memo(ComponentName);
```
