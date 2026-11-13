'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './rust-battle-background.module.css';

// The homepage's Rust backdrop: the Rust store's own artwork with a firefight
// drawn over it (muzzle flashes and tracers along the rifle, smoke, return fire
// from the base below, a distant explosion now and then). Decorative only: no
// text, no pointer events. Positions are image coordinates mapped with the same
// cover crop the picture uses, so the flashes stay on the barrel at every size.

const IMAGE = { width: 3840, height: 2880 };
const MUZZLE = { u: 0.292, v: 0.462 };                 // tip of the rifle barrel
const BARREL_ANGLE = Math.atan2(23, -476);             // the barrel points left, slightly down
const BASE = { u: [0.22, 0.42], v: [0.61, 0.68] };     // the monument in the valley
const OVERHEAD = { u: [0.5, 0.95], v: [0.12, 0.3] };   // return fire passes over the soldier
const OBJECT_POSITION = { desktop: 0.5, phone: 0.37 }; // horizontal crop (matches the CSS)

type Tracer = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; life: number; max: number; hostile: boolean };
type Flash = { x: number; y: number; r: number; angle: number; life: number; max: number; kind: 'muzzle' | 'distant' | 'blast' };
type Puff = { x: number; y: number; vx: number; vy: number; r: number; grow: number; alpha: number; life: number; max: number };
type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function RustBattleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phone = window.matchMedia('(max-width: 700px)');

    let width = 0, height = 0, frame = 0, last = 0, running = false;
    let nextBurst = 700, shotsLeft = 0, nextShot = 0, nextHostile = 2600, nextBlast = 5200;
    const tracers: Tracer[] = [], flashes: Flash[] = [], puffs: Puff[] = [], embers: Ember[] = [];

    // Image point (u, v) -> screen point, using the picture's object-fit: cover.
    const toScreen = (u: number, v: number) => {
      const scale = Math.max(width / IMAGE.width, height / IMAGE.height);
      const drawnW = IMAGE.width * scale, drawnH = IMAGE.height * scale;
      const position = phone.matches ? OBJECT_POSITION.phone : OBJECT_POSITION.desktop;
      return { x: (width - drawnW) * position + u * drawnW, y: (height - drawnH) * 0.5 + v * drawnH, scale };
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas!.clientWidth; height = canvas!.clientHeight;
      canvas!.width = Math.round(width * dpr); canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function fire(now: number) {
      const muzzle = toScreen(MUZZLE.u, MUZZLE.v);
      const angle = BARREL_ANGLE + rand(-0.025, 0.02);
      const speed = Math.max(width, height) * rand(1.3, 1.7);
      const r = Math.max(12, 100 * muzzle.scale);
      tracers.push({ x: muzzle.x, y: muzzle.y, ox: muzzle.x, oy: muzzle.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, max: rand(0.3, 0.42), hostile: false });
      flashes.push({ x: muzzle.x, y: muzzle.y, r: r * rand(0.85, 1.15), angle, life: 0, max: 0.075, kind: 'muzzle' });
      puffs.push({ x: muzzle.x + rand(-4, 4), y: muzzle.y + rand(-3, 3), vx: rand(-16, -6), vy: rand(-16, -7), r: r * 0.35, grow: r * 0.7, alpha: 0.2, life: 0, max: rand(1, 1.6) });
      for (let i = 0; i < (phone.matches ? 1 : 3); i++) {
        embers.push({ x: muzzle.x, y: muzzle.y, vx: rand(-70, 20), vy: rand(-70, -10), life: 0, max: rand(0.35, 0.7), size: rand(0.8, 1.6) });
      }
      nextShot = now + rand(85, 125);
    }

    function hostileFire(now: number) {
      const from = toScreen(rand(BASE.u[0], BASE.u[1]), rand(BASE.v[0], BASE.v[1]));
      const aim = toScreen(rand(OVERHEAD.u[0], OVERHEAD.u[1]), rand(OVERHEAD.v[0], OVERHEAD.v[1]));
      const angle = Math.atan2(aim.y - from.y, aim.x - from.x);
      const speed = Math.max(width, height) * rand(1.1, 1.4);
      const shots = Math.round(rand(2, 4));
      for (let i = 0; i < shots; i++) {
        const a = angle + rand(-0.04, 0.04);
        tracers.push({ x: from.x, y: from.y, ox: from.x, oy: from.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: -i * 0.12, max: rand(0.55, 0.75), hostile: true });
        flashes.push({ x: from.x, y: from.y, r: Math.max(4, 30 * from.scale), angle: a, life: -i * 0.12, max: 0.06, kind: 'distant' });
      }
      nextHostile = now + rand(2600, 5200);
    }

    // A distant explosion at the base now and then: a flash, debris and rising smoke.
    function blast(now: number) {
      const at = toScreen(rand(BASE.u[0], BASE.u[1]), rand(BASE.v[0], BASE.v[1]));
      const size = Math.max(14, 200 * at.scale);
      flashes.push({ x: at.x, y: at.y, r: size, angle: 0, life: 0, max: 0.45, kind: 'blast' });
      for (let i = 0; i < 4; i++) {
        puffs.push({ x: at.x + rand(-0.4, 0.4) * size, y: at.y - rand(0, 0.3) * size, vx: rand(-5, 5), vy: rand(-18, -8), r: size * rand(0.25, 0.4), grow: size * 0.35, alpha: 0.22, life: -i * 0.15, max: rand(3, 4.5) });
      }
      for (let i = 0; i < (phone.matches ? 4 : 8); i++) {
        embers.push({ x: at.x, y: at.y, vx: rand(-60, 60), vy: rand(-95, -35), life: 0, max: rand(0.6, 1.1), size: rand(0.8, 1.5) });
      }
      nextBlast = now + rand(8000, 14000);
    }

    function step(dt: number, now: number) {
      if (now >= nextBurst && shotsLeft === 0) { shotsLeft = Math.round(rand(3, 7)); nextShot = now; }
      if (shotsLeft > 0 && now >= nextShot) { fire(now); shotsLeft--; if (shotsLeft === 0) nextBurst = now + rand(1400, 3400); }
      if (now >= nextHostile) hostileFire(now);
      if (now >= nextBlast) blast(now);
      for (const list of [tracers, flashes, puffs, embers] as { life: number; max: number }[][]) {
        for (let i = list.length - 1; i >= 0; i--) { list[i].life += dt; if (list[i].life > list[i].max) list.splice(i, 1); }
      }
      for (const t of tracers) if (t.life > 0) { t.x += t.vx * dt; t.y += t.vy * dt; }
      for (const p of puffs) if (p.life > 0) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.grow * dt; }
      for (const e of embers) { e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 60 * dt; }
    }

    function glow(x: number, y: number, r: number, inner: string, mid: string) {
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, inner); g.addColorStop(0.3, mid); g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx!.fillStyle = g;
      ctx!.beginPath(); ctx!.arc(x, y, r, 0, Math.PI * 2); ctx!.fill();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      // Smoke first, so the fire reads on top of it.
      for (const p of puffs) {
        if (p.life <= 0) continue;
        const k = Math.min(1, p.life * 4) * (1 - p.life / p.max);
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(176,170,160,${p.alpha * k})`); g.addColorStop(1, 'rgba(176,170,160,0)');
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx!.fill();
      }
      ctx!.globalCompositeOperation = 'lighter';
      for (const f of flashes) {
        if (f.life < 0) continue;
        const k = 1 - f.life / f.max;
        if (f.kind === 'muzzle') {
          // The light the shot throws on the scene, then the flame itself.
          glow(f.x, f.y, f.r * 3.2, `rgba(255,170,80,${0.22 * k})`, `rgba(255,120,40,${0.1 * k})`);
          ctx!.save();
          ctx!.translate(f.x, f.y); ctx!.rotate(f.angle); ctx!.scale(1, 0.38);
          glow(f.r * 0.55, 0, f.r * 0.95, `rgba(255,250,225,${k})`, `rgba(255,196,90,${0.85 * k})`);
          ctx!.restore();
          glow(f.x, f.y, f.r * 0.45, `rgba(255,255,240,${k})`, `rgba(255,210,120,${0.8 * k})`);
        } else if (f.kind === 'distant') {
          glow(f.x, f.y, f.r, `rgba(255,214,150,${0.95 * k})`, `rgba(255,130,50,${0.6 * k})`);
        } else {
          const rise = Math.min(1, f.life / 0.08);
          glow(f.x, f.y, f.r * (0.6 + 0.4 * rise), `rgba(255,220,150,${0.75 * k})`, `rgba(255,110,30,${0.42 * k})`);
        }
      }
      ctx!.lineCap = 'round';
      for (const t of tracers) {
        if (t.life < 0) continue;
        const k = Math.max(0, 1 - t.life / t.max);
        // The tail never reaches back past the gun that fired it.
        const travelled = Math.hypot(t.x - t.ox, t.y - t.oy);
        const speed = Math.hypot(t.vx, t.vy);
        const tail = Math.min(travelled, speed * (t.hostile ? 0.045 : 0.06));
        const tx = t.x - (t.vx / speed) * tail, ty = t.y - (t.vy / speed) * tail;
        const g = ctx!.createLinearGradient(tx, ty, t.x, t.y);
        g.addColorStop(0, 'rgba(255,170,60,0)');
        g.addColorStop(1, t.hostile ? `rgba(255,120,70,${0.85 * k})` : `rgba(255,226,150,${k})`);
        ctx!.strokeStyle = g;
        ctx!.lineWidth = t.hostile ? 1.3 : 2;
        ctx!.beginPath(); ctx!.moveTo(tx, ty); ctx!.lineTo(t.x, t.y); ctx!.stroke();
      }
      for (const e of embers) {
        const k = 1 - e.life / e.max;
        ctx!.fillStyle = `rgba(255,170,70,${0.9 * k})`;
        ctx!.fillRect(e.x, e.y, e.size, e.size);
      }
      ctx!.globalCompositeOperation = 'source-over';
    }

    function loop(now: number) {
      frame = requestAnimationFrame(loop);
      if (document.hidden) { last = now; return; }
      if (last && now - last < 1000 / 40) return; // at most 40 frames per second
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      step(dt, now);
      draw();
    }

    function start() {
      if (running || reduced.matches) return;
      running = true; last = 0;
      frame = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
      tracers.length = flashes.length = puffs.length = embers.length = 0;
      ctx!.clearRect(0, 0, width, height);
    }
    const onMotion = () => (reduced.matches ? stop() : start());

    resize();
    start();
    window.addEventListener('resize', resize);
    reduced.addEventListener('change', onMotion);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      reduced.removeEventListener('change', onMotion);
    };
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      {/* The picture and the gunfire drift together, so the flashes stay on the
          barrel; the fire is drawn above the shade so it keeps its brightness. */}
      <div className={styles.scene}>
        <Image src="/images/cloudy-rust-premium-4k.avif" alt="" fill sizes="100vw" preload className={styles.picture} />
        <div className={styles.shade} />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={styles.dim} />
    </div>
  );
}
