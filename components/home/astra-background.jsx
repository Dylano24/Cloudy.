'use client';

import { useEffect, useRef } from 'react';

const PATHS = [[[0,0,0],[0.37,-0.19,0.08],[0.31,-0.45,-0.12],[-0.14,-0.58,0.16],[-0.59,-0.32,-0.1],[-0.72,0.13,0.12],[-0.46,0.58,-0.16],[0.12,0.77,0.14],[0.69,0.58,-0.08],[1.01,0.06,0.18],[0.88,-0.58,-0.14],[0.31,-1.03,0.08],[-0.53,-1.03,-0.18],[-1.23,-0.58,0.12],[-1.49,0.13,-0.08],[-1.3,0.9,0.16],[-0.65,1.47,-0.12],[0.12,1.6,0.1],[0.95,1.28,-0.16],[1.59,0.58,0.12],[1.72,-0.38,-0.1],[1.33,-1.22,0.18],[0.5,-1.73,-0.16],[-0.53,-1.67,0.12],[-1.42,-1.09,-0.08],[-1.81,-0.19,0.16],[-1.74,0.9,-0.12],[-1.49,1.86,0.1],[-0.97,2.69,-0.08],[-0.14,3.46,0.04]],[[-1.25,1.05,0.06],[-1.2,1.62,-0.08],[-0.9,2.18,0.1],[-0.4,2.66,-0.1],[0.2,3.02,0.08],[0.92,3.14,-0.06],[1.66,3.07,0.02]]];
const SAMPLE_COUNT = 2048;

// The curve is unchanged; sample its coordinates once rather than allocating
// a new array for every star on every animation frame.
const CURVES = PATHS.map(path => {
  const samples = new Float32Array((SAMPLE_COUNT + 1) * 3);
  for (let n = 0; n <= SAMPLE_COUNT; n++) {
    const f = Math.min(.999999, n / SAMPLE_COUNT) * (path.length - 1);
    const i = Math.floor(f), u = f - i;
    for (let k = 0; k < 3; k++) {
      const a = path[Math.max(0, i - 1)][k], b = path[i][k];
      const c = path[Math.min(path.length - 1, i + 1)][k];
      const d = path[Math.min(path.length - 1, i + 2)][k];
      samples[n * 3 + k] = .5 * ((2 * b) + (-a + c) * u
        + (2 * a - 5 * b + 4 * c - d) * u * u
        + (-a + 3 * b - 3 * c + d) * u * u * u);
    }
  }
  return samples;
});

export function AstraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = document.querySelector('.cloudy-classic-hero');
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mobile = window.matchMedia('(max-width: 820px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4
      || (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4);
    const logo = hero.querySelector('.cloudy-classic-logo-shell img');
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const spriteCtx = sprite.getContext('2d');
    if (spriteCtx) {
      const glow = spriteCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, 'rgba(255,95,110,.38)');
      glow.addColorStop(.25, 'rgba(230,24,50,.13)');
      glow.addColorStop(1, 'rgba(140,0,20,0)');
      spriteCtx.fillStyle = glow;
      spriteCtx.fillRect(0, 0, 64, 64);
    }
    // Rasterize the two unchanged circular dot colors once. A scaled image
    // stamp replaces three path commands for every star on every frame.
    const dots = ['#e82b42', '#ffc3c6'].map(color => {
      const image = document.createElement('canvas');
      image.width = image.height = 32;
      const pen = image.getContext('2d');
      if (!pen) return null;
      pen.fillStyle = color;
      pen.beginPath();
      pen.arc(16, 16, 16, 0, Math.PI * 2);
      pen.fill();
      return image;
    });
    const ambientCanvas = document.createElement('canvas');
    const ambientCtx = ambientCanvas.getContext('2d');

    let width = 0, height = 0, dpr = 1, anchorX = 0, anchorY = 0;
    let particles = [], core = [], ambient = null, profile = '';
    let frameId = 0, resizeId = 0, visible = true, disposed = false;
    let time = 0, previousFrame = 0, previousPaint = 0;
    let paintInterval = 1000 / 60, paintCost = 0, slowPaints = 0, fastPaints = 0;
    let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
    let drag = false, pressed = false, px = 0, py = 0, mx = -9999, my = -9999;
    let projectedX = 0, projectedY = 0, projectedScale = 1;

    function makeStars() {
      const nextProfile = mobile.matches ? 'mobile' : lowPower ? 'low' : 'desktop';
      if (profile === nextProfile) return;
      profile = nextProfile;
      let seed = 27;
      const rnd = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
      const gauss = () => Math.sqrt(-2 * Math.log(Math.max(.0001, rnd()))) * Math.cos(6.283185 * rnd());
      const count = mobile.matches ? (lowPower ? 850 : 1400) : lowPower ? 2600 : 6200;
      const coreCount = mobile.matches ? 130 : lowPower ? 260 : 650;
      particles = Array.from({ length: count }, (_, i) => {
        const path = i < count * 5500 / 6200 ? 0 : 1, t = rnd();
        const spread = .012 + Math.pow(rnd(), 4) * .13;
        const star = { path, t, ox: gauss() * spread, oy: gauss() * spread, oz: gauss() * .12,
          r: rnd() < .035 ? 1.8 + rnd() * 2.4 : .3 + rnd() * .7,
          phase: rnd() * 6.28, alpha: .2 + rnd() * .65, dx: 0, dy: 0 };
        star.phaseSin = Math.sin(star.phase);
        star.phaseCos = Math.cos(star.phase);
        return star;
      });
      core = Array.from({ length: coreCount }, () => ({
        x: gauss() * .085, y: gauss() * .085, z: gauss() * .12,
        r: .2 + rnd() * 1.1, a: .2 + rnd() * .6,
      }));
    }

    function resize() {
      resizeId = 0;
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const bounds = logo ? logo.getBoundingClientRect() : hero.getBoundingClientRect();
      anchorX = bounds.left - rect.left + bounds.width / 2;
      // Mobile uses the canvas' document box, so the whole artwork scrolls
      // away with the hero. Desktop keeps its existing fixed composition.
      anchorY = bounds.top - rect.top + bounds.height / 2 + (mobile.matches ? 0 : window.scrollY);
      const pixelBudget = mobile.matches ? 1200000 : 4000000;
      dpr = Math.max(.5, Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 2,
        Math.sqrt(pixelBudget / (width * height))));
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ambient = ctx.createRadialGradient(anchorX, anchorY, 0, anchorX, anchorY, Math.max(width, height) * .65);
      ambient.addColorStop(0, 'rgba(110,5,22,.10)');
      ambient.addColorStop(1, 'rgba(0,0,0,0)');
      // This glow only changes on resize. Rasterize it once rather than
      // shading the whole viewport with a radial gradient every frame.
      if (ambientCtx) {
        ambientCanvas.width = pixelWidth;
        ambientCanvas.height = pixelHeight;
        ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ambientCtx.fillStyle = ambient;
        ambientCtx.fillRect(0, 0, width, height);
      }
      makeStars();
      playback(true);
    }

    function scheduleResize() {
      if (!resizeId) resizeId = requestAnimationFrame(resize);
    }

    function draw(now) {
      const dt = previousPaint ? Math.min(.05, (now - previousPaint) / 1000) : 0;
      previousPaint = now;
      if (!reduced.matches) time += dt;
      const damping = reduced.matches ? 1 : 1 - Math.exp(-6 * dt);
      yaw += (targetYaw - yaw) * damping;
      pitch += (targetPitch - pitch) * damping;
      const ry = yaw + (reduced.matches ? 0 : Math.sin(time * .22) * .18) - .06;
      const rx = pitch + .08 + (reduced.matches ? 0 : Math.sin(time * .17) * .10);
      const cz = Math.cos(-.025), sz = Math.sin(-.025), cy = Math.cos(ry), sy = Math.sin(ry);
      const cx = Math.cos(rx), sx = Math.sin(rx), scale = Math.min(height / 2.8, width / 3.2);
      // Compose the rotation once, not separately for every star.
      const xx = cz * cy, xy = -sz * cy, xz = -sy;
      const yx = sz * cx - cz * sy * sx, yy = cz * cx + sz * sy * sx, yz = -cy * sx;
      const zx = sz * sx + cz * sy * cx, zy = cz * sx - sz * sy * cx, zz = cy * cx;
      const offset = (time * .0064) % 1;
      const twinkleSin = Math.sin(time * .62), twinkleCos = Math.cos(time * .62);
      const interactive = !mobile.matches;
      const pointerPresent = mx !== -9999 && my !== -9999;
      const repelDamping = Math.min(1, dt * 7);
      function project(x, y, z) {
        projectedScale = 8 / (8 - (x * zx + y * zy + z * zz));
        projectedX = anchorX + (x * xx + y * xy + z * xz) * scale * projectedScale;
        projectedY = anchorY - (x * yx + y * yy + z * yz) * scale * projectedScale;
      }
      function dot(r, alpha, bright) {
        if (projectedX < -30 || projectedY < -30 || projectedX > width + 30 || projectedY > height + 30) return;
        ctx.globalAlpha = alpha;
        const radius = Math.max(.25, r * projectedScale);
        const image = dots[bright ? 1 : 0];
        if (image) ctx.drawImage(image, projectedX - radius, projectedY - radius, radius * 2, radius * 2);
        else {
          ctx.fillStyle = bright ? '#ffc3c6' : '#e82b42';
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, radius, 0, 6.283);
          ctx.fill();
        }
        if (r > 1.3 && spriteCtx) ctx.drawImage(sprite, projectedX - r * 6, projectedY - r * 6, r * 12, r * 12);
      }
      ctx.clearRect(0, 0, width, height);
      if (ambientCtx) ctx.drawImage(ambientCanvas, 0, 0, width, height);
      else {
        ctx.fillStyle = ambient;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const star of particles) {
        let t = star.t - (reduced.matches ? 0 : offset);
        if (t < 0) t += 1;
        const curve = CURVES[star.path], sample = t * SAMPLE_COUNT;
        const i = Math.floor(sample) * 3, fraction = sample % 1;
        const x = curve[i] + (curve[i + 3] - curve[i]) * fraction;
        const y = curve[i + 1] + (curve[i + 4] - curve[i + 1]) * fraction;
        const z = curve[i + 2] + (curve[i + 5] - curve[i + 2]) * fraction;
        project(x + star.ox, y + star.oy, z * 1.4 + star.oz);
        if (interactive) {
          let tx = 0, ty = 0;
          if (pointerPresent) {
            const dx = projectedX - mx, dy = projectedY - my, squared = dx * dx + dy * dy;
            if (squared > 0 && squared < 85 * 85) {
              const distance = Math.sqrt(squared);
              const force = (1 - distance / 85) * (pressed ? 30 : 14) / distance;
              tx = dx * force; ty = dy * force;
            }
          }
          star.dx += (tx - star.dx) * repelDamping;
          star.dy += (ty - star.dy) * repelDamping;
          projectedX += star.dx; projectedY += star.dy;
        }
        dot(star.r, star.alpha * (.78 + .22 * (twinkleSin * star.phaseCos + twinkleCos * star.phaseSin)), star.r > 1.3);
      }
      for (const star of core) {
        project(star.x, star.y, star.z);
        dot(star.r, star.a, true);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      frameId = 0;
      if (disposed || document.hidden || !visible || reduced.matches) return;
      if (!previousFrame || now - previousFrame >= paintInterval - .5) {
        previousFrame = now;
        const started = performance.now();
        draw(now);
        paintCost += (Math.max(0, performance.now() - started) - paintCost) * .1;
        // Keep scrolling/input room on a device that cannot submit this
        // decoration cheaply. Hysteresis avoids oscillating frame rates.
        if (paintInterval < 20) {
          slowPaints = paintCost > 6 ? slowPaints + 1 : 0;
          if (slowPaints >= 30) { paintInterval = 1000 / 30; fastPaints = 0; }
        } else {
          fastPaints = paintCost < 3 ? fastPaints + 1 : 0;
          if (fastPaints >= 180) { paintInterval = 1000 / 60; slowPaints = 0; }
        }
      }
      frameId = requestAnimationFrame(frame);
    }

    function playback(redraw = false) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrame = previousPaint = 0;
      if (disposed || document.hidden || !visible) return;
      if (reduced.matches) { if (redraw) draw(performance.now()); }
      else frameId = requestAnimationFrame(frame);
    }
    const onPlaybackChange = () => playback(true);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      playback(true);
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(canvas);
    resizeObserver.observe(hero);
    if (logo) resizeObserver.observe(logo);
    function onPointerDown(event) {
      if (mobile.matches || event.pointerType === 'touch' || event.button !== 0) return;
      drag = pressed = true; px = event.clientX; py = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
    }
    function onPointerMove(event) {
      if (mobile.matches || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      mx = event.clientX - rect.left; my = event.clientY - rect.top;
      if (!drag) return;
      targetYaw += (event.clientX - px) * .005;
      targetPitch += (event.clientY - py) * .005;
      px = event.clientX; py = event.clientY;
      if (reduced.matches) playback(true);
    }
    const release = () => { drag = pressed = false; };
    const leave = () => { if (!drag) mx = my = -9999; };
    function onKeyDown(event) {
      switch (event.key) {
        case 'ArrowLeft': targetYaw -= .08; break;
        case 'ArrowRight': targetYaw += .08; break;
        case 'ArrowUp': targetPitch -= .08; break;
        case 'ArrowDown': targetPitch += .08; break;
        default: return;
      }
      event.preventDefault();
      if (reduced.matches) playback(true);
    }
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', scheduleResize);
    mobile.addEventListener('change', scheduleResize);
    reduced.addEventListener('change', onPlaybackChange);
    document.addEventListener('visibilitychange', onPlaybackChange);
    logo?.addEventListener('load', scheduleResize);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(resizeId);
      observer.disconnect(); resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', release);
      canvas.removeEventListener('pointercancel', release);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', scheduleResize);
      mobile.removeEventListener('change', scheduleResize);
      reduced.removeEventListener('change', onPlaybackChange);
      document.removeEventListener('visibilitychange', onPlaybackChange);
      logo?.removeEventListener('load', scheduleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cloudy-astra-background"
    style={{ pointerEvents: 'none', cursor: 'default' }} aria-hidden="true" />;
}
