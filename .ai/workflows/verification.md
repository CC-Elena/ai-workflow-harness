# 验证协议

本协议定义 Codex 修改代码后的验证顺序。验证命令优先复用项目已有命令，不额外开发测试平台。

## 1. 基础原则

1. 修改代码后必须验证。
2. 优先运行与修改范围最相关、成本最低的验证。
3. 中等及以上改动至少运行项目编译检查。
4. 验证失败时先判断是否由本次修改引入。
5. 所有验证结果必须记录到 Run Record。

## 2. 推荐验证顺序

### 2.1 静态检查

优先使用项目现有命令：

```bash
npm run lint
npm run typecheck
npm run build
```

如果某个项目仍保留统一 QA 命令，可优先使用：

```bash
pnpm run qa
```

### 2.2 单元或组件测试

涉及工具函数、Hook、复杂状态逻辑时，优先补充或运行对应测试。

### 2.3 页面验证

涉及 UI 或交互时：

1. 启动本地开发环境。
2. 打开目标页面。
3. 执行关键交互。
4. 截图检查布局、文案、空态、加载态、错误态。

### 2.4 Review 验证

涉及较大改动时，使用 `skills/code-review/SKILL.md` 做自查。

### 2.5 Harness 交付门禁

涉及真实需求交付或代码变更时，交付前运行：

```bash
npm run harness:check -- specs/{feature}
```

在 CI 的 pull request 事件中，使用 PR 真实 diff 模式：

```bash
npm run harness:check -- --changed --base <baseRef> --head <headRef>
```

该模式会检查 `base...head` 的所有变更文件，要求它们被至少一个本 PR 涉及的 Run Record 的“实际 Diff 覆盖表”覆盖。`Diff 覆盖模式：Feature scope` 只影响本地单 feature 检查，不会在 PR 模式中隐藏跨目录变更。

该命令失败时，不得将 Run Record 状态写为 `Success`。业务功能验收仍由需求自己的验收标准、测试或浏览器验证负责；`harness:check` 只检查流程、证据和范围控制。

## 3. 验证记录格式

记录到 `specs/{feature}/run-record.md`：

| 验证项 | 命令或方式 | 结果 | 说明 |
|--------|------------|------|------|
| Lint | `npm run lint` | Pass / Fail / Skipped | |
| Typecheck | `npm run typecheck` | Pass / Fail / Skipped | |
| Test | | | |
| Build | `npm run build` | Pass / Fail / Skipped | |
| Screenshot | | | |
| Review | | | |
| Harness Check | `npm run harness:check -- specs/{feature}` | Pass / Fail / Skipped | |

如果某次验证需要独立归档，可使用 `.ai/templates/verification-record-template.md` 保存为：

```text
specs/{feature}/verification-record.md
```

## 4. 跳过验证的要求

如果无法运行验证，必须说明原因：

1. 缺少依赖。
2. 命令不存在。
3. 环境无法启动。
4. 验证耗时过长且用户未要求。
5. 本次仅修改文档。

跳过验证不能写成“已验证”。

## 5. 失败处理

验证失败时：

1. 读取失败日志。
2. 判断是否与本次修改有关。
3. 若有关，按 `.ai/prompts/fix-verification-failure.md` 修复。
4. 若无关，记录为既有问题，不擅自扩大修改范围。
5. 若无法判断，向用户说明并请求确认。
