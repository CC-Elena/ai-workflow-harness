---
name: skeleton
description: 为页面/组件创建或更新骨架屏。用于骨架屏、skeleton、加载占位、首屏优化时。
version: 0.1.0
dependencies: [frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js skeleton` -->

# 骨架屏开发流程

> 代码示例参见 [references/sample-skeleton.md](./references/sample-skeleton.md) | 详细实现和常见问题参见 [REFERENCE.md](./REFERENCE.md)

## 概述

本项目采用 **3 阶段骨架屏** 模式：

- **Stage 1**：HTML 骨架屏（JS bundle 加载前）
- **Stage 2**：Suspense 骨架屏（懒加载组件下载中）
- **Stage 3**：API 加载骨架屏（数据接口请求中）

---

## 场景判断

**新建骨架屏**：执行阶段一 → 阶段二 → 阶段三

**更新骨架屏**：跳过阶段一，直接执行阶段二 → 阶段三

---

## 阶段一：创建骨架屏文件（仅新建时）

1. 创建目录：`src/components/SkeletonPage/[PageName]/`
2. 创建 `components/body.js` - 骨架屏 HTML
3. 创建 `[pageName]ForImport.js` - Suspense 入口
4. 创建 `[pageName]ForIndex.js` - HTML 注入入口
5. 注册到 `Preview.js`
6. 集成到 `route.js`
7. 实现 Stage 3（GlobalData 状态）
8. 注册到 `totalSkeleton.js`
9. 配置 `public/index.html` 路由映射

---

## 阶段二：生成骨架屏代码

1. **抓取实际 DOM**：启动 `npm run lint`，访问目标页面
2. **分析对比**：DOM 结构 + 设计稿 + 已有骨架屏代码
3. **生成代码**：复用公共组件（SharedHeader、FileTableSkeleton）
4. **添加样式**：更新 `commonCss.js`
5. **验证**：访问 `/skeleton-debug` 预览

---

## 阶段三：注入到 HTML

```bash
npm run skeleton
```

验证：
```bash
grep -c "index-skeleton-style" public/index.html
# 期望输出：1
```

---

## 文件结构

```
src/components/SkeletonPage/
├── [PageName]/
│   ├── components/body.js           # 骨架屏 HTML
│   ├── [pageName]ForImport.js       # Suspense 入口
│   ├── [pageName]ForIndex.js        # HTML 注入入口
│   └── [PageName]ContentSkeleton.js # API 加载骨架屏
├── common/
│   ├── commonCss.js                 # 共享样式
│   ├── SharedHeader.js              # 共享头部
│   └── FileTableSkeleton.js         # 文件表格骨架
└── Preview.js                       # 骨架屏预览注册
```
