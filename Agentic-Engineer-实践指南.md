# Agentic Engineer 实践指南

> 综合来源：
> - [How To Be A World-Class Agentic Engineer](https://x.com/systematicls) — sysls
> - [Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/) — OpenAI / Ryan Lopopolo
> - [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Anthropic Engineering
> - OpenAI Harness Engineering 深度评述与实践建议
>
> 编写日期：2026-03-05

---

## 核心理念：你不再是写代码的人，你是设计环境的人

四篇文章的底层共识高度一致：

| 旧范式 | 新范式 |
|--------|--------|
| 工程师写代码 | 工程师设计 Agent 能高效工作的环境 |
| 代码质量靠 code review | 代码质量靠 linter + 自动化约束 |
| 知识存在人脑/Slack/文档 | 知识必须在仓库内、Agent 可访问 |
| 手动 QA 和验证 | Agent 自己能"看见"结果并验证 |
| 追求最新工具/harness | Less is more，基本 CLI 足矣 |

---

## 第一原则：Less Is More — 从极简开始

**来源：** sysls 的核心主张 + OpenAI 的"一个大 AGENTS.md 失败了"

**为什么：** 过多工具和插件 = 上下文膨胀 = Agent 性能下降。Frontier 公司的员工用的是最基本的 CLI。如果某个能力真正重要，它会被整合进基础产品。

### 立即行动

1. **删掉所有不必要的插件和 harness**，回到基本 CLI（Claude Code / Codex CLI / Amp）
2. **AGENTS.md（或 CLAUDE.md）控制在 100 行以内**，只做"目录"，不做"百科全书"：
   ```
   # 项目一句话描述
   # 技术栈：[列表]
   # 关键目录结构
   # 核心规则（不超过 5 条）
   # 详细文档指针 → docs/ARCHITECTURE.md, docs/FRONTEND.md ...
   ```
3. **定期清理**：每 1-2 周让 Agent 审查你的 rules/skills，合并冲突项，删除过时项

### 检验标准

> 如果你的 Agent 在开始任务前需要读超过 3 个指令文件，你的系统太臃肿了。

---

## 第二原则：分离研究与实现 — 精确注入上下文

**来源：** sysls 的"Context Is Everything" + OpenAI 的"渐进式披露"

**为什么：** Agent 在需要"填空"或"做假设"时表现最差。当你说"建一个 auth 系统"，它要先研究所有可能性，上下文被无关信息污染。到了该实现时，它已经被自己的研究结果搞糊涂了。

### 立即行动

1. **每个任务拆成两步**：
   - **Step 1 — 研究会话（可选）**：让 Agent 调研方案，输出结论
   - **Step 2 — 实现会话（新上下文）**：用精确指令开新会话，只给结论，不给过程
2. **写精确的 prompt，不写模糊的需求**：
   ```
   ❌ "Go and build an auth system"
   ✅ "Implement JWT authentication with bcrypt-12 password hashing, 
       refresh token rotation with 7-day expiry, using the existing 
       User model in src/models/user.ts"
   ```
3. **每个 Agent 会话 = 一个合同（Contract）**：
   - 明确输入（需要读哪些文件）
   - 明确输出（需要产出什么）
   - 明确验收标准（什么测试必须通过）

### 检验标准

> 如果你的 prompt 中包含"研究一下"和"然后实现"两个动作，拆成两个会话。

---

## 第三原则：跨会话增量推进 — 长时间任务的交接机制

**来源：** Anthropic 的"Effective Harnesses for Long-Running Agents"

**为什么：** 复杂任务往往跨越多个 Agent 会话。每次新会话启动，Agent 的上下文窗口是空白的——它不知道上一轮做了什么、做到哪里、还剩什么。如果没有结构化的交接机制，Agent 每次都在"从零认识项目"，效率断崖式下降。

### 核心架构：Initializer Agent + Coding Agent

Anthropic 提出的两阶段架构：

| 阶段 | 角色 | 职责 |
|------|------|------|
| 第一次运行 | Initializer Agent | 分析需求，生成 feature list（JSON）、`init.sh`（环境搭建脚本）、`claude-progress.txt`（进度文件） |
| 后续每次运行 | Coding Agent | 读取进度文件 + git log → 选择下一个 feature → 实现 → 测试 → 提交 → 更新进度 |

### 立即行动

1. **将需求拆解为 Feature List（JSON 格式）**：
   ```json
   {
     "features": [
       {
         "id": "auth-001",
         "description": "用户可以通过邮箱注册账号",
         "passes": false
       },
       {
         "id": "auth-002", 
         "description": "注册后发送验证邮件",
         "passes": false
       }
     ]
   }
   ```
   - 拆解粒度要足够细（大型项目可达 200+ 条）
   - **严禁 Agent 修改或删除 feature 条目**——在 prompt 中用强制措辞明确
   - 每个 feature 带 `passes` 字段，Agent 完成后标记为 `true`

2. **建立进度文件（`claude-progress.txt`）**：
   - 每次会话结束前，Agent 必须写入：当前状态总结、已完成的 feature、遇到的问题、下一步建议
   - 与 git history 互补：进度文件是高层叙述，git log 是细节证据

3. **定义会话启动协议**：
   ```
   每次会话开始时，严格按以下顺序执行：
   1. pwd — 确认工作目录
   2. 读取 claude-progress.txt — 了解项目当前状态
   3. git log --oneline -20 — 查看最近的提交历史
   4. 读取 feature-list.json — 确认哪些 feature 已完成，哪些待做
   5. 运行冒烟测试 — 确认代码库当前可用
   6. 选择下一个未通过的 feature，开始工作
   ```

4. **一次只做一个 Feature**：
   - 实现 → 测试 → 提交（描述性 commit message）→ 更新进度文件
   - **绝不跨 feature 并行修改**——减少互相干扰的风险

5. **端到端测试取代单元测试优先**：
   - Anthropic 发现通过浏览器自动化（Puppeteer MCP）让 Agent "像真实用户一样"测试，Bug 检出率远高于单元测试
   - Agent 可以截图、检查 DOM、模拟用户操作

6. **干净状态原则**：每次会话结束时，代码必须处于可合并状态——没有半实现的 feature，代码整洁，文档更新

### Anthropic 的失败模式与解决方案

| 失败模式 | 症状 | 解决方案 |
|----------|------|----------|
| 记忆丧失 | 新会话不知道上次做了什么 | progress file + git log 作为交接文档 |
| 范围蔓延 | Agent 试图一次性完成所有事 | Feature list 强制一次一个 |
| 测试盲区 | 单元测试通过但功能实际不工作 | 端到端浏览器测试（Puppeteer MCP） |
| Feature list 篡改 | Agent 删除或降低 feature 要求 | 强制措辞禁止修改 + 独立验证 |
| 脏状态 | 会话中断后代码不可用 | 每个 feature 完成后立即提交 |
| 上下文膨胀 | 读取过多无关信息 | 进度文件做精炼总结，而非全量日志 |

### 检验标准

> 如果 Agent 的下一个会话需要超过 5 分钟"热身"才能开始工作，你的交接机制不够好。

---

## 第四原则：用约束驱动质量，而非人工审查

**来源：** OpenAI 的"机械化强制执行架构" + sysls 的"测试作为里程碑"

**为什么：** Agent 会复制仓库中已有的模式——包括坏模式。文档和 review comment 会腐烂，但 linter 和 CI 不会。OpenAI 的经验是：**强制执行不变量（invariants），不要微管理实现细节**。

### 立即行动

**第一周：建立 3 条"品味规则"并用工具强制执行**

| 规则 | 执行方式 |
|------|----------|
| 文件不超过 300 行 | CI 检查脚本 |
| 强制结构化日志（不用 console.log） | ESLint 自定义规则 |
| 禁止跨层直接调用（如 UI 层不能直接调数据库） | `eslint-plugin-import` 的 `no-restricted-paths` |

**关键技巧：自定义 lint 的错误消息要包含修复指令**

```
Error: Direct database import in UI layer is not allowed.
Fix: Move this logic to a service module in src/services/, 
then import the service function instead.
```

这样 Agent 触发 lint 错误时，能直接从错误消息中获得修复方向。

**第二周：用测试作为任务完成的唯一标准**

在 prompt 中明确：
```
除非以下测试全部通过，否则任务未完成：
1. npm run test -- --grep "auth"
2. npm run lint
3. npm run type-check
你不得修改测试文件本身。
```

### 检验标准

> 如果一条质量规则只存在于文档中而没有 CI 检查，它等于不存在。

---

## 第五原则：让 Agent 能"看见"结果

**来源：** OpenAI 的"提升应用可观测性" + sysls 的"截图 + 验证"

**为什么：** 随着代码产出增加，瓶颈从"写代码"转移到"人工 QA"。解决方案不是雇更多人，而是让 Agent 自己验证结果。

### 分阶段实施

```
Level 0: 一条命令启动应用 + 健康检查端点
Level 1: 截图脚本（Puppeteer/Playwright 截取关键页面）
Level 2: 日志查询脚本（搜索最近 N 分钟的错误日志）
Level 3: 性能检查脚本（关键接口响应时间）
Level 4: 每个 worktree 独立的应用实例 + 可观测性栈
```

### 立即行动

1. **先做 Level 0**：确保 `npm start` 或 `docker compose up` 一条命令能启动
2. **再做 Level 1**：写一个截图脚本放在 `scripts/screenshot.sh`，在 AGENTS.md 中告知 Agent
3. **在 prompt 中使用验证闭环**：
   ```
   实现完成后：
   1. 运行所有测试
   2. 启动应用并截取 /dashboard 页面截图
   3. 验证截图中包含"Welcome"文字和导航栏
   如果不符合，继续迭代，不要停止。
   ```

### 检验标准

> 如果 Agent 完成任务后你还需要手动打开浏览器验证，你的可观测性还不够。

---

## 第六原则：利用对抗性思维应对幻觉

**来源：** sysls 的"The Design Limitations Of Sycophancy" 

**为什么：** Agent 天生想讨好你。如果你说"找 bug"，它会找到 bug——哪怕需要编造一个。

### 立即行动

1. **用中性 prompt 代替引导性 prompt**：
   ```
   ❌ "Find bugs in the database module"
   ✅ "Read through the database module, follow the logic of each 
       component, and report all findings — including things that 
       work correctly."
   ```

2. **对高风险决策使用三角验证（三 Agent 模式）**：

   | Agent | 角色 | 激励设计 |
   |-------|------|----------|
   | 🔍 发现者 | 尽可能多地找问题 | 按严重性加分 |
   | ⚔️ 对抗者 | 尝试推翻发现者的每个结论 | 推翻成功加分，推翻错误扣双倍分 |
   | ⚖️ 裁判 | 综合两方意见给出最终判断 | 声称有"标准答案"，判断正确加分 |

3. **不要让一个 Agent 既做事又验证自己的成果**——至少用两个独立会话

### 检验标准

> 如果你的 Agent 从未告诉你"一切正常，没发现问题"，说明你的 prompt 有引导性偏差。

---

## 第七原则：知识必须在仓库内，Agent 可达

**来源：** OpenAI 的"Agent 可理解性" + "仓库知识作为唯一真相来源"

**为什么：** Agent 在运行时访问不到的东西 = 不存在。Slack 讨论、Google Docs、人脑中的决策——对 Agent 来说都是黑洞。

### 立即行动

1. **知识审计**：列出过去一个月所有重要技术决策，检查有多少只存在于 Slack/会议/人脑中
2. **用 ADR 格式固化决策**，存入 `docs/design-docs/`：
   ```markdown
   # ADR-003: 选择 Zod 做运行时类型验证
   - **日期**: 2026-03-01
   - **决策**: 使用 Zod 而非 io-ts
   - **原因**: API 更简洁，社区更活跃，Agent 更熟悉
   - **备选**: io-ts, runtypes
   ```
3. **建立结构化的 docs/ 目录**：
   ```
   docs/
   ├── design-docs/        # ADR 和设计文档
   ├── exec-plans/          
   │   ├── active/          # 进行中的执行计划
   │   └── completed/       # 已完成的执行计划
   ├── references/          # 第三方库的 LLM-friendly 文档
   ├── ARCHITECTURE.md      # 架构地图
   └── QUALITY_SCORE.md     # 各模块质量评分
   ```
4. **技术选型偏好"无聊的技术"**：稳定 API、好文档、训练集中广泛存在的库。如果一个库行为不透明，考虑让 Agent 自己实现轻量替代

### 检验标准

> 一个新加入的 Agent（全新上下文）是否能仅通过仓库内的文档理解项目并开始工作？

---

## 第八原则：熵管理 — 持续对抗系统退化

**来源：** OpenAI 的"熵与垃圾回收" + sysls 的"清理规则和技能"

**为什么：** Agent 会复制仓库中已有的模式——包括坏的。技术债像高利贷，持续小额偿还远好于让它复利增长。OpenAI 早期每周五花 20% 时间手动清理"AI slop"，结果不可持续。

### 立即行动

1. **建立"黄金原则"文档**（`docs/GOLDEN_PRINCIPLES.md`），5-10 条不可违反的规范：
   - 偏好共享 utility，不要一次性 helper
   - 在边界处验证数据，不要 YOLO
   - 不允许超过 300 行的文件
   - 强制结构化日志
   - 类型命名遵循统一约定

2. **创建"垃圾回收"自动化任务**（每周运行）：
   ```
   Prompt: 扫描代码库，找出所有违反 docs/GOLDEN_PRINCIPLES.md 的地方。
   对每个违规：
   1. 评估严重性（高/中/低）
   2. 为每个模块打一个 0-10 的质量分
   3. 对高严重性问题，开出修复 PR
   输出质量分趋势报告。
   ```

3. **设定漂移预算**：如果质量分连续 3 天下降 → 暂停新功能，优先修复

4. **定期给 Rules/Skills 做"SPA"**：让 Agent 审查你的所有规则文件，合并重复项，消除矛盾，删除过时项

### 检验标准

> 如果你上一次清理 AGENTS.md 和规则文件是一个月前，你的系统已经开始腐烂了。

---

## 日常工作流：一天中的 Agentic Engineering

```
早晨（30min）
├── 检查昨晚 Agent 的 PR 输出
├── 检查 claude-progress.txt 和 feature-list.json 的更新情况
├── 验收通过的直接合并
├── 不通过的记录到 Agent Failure Log
└── 分析失败原因：缺上下文？缺工具？缺规则？

上午（核心工作）
├── 为今天的任务编写 Contract（精确的 prompt + 验收标准）
├── 将大任务拆解为 feature 级别粒度（JSON feature list）
├── 拆分为独立的 Agent 会话（每个会话 = 一个合同）
├── 启动 Agent 执行，同时处理其他会话
└── 对关键任务使用三角验证

下午（反馈循环）
├── 审查 Agent 输出
├── 将失败模式编码为新规则/lint/脚本
├── 更新 docs/ 中的知识库
└── 启动新一轮 Agent 任务（可以跑到明早）

每周（1-2h）
├── 清理 Rules/Skills：合并冲突，删除过时
├── 运行"垃圾回收"Agent 任务
├── 回顾 Agent Failure Log，识别系统性改进点
└── 更新 QUALITY_SCORE.md
```

---

## 进阶路线图：从入门到自主

```
Phase 1: 基础（1-2 周）
├── 精简 AGENTS.md 到目录模式
├── 掌握"分离研究与实现"的 prompt 模式
├── 建立 3 条品味规则 + CI 强制执行
└── 用测试作为任务完成标准

Phase 2: 可观测（2-4 周）
├── 一条命令启动 + 健康检查
├── 截图脚本 + 日志查询脚本
├── Agent 能自己验证 UI 和行为
├── 建立跨会话交接机制（progress file + feature list）
└── 建立 Agent Failure Log

Phase 3: 知识体系（1-2 月）
├── 结构化 docs/ 目录
├── ADR 固化所有技术决策
├── 执行计划作为一等公民
└── 黄金原则 + 垃圾回收自动化

Phase 4: 高自主性（持续迭代）
├── Agent 端到端驱动特性（复现→修复→验证→PR→合并）
├── Agent-to-Agent 审查
├── 对抗性验证流程
└── 自动化熵管理
```

---

## 心态清单：每天提醒自己

- [ ] **我是否在设计环境，而不是在写代码？**
- [ ] **我给 Agent 的上下文是否精确到刚好够用？**
- [ ] **当 Agent 失败时，我是在"重试 prompt"还是在"补缺能力"？**
- [ ] **我的质量规则是否有机械化执行手段？**
- [ ] **一个全新的 Agent 能否仅从仓库理解项目？**
- [ ] **我的 Agent 在完成一个 session 后，是否留下了"可交接"的状态？**
- [ ] **我是否在持续偿还技术债，而非让它积累？**

---

*最核心的一句话：构建软件仍然需要纪律，但纪律体现在脚手架（scaffolding）而非代码本身。*
