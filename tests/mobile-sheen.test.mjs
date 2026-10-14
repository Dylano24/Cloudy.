import assert from 'node:assert/strict';
import test from 'node:test';
import { createMobileSheenClock } from '../lib/mobile-sheen-clock.ts';

test('a delayed frame never produces the doubled step seen in the iPhone recording', () => {
  const clock = createMobileSheenClock();
  clock.step(0);
  for (let n = 1; n <= 120; n++) clock.step(n * 1000 / 60);
  const before = clock.step(2000);
  const after = clock.step(2000 + 1000 / 30);
  assert.ok((after - before) * 6000 <= (1000 / 60) * 1.1 + 0.001);
});

test('normal 30, 60 and 120 Hz playback completes one cycle in six seconds', () => {
  for (const hz of [30, 60, 120]) {
    const clock = createMobileSheenClock();
    clock.step(0);
    let phase;
    for (let n = 1; n <= hz * 6; n++) phase = clock.step(n * 1000 / hz);
    assert.ok(Math.min(phase, 1 - phase) < 0.000001, String(hz));
  }
});

test('returning from a background tab preserves position instead of catching up', () => {
  const clock = createMobileSheenClock();
  clock.step(0);
  const before = clock.step(16);
  clock.pause();
  assert.equal(clock.step(30000), before);
});
