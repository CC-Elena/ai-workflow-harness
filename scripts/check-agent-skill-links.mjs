#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const canonicalDir = path.join(rootDir, 'skills');
const adapterDir = path.join(rootDir, '.agents/skills');
const failures = [];

function fail(message) {
  failures.push(message);
}

function posixRelative(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

if (!fs.existsSync(canonicalDir)) {
  fail('Missing canonical skills directory: skills');
}

if (!fs.existsSync(adapterDir)) {
  fail('Missing Codex adapter directory: .agents/skills');
}

const canonicalSkills = fs.existsSync(canonicalDir)
  ? fs
      .readdirSync(canonicalDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => fs.existsSync(path.join(canonicalDir, name, 'SKILL.md')))
      .sort()
  : [];

const adapterEntries = fs.existsSync(adapterDir)
  ? fs.readdirSync(adapterDir, { withFileTypes: true }).map((entry) => entry.name).sort()
  : [];

canonicalSkills.forEach((name) => {
  const linkPath = path.join(adapterDir, name);
  const expectedTarget = posixRelative(adapterDir, path.join(canonicalDir, name));

  if (!fs.existsSync(linkPath)) {
    fail(`Missing Codex skill link: .agents/skills/${name}`);
    return;
  }

  const stat = fs.lstatSync(linkPath);
  if (!stat.isSymbolicLink()) {
    fail(`Codex skill adapter must be a symlink, not a copied directory: .agents/skills/${name}`);
    return;
  }

  const actualTarget = fs.readlinkSync(linkPath);
  if (actualTarget !== expectedTarget) {
    fail(`Invalid symlink target for .agents/skills/${name}: expected ${expectedTarget}, got ${actualTarget}`);
  }

  if (!fs.existsSync(path.join(linkPath, 'SKILL.md'))) {
    fail(`Codex skill link does not resolve to a SKILL.md: .agents/skills/${name}`);
  }
});

adapterEntries.forEach((name) => {
  if (!canonicalSkills.includes(name)) {
    fail(`Unexpected Codex skill adapter without canonical skill: .agents/skills/${name}`);
  }
});

if (failures.length > 0) {
  console.error('Codex skill link check failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Codex skill link check passed for ${canonicalSkills.length} skills`);
