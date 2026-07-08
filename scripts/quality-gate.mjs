#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const maxLines = Number.parseInt(process.env.QUALITY_MAX_LINES || '500', 10);
const failures = [];
const categories = {
  baseline: '代码底线检查',
  standards: '代码规范检查'
};

const codeExts = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const scanRoots = ['src', 'scripts', 'skills'];
const secRoots = ['src', 'scripts', 'skills', '.github', '.ai'];
const skipDirs = new Set(['.git', '.next', 'node_modules']);
const skipParts = new Set(['evidence']);

function clean(value) {
  return value.replace(/^\s+|\s+$/g, '');
}

function fail(category, filePath, line, message) {
  failures.push({
    category,
    detail: line ? `${filePath}:${line} ${message}` : `${filePath} ${message}`
  });
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isSkipped(filePath) {
  return toPosix(filePath)
    .split('/')
    .some((part) => skipDirs.has(part) || skipParts.has(part));
}

function walk(root) {
  const fullRoot = path.join(repoRoot, root);
  if (!fs.existsSync(fullRoot)) return [];

  const files = [];
  const entries = fs.readdirSync(fullRoot, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(fullRoot, entry.name);
    const relPath = toPosix(path.relative(repoRoot, fullPath));

    if (isSkipped(relPath)) return;

    if (entry.isDirectory()) {
      files.push(...walk(relPath));
      return;
    }

    if (entry.isFile()) {
      files.push(relPath);
    }
  });

  return files;
}

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function isCodeFile(filePath) {
  return codeExts.has(path.extname(filePath));
}

function listCodeFiles() {
  return scanRoots.flatMap(walk).filter(isCodeFile).sort();
}

function listSecFiles() {
  const exts = new Set([...codeExts, '.json', '.yml', '.yaml', '.env', '.md']);
  return secRoots
    .flatMap(walk)
    .filter((filePath) => exts.has(path.extname(filePath)) || filePath.includes('.env'))
    .sort();
}

function checkLineCounts(files) {
  files.forEach((filePath) => {
    const lines = read(filePath).split('\n').length;
    if (lines > maxLines) {
      fail(categories.standards, filePath, 0, `exceeds ${maxLines} lines (${lines}). Split the file before adding logic.`);
    }
  });
}

function checkCatchBlocks(files) {
  const catchPattern = /catch\s*(?:\(([^)]*)\))?\s*\{([\s\S]*?)\n\s*\}/g;

  files.forEach((filePath) => {
    const text = read(filePath);
    let match = catchPattern.exec(text);

    while (match) {
      const binding = clean(match[1] || '');
      const body = clean(match[2] || '');
      const line = lineAt(text, match.index);
      const handled =
        /\bthrow\b|console\.(?:error|warn|info)|logger\.|Response\.json|writeJson|fail\(|set[A-Z]\w*\(|removeItem\(/.test(body);

      if (!binding) {
        fail(categories.baseline, filePath, line, 'uses catch without an error binding.');
      }

      if (!body) {
        fail(categories.baseline, filePath, line, 'uses an empty catch block.');
      } else if (!handled) {
        fail(categories.baseline, filePath, line, 'catches an error without visible handling, logging, propagation, or fallback state.');
      }

      match = catchPattern.exec(text);
    }
  });
}

function checkSecrets(files) {
  const secretName = /\b(?:api[_-]?key|secret|token|password|passwd|private[_-]?key|client[_-]?secret|access[_-]?key)\b/i;
  const assignment = /(?:const|let|var|export\s+const)?\s*['"]?([A-Z0-9_ -]*?(?:api[_-]?key|secret|token|password|passwd|private[_-]?key|client[_-]?secret|access[_-]?key)[A-Z0-9_ -]*?)['"]?\s*[:=]\s*['"`]([^'"`]+)['"`]/i;
  const endpoint = /\b(?:API|BASE|SERVICE|SERVER|AUTH)_[A-Z0-9_]*(?:URL|HOST|ENDPOINT)\b\s*=\s*['"`]https?:\/\//;
  const placeholder = /^(?:changeme|change-me|example|placeholder|dummy|test|todo|xxx|your[-_ ]|<|process\.env)/i;

  files.forEach((filePath) => {
    const lines = read(filePath).split('\n');

    lines.forEach((lineText, index) => {
      const line = clean(lineText);
      if (!line || line.startsWith('//') || line.startsWith('*')) return;

      const found = line.match(assignment);
      if (found && secretName.test(found[1])) {
        const value = clean(found[2]);
        if (value.length >= 8 && !placeholder.test(value)) {
          fail(categories.baseline, filePath, index + 1, 'appears to hardcode a secret. Use env vars or a config source.');
        }
      }

      if (endpoint.test(line) && !line.includes('process.env')) {
        fail(categories.baseline, filePath, index + 1, 'appears to hardcode a service endpoint. Use a config boundary.');
      }
    });
  });
}

function checkLocalWheels(files) {
  const wheel = /\b(?:function|const|let)\s+(debounce|throttle|sleep|delay|deepClone|cloneDeep|classNames|clsx|cn|dateLabel|parseQuery|buildQuery)\b/;
  const jsonClone = /JSON\.parse\s*\(\s*JSON\.stringify\s*\(/;

  files.forEach((filePath) => {
    const lines = read(filePath).split('\n');

    lines.forEach((lineText, index) => {
      const found = lineText.match(wheel);
      if (found) {
        fail(categories.standards, filePath, index + 1, `defines "${found[1]}" locally. Reuse an existing helper or document why a new one is needed.`);
      }

      if (jsonClone.test(lineText)) {
        fail(categories.standards, filePath, index + 1, 'uses JSON stringify/parse cloning. Use structuredClone or an existing utility.');
      }
    });
  });
}

function run() {
  const codeFiles = listCodeFiles();
  const secFiles = listSecFiles();

  if (!args.has('--security-only')) {
    checkLineCounts(codeFiles);
    checkCatchBlocks(codeFiles);
    checkLocalWheels(codeFiles);
  }

  if (!args.has('--skip-security')) {
    checkSecrets(secFiles);
  }

  if (failures.length > 0) {
    console.error('Quality gate failed:');
    Object.values(categories).forEach((category) => {
      const categoryFailures = failures.filter((failure) => failure.category === category);
      if (categoryFailures.length === 0) return;

      console.error(`\n${category}:`);
      categoryFailures.forEach((failure) => console.error(`- ${failure.detail}`));
    });
    process.exit(1);
  }

  console.log(`Quality gate passed (${codeFiles.length} code files, max ${maxLines} lines).`);
  console.log(`- ${categories.baseline}: passed`);
  console.log(`- ${categories.standards}: passed`);
}

run();
