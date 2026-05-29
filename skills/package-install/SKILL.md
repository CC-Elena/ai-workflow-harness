---
name: package-install
description: 一体化执行 ai-workflow-harness 的安装、初始化、项目宪法生成与验证。当用户说“安装 harness”“按安装 skill 执行”“setup/install/migrate harness”“接入并验证”时触发此 Skill。
version: 0.3.0
---

# Package Install Skill

把「安装 → 资产落盘 → 项目宪法生成 → 验证」收敛成单一可执行流程，专用于 ai-workflow-harness 包。

## 触发语句

1. 按安装 skill 执行
2. 帮我安装 ai-workflow-harness（并接入当前项目）
3. setup / install / migrate harness
4. 一键安装、接入并验证
5. 把这个仓库接入 AI Workflow Harness 并跑通验证

## 执行模式判定（必做）

进入流程前先确定模式，模式决定执行路径：

| 模式 | 触发条件 | 主路径 |
|---|---|---|
| **A. CLI 接入（推荐）** | 目标是把 harness 接入一个已有项目；npm 可达 | `npx ai-workflow-harness init` + 项目宪法生成 |
| **B. 离线 / 无 npm** | 无法访问 npm 注册中心 | 委托 `skills/harness-migration/SKILL.md` 的 git clone 路径 |
| **C. 仅安装、不接入** | 用户显式声明「仅安装/只验证 CLI」 | 仅 Step 1 + Step 2 + CLI version 验证 |

无法判定时默认模式 A。

## 子 Skill 关系（去重）

- 模式 A：本 Skill 是主流程；**仅在 Step 4 生成项目宪法时**调用 `skills/harness-migration/SKILL.md` **Phase 3**（不要执行 Phase 1/2，避免与 `init` 重复复制资产）。
- 模式 B：本 Skill 退化为入口，整体委托 `harness-migration` 全 Phase。
- 模式 C：不触发 `harness-migration`。

## 标准执行步骤（模式 A）

按顺序执行，不要跳步。每一步必须有命令和结论。

### Step 1: 环境与场景预检

1. `node -v`（要求 ≥ 18）、`npm -v`
2. 当前目录是否为目标项目根目录（存在 `package.json` 或 `.git`）
3. 检查 git 工作区状态：`git status --porcelain`，若非空提醒用户先 commit/stash
4. 检查是否已接入：是否存在 `.ai/`、`AGENTS.md`、`skills/project/SKILL.md`
   - 全部不存在 → 全新接入
   - 部分存在 → 升级模式，Step 3 必须加 `--force` 或精确选择子集
   - 完整存在 → 询问用户「升级」还是「跳到验证」

任何一项不满足，先报告并给修正命令，再继续。

### Step 2: CLI 可达性验证

只用 npx，不要安装为项目依赖、不要全局安装（避免污染）：

```bash
npx -y ai-workflow-harness@latest --version
```

成功 = 看到版本号。失败按「失败处理规则」分类处理。

### Step 3: 资产落盘（init）

按顺序两次调用：

1. **预演**：`npx -y ai-workflow-harness@latest init --dry-run`
   - 必读输出：哪些文件会写、哪些会 skip
2. **真实执行**：`npx -y ai-workflow-harness@latest init`
   - 升级模式时按需加 `--force`
   - 需要额外 Skills：`--with-skills=frontend-dev,test` 或 `--all-skills`
   - 不需要 Skills：`--no-skills`

CLI `init` 会落盘：`.ai/{workflows,templates,prompts,policies}/`、`.ai/context/skill-routing-minimal.md`、`.ai/evals/` 规则、`AGENTS.md`、`scripts/check-harness-run.mjs`、core Skills。

**CLI `init` 不会生成**（关键）：`skills/project/SKILL.md`、`.ai/context/project-map.md`、`.ai/context/common-patterns.md`。这三件由 Step 4 生成。

### Step 4: 生成项目宪法（不可省略）

读取并执行 `skills/harness-migration/SKILL.md` 的 **Phase 3 全部子步骤**，**只做 Phase 3，跳过 Phase 1/2/4**：

1. 分析当前项目：读 `package.json`、目录结构、主要框架/语言
2. 生成 `skills/project/SKILL.md`（项目专属：启动命令、技术栈、代码规范）
3. 生成 `.ai/context/project-map.md`（目录地图）
4. 生成 `.ai/context/common-patterns.md`（1-2 个本项目典型代码片段）
5. 追加/合并 `.ai/context/skill-routing.md`（按已安装 Skills 与项目场景建立映射）

生成前先读现有同名文件，避免覆盖用户已有内容；冲突时改为 `*.generated.md` 并提示用户合并。

### Step 5: 验证（必须执行，全部要跑）

| 检查项 | 命令 / 方式 | 通过标准 |
|---|---|---|
| CLI 版本 | `npx -y ai-workflow-harness@latest --version` | 输出版本号 |
| 资产存在 | 检查 `.ai/workflows/`、`.ai/templates/`、`AGENTS.md`、`scripts/check-harness-run.mjs` | 全部存在 |
| 项目宪法 | 检查 `skills/project/SKILL.md`、`.ai/context/project-map.md` | 全部存在且非空 |
| Gate 脚本 | `node scripts/check-harness-run.mjs --help` 或在已有 spec 上 `npx ai-workflow-harness check <specPath>` | 退出码 0 或显示 usage |

**注意**：`ai-workflow-harness check` 是 Spec gate，需要 `specPath` 或 `--changed --base X --head Y`，**不要裸跑 `check`**，否则会报参数错误。无 Spec 可验时改用 `--help` 验证脚本可运行。

失败时先给「失败项 + 根因猜测 + 修复命令」三元组，再附原始日志摘录（最多 20 行）。

### Step 6: 结果输出格式

最终回复必须包含：

1. **模式**：A / B / C 及判定依据
2. **已执行命令**：按 Step 分组列出
3. **落盘清单**：实际写入/跳过的路径（取自 init 输出 + Step 4 生成的文件）
4. **验证矩阵**：Step 5 表格每行的通过/失败
5. **失败修复命令**（若有）
6. **下一步建议**（≤ 3 条，例如：跑首个 Spec、提交资产到 git、按需 `--all-skills` 扩充）

## 失败处理规则

| 失败类型 | 处理动作 |
|---|---|
| `npx` 拉不到包 | 检查网络/镜像：`npm config get registry`；建议 `npm config set registry https://registry.npmjs.org/` |
| `EACCES` 权限错误 | 改用 npx（已是默认），不要 `sudo npm install -g` |
| `init` 跳过过多文件 | 升级模式确认；如需覆盖加 `--force`，禁止盲目覆盖用户已编辑的 `AGENTS.md` |
| 项目宪法生成被覆盖风险 | 改写为 `*.generated.md`，让用户人工合并 |
| `check` 报参数错误 | 不是 bug，是用法错误；改用 `--help` 或提供 `specPath` |
| git 工作区脏 | 中断流程，提示先 commit/stash，再重跑 |
| 模式 A 网络不可达 | 降级模式 B，整体委托 `harness-migration` |

## 禁止事项

1. 不要把 ai-workflow-harness 装为项目 dependency（`npm i ai-workflow-harness`）— 它是工具包，用 npx 即可
2. 不要 `npm install -g`，避免污染全局
3. 不要裸跑 `npx ai-workflow-harness check`（会报参数错）
4. 不要在仅完成 Step 3（init 落盘）时声称「已接入 Harness」— 必须完成 Step 4 项目宪法
5. 不要静默用 `--force` 覆盖已存在的 `AGENTS.md` / `skills/project/SKILL.md`
6. 不要在失败时只贴日志，必须给修复命令
7. 不要执行 `rm -rf`、`git reset --hard` 等破坏性命令
8. 不要在迁移路径上同时跑 `init` 和 `harness-migration` Phase 1/2（资产重复来源会冲突）