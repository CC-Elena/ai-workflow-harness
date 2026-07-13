import { randomUUID } from 'node:crypto';

/**
 * Public Harness API.
 */
export function stableId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

/**
 * Public Harness API.
 */
export function createRunIdentity(parentSpanId = null) {
  return {
    runId: stableId('run'),
    traceId: stableId('trace'),
    spanId: stableId('span'),
    parentSpanId
  };
}
