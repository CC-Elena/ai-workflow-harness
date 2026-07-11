#!/usr/bin/env node
// ai-workflow-harness CLI
// Usage:
//   npx ai-workflow-harness init [targetDir] [--force] [--with-skills=a,b,c] [--no-skills]
//   npx ai-workflow-harness check [specPath|--changed --base X --head Y]
//   npx ai-workflow-harness --version | --help

import { readFileSync, mkdirSync, existsSync, statSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m'
};
const log = (...a) => console.log(...a);
const ok = (m) => log(`${c.green}✔${c.reset} ${m}`);
const warn = (m) => log(`${c.yellow}!${c.reset} ${m}`);
const err = (m) => log(`${c.red}✘${c.reset} ${m}`);
const step = (m) => log(`\n${c.bold}${c.cyan}▸${c.reset} ${c.bold}${m}${c.reset}`);

// ---------- arg parsing ----------
function parseArgs(argv) {
  const out = { _: [], flags: {} };
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out.flags[k] = v === undefined ? true : v;
    } else if (a.startsWith('-')) {
      out.flags[a.slice(1)] = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

const HELP = `${c.bold}ai-workflow-harness${c.reset} v${PKG.version}

A repository-native AI development workflow framework.

${c.bold}Usage:${c.reset}
  npx ai-workflow-harness <command> [options]

${c.bold}Commands:${c.reset}
  ${c.cyan}init${c.reset} [targetDir]      Scaffold harness assets into a project (default: current dir).
  ${c.cyan}check${c.reset} [args...]       Run the harness:check gate (proxies to scripts/check-harness-run.mjs).
  ${c.cyan}help${c.reset}                  Show this help.
  ${c.cyan}version${c.reset}               Print version.

${c.bold}init options:${c.reset}
  --force                  Overwrite existing files (default: skip).
  --with-skills=a,b,c      Comma-separated extra Skills to copy (in addition to core set).
  --all-skills             Copy every Skill shipped with the package.
  --no-skills              Skip Skills entirely (only copy .ai/ + AGENTS.md + gate script).
  --no-scripts             Do not copy scripts/check-harness-run.mjs.
  --dry-run                Print actions without writing files.

${c.bold}Examples:${c.reset}
  npx ai-workflow-harness init
  npx ai-workflow-harness init ./my-app --with-skills=frontend-dev,test
  npx ai-workflow-harness init --all-skills --force
  npx ai-workflow-harness check specs/my-feature
  npx ai-workflow-harness check --changed --base main --head HEAD

${c.bold}Docs:${c.reset} ${PKG.homepage || 'https://github.com/CC-Elena/ai-workflow-harness'}
`;

// ---------- copy helpers ----------
function copyRecursive(src, dst, { force, dryRun, onCopy }) {
  if (!existsSync(src)) return { copied: 0, skipped: 0 };
  const st = statSync(src);
  let copied = 0, skipped = 0;
  if (st.isDirectory()) {
    if (!dryRun) mkdirSync(dst, { recursive: true });
    for (const entry of readdirSync(src)) {
      const r = copyRecursive(join(src, entry), join(dst, entry), { force, dryRun, onCopy });
      copied += r.copied; skipped += r.skipped;
    }
  } else {
    if (existsSync(dst) && !force) {
      skipped++;
    } else {
      if (!dryRun) {
        mkdirSync(dirname(dst), { recursive: true });
        copyFileSync(src, dst);
      }
      copied++;
      onCopy?.(dst);
    }
  }
  return { copied, skipped };
}

// ---------- init ----------
const CORE_SKILLS = [
  'project',
  'auto-rules',
  'code-review',
  'workflow-assets',
  'feature-dev',
  'harness-migration',
  'skill-creator',
];

const AI_SUBDIRS = ['workflows', 'templates', 'prompts', 'policies'];
const AI_CONTEXT_FILES = ['skill-routing-minimal.md']; // keep generic, skip project-specific maps

async function cmdInit(args) {
  const target = resolve(args._[1] || process.cwd());
  const force = !!args.flags.force;
  const dryRun = !!args.flags['dry-run'];
  const noSkills = !!args.flags['no-skills'];
  const allSkills = !!args.flags['all-skills'];
  const noScripts = !!args.flags['no-scripts'];
  const extraSkills = (args.flags['with-skills'] || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  log(`${c.bold}AI Workflow Harness${c.reset} ${c.dim}v${PKG.version}${c.reset}`);
  log(`Target: ${c.cyan}${target}${c.reset}${dryRun ? c.yellow + ' (dry-run)' + c.reset : ''}`);
  if (!existsSync(target)) {
    if (dryRun) log(`Would create directory: ${target}`);
    else mkdirSync(target, { recursive: true });
  }

  let totalCopied = 0, totalSkipped = 0;
  const record = (label, r) => {
    totalCopied += r.copied; totalSkipped += r.skipped;
    log(`  ${c.dim}copied ${r.copied}, skipped ${r.skipped}${c.reset} ${label}`);
  };

  // 1. .ai/{workflows,templates,prompts,policies}
  step('Copy .ai/ workflow assets');
  for (const sub of AI_SUBDIRS) {
    const src = join(PKG_ROOT, '.ai', sub);
    const dst = join(target, '.ai', sub);
    if (!existsSync(src)) { warn(`source missing: .ai/${sub} (skipped)`); continue; }
    record(`.ai/${sub}/`, copyRecursive(src, dst, { force, dryRun }));
  }
  // .ai/context (generic files only)
  for (const f of AI_CONTEXT_FILES) {
    const src = join(PKG_ROOT, '.ai', 'context', f);
    const dst = join(target, '.ai', 'context', f);
    if (!existsSync(src)) continue;
    record(`.ai/context/${f}`, copyRecursive(src, dst, { force, dryRun }));
  }
  // .ai/evals rules (no run records)
  const evalsRulesSrc = join(PKG_ROOT, '.ai', 'evals');
  if (existsSync(evalsRulesSrc)) {
    for (const entry of readdirSync(evalsRulesSrc)) {
      if (entry === 'runs' || entry === 'rca') continue;
      const src = join(evalsRulesSrc, entry);
      const dst = join(target, '.ai', 'evals', entry);
      record(`.ai/evals/${entry}`, copyRecursive(src, dst, { force, dryRun }));
    }
  }
  if (!dryRun) {
    mkdirSync(join(target, '.ai', 'evals', 'runs'), { recursive: true });
    mkdirSync(join(target, '.ai', 'evals', 'rca'), { recursive: true });
  }

  // 2. AGENTS.md (only if not already present, never force)
  step('Copy AGENTS.md routing entrypoint');
  const agentsDst = join(target, 'AGENTS.md');
  if (existsSync(agentsDst) && !force) {
    warn('AGENTS.md already exists — kept as-is (use --force to overwrite)');
  } else {
    const r = copyRecursive(join(PKG_ROOT, 'AGENTS.md'), agentsDst, { force: true, dryRun });
    record('AGENTS.md', r);
  }

  // 3. scripts/check-harness-run.mjs (gate)
  if (!noScripts) {
    step('Copy harness:check gate script');
    record('scripts/check-harness-run.mjs',
      copyRecursive(join(PKG_ROOT, 'scripts', 'check-harness-run.mjs'),
        join(target, 'scripts', 'check-harness-run.mjs'), { force, dryRun }));
  }

  // 4. Skills
  if (!noSkills) {
    step('Copy Skills');
    const allAvailable = readdirSync(join(PKG_ROOT, 'skills'))
      .filter(n => statSync(join(PKG_ROOT, 'skills', n)).isDirectory());
    let toCopy = allSkills
      ? allAvailable
      : Array.from(new Set([...CORE_SKILLS, ...extraSkills]));
    // Validate extras
    for (const s of extraSkills) {
      if (!allAvailable.includes(s)) warn(`unknown skill: ${s}`);
    }
    toCopy = toCopy.filter(s => allAvailable.includes(s));
    for (const skill of toCopy) {
      const src = join(PKG_ROOT, 'skills', skill);
      const dst = join(target, 'skills', skill);
      // For `project` skill, copy template not the meta-project's own SKILL.md
      if (skill === 'project') {
        const tplSrc = join(PKG_ROOT, 'skills', 'harness-migration', 'templates', 'project-skill.md');
        if (existsSync(tplSrc) && (force || !existsSync(join(dst, 'SKILL.md')))) {
          if (!dryRun) {
            mkdirSync(dst, { recursive: true });
            copyFileSync(tplSrc, join(dst, 'SKILL.md'));
          }
          ok(`skills/project/SKILL.md ${c.dim}(skeleton — edit me!)${c.reset}`);
        } else {
          warn(`skills/project/SKILL.md already exists`);
        }
        continue;
      }
      record(`skills/${skill}/`, copyRecursive(src, dst, { force, dryRun }));
    }
  }

  // 5. Empty specs dir
  if (!dryRun) mkdirSync(join(target, 'specs'), { recursive: true });

  // 6. Summary + next steps
  log(`\n${c.bold}Summary${c.reset}  copied: ${c.green}${totalCopied}${c.reset}  skipped: ${c.yellow}${totalSkipped}${c.reset}`);
  log(`\n${c.bold}Next steps:${c.reset}`);
  log(`  1. Edit ${c.cyan}skills/project/SKILL.md${c.reset} — fill in your project's stack, scripts, and protected paths.`);
  log(`  2. Read ${c.cyan}AGENTS.md${c.reset} — the agent routing entrypoint.`);
  log(`  3. Add this to your package.json scripts:`);
  log(`       ${c.dim}"harness:check": "node scripts/check-harness-run.mjs"${c.reset}`);
  log(`  4. Try a small spec:  ${c.cyan}mkdir -p specs/hello && touch specs/hello/spec.md${c.reset}`);
  log(`  5. Run the gate:      ${c.cyan}npx ai-workflow-harness check specs/hello${c.reset}\n`);
  ok('Harness initialized.');
}

// ---------- check (proxy) ----------
async function cmdCheck() {
  const cwd = process.cwd();
  // Prefer local copy if exists, else fall back to packaged script.
  const localScript = join(cwd, 'scripts', 'check-harness-run.mjs');
  const pkgScript = join(PKG_ROOT, 'scripts', 'check-harness-run.mjs');
  const script = existsSync(localScript) ? localScript : pkgScript;
  if (!existsSync(script)) {
    err(`check-harness-run.mjs not found locally or in package.`);
    process.exit(2);
  }
  const passThrough = process.argv.slice(3); // strip "node bin check"
  const r = spawnSync(process.execPath, [script, ...passThrough], { stdio: 'inherit', cwd });
  process.exit(r.status ?? 1);
}

// ---------- entry ----------
(async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  if (args.flags.version || args.flags.v || cmd === 'version') {
    log(PKG.version);
    return;
  }
  if (args.flags.help || args.flags.h || !cmd || cmd === 'help') {
    log(HELP);
    return;
  }

  try {
    if (cmd === 'init') return await cmdInit(args);
    if (cmd === 'check') return await cmdCheck();
    err(`Unknown command: ${cmd}`);
    log(HELP);
    process.exit(1);
  } catch (e) {
    err(e.message || String(e));
    if (process.env.DEBUG) console.error(e);
    process.exit(1);
  }
})();
