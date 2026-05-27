import fs from 'node:fs';
import path from 'node:path';

export function readStdinJson() {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) return {};
  return JSON.parse(input);
}

export function repoPath(...parts) {
  return path.join(process.cwd(), ...parts);
}

export function readPolicy() {
  const policyPath = repoPath('.ai/policies/codex-rule-levels.json');
  return JSON.parse(fs.readFileSync(policyPath, 'utf8'));
}

export function isTruthyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function classifyPrompt(prompt = '') {
  const text = prompt.toLowerCase();
  const explicitSpec = /\/spec|走\s*spec|进入\s*spec|按\s*spec|生成\s*spec|用\s*sdd|完整需求流程/i.test(prompt);
  const explicitMiniSpec = /\/mini-spec|mini\s*spec|轻量\s*spec|简单\s*spec/i.test(prompt);
  const failure = /失败|报错|修复|fix|failed|failure|rca|回归|回滚/i.test(prompt);
  const harnessMaintenance = /harness|\.ai|\.codex|agents\.md|hook|approval|sandbox|规则|模板|工作流|workflow|门禁|check-harness|codex/i.test(prompt);
  const risky = /权限|auth|登录|支付|生产|部署|ci|workflow|依赖|install|package\.json|删除|rm\s|安全|secret|token|approval|sandbox|hook|\.codex|agents\.md/i.test(prompt);
  const large = /跨模块|重构|接口|api|状态管理|全流程|上线|架构|多页面|复杂/i.test(prompt);
  const medium = /多文件|页面|交互|ui|截图|测试|浏览器|表单|列表|筛选|验证/i.test(prompt);

  if (failure) return { level: 'Failure', workMode: explicitSpec ? 'Full Spec' : 'Failure' };
  if (explicitSpec) return { level: risky ? 'Risky' : 'Large', workMode: 'Full Spec' };
  if (harnessMaintenance) return { level: risky ? 'Risky' : 'Medium', workMode: 'Lightweight Harness Maintenance' };
  if (risky) return { level: 'Risky', workMode: 'Lightweight with Approval' };
  if (explicitMiniSpec || large) return { level: large ? 'Large' : 'Medium', workMode: explicitMiniSpec ? 'Mini Spec' : 'Mini Spec Recommended' };
  if (medium) return { level: 'Medium', workMode: 'Lightweight or Mini Spec' };
  if (text.trim()) return { level: 'Small', workMode: 'Lightweight' };
  return { level: 'Small', workMode: 'Lightweight' };
}

export function getToolCommand(input) {
  const toolInput = input.tool_input || {};
  return (
    toolInput.command ||
    toolInput.cmd ||
    toolInput.patch ||
    toolInput.content ||
    JSON.stringify(toolInput)
  );
}

export function extractTouchedPathsFromText(text = '') {
  const paths = new Set();
  const pathPattern =
    /(?:^|[\s"'`])((?:\.codex|\.ai|\.github|scripts|src|docs|specs|skills|app|components|lib|public|package\.json|package-lock\.json|AGENTS\.md|next\.config\.ts|tsconfig\.json|eslint\.config\.mjs)[^\s"'`),;]*)/gm;
  let match = pathPattern.exec(text);
  while (match) {
    paths.add(match[1].replace(/[.:]$/, ''));
    match = pathPattern.exec(text);
  }
  return Array.from(paths);
}

export function isGuardedPath(filePath, policy = readPolicy()) {
  return policy.guardedPaths.some((guardedPath) => {
    if (guardedPath.endsWith('/')) return filePath.startsWith(guardedPath);
    return filePath === guardedPath || filePath.startsWith(`${guardedPath}/`);
  });
}

export function containsAny(text, patterns = []) {
  return patterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
}

export function deny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  };
}

export function block(reason, additionalContext = '') {
  return {
    decision: 'block',
    reason,
    hookSpecificOutput: additionalContext
      ? {
          hookEventName: 'PostToolUse',
          additionalContext
        }
      : undefined
  };
}

export function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
