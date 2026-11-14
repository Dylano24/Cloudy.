import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTypeScript } from './helpers/load-typescript.mjs';

// A 2D context that accepts every call, so the scene can run without a browser.
function fakeSurface(width, height) {
  const gradient = { addColorStop() {} };
  const calls = { drawImage: 0 };
  const ctx = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
      if (key === 'drawImage') return () => { calls.drawImage++; };
      return () => {};
    },
    set(target, key, value) { target[key] = value; return true; },
  });
  return { width, height, calls, getContext: () => ctx };
}

function run({ phone, seconds, seed = 7 }) {
  const { createBattleScene, seeded } = loadTypeScript('components/home/rust-battle-scene.ts');
  const scene = createBattleScene({ phone, makeSurface: fakeSurface, random: seeded(seed) });
  const [width, height] = phone ? [390, 844] : [1440, 900];
  scene.resize(width, height, 1);
  const screen = fakeSurface(width, height);
  const seen = { heli: false, drop: false, explosions: 0, max: { puffs: 0, sparks: 0 } };
  for (let frame = 0; frame < seconds * 40; frame++) {
    scene.step(1 / 40);
    if (frame % 4 === 0) scene.draw(screen.getContext('2d'));
    const stats = scene.stats();
    seen.heli ||= stats.heli; seen.drop ||= stats.drop; seen.explosions = stats.explosions;
    for (const key of Object.keys(seen.max)) seen.max[key] = Math.max(seen.max[key], stats[key]);
  }
  return { seen, screen, scene };
}

test('two minutes of the night: a helicopter patrol, an airdrop and C4, nothing throws', () => {
  const { seen, screen } = run({ phone: false, seconds: 120 });
  assert.ok(seen.explosions > 0, 'C4 went off');
  assert.ok(seen.heli, 'the helicopter flew over');
  assert.ok(seen.drop, 'a supply drop happened');
  assert.ok(screen.calls.drawImage > 0, 'the scene was drawn');
});

test('effects stay within their limits, lower on phones', () => {
  const desktop = run({ phone: false, seconds: 90, seed: 3 }).seen.max;
  assert.ok(desktop.puffs <= 260 && desktop.sparks <= 260, JSON.stringify(desktop));
  const phone = run({ phone: true, seconds: 90, seed: 3 }).seen.max;
  assert.ok(phone.puffs <= 140 && phone.sparks <= 140, JSON.stringify(phone));
});

test('a resize starts the raid again from the new layout', () => {
  const { scene } = run({ phone: false, seconds: 20 });
  scene.resize(1280, 720, 1);
  const stats = scene.stats();
  assert.equal(stats.heli, false);
  assert.equal(stats.drop, false);
  assert.ok(stats.fires >= 2, 'bases are already burning');
});

test('nobody shoots: no tracers, rockets or muzzle flashes in the scene', () => {
  const scene = readFileSync(new URL('../components/home/rust-battle-scene.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(scene, /tracer|launchRocket|muzzle|burst\(|flyby/i);
});

test('the homepage backdrop is drawn in code: no photo, no red star field', () => {
  const component = readFileSync(new URL('../components/home/rust-battle-background.tsx', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(component, /\.avif|next\/image/);
  assert.doesNotMatch(page, /AstraBackground/);
  assert.match(page, /<RustBattleBackground \/>/);
});
