import fs from 'node:fs';
import path from 'node:path';

function exists(root, relative) { return fs.existsSync(path.join(root, relative)); }

export class TechnologyPreset {
  constructor(id) { this.id = id; }
  detect() { throw new Error('detect() must be implemented'); }
  commands() { throw new Error('commands() must be implemented'); }
}

export const nextjsPreset = {
  id: 'nextjs-typescript',
  detect(root) {
    if (!exists(root, 'package.json')) return null;
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (!pkg.dependencies?.next && !pkg.devDependencies?.next) return null;
    return { confidence: 'detected', version: pkg.dependencies?.next || pkg.devDependencies?.next, typescript: exists(root, 'tsconfig.json') };
  },
  commands(root) {
    const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts || {};
    return ['lint', 'typecheck', 'test', 'build'].filter((name) => scripts[name]).map((name) => ['npm', 'run', name]);
  }
};

export const unityPreset = {
  id: 'unity',
  detect(root) {
    const versionFile = path.join(root, 'ProjectSettings', 'ProjectVersion.txt');
    if (!fs.existsSync(versionFile)) return null;
    const content = fs.readFileSync(versionFile, 'utf8');
    return { confidence: 'detected', version: content.match(/m_EditorVersion:\s*(.+)/)?.[1] || 'unknown' };
  },
  commands({ editor = 'Unity', projectPath, buildTarget = 'StandaloneOSX' }) {
    const base = [editor, '-batchmode', '-nographics', '-quit', '-projectPath', projectPath];
    return {
      editMode: [...base, '-runTests', '-testPlatform', 'EditMode', '-testResults', 'artifacts/editmode.xml', '-logFile', 'artifacts/editmode.log'],
      playMode: [...base, '-runTests', '-testPlatform', 'PlayMode', '-testResults', 'artifacts/playmode.xml', '-logFile', 'artifacts/playmode.log'],
      build: [...base, '-buildTarget', buildTarget, '-executeMethod', 'HarnessBuild.Perform', '-logFile', 'artifacts/build.log']
    };
  },
  validateResources(root) {
    const issues = [];
    const guids = new Map();
    const assets = path.join(root, 'Assets');
    if (!fs.existsSync(assets)) return { status: 'fail', issues: ['Assets directory missing'] };
    const visit = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (!entry.name.endsWith('.meta') && !fs.existsSync(`${target}.meta`)) issues.push(`missing meta: ${path.relative(root, target)}`);
      else if (entry.name.endsWith('.meta')) {
        const guid = fs.readFileSync(target, 'utf8').match(/^guid:\s*(\w+)/m)?.[1];
        if (!guid) issues.push(`missing guid: ${path.relative(root, target)}`);
        else if (guids.has(guid)) issues.push(`duplicate guid: ${guid}`);
        else guids.set(guid, target);
      }
    });
    visit(assets);
    for (const file of guids.values()) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(/guid:\s*(\w+)/g)) if (match[1] !== content.match(/^guid:\s*(\w+)/m)?.[1] && !guids.has(match[1])) issues.push(`missing reference: ${match[1]} in ${path.relative(root, file)}`);
    }
    return { status: issues.length ? 'fail' : 'pass', issues, sceneBuildListPolicy: 'ProjectSettings/EditorBuildSettings.asset is authoritative', editorBuild: 'environment_unavailable' };
  }
};

export const cocosPreset = {
  id: 'cocos-creator',
  detect(root) {
    if (!exists(root, 'project.json')) return null;
    const project = JSON.parse(fs.readFileSync(path.join(root, 'project.json'), 'utf8'));
    return { confidence: 'detected', version: project.version || project.engine || 'unknown' };
  },
  commands({ editor = 'CocosCreator', projectPath, platform = 'web-mobile' }) {
    return { build: [editor, '--project', projectPath, '--build', `platform=${platform}`, '--log', 'artifacts/build.log'] };
  },
  validateResources(root) {
    const issues = [];
    const uuids = new Set();
    const referenced = [];
    const assets = path.join(root, 'assets');
    if (!fs.existsSync(assets)) return { status: 'fail', issues: ['assets directory missing'] };
    const visit = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(target);
      else {
        const content = fs.readFileSync(target, 'utf8');
        if (entry.name.endsWith('.meta')) {
          try { const data = JSON.parse(content); if (data.uuid) uuids.add(data.uuid); else issues.push(`missing uuid: ${path.relative(root, target)}`); }
          catch { issues.push(`invalid meta json: ${path.relative(root, target)}`); }
        } else for (const match of content.matchAll(/"__uuid__"\s*:\s*"([^"]+)"/g)) referenced.push([match[1], target]);
      }
    });
    visit(assets);
    referenced.forEach(([uuid, file]) => { if (!uuids.has(uuid)) issues.push(`missing reference: ${uuid} in ${path.relative(root, file)}`); });
    return { status: issues.length ? 'fail' : 'pass', issues, editorBuild: 'environment_unavailable' };
  }
};

export const PRESETS = [nextjsPreset, unityPreset, cocosPreset];

/**
 * Public Harness API.
 */
export function detectPresets(root) {
  return PRESETS.map((preset) => ({ preset: preset.id, result: preset.detect(root) })).filter((item) => item.result);
}
