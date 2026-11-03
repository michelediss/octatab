import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTopSitesVerticalShift } from '../../js/utils.js';

test('uses a gentle upward offset for one and two rows only', () => {
  const rowPitch = 140;
  assert.ok(Math.abs(calculateTopSitesVerticalShift(1, rowPitch) + 44.8) < 0.000001);
  assert.ok(Math.abs(calculateTopSitesVerticalShift(2, rowPitch) + 22.4) < 0.000001);
  assert.equal(calculateTopSitesVerticalShift(3, rowPitch), 0);
  assert.equal(calculateTopSitesVerticalShift(4, rowPitch), 0);
});
