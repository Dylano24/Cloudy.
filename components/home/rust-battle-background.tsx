'use client';

import { useEffect, useRef } from 'react';
import { createBattleScene } from './rust-battle-scene';
import styles from './rust-battle-background.module.css';

// The homepage's backdrop: a Rust raid at night, drawn in code by
// rust-battle-scene. Decorative only: no text, no pointer events. With
// reduced motion it shows one still frame.

export function RustBattleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phone = window.matchMedia('(max-width: 700px)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const scene = createBattleScene({
      phone,
      makeSurface: (width, height) => {
        const surface = document.createElement('canvas');
        surface.width = width; surface.height = height;
        return surface;
      },
    });
    const fps = phone ? 30 : 60;
    let frame = 0, resizeFrame = 0, last = 0, width = 0, height = 0, running = false;

    function resize() {
      resizeFrame = 0;
      const w = canvas!.clientWidth, h = canvas!.clientHeight;
      if (!w || !h || (w === width && h === height)) return;
      width = w; height = h;
      // A soft backdrop does not need retina pixels; this keeps every frame cheap.
      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1);
      canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr);
      scene.resize(w, h, dpr);
      scene.draw(ctx!);
    }
    const scheduleResize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(resize); };

    function loop(time: number) {
      frame = requestAnimationFrame(loop);
      if (document.hidden) { last = 0; return; }
      if (last && time - last < 1000 / fps - 1) return;
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;
      scene.step(dt);
      scene.draw(ctx!);
    }
    function start() {
      if (running || reduced.matches) return;
      running = true; last = 0;
      frame = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }
    const onMotion = () => { if (reduced.matches) { stop(); scene.draw(ctx); } else start(); };
    const onPointer = (event: PointerEvent) => scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);

    resize();
    start();
    window.addEventListener('resize', scheduleResize);
    reduced.addEventListener('change', onMotion);
    if (finePointer && !phone) window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      stop();
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', scheduleResize);
      reduced.removeEventListener('change', onMotion);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.scene}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={styles.shade} />
      <div className={styles.dim} />
    </div>
  );
}
