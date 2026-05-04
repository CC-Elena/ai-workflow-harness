#!/usr/bin/env node
/**
 * Skill Initializer - Creates a new skill from template
 * 
 * Usage:
 *     node skills/skill-creator/scripts/init-skill.js <skill-name> [options]
 * 
 * Examples:
 *     node scripts/init-skill.js my-new-skill
 *     node scripts/init-skill.js my-api-helper --path skills
 */

const fs = require('fs');
const path = require('path');

const SKILL_TEMPLATE = `---
name: {skill_name}
description: [TODO: 这项 skill 的功能以及何时使用它。必须包含【触发时机】——例如特定的文件类型、任务场景或用户意图。]
version: 0.1.0
---

# {skill_title}

## 概述

[TODO: 用 1-2 句话解释这个 skill 赋予了 AI 什么能力]

## Skill 结构建议

[TODO: 选择最适合的结构。常用模式：

**1. 工作流模式** (适合顺序流程)
- 适用于步骤明确的任务
- 示例：DOCX 处理 -> "流程决策树" -> "读取" -> "创建" -> "编辑"
- 结构：## 概述 -> ## 流程决策树 -> ## 第一步 -> ## 第二步...

**2. 任务模式** (适合工具集合)
- 适用于提供多种独立功能的 skill
- 示例：PDF 处理 -> "快速开始" -> "合并 PDF" -> "拆分 PDF" -> "提取文本"
- 结构：## 概述 -> ## 快速开始 -> ## 任务类目 1 -> ## 任务类目 2...

**3. 参考/规范模式** (适合标准或说明书)
- 适用于品牌指南、代码规范等
- 示例：品牌风格 -> "设计原则" -> "色彩" -> "字体" -> "使用案例"
- 结构：## 概述 -> ## 准则 -> ## 详细规范 -> ## 用法...

**4. 能力模式** (适合复杂系统)
- 适用于包含多个相互关联功能的 skill
- 示例：产品管理 -> "核心能力" -> 编号的能力列表
- 结构：## 概述 -> ## 核心能力 -> ### 1. 功能 A -> ### 2. 功能 B...

以上模式可以混合使用。完成后删除本章节。]

## [TODO: 替换为所选结构的第一章节标题]

[TODO: 在此处添加内容。参考现有 skill：
- 复杂工作流使用决策树
- 具体的代码示例
- 真实的 Use Cases
- 按需引用 references 文件]

## 资源 (Resources)

本 skill 包含示例资源目录，展示了如何组织不同类型的资源：

### scripts/
可直接运行的脚本 (Node.js/Python/Bash)，用于自动化、数据处理或特定操作。

**适用场景：** 需要确定性结果的复杂逻辑、重复性任务。

### references/
参考文档，AI 在需要时会读取这些内容以辅助决策。

**适用场景：** 详细 API 文档、数据库 Schema、长篇指南。

### assets/
由 AI 在输出中使用的文件，不会被读取到上下文中。

**适用场景：** 模板文件 (.pptx, .docx)、样板代码、图片、图标、字体。

---

**提示：请删除不需要的目录。** 不是每个 skill 都需要所有资源。
`;

const EXAMPLE_SCRIPT = `#!/usr/bin/env node
/**
 * {skill_name} 的示例脚本
 * 
 * 这是一个占位脚本，请替换为实际逻辑或删除。
 */

function main() {
  console.log("{skill_title} 的示例脚本已运行");
  // TODO: 添加实际脚本逻辑
  // 例如：数据处理、文件转换、API 调用等
}

if (require.main === module) {
  main();
}
`;

const EXAMPLE_REFERENCE = `# {skill_title} 参考文档

这是详细参考文档的占位符。请替换为实际内容或删除。

## 何时使用参考文档 (References)

参考文档适合存放：
- 完整的 API 文档
- 详细的操作手册
- 复杂的多步骤流程
- 篇幅过长不适合放在 SKILL.md 主文件的内容
- 仅在特定场景下需要的信息

## 结构建议

### API 文档示例
- 概述
- 认证方式
- 接口列表与示例
- 错误码
- 频率限制

### 工作流指南示例
- 前置条件
- 分步指南
- 常见模式
- 故障排查
- 最佳实践
`;

const EXAMPLE_ASSET = `# 示例资源文件 (Asset)

此目录用于存放静态资源文件。
请替换为实际资源（模板、图片、字体等）或删除。

assets 目录下的文件**不会**被加载到 AI 上下文中，而是用于在 AI 的输出中使用（例如复制文件、作为模板填充）。

## 常见资源类型

- 模板：.pptx, .docx, 样板项目目录
- 图片：.png, .jpg, .svg
- 字体：.ttf, .woff2
- 样板代码：初始文件结构
- 数据：.csv, .json示例
`;

function toTitleCase(str) {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function initSkill(skillName, outputDir) {
  const skillDir = path.resolve(outputDir, skillName);
  
  if (fs.existsSync(skillDir)) {
    console.error(`❌ 错误：Skill 目录已存在：${skillDir}`);
    return false;
  }
  
  const title = toTitleCase(skillName);
  
  try {
    // 创建目录
    fs.mkdirSync(skillDir, { recursive: true });
    console.log(`✅ 已创建目录：${skillDir}`);
    
    // 创建 SKILL.md
    const skillContent = SKILL_TEMPLATE
      .replace(/{skill_name}/g, skillName)
      .replace(/{skill_title}/g, title);
    
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);
    console.log(`✅ 已创建 SKILL.md`);
    
    // 创建 scripts/
    const scriptsDir = path.join(skillDir, 'scripts');
    fs.mkdirSync(scriptsDir);
    const scriptContent = EXAMPLE_SCRIPT
      .replace(/{skill_name}/g, skillName)
      .replace(/{skill_title}/g, title);
    fs.writeFileSync(path.join(scriptsDir, 'example.js'), scriptContent);
    fs.chmodSync(path.join(scriptsDir, 'example.js'), 0o755);
    console.log(`✅ 已创建 scripts/example.js`);
    
    // 创建 references/
    const refDir = path.join(skillDir, 'references');
    fs.mkdirSync(refDir);
    const refContent = EXAMPLE_REFERENCE
      .replace(/{skill_title}/g, title);
    fs.writeFileSync(path.join(refDir, 'api_reference.md'), refContent);
    console.log(`✅ 已创建 references/api_reference.md`);
    
    // 创建 assets/
    const assetsDir = path.join(skillDir, 'assets');
    fs.mkdirSync(assetsDir);
    fs.writeFileSync(path.join(assetsDir, 'example_asset.txt'), EXAMPLE_ASSET);
    console.log(`✅ 已创建 assets/example_asset.txt`);
    
    console.log(`\n✅ Skill '${skillName}' 初始化成功！位置：${skillDir}`);
    console.log(`\n后续步骤：`);
    console.log(`1. 编辑 SKILL.md 完成 TODO 项`);
    console.log(`2. 根据需要修改或删除示例文件`);
    
    return true;
  } catch (error) {
    console.error(`❌ 初始化失败：${error.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const skillName = args[0];
  
  if (!skillName || args.includes('-h') || args.includes('--help')) {
    console.log(`用法: node init-skill.js <skill-name> [--path <output-dir>]`);
    process.exit(1);
  }
  
  let outputDir = process.cwd();
  
  // 默认尝试使用 skills 目录
  const defaultSkillsDir = path.join(process.cwd(), 'skills');
  if (fs.existsSync(defaultSkillsDir) && !args.includes('--path')) {
    outputDir = defaultSkillsDir;
  }

  if (args.includes('--path')) {
    outputDir = args[args.indexOf('--path') + 1] || outputDir;
  }
  
  // 简化的名称验证
  if (!/^[a-z0-9-]+$/.test(skillName)) {
    console.error('❌ Skill 名称必须由小写字母、数字和连字符组成 (例如: my-skill)');
    process.exit(1);
  }
  
  if (!initSkill(skillName, outputDir)) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
