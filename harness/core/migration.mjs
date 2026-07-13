import fs from 'node:fs';
import path from 'node:path';
import { detectPresets } from './presets.mjs';
import { validateContract } from './contracts.mjs';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

/**
 * Public Harness API.
 */
export function inspectProject(root) {
  const absolute = path.resolve(root);
  const presets = detectPresets(absolute);
  const detected = [];
  if (fs.existsSync(path.join(absolute, 'package.json'))) detected.push('node');
  if (fs.existsSync(path.join(absolute, 'pyproject.toml')) || fs.existsSync(path.join(absolute, 'requirements.txt')) || fs.existsSync(path.join(absolute, 'service.py'))) detected.push('python');
  if (fs.existsSync(path.join(absolute, '.git'))) detected.push('git');
  return {
    root: absolute, detected: [...detected, ...presets.map((item) => item.preset)],
    inferred: fs.existsSync(path.join(absolute, 'tests')) ? ['tests-directory'] : [],
    needs_confirmation: ['domain invariants', 'protected paths', 'authoritative documentation'],
    unsupported: ['automatic business understanding', 'unconfigured symbol/RAG/MCP providers']
  };
}

/**
 * Public Harness API.
 */
export function initProject(root, options = {}) {
  const inspection = inspectProject(root);
  const harnessDir = path.join(inspection.root, '.harness');
  const presetIds = detectPresets(inspection.root).map((item) => item.preset);
  const project = {
    schemaVersion: '1.0.0', id: `project-${path.basename(inspection.root)}`, status: 'draft', extensions: {},
    name: path.basename(inspection.root), root: '.', presets: presetIds,
    ownership: { '.harness/templates': 'Harness-owned', '.harness/project.json': 'Project-owned', '.harness/domain.json': 'Domain-owned', '.harness/runs': 'Run/Evidence' },
    execution: detectExecution(inspection.root), protectedPaths: ['.git', '.env', '.github/workflows'], needsConfirmation: inspection.needs_confirmation
  };
  const validation = {
    schemaVersion: '1.0.0', id: `validation-${project.name}`, status: 'draft', extensions: {}, protectedPaths: project.protectedPaths,
    validators: project.execution.command ? [{ id: 'minimum', kind: 'behavior', command: project.execution.command, timeoutMs: 30000 }] : [],
    changeRules: [{ changeClasses: ['code', 'test'], validators: ['minimum'] }]
  };
  const files = {
    '.harness/project.json': project,
    '.harness/validation.json': validation,
    '.harness/adapter.json': { schemaVersion: '1.0.0', adapter: 'generic-process', status: project.execution.command ? 'ready' : 'needs_confirmation' },
    '.harness/domain.json': { schemaVersion: '1.0.0', status: 'needs_confirmation', invariants: [], authoritativeSources: [] }
  };
  const actions = Object.entries(files).map(([relative, content]) => ({ path: relative, action: fs.existsSync(path.join(inspection.root, relative)) ? 'preserve' : 'create', content }));
  if (!options.dryRun) {
    fs.mkdirSync(harnessDir, { recursive: true });
    actions.filter((action) => action.action === 'create').forEach((action) => {
      const target = path.join(inspection.root, action.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, `${JSON.stringify(action.content, null, 2)}\n`, { flag: 'wx' });
    });
  }
  return { dryRun: Boolean(options.dryRun), actions };
}

function detectExecution(root) {
  if (fs.existsSync(path.join(root, 'package.json'))) {
    const scripts = readJson(path.join(root, 'package.json')).scripts || {};
    for (const name of ['test', 'typecheck', 'build', 'lint']) if (scripts[name]) return { adapter: 'generic-process', command: ['npm', 'run', name], source: `package.json#scripts.${name}` };
  }
  if (fs.existsSync(path.join(root, 'tests', 'test_service.py'))) return { adapter: 'generic-process', command: ['python3', '-m', 'unittest', 'discover', '-s', 'tests'], source: 'python-stdlib' };
  if (fs.existsSync(path.join(root, 'verify.mjs'))) return { adapter: 'generic-process', command: [process.execPath, 'verify.mjs'], source: 'fixture' };
  return { adapter: 'generic-process', command: null, source: null };
}

/**
 * Public Harness API.
 */
export function doctorProject(root) {
  const absolute = path.resolve(root);
  const issues = [];
  const projectPath = path.join(absolute, '.harness', 'project.json');
  const validationPath = path.join(absolute, '.harness', 'validation.json');
  if (!fs.existsSync(projectPath)) issues.push('project manifest missing');
  if (!fs.existsSync(validationPath)) issues.push('validation manifest missing');
  if (fs.existsSync(projectPath)) {
    const project = readJson(projectPath);
    issues.push(...validateContract('projectManifest', project).errors);
    if (!project.execution?.command) issues.push('controlled execution command needs confirmation');
    if ((project.needsConfirmation || []).length) issues.push(...project.needsConfirmation.map((name) => `needs confirmation: ${name}`));
  }
  if (fs.existsSync(validationPath)) issues.push(...validateContract('validationManifest', readJson(validationPath)).errors);
  return { status: issues.length ? 'needs_confirmation' : 'pass', checks: { schema: fs.existsSync(projectPath), paths: true, adapter: true, preset: detectPresets(absolute).length > 0, domain: fs.existsSync(path.join(absolute, '.harness', 'domain.json')), hooks: fs.existsSync(path.join(absolute, '.codex', 'hooks.json')), ci: fs.existsSync(path.join(absolute, '.github', 'workflows')) }, issues };
}
