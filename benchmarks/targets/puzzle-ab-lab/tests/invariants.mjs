import assert from 'node:assert/strict';
import { createState } from '../game-core/state.mjs';
import { revive } from '../features/revive.mjs';
import { assignExperiment } from '../experiments/assignment.mjs';
import { shouldShowRevive } from '../ui/revive-view.mjs';
import { reviveEvent } from '../telemetry/events.mjs';

/**
 * Public Harness API.
 */
export function verifyInvariants() {
  for (const price of [3, 5, 10]) {
    const initial = createState({ coins: 20, board: 'fixed-seed', score: 88 });
    const first = revive(initial, price);
    assert.equal(first.ok, true);
    assert.equal(first.state.coins, 20 - price);
    assert.equal(first.state.board, 'fixed-seed');
    assert.equal(first.state.score, 88);
    assert.equal(revive(first.state, price).reason, 'already_revived');
  }
  assert.equal(revive(createState({ coins: 2 }), 3).reason, 'insufficient_coins');
  assert.equal(assignExperiment('stable-player'), assignExperiment('stable-player'));
  assert.equal(shouldShowRevive('control', createState()), false);
  assert.deepEqual(reviveEvent({ playerId: 'p1', group: 'revive-treatment', price: 3, result: 'pass' }).fields, ['playerId', 'group', 'price', 'result']);
}
