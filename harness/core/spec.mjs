function issue(code, message, path = '') {
  return { code, message, path, severity: 'error' };
}

/**
 * Public Harness API.
 */
export function lintSpec(spec, graph = {}) {
  const issues = [];
  const acceptance = Array.isArray(spec.acceptanceCriteria) ? spec.acceptanceCriteria : [];
  const invariants = Array.isArray(spec.invariants) ? spec.invariants : [];
  const scope = new Set(spec.scope || []);
  const nonGoals = new Set(spec.nonGoals || []);

  if (acceptance.length === 0) issues.push(issue('SPEC_MISSING_AC', 'At least one acceptance criterion is required', 'acceptanceCriteria'));
  const acIds = new Set();
  acceptance.forEach((ac, index) => {
    if (!ac?.id || acIds.has(ac.id)) issues.push(issue('SPEC_INVALID_AC_ID', 'Acceptance criteria require unique stable IDs', `acceptanceCriteria.${index}`));
    else acIds.add(ac.id);
    if (!ac?.behavior || !ac?.expected) issues.push(issue('SPEC_INCOMPLETE_AC', 'Acceptance criterion requires behavior and expected result', `acceptanceCriteria.${index}`));
  });

  [...scope].filter((entry) => nonGoals.has(entry)).forEach((entry) => issues.push(issue('SPEC_SCOPE_CONFLICT', `${entry} appears in scope and non-goals`, 'scope')));
  if ((spec.unresolvedQuestions || []).some((question) => question.blocking !== false && question.status !== 'resolved')) {
    issues.push(issue('SPEC_UNRESOLVED_BLOCKER', 'Executor cannot start with unresolved blocking questions', 'unresolvedQuestions'));
  }

  const selected = spec.parameters || {};
  (spec.parameterRules || []).forEach((rule, index) => {
    const matches = Object.entries(rule.when || {}).every(([key, value]) => selected[key] === value);
    if (matches && rule.invalid) issues.push(issue('SPEC_ILLEGAL_PARAMETERS', rule.reason || 'Illegal parameter combination', `parameterRules.${index}`));
  });

  const tasks = graph.tasks || [];
  const validations = graph.validations || [];
  const evidence = graph.evidence || [];
  const taskAcIds = new Set(tasks.flatMap((task) => task.acceptanceIds || []));
  const validationAcIds = new Set(validations.flatMap((item) => item.acceptanceIds || []));
  const evidenceAcIds = new Set(evidence.flatMap((item) => item.acceptanceIds || []));
  acIds.forEach((id) => {
    if (!taskAcIds.has(id)) issues.push(issue('TRACE_AC_WITHOUT_TASK', `${id} has no task`, 'traceability'));
    if (!validationAcIds.has(id)) issues.push(issue('TRACE_AC_WITHOUT_VALIDATION', `${id} has no validation`, 'traceability'));
    if (!evidenceAcIds.has(id)) issues.push(issue('TRACE_AC_WITHOUT_EVIDENCE', `${id} has no evidence`, 'traceability'));
  });
  invariants.forEach((invariant, index) => {
    if (!invariant.id || !validationAcIds.has(invariant.id)) issues.push(issue('SPEC_UNVALIDATED_INVARIANT', `${invariant.id || `invariant ${index}`} has no validation`, `invariants.${index}`));
  });

  return { ok: issues.length === 0, issues, traceability: { acceptance: acIds.size, tasks: taskAcIds.size, validations: validationAcIds.size, evidence: evidenceAcIds.size } };
}

/**
 * Public Harness API.
 */
export function expandParameterizedSpec(spec, variants) {
  return variants.map((parameters, index) => ({
    ...structuredClone(spec), id: `${spec.id}-variant-${index + 1}`, parameters: { ...(spec.parameters || {}), ...parameters },
    extensions: { ...(spec.extensions || {}), sourceSpecId: spec.id, variant: index + 1 }
  }));
}
