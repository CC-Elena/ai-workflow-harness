import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(here, '..', 'contracts', 'registry.v1.json');

/**
 * Public Harness API.
 */
export function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function matchesType(value, expected) {
  const types = Array.isArray(expected) ? expected : [expected];
  return types.some((type) => {
    if (type === 'null') return value === null;
    if (type === 'array') return Array.isArray(value);
    if (type === 'integer') return Number.isInteger(value);
    if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
    if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
    return typeof value === type;
  });
}

function validateProperties(document, properties, errors) {
  Object.entries(properties).forEach(([name, rule]) => {
    if (!(name in document)) return;
    const value = document[name];
    if (rule.type && !matchesType(value, rule.type)) errors.push(`${name}: expected ${JSON.stringify(rule.type)}`);
    if (rule.const !== undefined && value !== rule.const) errors.push(`${name}: unsupported value ${JSON.stringify(value)}`);
    if (rule.enum && !rule.enum.includes(value)) errors.push(`${name}: must be one of ${rule.enum.join(', ')}`);
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) errors.push(`${name}: too short`);
  });
}

/**
 * Public Harness API.
 */
export function validateContract(kind, document, registry = loadRegistry()) {
  const definition = registry.contracts[kind];
  if (!definition) return { ok: false, errors: [`unknown contract kind: ${kind}`] };
  if (!document || typeof document !== 'object' || Array.isArray(document)) return { ok: false, errors: ['document must be an object'] };

  const errors = [];
  if (document.schemaVersion !== registry.registryVersion) {
    errors.push(`unknown schemaVersion: ${String(document.schemaVersion)}; supported: ${registry.registryVersion}`);
  }
  const required = [...registry.base.required, ...definition.required];
  required.forEach((field) => {
    if (!(field in document)) errors.push(`missing required field: ${field}`);
  });
  validateProperties(document, registry.base.properties, errors);
  validateProperties(document, definition.properties, errors);
  return { ok: errors.length === 0, errors, kind, schemaVersion: document.schemaVersion };
}

/**
 * Public Harness API.
 */
export function assertContract(kind, document) {
  const result = validateContract(kind, document);
  if (!result.ok) throw new Error(`Invalid ${kind}: ${result.errors.join('; ')}`);
  return document;
}

/**
 * Public Harness API.
 */
export function contractExample(kind, fields = {}) {
  const registry = loadRegistry();
  const definition = registry.contracts[kind];
  if (!definition) throw new Error(`Unknown contract kind: ${kind}`);
  const value = { schemaVersion: registry.registryVersion, id: `${kind}-example`, status: 'draft', extensions: {}, ...fields };
  return value;
}
