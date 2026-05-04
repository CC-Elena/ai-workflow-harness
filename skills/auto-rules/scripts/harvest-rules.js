/**
 * 规则收割机 (Harvest Rules)
 * 用于将 AI 提炼的新规则自动追加到 auto-rules/SKILL.md 中
 * 
 * 用法:
 * node scripts/harvest-rules.js "规则标题" "规则详情..." "相关文件/Commit"
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '../RULES.md');

function harvestRule() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('用法: node scripts/harvest-rules.js "<Title>" "<Description>" [Context]');
    process.exit(1);
  }

  const [title, description, context] = args;
  const date = new Date().toISOString().split('T')[0];
  
  // 格式化新规则
  const newRule = `
### ${title} (${date})

**规则**: ${description}

${context ? `> 上下文: ${context}` : ''}

---
`;

  try {
    if (!fs.existsSync(TARGET_FILE)) {
      console.error(`❌ 目标文件不存在: ${TARGET_FILE}`);
      process.exit(1);
    }

    let content = fs.readFileSync(TARGET_FILE, 'utf-8');
    
    // 寻找插入点
    const insertPoint = '<!-- RULES_END -->';
    if (!content.includes(insertPoint)) {
      console.error('❌ 目标文件格式错误: 找不到 <!-- RULES_END --> 标记');
      process.exit(1);
    }

    // 插入规则
    content = content.replace(insertPoint, `${newRule}\n${insertPoint}`);
    
    fs.writeFileSync(TARGET_FILE, content, 'utf-8');
    console.log(`✅ 已成功收割规则: "${title}"`);
    console.log(`📍 已写入: ${TARGET_FILE}`);
    
  } catch (error) {
    console.error('❌ 写入失败:', error);
    process.exit(1);
  }
}

harvestRule();
