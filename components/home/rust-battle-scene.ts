// The homepage's Rust night, drawn entirely in code (no photos): a night sky
// with a moon and drifting clouds, mountains, a launch tower, power pylons, a
// pine forest, walled player bases and a sandbag foreground. Nobody shoots:
// bases burn and smoke, searchlights sweep the sky, a helicopter patrols with
// its searchlight, flares drift down, a cargo plane drops a supply crate with
// purple signal smoke, and now and then C4 goes off on a wall.
//
// The scenery is painted once per resize into a few layers; every frame only
// the layers and the effects are drawn. No React here, so it can be tested
// with a fake canvas.

type Ctx = CanvasRenderingContext2D;
export type Surface = { width: number; height: number; getContext(kind: '2d'): Ctx | null };
export type MakeSurface = (width: number, height: number) => Surface;
type Point = { x: number; y: number };

const TAU = Math.PI * 2;
const SCENERY_SEED = 0x5eed1;

/** Small seeded generator, so the scenery looks the same on every visit. */
export function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ effects

type Blast = { x: number; y: number; r: number; life: number; max: number };
type Ring = { x: number; y: number; r: number; life: number; max: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };
type Puff = { x: number; y: number; vx: number; vy: number; r: number; grow: number; alpha: number; life: number; max: number; signal?: boolean };
type Flash = { x: number; y: number; r: number; life: number; max: number; alpha: number };
type Fire = { x: number; y: number; s: number; heat: number; decay: number; ember: number; smoke: number; seed: number };
type Heli = { x: number; y: number; dir: 1 | -1; speed: number; t: number };
type Flare = { x: number; y: number; vy: number; t: number; life: number };
type Charge = { x: number; y: number; t: number; dur: number };
type Drop = { x: number; y: number; dir: 1 | -1; speed: number; t: number; target: Point; crate: { x: number; y: number; t: number; landed: number } | null; dropped: boolean; signal: number };
type Compound = { targets: Point[]; windows: { x: number; y: number; w: number; h: number; seed: number }[]; tower: Point; fire: Point[] };

export type SceneStats = { sparks: number; puffs: number; fires: number; explosions: number; heli: boolean; drop: boolean };

export function createBattleScene({ phone, makeSurface, random = Math.random }: { phone: boolean; makeSurface: MakeSurface; random?: () => number }) {
  const rand = (min: number, max: number) => min + random() * (max - min);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length) % list.length];

  let W = 0, H = 0, S = 1, horizon = 0, margin = 0, dpr = 1;
  // Each layer covers only the band of the screen it paints, to keep every frame cheap.
  type Layer = { surface: Surface; top: number; height: number };
  let layers: { back: Layer; near: Layer; front: Layer; clouds: Layer; fog: Layer } | null = null;
  let compounds: Compound[] = [], stacks: Point[] = [], beacon: Point = { x: 0, y: 0 };
  let groundTargets: Point[] = [], campfires: Point[] = [];

  const blasts: Blast[] = [], rings: Ring[] = [], sparks: Spark[] = [], puffs: Puff[] = [];
  const lights: Flash[] = [], fires: Fire[] = [], flares: Flare[] = [], charges: Charge[] = [];
  let heli: Heli | null = null;
  let drop: Drop | null = null;
  const queue: { at: number; run: () => void }[] = [];
  const later = (delay: number, run: () => void) => queue.push({ at: now + delay, run });
  let now = 0, shake = 0, whiteout = 0, explosions = 0;
  const pointer = { x: 0, y: 0 };
  let aim = { x: 0, y: 0 };
  const timers = { heli: 3.5, flare: 2.2, charge: 7, stack: 0, drop: 11 };
  const cap = phone ? { puffs: 140, sparks: 140 } : { puffs: 260, sparks: 260 };

  // ------------------------------------------------------------- sprites

  function sprite(size: number, stops: [number, string][]) {
    const surface = makeSurface(size, size);
    const g = surface.getContext('2d');
    if (g) {
      const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (const [at, color] of stops) gradient.addColorStop(at, color);
      g.fillStyle = gradient;
      g.fillRect(0, 0, size, size);
    }
    return surface;
  }
  const glow = sprite(64, [[0, 'rgba(255,255,236,1)'], [0.18, 'rgba(255,214,140,0.95)'], [0.45, 'rgba(255,120,40,0.4)'], [1, 'rgba(255,60,10,0)']]);
  const smoke = sprite(64, [[0, 'rgba(112,98,94,0.55)'], [0.55, 'rgba(78,68,68,0.28)'], [1, 'rgba(50,44,46,0)']]);
  const signal = sprite(64, [[0, 'rgba(176,96,220,0.55)'], [0.55, 'rgba(120,64,170,0.28)'], [1, 'rgba(80,40,120,0)']]);
  const light = sprite(64, [[0, 'rgba(255,240,222,1)'], [0.4, 'rgba(255,214,170,0.35)'], [1, 'rgba(255,190,140,0)']]);

  // ------------------------------------------------------------- scenery

  function band(width: number, top: number, bottom: number, shift: number) {
    const height = Math.max(1, bottom - top);
    const surface = makeSurface(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
    const g = surface.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(shift, -top);
    return { g, layer: { surface, top, height } as Layer };
  }

  function blob(g: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    const gradient = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gradient;
    g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill();
    g.restore();
  }

  function ridge(rng: () => number, base: number, amplitude: number, roughness: number) {
    const points: number[] = new Array(65).fill(0);
    points[0] = rng(); points[64] = rng();
    for (let step = 32, scale = 1; step >= 1; step /= 2, scale *= roughness) {
      for (let i = step; i < 64; i += step * 2) points[i] = (points[i - step] + points[i + step]) / 2 + (rng() - 0.5) * scale;
    }
    const min = Math.min(...points), max = Math.max(...points);
    return points.map(p => base - ((p - min) / (max - min || 1)) * amplitude);
  }

  function fillRidge(g: Ctx, heights: number[], from: number, to: number, bottom: number) {
    g.beginPath();
    g.moveTo(from, bottom);
    heights.forEach((y, i) => g.lineTo(from + ((to - from) * i) / (heights.length - 1), y));
    g.lineTo(to, bottom);
    g.closePath();
    g.fill();
  }

  function paintSky(g: Ctx, rng: () => number) {
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#03040a'); sky.addColorStop(0.42, '#0a0b17'); sky.addColorStop(0.72, '#1f0e15');
    sky.addColorStop(0.9, '#4a1a12'); sky.addColorStop(1, '#7c3014');
    g.fillStyle = sky; g.fillRect(-margin, 0, W + margin * 2, horizon);
    g.fillStyle = '#0a0607'; g.fillRect(-margin, horizon, W + margin * 2, H - horizon);
    // The raid lights the horizon.
    g.globalCompositeOperation = 'lighter';
    blob(g, W * 0.68, horizon, W * 0.5, H * 0.22, 'rgba(255,104,36,0.26)');
    blob(g, W * 0.16, horizon, W * 0.34, H * 0.16, 'rgba(255,86,28,0.18)');
    g.globalCompositeOperation = 'source-over';
    // Moon with a soft halo and faint craters.
    const mx = W * (phone ? 0.8 : 0.83), my = H * (phone ? 0.21 : 0.15), mr = Math.max(18, 40 * S);
    g.globalCompositeOperation = 'lighter';
    blob(g, mx, my, mr * 7, mr * 7, 'rgba(120,140,210,0.09)');
    blob(g, mx, my, mr * 2.6, mr * 2.6, 'rgba(255,240,220,0.14)');
    g.globalCompositeOperation = 'source-over';
    const disc = g.createRadialGradient(mx - mr * 0.3, my - mr * 0.35, mr * 0.1, mx, my, mr);
    disc.addColorStop(0, '#fffaf0'); disc.addColorStop(0.65, '#ebe3d4'); disc.addColorStop(1, '#cfc4b2');
    g.fillStyle = disc; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
    g.fillStyle = 'rgba(150,136,120,0.12)';
    for (let i = 0; i < 6; i++) { const a = rng() * TAU, d = rng() * mr * 0.6; g.beginPath(); g.arc(mx + Math.cos(a) * d, my + Math.sin(a) * d, mr * (0.06 + rng() * 0.12), 0, TAU); g.fill(); }
    // High, still clouds; one streak crosses the moon.
    for (let i = 0; i < (phone ? 14 : 26); i++) {
      const rx = (70 + rng() * 170) * S;
      const cx = rng() * W, cy = H * (0.04 + rng() * 0.18), ry = rx * (0.22 + rng() * 0.16);
      blob(g, cx, cy, rx, ry, `rgba(30,24,40,${0.45 + rng() * 0.35})`);
      // Clouds near the moon catch its light.
      const near = Math.max(0, 1 - Math.hypot(cx - mx, cy - my) / (W * 0.3));
      if (near > 0) { g.globalCompositeOperation = 'lighter'; blob(g, cx, cy - ry * 0.3, rx * 0.8, ry * 0.5, `rgba(170,180,220,${0.08 * near})`); g.globalCompositeOperation = 'source-over'; }
    }
  }

  function paintClouds(g: Ctx, rng: () => number, width: number) {
    // A strip twice the screen wide that scrolls with the wind and wraps.
    for (let i = 0; i < (phone ? 18 : 34); i++) {
      const x = rng() * width, y = H * (0.3 + rng() * 0.22), rx = (90 + rng() * 200) * S, ry = rx * (0.18 + rng() * 0.14);
      for (const dx of [-width, 0, width]) {
        blob(g, x + dx, y, rx, ry, `rgba(34,22,30,${0.5 + rng() * 0.3})`);
        g.globalCompositeOperation = 'lighter';
        blob(g, x + dx, y + ry * 0.55, rx * 0.8, ry * 0.5, 'rgba(255,112,50,0.12)');
        g.globalCompositeOperation = 'source-over';
      }
    }
  }

  function paintFog(g: Ctx, rng: () => number, width: number) {
    for (let i = 0; i < (phone ? 16 : 30); i++) {
      const x = rng() * width, y = horizon + (rng() - 0.6) * H * 0.07, rx = (80 + rng() * 160) * S;
      for (const dx of [-width, 0, width]) blob(g, x + dx, y, rx, rx * 0.22, `rgba(46,26,28,${0.32 + rng() * 0.2})`);
    }
  }

  function paintMountains(g: Ctx, rng: () => number) {
    g.fillStyle = '#1b1220';
    fillRidge(g, ridge(rng, horizon - H * 0.07, H * 0.13, 0.55), -margin, W + margin, horizon + 4);
    const haze = g.createLinearGradient(0, horizon - H * 0.2, 0, horizon);
    haze.addColorStop(0, 'rgba(120,40,24,0)'); haze.addColorStop(1, 'rgba(150,52,24,0.42)');
    g.fillStyle = haze; g.fillRect(-margin, horizon - H * 0.2, W + margin * 2, H * 0.2 + 4);
    g.fillStyle = '#120b11';
    fillRidge(g, ridge(rng, horizon - H * 0.015, H * 0.075, 0.6), -margin, W + margin, H + 2);
  }

  function lattice(g: Ctx, x: number, base: number, height: number, bottomWidth: number, topWidth: number, sections: number) {
    g.beginPath();
    const at = (k: number) => ({ y: base - height * k, half: (bottomWidth + (topWidth - bottomWidth) * k) / 2 });
    for (let i = 0; i < sections; i++) {
      const a = at(i / sections), b = at((i + 1) / sections);
      g.moveTo(x - a.half, a.y); g.lineTo(x - b.half, b.y);
      g.moveTo(x + a.half, a.y); g.lineTo(x + b.half, b.y);
      g.moveTo(x - a.half, a.y); g.lineTo(x + b.half, b.y);
      g.moveTo(x + a.half, a.y); g.lineTo(x - b.half, b.y);
      g.moveTo(x - b.half, b.y); g.lineTo(x + b.half, b.y);
    }
    g.stroke();
  }

  function pine(g: Ctx, x: number, base: number, height: number) {
    const width = height * 0.42;
    g.fillRect(x - height * 0.03, base - height * 0.2, height * 0.06, height * 0.2);
    for (let k = 0; k < 3; k++) {
      const top = base - height * (0.4 + k * 0.3) - height * 0.12, bottom = base - height * (0.12 + k * 0.27), w = width * (1 - k * 0.24);
      g.beginPath(); g.moveTo(x, top); g.lineTo(x - w / 2, bottom); g.lineTo(x + w / 2, bottom); g.closePath(); g.fill();
    }
  }

  function compound(g: Ctx, rng: () => number, cx: number, ground: number, s: number): Compound {
    const result: Compound = { targets: [], windows: [], tower: { x: 0, y: 0 }, fire: [] };
    const dark = '#0b0708', wall = '#0f0a0b';
    // Main building, an upper floor with shooting slits, roof railing.
    const bw = 86 * s, bh = 92 * s, bx = cx - bw / 2 + (rng() - 0.5) * 20 * s, by = ground - bh;
    g.fillStyle = dark; g.fillRect(bx, by, bw, bh);
    const uw = 58 * s, uh = 38 * s, ux = bx + (bw - uw) * rng();
    g.fillRect(ux, by - uh, uw, uh);
    for (let i = 0; i < 6; i++) g.fillRect(ux + (i * (uw - 4 * s)) / 5, by - uh - 6 * s, 4 * s, 6 * s);
    g.fillStyle = '#1a1012';
    for (let i = 0; i < 3; i++) g.fillRect(ux + 8 * s + i * 17 * s, by - uh + 15 * s, 12 * s, 2.4 * s);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
      const wx = bx + 10 * s + col * 19 * s, wy = by + 14 * s + row * 24 * s;
      const lit = rng() < 0.42;
      g.fillStyle = '#1a1012'; g.fillRect(wx, wy, 8 * s, 8 * s);
      if (lit) result.windows.push({ x: wx, y: wy, w: 8 * s, h: 8 * s, seed: rng() * 100 });
    }
    // Rim light from the fires on the roof edges.
    g.fillStyle = 'rgba(255,120,60,0.16)'; g.fillRect(bx, by, bw, 1.4 * s); g.fillRect(ux, by - uh, uw, 1.4 * s);
    // Sniper tower.
    const tx = cx + (rng() < 0.5 ? -1 : 1) * 82 * s, th = 128 * s;
    g.fillStyle = dark; g.fillRect(tx - 7 * s, ground - th, 14 * s, th);
    g.fillRect(tx - 17 * s, ground - th - 24 * s, 34 * s, 24 * s);
    g.fillRect(tx - 20 * s, ground - th - 28 * s, 40 * s, 5 * s);
    g.fillStyle = '#1a1012'; g.fillRect(tx - 12 * s, ground - th - 18 * s, 24 * s, 5 * s);
    result.tower = { x: tx, y: ground - th - 26 * s };
    result.windows.push({ x: tx - 12 * s, y: ground - th - 18 * s, w: 24 * s, h: 5 * s, seed: rng() * 100 });
    // High external walls with pointed logs and a gate.
    const ww = 200 * s, wh = 34 * s, wx = cx - ww / 2;
    g.fillStyle = wall; g.fillRect(wx, ground - wh, ww, wh);
    g.beginPath();
    for (let x = wx; x < wx + ww; x += 7 * s) { g.moveTo(x, ground - wh); g.lineTo(x + 3.5 * s, ground - wh - 7 * s); g.lineTo(x + 7 * s, ground - wh); }
    g.fill();
    g.fillStyle = '#070405'; g.fillRect(cx - 12 * s, ground - wh * 0.8, 24 * s, wh * 0.8);
    g.fillStyle = 'rgba(255,120,60,0.12)'; g.fillRect(wx, ground - wh, ww, 1.2 * s);
    result.targets.push({ x: bx + bw * 0.3, y: by + bh * 0.3 }, { x: bx + bw * 0.75, y: by + bh * 0.55 }, { x: ux + uw / 2, y: by - uh / 2 }, { x: wx + ww * 0.2, y: ground - wh / 2 }, { x: wx + ww * 0.8, y: ground - wh / 2 });
    result.fire.push({ x: ux + uw * 0.5, y: by - uh }, { x: bx + bw * 0.2, y: by }, { x: wx + ww * 0.15, y: ground - wh });
    return result;
  }

  function paintNear(g: Ctx, rng: () => number) {
    g.strokeStyle = '#0d0809'; g.fillStyle = '#0d0809'; g.lineWidth = Math.max(1, 1.3 * S);
    // Power line across the valley.
    const pylons = (phone ? [0.3, 0.62] : [0.26, 0.42, 0.56]).map(f => ({ x: W * f, top: horizon - H * 0.16 }));
    for (const p of pylons) {
      lattice(g, p.x, horizon + 4, H * 0.16, 30 * S, 8 * S, 6);
      g.fillRect(p.x - 22 * S, p.top + 10 * S, 44 * S, 2.4 * S);
      g.fillRect(p.x - 16 * S, p.top + 26 * S, 32 * S, 2.4 * S);
    }
    g.beginPath();
    for (let i = -1; i < pylons.length; i++) {
      const a = i < 0 ? { x: -margin, top: horizon - H * 0.1 } : pylons[i];
      const b = i + 1 < pylons.length ? pylons[i + 1] : { x: W + margin, top: horizon - H * 0.12 };
      for (const dy of [11, 27]) { g.moveTo(a.x, a.top + dy * S); g.quadraticCurveTo((a.x + b.x) / 2, a.top + dy * S + 26 * S, b.x, b.top + dy * S); }
    }
    g.lineWidth = Math.max(0.8, 0.9 * S); g.stroke();
    // Launch tower with its rocket.
    const lx = W * (phone ? 0.84 : 0.76), lh = H * 0.36;
    g.lineWidth = Math.max(1, 1.6 * S);
    lattice(g, lx, horizon + 6, lh, 34 * S, 22 * S, 12);
    for (let k = 1; k < 5; k++) g.fillRect(lx - 17 * S, horizon - (lh * k) / 5, 44 * S, 3 * S);
    const rx = lx + 34 * S, rw = 20 * S, rh = lh * 0.86;
    g.fillRect(rx - rw / 2, horizon - rh, rw, rh);
    g.beginPath(); g.moveTo(rx - rw / 2, horizon - rh); g.quadraticCurveTo(rx, horizon - rh - 42 * S, rx + rw / 2, horizon - rh); g.fill();
    g.beginPath(); g.moveTo(rx - rw / 2, horizon - 26 * S); g.lineTo(rx - rw, horizon); g.lineTo(rx - rw / 2, horizon); g.fill();
    g.beginPath(); g.moveTo(rx + rw / 2, horizon - 26 * S); g.lineTo(rx + rw, horizon); g.lineTo(rx + rw / 2, horizon); g.fill();
    beacon = { x: lx, y: horizon - lh - 4 * S };
    // Smokestacks of the old plant.
    stacks = [];
    for (const f of phone ? [0.06] : [0.05, 0.085]) {
      const sx = W * f, sh = H * (0.17 + rng() * 0.04);
      g.beginPath(); g.moveTo(sx - 9 * S, horizon + 4); g.lineTo(sx - 6 * S, horizon - sh); g.lineTo(sx + 6 * S, horizon - sh); g.lineTo(sx + 9 * S, horizon + 4); g.fill();
      stacks.push({ x: sx, y: horizon - sh });
    }
    // Two rows of pines.
    for (const row of [{ y: horizon + 3 * S, min: 16, max: 34, color: '#0c0709' }, { y: horizon + 12 * S, min: 24, max: 52, color: '#080506' }]) {
      g.fillStyle = row.color;
      for (let x = -margin; x < W + margin; x += (5 + rng() * 9) * S) pine(g, x, row.y + rng() * 6 * S, (row.min + rng() * (row.max - row.min)) * S);
    }
    // The bases being raided.
    const spots = phone ? [0.18, 0.62] : [0.13, 0.5, 0.9];
    compounds = spots.map(f => compound(g, rng, W * f, horizon + 16 * S, S * (phone ? 0.85 : 1)));
    paintGround(g, rng);
  }

  // The valley floor: rolling hills lit by the fires, a dirt road to the middle
  // base, craters, barricades, dead trees and a burnt-out car.
  function paintGround(g: Ctx, rng: () => number) {
    const top = horizon + 16 * S, low = H * (phone ? 0.9 : 0.88);
    const depth = (y: number) => S * (0.55 + Math.max(0, (y - top) / (low - top)) * 1.1);
    const floor = g.createLinearGradient(0, top, 0, H);
    floor.addColorStop(0, '#140b0b'); floor.addColorStop(0.45, '#0c0708'); floor.addColorStop(1, '#060404');
    g.fillStyle = floor; g.fillRect(-margin, top, W + margin * 2, H - top);
    g.globalCompositeOperation = 'lighter';
    for (const c of compounds) blob(g, c.tower.x, top + 6 * S, 190 * S, 46 * S, 'rgba(255,96,36,0.11)');
    g.globalCompositeOperation = 'source-over';
    // Road from the bottom of the screen to the middle base's gate.
    const gate = compounds[Math.floor(compounds.length / 2)];
    const gx = gate.targets[3].x + (gate.targets[4].x - gate.targets[3].x) / 2;
    g.fillStyle = 'rgba(74,50,40,0.42)';
    g.beginPath();
    g.moveTo(gx - 6 * S, top);
    g.bezierCurveTo(gx - 40 * S, top + (low - top) * 0.4, W * 0.36, low - 40 * S, W * 0.3, H + 2);
    g.lineTo(W * 0.3 + 120 * S, H + 2);
    g.bezierCurveTo(W * 0.36 + 110 * S, low - 40 * S, gx + 30 * S, top + (low - top) * 0.4, gx + 6 * S, top);
    g.closePath(); g.fill();
    // Rolling hills, each a little closer and darker, with a warm rim.
    const hills = ['#0f090a', '#0b0607', '#080505'];
    hills.forEach((color, k) => {
      const base = top + (low - top) * (0.3 + k * 0.28);
      const heights = ridge(rng, base, H * 0.035, 0.55);
      g.fillStyle = color;
      fillRidge(g, heights, -margin, W + margin, H + 2);
      g.strokeStyle = 'rgba(255,128,76,0.07)'; g.lineWidth = 1.2 * S;
      g.beginPath();
      heights.forEach((y, i) => { const x = -margin + ((W + margin * 2) * i) / (heights.length - 1); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    });
    // Craters.
    for (let i = 0; i < (phone ? 4 : 8); i++) {
      const x = rng() * W, y = top + (low - top) * (0.15 + rng() * 0.75), d = depth(y), r = (14 + rng() * 16) * d;
      g.fillStyle = '#040203'; g.beginPath(); g.ellipse(x, y, r, r * 0.32, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,120,70,0.10)'; g.lineWidth = 1.4 * d;
      g.beginPath(); g.ellipse(x, y - r * 0.05, r * 1.05, r * 0.36, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      groundTargets.push({ x, y });
    }
    // Wooden barricades.
    g.strokeStyle = '#070405'; g.lineCap = 'round';
    for (let i = 0; i < (phone ? 3 : 6); i++) {
      const x = W * (0.06 + rng() * 0.88), y = top + (low - top) * (0.2 + rng() * 0.6), d = depth(y);
      g.lineWidth = 3 * d;
      g.beginPath();
      for (let k = 0; k < 3; k++) {
        const bx = x + k * 13 * d;
        g.moveTo(bx, y); g.lineTo(bx + 16 * d, y - 18 * d); g.moveTo(bx + 16 * d, y); g.lineTo(bx, y - 18 * d);
      }
      g.moveTo(x - 4 * d, y - 9 * d); g.lineTo(x + 46 * d, y - 9 * d);
      g.stroke();
    }
    g.lineCap = 'butt';
    // Dead trees.
    g.strokeStyle = '#060304';
    for (let i = 0; i < (phone ? 2 : 4); i++) {
      const x = W * (0.04 + rng() * 0.92), y = top + (low - top) * (0.1 + rng() * 0.7), d = depth(y), h = (40 + rng() * 30) * d;
      g.lineWidth = 3 * d;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2 * d, y - h);
      for (let k = 0; k < 4; k++) {
        const by = y - h * (0.45 + k * 0.14), side = k % 2 ? 1 : -1;
        g.moveTo(x + d, by); g.lineTo(x + side * (10 + rng() * 12) * d, by - (8 + rng() * 8) * d);
      }
      g.stroke();
    }
    // A burnt-out car on the road side.
    {
      const x = W * (phone ? 0.08 : 0.24), y = top + (low - top) * 0.55, d = depth(y);
      g.fillStyle = '#060304';
      g.beginPath(); g.moveTo(x, y - 8 * d); g.lineTo(x + 12 * d, y - 18 * d); g.lineTo(x + 38 * d, y - 19 * d); g.lineTo(x + 50 * d, y - 9 * d); g.lineTo(x + 58 * d, y - 8 * d); g.lineTo(x + 58 * d, y); g.lineTo(x, y); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,120,60,0.09)'; g.fillRect(x + 14 * d, y - 17 * d, 22 * d, 1.5 * d);
      campfires.push({ x: x + 30 * d, y: y - 12 * d });
    }
  }

  function paintFront(g: Ctx, rng: () => number) {
    const top = H * (phone ? 0.9 : 0.88);
    g.fillStyle = '#040203';
    fillRidge(g, ridge(rng, top + H * 0.03, H * 0.05, 0.62), -margin, W + margin, H + 2);
    // Sandbags at both corners and a log barricade.
    const sandbags = (x0: number, x1: number, base: number) => {
      const bagW = 26 * S, bagH = 11 * S;
      for (let row = 0; row < 3; row++) for (let x = x0 + (row % 2) * bagW * 0.5; x < x1 - row * bagW * 0.6; x += bagW * 0.96) {
        const y = base - row * bagH * 0.9;
        g.fillStyle = '#070405'; g.beginPath(); g.ellipse(x, y, bagW / 2, bagH / 2, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,130,70,0.08)'; g.beginPath(); g.ellipse(x, y - bagH * 0.25, bagW * 0.4, bagH * 0.18, 0, 0, TAU); g.fill();
      }
    };
    sandbags(-margin, W * (phone ? 0.3 : 0.17), H * 0.95);
    sandbags(W * (phone ? 0.74 : 0.86), W + margin, H * 0.955);
    g.strokeStyle = '#060304'; g.lineWidth = 5 * S; g.lineCap = 'round';
    const bx = W * (phone ? 0.5 : 0.3), by = H * 0.94;
    g.beginPath();
    for (let i = 0; i < 4; i++) { g.moveTo(bx + i * 16 * S, by); g.lineTo(bx + i * 16 * S + 22 * S, by - 30 * S); g.moveTo(bx + i * 16 * S + 22 * S, by); g.lineTo(bx + i * 16 * S, by - 30 * S); }
    g.stroke();
    g.lineCap = 'butt';
    // Grass along the ridge.
    g.strokeStyle = '#050304'; g.lineWidth = Math.max(1, 1.2 * S);
    g.beginPath();
    for (let x = -margin; x < W + margin; x += (3 + rng() * 6) * S) {
      const base = top + H * 0.035 + rng() * H * 0.02, h = (6 + rng() * 14) * S;
      g.moveTo(x, base); g.quadraticCurveTo(x + 2 * S, base - h * 0.6, x + (rng() - 0.5) * 8 * S, base - h);
    }
    g.stroke();
  }

  function paint() {
    const rng = seeded(SCENERY_SEED);
    groundTargets = []; campfires = [];
    const wide = W + margin * 2, strip = W * 2;
    const back = band(wide, 0, H, margin);
    const near = band(wide, Math.max(0, horizon - H * 0.42 - 60 * S), H, margin);
    const front = band(wide, H * 0.82, H, margin);
    const clouds = band(strip, H * 0.16, Math.min(horizon, H * 0.68), 0);
    const fog = band(strip, horizon - H * 0.12, Math.min(H, horizon + H * 0.1), 0);
    paintSky(back.g, rng);
    paintMountains(back.g, rng);
    paintNear(near.g, rng);
    paintFront(front.g, rng);
    paintClouds(clouds.g, rng, strip);
    paintFog(fog.g, rng, strip);
    layers = { back: back.layer, near: near.layer, front: front.layer, clouds: clouds.layer, fog: fog.layer };
  }

  // ------------------------------------------------------------- spawning

  const push = <T,>(list: T[], item: T, limit: number) => { list.push(item); if (list.length > limit) list.splice(0, list.length - limit); };

  function puff(x: number, y: number, r: number, life: number, alpha = 0.7, vy = -10 * S, signalSmoke = false) {
    push(puffs, { x, y, vx: rand(4, 14) * S, vy, r, grow: r * rand(0.5, 1), alpha, life: 0, max: life, signal: signalSmoke }, cap.puffs);
  }

  function explode(x: number, y: number, size: number, big = false) {
    explosions++;
    push(blasts, { x, y, r: size, life: 0, max: big ? 0.75 : 0.5 }, 30);
    push(rings, { x, y, r: size * (big ? 5 : 3.2), life: 0, max: big ? 0.55 : 0.4 }, 20);
    push(lights, { x, y, r: size * (big ? 16 : 9), life: 0, max: big ? 0.6 : 0.35, alpha: big ? 0.55 : 0.32 }, 20);
    for (let i = 0; i < (big ? 30 : 16) * (phone ? 0.6 : 1); i++) {
      const angle = rand(Math.PI * 1.05, Math.PI * 1.95), speed = rand(60, big ? 320 : 220) * S;
      push(sparks, { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: rand(0.5, 1.3), size: rand(1, 2.2) * S }, cap.sparks);
    }
    for (let i = 0; i < (big ? 14 : 6); i++) puff(x + rand(-1, 1) * size * 0.6, y - rand(0, size * (big ? 1.4 : 0.5)), size * rand(0.5, 1), rand(3, 6), 0.8, -rand(14, big ? 40 : 26) * S);
    if (big) {
      shake = Math.max(shake, 1);
      whiteout = Math.max(whiteout, 0.16);
      for (let i = 1; i <= 3; i++) later(i * 0.14, () => explode(x + rand(-1, 1) * size * 1.4, y + rand(-0.6, 0.2) * size, size * 0.45));
    } else shake = Math.max(shake, 0.25);
    const burning = fires.find(f => Math.hypot(f.x - x, f.y - y) < 40 * S);
    if (burning) burning.heat = Math.min(1.4, burning.heat + 0.5);
    else push(fires, { x, y, s: S * rand(0.8, 1.2) * (big ? 1.4 : 1), heat: 1, decay: rand(0.025, 0.05), ember: 0, smoke: 0, seed: rand(0, 100) }, phone ? 6 : 10);
  }

  function step(dt: number) {
    if (!layers) return;
    now += dt;
    for (let i = queue.length - 1; i >= 0; i--) if (queue[i].at <= now) queue.splice(i, 1)[0].run();
    for (const key of Object.keys(timers) as (keyof typeof timers)[]) timers[key] -= dt;

    if (timers.heli <= 0 && !heli) {
      const dir: 1 | -1 = random() < 0.5 ? 1 : -1;
      heli = { x: dir === 1 ? -160 * S : W + 160 * S, y: H * rand(0.17, 0.28), dir, speed: Math.max(80, W / 11), t: 0 };
    }
    if (timers.flare <= 0 && flares.length < 2) {
      flares.push({ x: W * rand(0.12, 0.88), y: H * rand(0.06, 0.16), vy: 12 * S, t: 0, life: rand(8, 10) });
      timers.flare = rand(9, 14);
    }
    if (timers.charge <= 0) {
      const c = pick(compounds).targets.slice(3);
      const at = pick(c);
      charges.push({ x: at.x, y: at.y, t: 0, dur: 2.6 });
      timers.charge = rand(11, 17);
    }
    if (timers.drop <= 0 && !drop && groundTargets.length) {
      const dir: 1 | -1 = random() < 0.5 ? 1 : -1;
      drop = { x: dir === 1 ? -220 * S : W + 220 * S, y: H * (phone ? 0.16 : 0.09), dir, speed: Math.max(70, W / 13), t: 0, target: pick(groundTargets), crate: null, dropped: false, signal: 0 };
    }
    if (drop) {
      const d = drop;
      d.t += dt; d.x += d.dir * d.speed * dt; d.signal -= dt;
      if (d.signal <= 0 && (!d.crate || d.crate.landed < 3)) { puff(d.target.x + rand(-4, 4) * S, d.target.y, 8 * S, rand(4, 6), 0.7, -rand(18, 28) * S, true); d.signal = 0.12; }
      if (!d.dropped && (d.dir === 1 ? d.x >= d.target.x : d.x <= d.target.x)) { d.dropped = true; d.crate = { x: d.x, y: d.y + 10 * S, t: 0, landed: 0 }; }
      if (d.crate) {
        const c = d.crate;
        c.t += dt;
        if (c.y < d.target.y) { c.y = Math.min(d.target.y, c.y + 34 * S * dt); c.x += (d.target.x - c.x) * Math.min(1, dt * 0.4) + Math.sin(c.t * 1.2) * 6 * S * dt; }
        else c.landed += dt;
      }
      const gone = d.dir === 1 ? d.x > W + 260 * S : d.x < -260 * S;
      if (gone && d.crate && d.crate.landed > 7) { drop = null; timers.drop = rand(24, 34); }
    }
    if (timers.stack <= 0) {
      for (const s of stacks) puff(s.x, s.y, 7 * S, rand(5, 8), 0.42, -rand(12, 20) * S);
      timers.stack = 0.35;
    }

    if (heli) {
      heli.t += dt;
      heli.x += heli.dir * heli.speed * dt;
      if ((heli.dir === 1 && heli.x > W + 200 * S) || (heli.dir === -1 && heli.x < -200 * S)) { heli = null; timers.heli = rand(15, 22); }
    }
    for (let i = flares.length - 1; i >= 0; i--) {
      const f = flares[i];
      f.t += dt;
      f.y += f.vy * dt; f.x += Math.sin(f.t * 1.4) * 10 * S * dt;
      if (f.t > f.life) flares.splice(i, 1);
    }
    for (let i = charges.length - 1; i >= 0; i--) {
      const c = charges[i];
      c.t += dt;
      if (c.t >= c.dur) { charges.splice(i, 1); explode(c.x, c.y, 34 * S, true); }
    }
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.heat -= f.decay * dt;
      if (f.heat <= 0) { fires.splice(i, 1); continue; }
      f.ember -= dt; f.smoke -= dt;
      if (f.ember <= 0) { push(sparks, { x: f.x + rand(-8, 8) * f.s, y: f.y, vx: rand(-14, 14) * S, vy: -rand(30, 70) * S, life: 0, max: rand(0.8, 1.6), size: rand(0.8, 1.6) * S }, cap.sparks); f.ember = rand(0.08, 0.2) / f.heat; }
      if (f.smoke <= 0) { puff(f.x + rand(-6, 6) * f.s, f.y - 10 * f.s, 12 * f.s, rand(4, 7), 0.6 * Math.min(1, f.heat), -rand(14, 24) * S); f.smoke = 0.3 / Math.min(1, f.heat + 0.2); }
    }
    const age = <T extends { life: number; max: number }>(list: T[]) => { for (let i = list.length - 1; i >= 0; i--) { list[i].life += dt; if (list[i].life > list[i].max) list.splice(i, 1); } };
    age(blasts); age(rings); age(sparks); age(puffs); age(lights);
    for (const s of sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * S * dt; s.vx *= 1 - dt * 0.6; }
    for (const p of puffs) if (p.life > 0) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.grow * dt; p.vy *= 1 - dt * 0.15; }
    shake = Math.max(0, shake - dt * 2.2);
    whiteout = Math.max(0, whiteout - dt * 0.6);
    pointer.x += (aim.x - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (aim.y - pointer.y) * Math.min(1, dt * 3);
  }


  // ------------------------------------------------------------- drawing

  function stamp(g: Ctx, image: Surface, x: number, y: number, r: number, alpha: number) {
    if (alpha <= 0 || r <= 0) return;
    g.globalAlpha = Math.min(1, alpha);
    g.drawImage(image as unknown as CanvasImageSource, x - r, y - r, r * 2, r * 2);
  }

  function beam(g: Ctx, x: number, y: number, angle: number, length: number, spread: number, alpha: number) {
    g.globalAlpha = 1;
    const gradient = g.createLinearGradient(x, y, x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    gradient.addColorStop(0, `rgba(255,246,226,${alpha})`); gradient.addColorStop(1, 'rgba(255,246,226,0)');
    g.fillStyle = gradient;
    g.beginPath(); g.moveTo(x, y);
    g.lineTo(x + Math.cos(angle - spread) * length, y + Math.sin(angle - spread) * length);
    g.lineTo(x + Math.cos(angle + spread) * length, y + Math.sin(angle + spread) * length);
    g.closePath(); g.fill();
  }

  function dot(g: Ctx, x: number, y: number, r: number, color: string) {
    g.globalAlpha = 1;
    const gradient = g.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color); gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gradient; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }

  function drawHeli(g: Ctx, h: Heli) {
    const s = S * (phone ? 1.1 : 1.35), bob = Math.sin(h.t * 1.3) * 5 * S, x = h.x, y = h.y + bob;
    // Searchlight sweeping the ground.
    const gx = x + h.dir * 70 * S + Math.sin(h.t * 0.9) * 140 * S, gy = horizon + 24 * S;
    g.globalCompositeOperation = 'lighter';
    const angle = Math.atan2(gy - y, gx - x), length = Math.hypot(gx - x, gy - y);
    beam(g, x + h.dir * 18 * s, y + 10 * s, angle, length * 1.05, 0.11, 0.2);
    stamp(g, light, gx, gy, 70 * S, 0.22);
    g.globalCompositeOperation = 'source-over';
    g.save();
    g.globalAlpha = 1;
    g.translate(x, y); g.rotate(h.dir * 0.07); g.scale(h.dir * s, s);
    g.fillStyle = '#07060a';
    g.beginPath(); g.ellipse(0, 0, 34, 13, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(24, 3, 17, 9, 0.18, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-26, -5); g.lineTo(-90, -9); g.lineTo(-90, -3); g.lineTo(-26, 7); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-84, -7); g.lineTo(-97, -27); g.lineTo(-91, -27); g.lineTo(-78, -5); g.closePath(); g.fill();
    g.fillRect(-8, 7, 28, 4); g.fillRect(-6, 10, 12, 6); g.fillRect(10, 10, 12, 6);
    g.fillRect(-26, 19, 54, 2.5); g.fillRect(-14, 12, 2.5, 8); g.fillRect(12, 12, 2.5, 8);
    g.fillRect(-2, -19, 4, 8);
    g.globalAlpha = 0.16; g.beginPath(); g.ellipse(0, -19, 88, 3.2, 0, 0, TAU); g.fill();
    g.globalAlpha = 0.6;
    for (const k of [0, Math.PI / 2]) { const len = 88 * Math.cos(h.t * 38 + k); g.fillRect(Math.min(0, len), -20.5, Math.abs(len), 3); }
    g.globalAlpha = 0.3; g.beginPath(); g.arc(-92, -13, 12, 0, TAU); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(140,200,255,0.18)'; g.beginPath(); g.ellipse(27, 0, 9, 5, 0.18, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(170,180,225,0.4)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(0, 0, 34, 13, 0, Math.PI * 1.12, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.moveTo(-26, -5); g.lineTo(-90, -9); g.stroke();
    g.restore();
    g.globalCompositeOperation = 'lighter';
    const blink = Math.sin(h.t * 7) > 0.6;
    dot(g, x - h.dir * 88 * s, y - 6 * s, 7 * S, `rgba(255,60,60,${blink ? 0.9 : 0.25})`);
    dot(g, x, y + 12 * s, 6 * S, `rgba(120,255,160,${blink ? 0.25 : 0.8})`);
    if (Math.sin(h.t * 3.1) > 0.92) dot(g, x - h.dir * 20 * s, y - 14 * s, 14 * S, 'rgba(255,255,255,0.9)');
    g.globalCompositeOperation = 'source-over';
  }

  function drawDrop(g: Ctx, d: Drop, off: Point) {
    const s = S * (phone ? 0.9 : 1.1);
    g.globalAlpha = 1;
    // Cargo plane, side view.
    g.save();
    g.translate(d.x + off.x, d.y + off.y); g.scale(d.dir * s, s);
    g.fillStyle = '#08070b';
    g.beginPath(); g.moveTo(-70, -6); g.lineTo(52, -8); g.quadraticCurveTo(74, -4, 70, 4); g.lineTo(-62, 8); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-70, -6); g.lineTo(-86, -30); g.lineTo(-74, -30); g.lineTo(-52, -6); g.closePath(); g.fill();
    g.fillRect(-20, -4, 46, 4);
    g.fillRect(-8, 1, 14, 6); g.fillRect(12, 1, 14, 6);
    g.strokeStyle = 'rgba(170,180,225,0.35)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-60, -6.5); g.lineTo(50, -8.5); g.stroke();
    g.restore();
    g.globalCompositeOperation = 'lighter';
    const blink = Math.sin(d.t * 6) > 0.5;
    dot(g, d.x + off.x - d.dir * 84 * s, d.y + off.y - 28 * s, 6 * S, `rgba(255,70,70,${blink ? 0.9 : 0.2})`);
    dot(g, d.x + off.x + d.dir * 6 * s, d.y + off.y + 2 * s, 5 * S, `rgba(120,255,170,${blink ? 0.2 : 0.8})`);
    g.globalCompositeOperation = 'source-over';
    // The crate under its parachute.
    if (d.crate) {
      const c = d.crate, x = c.x + off.x, y = c.y + off.y, cs = S * (phone ? 0.9 : 1.1);
      g.globalAlpha = Math.max(0, 1 - Math.max(0, c.landed - 5) / 2);
      if (c.y < d.target.y) {
        g.fillStyle = '#1a1520';
        g.beginPath(); g.ellipse(x, y - 34 * cs, 20 * cs, 12 * cs, 0, Math.PI, 0); g.fill();
        g.strokeStyle = 'rgba(200,190,220,0.35)'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(x, y - 34 * cs, 20 * cs, 12 * cs, 0, Math.PI, 0); g.stroke();
        g.strokeStyle = 'rgba(40,34,44,0.9)';
        g.beginPath(); g.moveTo(x - 19 * cs, y - 34 * cs); g.lineTo(x - 5 * cs, y - 8 * cs); g.moveTo(x + 19 * cs, y - 34 * cs); g.lineTo(x + 5 * cs, y - 8 * cs); g.moveTo(x, y - 34 * cs); g.lineTo(x, y - 8 * cs); g.stroke();
      }
      g.fillStyle = '#0c090a'; g.fillRect(x - 7 * cs, y - 9 * cs, 14 * cs, 10 * cs);
      g.globalCompositeOperation = 'lighter';
      if (Math.sin(c.t * 5) > 0) dot(g, x, y - 10 * cs, 5 * S, 'rgba(255,200,90,0.8)');
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
    }
  }

  function draw(g: Ctx) {
    if (!layers) return;
    const shakeMax = (phone ? 3 : 6) * S;
    const sx = shake > 0 ? (random() - 0.5) * 2 * shake * shakeMax : 0, sy = shake > 0 ? (random() - 0.5) * 2 * shake * shakeMax : 0;
    const px = phone ? 0 : pointer.x, py = phone ? 0 : pointer.y;
    const at = (depth: number) => ({ x: sx - px * depth * S, y: sy - py * depth * S * 0.5 });
    const blit = (l: Layer, off: Point) => {
      g.globalAlpha = 1;
      g.drawImage(l.surface as unknown as CanvasImageSource, off.x - margin, l.top + off.y, W + margin * 2, l.height);
    };
    // A strip twice the screen wide, scrolled and wrapped: copy only what shows.
    const wrap = (l: Layer, scroll: number, off: Point, alpha: number) => {
      const visible = W + margin * 2, strip = W * 2, source = l.surface as unknown as CanvasImageSource;
      const o = ((scroll % strip) + strip) % strip, first = Math.min(visible, strip - o);
      const sh = l.surface.height, sw = (x: number, w: number) => Math.max(1, Math.min(l.surface.width - x * dpr, w * dpr));
      g.globalAlpha = alpha;
      g.drawImage(source, o * dpr, 0, sw(o, first), sh, off.x - margin, l.top + off.y, first, l.height);
      if (first < visible) g.drawImage(source, 0, 0, sw(0, visible - first), sh, off.x - margin + first, l.top + off.y, visible - first, l.height);
    };
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;

    const sky = at(3), far = sky, near = at(12), front = at(22);
    blit(layers.back, sky);
    // Clouds drift and wrap; searchlights sweep the sky.
    wrap(layers.clouds, now * 6 * S, sky, 0.9);
    g.globalCompositeOperation = 'lighter';
    compounds.forEach((c, i) => beam(g, c.tower.x + near.x, c.tower.y + near.y, -Math.PI / 2 + Math.sin(now * 0.35 + i * 2.1) * 0.65, H * 0.8, 0.05, 0.045));
    for (const f of flares) {
      const k = Math.min(1, f.t * 2) * Math.min(1, f.life - f.t);
      stamp(g, light, f.x + far.x, f.y + far.y, Math.max(W, H) * 0.3, 0.18 * k * (0.85 + Math.sin(now * 23) * 0.15));
    }
    g.globalCompositeOperation = 'source-over';
    // Light from explosions and flares on the scenery.
    g.globalCompositeOperation = 'lighter';
    for (const l of lights) stamp(g, glow, l.x + near.x, l.y + near.y, l.r, l.alpha * (1 - l.life / l.max));
    g.globalCompositeOperation = 'source-over';
    blit(layers.near, near);
    // Burning bases, lit windows and the tower's warning light.
    g.globalCompositeOperation = 'lighter';
    const warn = Math.sin(now * 3) > 0.2;
    dot(g, beacon.x + near.x, beacon.y + near.y, 9 * S, `rgba(255,70,50,${warn ? 0.85 : 0.15})`);
    for (const c of compounds) for (const w of c.windows) {
      const flicker = 0.55 + Math.sin(now * 9 + w.seed) * 0.15 + Math.sin(now * 23 + w.seed * 3) * 0.1;
      g.globalAlpha = 1;
      g.fillStyle = `rgba(255,168,84,${0.6 * flicker})`;
      g.fillRect(w.x + near.x, w.y + near.y, w.w, w.h);
      stamp(g, glow, w.x + w.w / 2 + near.x, w.y + w.h / 2 + near.y, 12 * S, 0.3 * flicker);
    }
    for (const f of fires) {
      const heat = Math.min(1.2, f.heat);
      for (let k = 0; k < 3; k++) {
        const flick = 0.75 + Math.sin(now * (11 + k * 4) + f.seed + k) * 0.25;
        stamp(g, glow, f.x + near.x + Math.sin(now * 5 + k * 2 + f.seed) * 3 * f.s, f.y + near.y - (6 + k * 8) * f.s, (16 + k * 7) * f.s * heat * flick, 0.7 * heat * flick);
      }
      stamp(g, glow, f.x + near.x, f.y + near.y - 10 * f.s, 70 * f.s * heat, 0.16 * heat);
    }
    for (const c of charges) {
      const period = 0.5 - (c.t / c.dur) * 0.42;
      if ((c.t % period) < period * 0.45) dot(g, c.x + near.x, c.y + near.y, 6 * S, 'rgba(255,40,40,0.95)');
    }
    g.globalCompositeOperation = 'source-over';
    // Fog in the valley.
    wrap(layers.fog, now * 10 * S, near, 0.65);
    // Smoke.
    for (const p of puffs) {
      if (p.life <= 0) continue;
      const k = Math.min(1, p.life * 3) * (1 - p.life / p.max);
      stamp(g, p.signal ? signal : smoke, p.x + near.x, p.y + near.y, p.r, p.alpha * k);
    }
    // Explosions.
    g.globalCompositeOperation = 'lighter';
    for (const b of blasts) {
      const k = b.life / b.max, x = b.x + near.x, y = b.y + near.y;
      // A white core, an orange fireball and a column of fire rising out of it.
      stamp(g, glow, x, y, b.r * (1 + k * 2.8), 1 - k);
      stamp(g, glow, x, y - b.r * k * 1.4, b.r * (0.7 + k * 2), (1 - k) * 0.9);
      stamp(g, glow, x, y - b.r * k * 2.6, b.r * (0.5 + k * 1.4), (1 - k) * 0.6);
      if (k < 0.25) stamp(g, light, x, y, b.r * 1.4, 1 - k * 4);
    }
    for (const r of rings) {
      const k = r.life / r.max;
      g.globalAlpha = (1 - k) * 0.55;
      g.strokeStyle = 'rgba(255,226,190,1)'; g.lineWidth = Math.max(1, 3 * S * (1 - k));
      g.beginPath(); g.ellipse(r.x + near.x, r.y + near.y, r.r * k, r.r * k * 0.55, 0, 0, TAU); g.stroke();
    }
    g.strokeStyle = '#ffbf6a'; g.lineCap = 'round';
    for (const s of sparks) {
      const k = 1 - s.life / s.max, x = s.x + near.x, y = s.y + near.y;
      g.globalAlpha = k; g.lineWidth = s.size;
      g.beginPath(); g.moveTo(x - s.vx * 0.025, y - s.vy * 0.025); g.lineTo(x, y); g.stroke();
    }
    g.lineCap = 'butt';
    for (const f of flares) {
      stamp(g, glow, f.x + far.x, f.y + far.y, 18 * S * (0.9 + Math.sin(now * 31) * 0.1), 1);
    }
    g.globalCompositeOperation = 'source-over';
    if (drop) drawDrop(g, drop, far);
    if (heli) drawHeli(g, heli);
    blit(layers.front, front);
    if (whiteout > 0) {
      g.globalAlpha = whiteout; g.fillStyle = '#ffb27a'; g.fillRect(-20, -20, W + 40, H + 40);
    }
    g.globalAlpha = 1;
  }

  // ------------------------------------------------------------- public

  return {
    resize(width: number, height: number, pixelRatio: number) {
      W = Math.max(1, width); H = Math.max(1, height); dpr = pixelRatio;
      S = Math.min(1.4, Math.max(0.5, Math.sqrt(W * H) / 1150));
      horizon = H * (phone ? 0.6 : 0.67);
      margin = Math.ceil(36 * S);
      paint();
      // New geometry: start the raid again from the new positions.
      for (const list of [blasts, rings, sparks, puffs, lights, fires, flares, charges, queue] as unknown[][]) list.length = 0;
      heli = null; drop = null; timers.drop = 11;
      // The raid is already under way when the page opens.
      {
        const [a, b] = [compounds[0], compounds[compounds.length - 1]];
        for (const spot of [a.fire[0], b.fire[1], ...campfires]) fires.push({ x: spot.x, y: spot.y, s: S, heat: 1, decay: 0.012, ember: 0, smoke: 0, seed: rand(0, 100) });
      }
    },
    step,
    draw,
    setPointer(x: number, y: number) { aim = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) }; },
    stats(): SceneStats { return { sparks: sparks.length, puffs: puffs.length, fires: fires.length, explosions, heli: Boolean(heli), drop: Boolean(drop) }; },
  };
}
