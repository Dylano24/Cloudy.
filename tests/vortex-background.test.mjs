import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const shader = () => loadTypeScript('components/home/vortex-shader.ts');
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('the vortex renders as sharp as the screen allows, within a pixel budget', () => {
  const { renderScale } = shader();
  // A 1440×900 laptop at 2× would be 5.2 million pixels; it renders about 2.6 million.
  const laptop = renderScale(1440, 900, 2, 2_600_000);
  assert.ok(laptop < 2 && Math.abs(1440 * 900 * laptop * laptop - 2_600_000) < 1000);
  // A small window never renders above its own pixel ratio.
  assert.equal(renderScale(800, 600, 1, 2_600_000), 1);
  // A 4K screen at 2× still stays within the budget, but never drops below 0.35.
  const fourK = renderScale(3840, 2160, 2, 2_600_000);
  assert.ok(3840 * 2160 * fourK * fourK <= 2_600_001);
  assert.equal(renderScale(100_000, 100_000, 2, 1000), 0.35);
});

test('the vortex sits on the logo, in GPU pixels from the bottom left', () => {
  const { vortexCenter } = shader();
  assert.deepEqual(vortexCenter({ x: 720, y: 268 }, { width: 1440, height: 900 }, 2), { x: 1440, y: 1264 });
  // Scrolled past the logo, the centre moves above the screen with it.
  assert.deepEqual(vortexCenter({ x: 720, y: -400 }, { width: 1440, height: 900 }, 1), { x: 720, y: 1300 });
  // No logo: the upper middle of the screen.
  assert.deepEqual(vortexCenter(null, { width: 1000, height: 1000 }, 1), { x: 500, y: 680 });
});

test('the shader is WebGL 1, uses the brand red and has no photo or red speckles', () => {
  const { FRAGMENT_SHADER, VERTEX_SHADER } = shader();
  assert.match(FRAGMENT_SHADER, /gl_FragColor/);
  assert.doesNotMatch(FRAGMENT_SHADER + VERTEX_SHADER, /#version 300|texture2D|sampler2D/);
  // #e51b2e = (0.898, 0.106, 0.180)
  assert.match(FRAGMENT_SHADER, /vec3\(0\.9, 0\.105, 0\.18\)/);
  // Stars are white, never red.
  assert.match(FRAGMENT_SHADER, /vec3\(0\.95, 0\.93, 1\.0\) \* stars/);
});

test('the homepage uses the vortex: no photo, no Rust scene, no red star field', () => {
  const page = read('app/page.tsx'), component = read('components/home/vortex-background.tsx');
  assert.match(page, /<VortexBackground \/>/);
  assert.doesNotMatch(page, /AstraBackground|RustBattleBackground/);
  assert.doesNotMatch(component, /\.avif|next\/image/);
  // Reduced motion shows one still frame; a lost GPU context stops drawing.
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /webglcontextlost/);
});
