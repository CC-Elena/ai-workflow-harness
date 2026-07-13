/**
 * Public Harness API.
 */
export function chargeRevive(state, price) {
  if (state.coins < price) return { ok: false, reason: 'insufficient_coins', state };
  return { ok: true, state: { ...state, coins: state.coins - price } };
}
