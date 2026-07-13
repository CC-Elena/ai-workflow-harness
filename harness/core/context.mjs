import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { sha256 } from './trace.mjs';
import { assessUntrustedText } from './security.mjs';
import { stableId } from './ids.mjs';

const IGNORED = new Set(['.git', 'node_modules', '.next', '.harness', 'dist', 'build']);

function walk(root, output = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) walk(target, output);
    else if (entry.isFile()) output.push(target);
  }
  return output;
}

function item(provider, source, content, authority, options = {}) {
  const trust = options.trusted === false ? assessUntrustedText(content) : { trusted: true, promptInjection: false };
  return {
    schemaVersion: '1.0.0', id: stableId('context'), status: 'ready', extensions: { key: options.key || source, promptInjection: trust.promptInjection },
    provider, source, authority: trust.trusted ? authority : Math.min(authority, trust.maxAuthority),
    contentHash: sha256(String(content)), trusted: trust.trusted, content: String(content),
    observedAt: options.observedAt || new Date().toISOString()
  };
}

export class ContextProvider {
  constructor(name) { this.name = name; }
  collect() { throw new Error('collect() must be implemented'); }
}

export class RepositoryManifestProvider extends ContextProvider {
  constructor() { super('repository-manifest'); }
  collect({ root }) {
    const markers = ['package.json', 'pyproject.toml', 'requirements.txt', 'go.mod', 'ProjectSettings/ProjectVersion.txt', 'project.json']
      .filter((name) => fs.existsSync(path.join(root, name)));
    return [item(this.name, root, JSON.stringify({ markers, topLevel: fs.readdirSync(root).sort() }), 70, { key: 'repository-manifest' })];
  }
}

export class DirectFileProvider extends ContextProvider {
  constructor() { super('direct-file'); }
  collect({ root, files = [], trusted = true }) {
    return files.map((file) => {
      const target = path.resolve(root, file);
      if (!target.startsWith(path.resolve(root) + path.sep) && target !== path.resolve(root)) throw new Error(`Direct file escapes root: ${file}`);
      return item(this.name, path.relative(root, target), fs.readFileSync(target, 'utf8'), 80, { key: file, trusted });
    });
  }
}

export class LexicalSearchProvider extends ContextProvider {
  constructor() { super('lexical-search'); }
  collect({ root, query, limit = 20 }) {
    if (!query) return [];
    const needle = query.toLowerCase();
    const results = [];
    for (const file of walk(root)) {
      if (results.length >= limit) break;
      let content;
      try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (results.length < limit && line.toLowerCase().includes(needle)) {
          results.push(item(this.name, `${path.relative(root, file)}:${index + 1}`, line, 50, { key: path.relative(root, file) }));
        }
      });
    }
    return results;
  }
}

export class GitHistoryProvider extends ContextProvider {
  constructor() { super('git-history'); }
  collect({ root, limit = 10 }) {
    const result = spawnSync('git', ['log', `-${limit}`, '--pretty=format:%H%x09%aI%x09%s'], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) return [];
    return result.stdout.split(/\r?\n/).filter(Boolean).map((line) => item(this.name, 'git-log', line, 45, { key: line.split('\t')[0] }));
  }
}

export class ProjectInstructionProvider extends ContextProvider {
  constructor() { super('project-instruction'); }
  collect({ root, target = root }) {
    const rootPath = path.resolve(root);
    let cursor = path.resolve(target);
    const files = [];
    while (cursor.startsWith(rootPath)) {
      const candidate = path.join(cursor, 'AGENTS.md');
      if (fs.existsSync(candidate)) files.push(candidate);
      if (cursor === rootPath) break;
      cursor = path.dirname(cursor);
    }
    return files.reverse().map((file, index) => item(this.name, path.relative(rootPath, file), fs.readFileSync(file, 'utf8'), 90 + index, { key: 'project-instructions' }));
  }
}

/**
 * Public Harness API.
 */
export function resolveConflicts(items) {
  const groups = new Map();
  items.forEach((entry) => {
    const key = entry.extensions?.key || entry.source;
    groups.set(key, [...(groups.get(key) || []), entry]);
  });
  const selected = [];
  const conflicts = [];
  groups.forEach((entries) => {
    const ranked = [...entries].sort((a, b) => Number(b.trusted) - Number(a.trusted) || b.authority - a.authority || String(b.observedAt).localeCompare(String(a.observedAt)));
    selected.push(ranked[0]);
    if (ranked.length > 1 && new Set(ranked.map((entry) => entry.contentHash)).size > 1) {
      conflicts.push({
        schemaVersion: '1.0.0', id: stableId('conflict'), status: 'ready', extensions: {},
        itemIds: ranked.map((entry) => entry.id), winnerId: ranked[0].id,
        reason: ranked[0].trusted !== ranked[1].trusted ? 'trusted source wins' : ranked[0].authority !== ranked[1].authority ? 'higher authority wins' : 'newer observation wins'
      });
    }
  });
  return { selected, conflicts };
}

/**
 * Public Harness API.
 */
export function buildContextPack(providerRequests, options = {}) {
  const candidates = providerRequests.flatMap(({ provider, request }) => provider.collect(request));
  const resolved = resolveConflicts(candidates);
  const budget = options.budgetCharacters || 20000;
  let used = 0;
  const items = [];
  [...resolved.selected].sort((a, b) => b.authority - a.authority).forEach((entry) => {
    const size = entry.content.length;
    if (used + size <= budget) { items.push(entry); used += size; }
  });
  const gold = new Set(options.goldSources || []);
  const selectedSources = new Set(items.map((entry) => entry.source));
  const relevantSelected = [...selectedSources].filter((source) => gold.has(source)).length;
  return {
    items, conflicts: resolved.conflicts, budget: { limit: budget, used, omitted: resolved.selected.length - items.length },
    metrics: {
      recall: gold.size ? relevantSelected / gold.size : null,
      precision: selectedSources.size ? relevantSelected / selectedSources.size : null,
      noise: selectedSources.size ? 1 - relevantSelected / selectedSources.size : null
    }
  };
}
