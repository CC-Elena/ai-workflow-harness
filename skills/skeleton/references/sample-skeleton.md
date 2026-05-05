# 骨架屏代码示例

## Stage 1：HTML 骨架屏（注入到 index.html）

```javascript
// src/components/SkeletonPage/MyPage/components/body.js
import { css } from '../../../common/commonCss';

const body = `
<div class="${css.container}">
  <div class="${css.header}">
    <div class="${css.logo}"></div>
    <div class="${css.nav}">
      <div class="${css.navItem}"></div>
      <div class="${css.navItem}"></div>
    </div>
  </div>
  <div class="${css.content}">
    <div class="${css.sidebar}">
      <div class="${css.menuItem}"></div>
      <div class="${css.menuItem}"></div>
    </div>
    <div class="${css.main}">
      <div class="${css.title}"></div>
      <div class="${css.paragraph}"></div>
      <div class="${css.paragraph}"></div>
    </div>
  </div>
</div>
`;

export default body;
```

---

## Stage 2：Suspense 骨架屏入口

```javascript
// src/components/SkeletonPage/MyPage/myPageForImport.js
import React, { Suspense, lazy } from 'react';
import MyPageSkeleton from './MyPageContentSkeleton';

const MyPageContent = lazy(() => import('@/pages/MyPage'));

const MyPageForImport = (props) => (
  <Suspense fallback={<MyPageSkeleton />}>
    <MyPageContent {...props} />
  </Suspense>
);

export default MyPageForImport;
```

---

## Stage 3：API 加载骨架屏

```javascript
// src/components/SkeletonPage/MyPage/MyPageContentSkeleton.js
import React from 'react';
import { Skeleton } from 'antd';
import SharedHeader from '../common/SharedHeader';
import styles from './style.module.less';

const MyPageContentSkeleton = () => (
  <div className={styles.container}>
    <SharedHeader />
    <div className={styles.content}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  </div>
);

export default MyPageContentSkeleton;
```

---

## 路由配置示例

```javascript
import MyPageForImport from '@/components/SkeletonPage/MyPage/myPageForImport';

{
  path: '/my-page',
  component: MyPageForImport,
}
```
