// The homepage's red space vortex, rendered on the GPU. A fragment shader
// draws a nebula that spirals into the Cloudy logo: domain-warped noise in
// two cross-faded layers (so the swirl tightens forever without tearing),
// two logarithmic spiral arms, a glowing accretion ring around the logo, a
// faint nebula across the rest of the page and a few twinkling white stars.

export const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

export const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution; // drawing buffer, px
uniform vec2 uCenter;     // vortex centre, px from the bottom left
uniform float uUnit;      // px per scene unit (half the shorter side)
uniform float uRing;      // radius of the logo, in scene units
uniform float uTime;
uniform vec2 uPointer;    // -1..1, smoothed

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Layered noise; broad shapes need fewer layers than fine detail.
float fbm(vec2 p, int octaves) {
  float value = 0.0, amplitude = 0.5;
  mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p); p = turn * p; amplitude *= 0.5;
  }
  return value;
}

mat2 rotate(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// Matter falling in: the twist tightens and the pattern drifts inward over
// one cycle; two layers half a cycle apart hide each layer's reset. Returns
// soft clouds (x) and thin bright filaments along the spiral (y).
vec2 swirlLayer(vec2 p, float r, float phase, vec2 warp) {
  float twist = (1.5 + phase * 1.8) / (r + 0.32) + uTime * 0.06;
  vec2 q = rotate(twist) * p * (1.0 + phase * 0.45);
  float cloud = fbm(q * 2.2 + warp * 1.8, 5);
  float ridge = 1.0 - abs(2.0 * fbm(q * 4.6 + warp * 1.2 + 7.3, 4) - 1.0);
  return vec2(cloud, ridge);
}

vec3 palette(float d) {
  vec3 c = mix(vec3(0.0), vec3(0.09, 0.0, 0.014), smoothstep(0.0, 0.22, d));
  c = mix(c, vec3(0.42, 0.015, 0.05), smoothstep(0.18, 0.5, d));
  c = mix(c, vec3(0.9, 0.105, 0.18), smoothstep(0.45, 0.85, d));
  c = mix(c, vec3(1.0, 0.42, 0.24), smoothstep(0.82, 1.2, d));
  c = mix(c, vec3(1.0, 0.92, 0.86), smoothstep(1.15, 1.75, d));
  return c;
}

float star(vec2 p, float density) {
  vec2 cell = floor(p * density), f = fract(p * density) - 0.5;
  float h = hash(cell);
  if (h < 0.97) return 0.0;
  vec2 offset = vec2(hash(cell + 7.1), hash(cell + 3.7)) - 0.5;
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + h * 2.5) + h * 40.0);
  return smoothstep(0.075, 0.0, length(f - offset * 0.7)) * twinkle * (h - 0.97) / 0.03;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - uCenter) / uUnit + uPointer * 0.025;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uTime;

  vec2 turning = rotate(t * 0.035) * p;
  vec2 warp = vec2(fbm(turning * 1.3 + 3.1, 3), fbm(turning * 1.3 + vec2(8.7, 1.3), 3));
  float phaseA = fract(t * 0.04), phaseB = fract(t * 0.04 + 0.5);
  vec2 s = swirlLayer(p, r, phaseA, warp) * (1.0 - abs(2.0 * phaseA - 1.0))
         + swirlLayer(p, r, phaseB, warp) * (1.0 - abs(2.0 * phaseB - 1.0));
  float cloud = smoothstep(0.3, 0.82, s.x);
  float filament = pow(s.y, 7.0);

  // Two spiral arms; black space between them.
  float arms = 0.5 + 0.5 * cos(2.0 * a - 4.4 * log(r + 0.02) - t * 0.32);
  float armMask = mix(0.18, 1.0, arms * arms);
  // Hottest right around the logo, fading out into space.
  float profile = smoothstep(uRing * 0.95, uRing * 1.6, r) * (1.6 * exp(-r * 1.25) + 0.1);
  float density = (cloud * 0.85 + filament * 0.95) * armMask * profile * 1.7;
  vec3 color = palette(density);

  // A faint, dark nebula everywhere, so the page below the vortex is never empty.
  float haze = fbm(frag / uUnit * 0.85 + vec2(t * 0.012, -t * 0.007), 3);
  color += vec3(0.13, 0.005, 0.022) * pow(haze, 2.6);
  // Soft bloom around the centre.
  color += vec3(0.55, 0.035, 0.075) * exp(-r * 2.3) * 0.28;

  // The photon ring hugging the logo, with a hot spot that orbits, and its glow.
  float ringR = uRing * 1.07;
  float ring = exp(-pow((r - ringR) / max(uRing * 0.06, 0.004), 2.0));
  float halo = exp(-max(r - ringR, 0.0) / max(uRing * 0.55, 0.02)) * step(uRing * 0.9, r);
  float hot = 0.55 + 0.45 * cos(a - t * 0.7);
  color += vec3(1.0, 0.55, 0.42) * ring * 1.3 * hot + vec3(0.95, 0.16, 0.12) * halo * 0.5;
  color *= smoothstep(uRing * 0.9, uRing * 1.0, r);

  // A few white stars, slowly drawn around the vortex.
  vec2 sq = rotate(t * 0.008 + 0.3 / (r + 1.0)) * p;
  float stars = star(sq, 8.0) + 0.6 * star(sq + 13.0, 16.0);
  color += vec3(0.95, 0.93, 1.0) * stars * (1.0 - smoothstep(0.1, 0.6, density)) * 0.9;

  vec2 uv = frag / uResolution;
  color *= 1.0 - 0.32 * pow(length(uv - vec2(0.5, 0.55)) * 1.2, 2.4);
  color = 1.0 - exp(-color * 1.35);
  color += (hash(frag + fract(t)) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * The drawing-buffer scale for a canvas of width × height CSS px: as sharp as
 * the screen allows (never above its pixel ratio), but never more than
 * `budget` pixels, so a 4K screen does not render 8 million pixels a frame.
 */
export function renderScale(width: number, height: number, pixelRatio: number, budget: number) {
  const area = Math.max(1, width * height);
  return Math.max(0.35, Math.min(pixelRatio, Math.sqrt(budget / area)));
}

/** Where the vortex sits, in drawing-buffer px from the bottom left. */
export function vortexCenter(logo: { x: number; y: number } | null, view: { width: number; height: number }, scale: number) {
  const x = logo ? logo.x : view.width / 2;
  const y = logo ? logo.y : view.height * 0.32;
  return { x: x * scale, y: (view.height - y) * scale };
}
