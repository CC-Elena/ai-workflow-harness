import { chargeRevive } from '../economy/revive.mjs';

/**
 * Public Harness API.
 */
export function revive(state, price) {
  if (state.revived) return { ok: false, reason: 'already_revived', state };
  const charged = chargeRevive(state, price);
  if (!charged.ok) return charged;
  return { ok: true, state: { ...charged.state, alive: true, revived: true } };
}
