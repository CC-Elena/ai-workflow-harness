# 常见实现模式

本文件记录 Codex 在本仓库中应优先遵循的常见实现模式。

## 1. React 组件

1. 优先使用函数组件和 Hooks。
2. 组件文件结构优先使用：

```text
ComponentName/
├── index.js
└── style.module.less
```

3. 用户可见文案必须使用 `intl.t()`。
4. 样式使用 CSS Modules。
5. 组件导出优先保持与同目录现有风格一致。

## 2. 样式

1. 使用 `*.module.less`。
2. 优先使用 `src/assets/style/variable-global.less` 中的语义变量。
3. 不随意修改全局变量。
4. UI 需求需要截图或设计稿对齐时，读取 `skills/ui-fidelity/SKILL.md`。

## 3. 国际化

1. 所有用户可见文案使用 `intl.t('文案')`。
2. 新增文案需同步更新语言资源。
3. 不在组件中硬编码中英文用户文案。

## 4. 组件复用

1. 创建新组件前必须查询复用候选。
2. 复用判断参考 `skills/component-reuse/SKILL.md`。
3. 无法复用时，在任务记录中说明原因。

## 5. 任务执行

1. 先声明影响文件和影响环境。
2. 一次只处理一个明确任务。
3. 修改后运行 `pnpm run qa` 或记录无法运行的原因。
4. 不做与任务无关的重构。

