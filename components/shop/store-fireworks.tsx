'use client';

import { useEffect, useRef } from 'react';
import styles from './store-fireworks.module.css';

type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; color: number; size: number; trail: [number, number][] };
type Rocket = { x: number; y: number; targetY: number; speed: number; color: number; trail: [number, number][] };
const colors = ['#fff3ce', '#ff344f', '#ffffff'];

export function StoreFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 1;
    let height = 1;
    let frame = 0;
    let previous = 0;
    let countdown = .3;
    let launches = 0;
    let visible = true;
    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];

    const glows = colors.map(color => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = 32;
      const pen = sprite.getContext('2d')!;
      const gradient = pen.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(.15, color);
      gradient.addColorStop(1, `${color}00`);
      pen.fillStyle = gradient;
      pen.fillRect(0, 0, 32, 32);
      return sprite;
    });

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function burst(x: number, y: number, color: number) {
      const count = width < 650 ? 90 : 160;
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2 + Math.random() * .04;
        const speed = (10 + Math.random() * 135) * Math.min(width / 800, 1);
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          age: 0, life: 2.2 + Math.random() * 1.5, color: i % 5 === 0 ? 2 : color,
          size: .6 + Math.random() * .6, trail: [] });
      }
      if (sparks.length > 650) sparks.splice(0, sparks.length - 650);
    }

    function animate(time: number) {
      const delta = Math.min((time - previous) / 1000 || .016, .04);
      previous = time;
      context!.clearRect(0, 0, width, height);
      context!.globalCompositeOperation = 'lighter';
      countdown -= delta;
      if (countdown <= 0) {
        const lane = [ .17, .82, .38, .68 ][launches % 4];
        rockets.push({ x: width * (lane + (Math.random() - .5) * .06), y: height,
          targetY: 65 + Math.random() * 90, speed: 310 + Math.random() * 70,
          color: launches % 2, trail: [] });
        launches++;
        countdown = 1.2 + Math.random() * .6;
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.trail.unshift([rocket.x, rocket.y]);
        rocket.trail.length = Math.min(rocket.trail.length, 18);
        rocket.y -= rocket.speed * delta;
        rocket.trail.forEach(([x, y], index) => {
          context!.globalAlpha = (1 - index / 18) * .6;
          context!.drawImage(glows[rocket.color], x - 5, y - 5, 10, 10);
        });
        if (rocket.y <= rocket.targetY) {
          burst(rocket.x, rocket.y, rocket.color);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.age += delta;
        if (spark.age >= spark.life) { sparks.splice(i, 1); continue; }
        spark.trail.unshift([spark.x, spark.y]);
        spark.trail.length = Math.min(spark.trail.length, 14);
        spark.vx *= Math.exp(-.55 * delta);
        spark.vy = spark.vy * Math.exp(-.4 * delta) + 25 * delta;
        spark.x += spark.vx * delta;
        spark.y += spark.vy * delta;
        const fade = Math.pow(1 - spark.age / spark.life, .7);
        context!.strokeStyle = colors[spark.color];
        context!.lineWidth = spark.size * .7;
        context!.globalAlpha = fade * .55;
        context!.beginPath();
        context!.moveTo(spark.x, spark.y);
        spark.trail.forEach(([x, y]) => context!.lineTo(x, y));
        context!.stroke();
        context!.globalAlpha = fade * (spark.age > 1.5 ? .5 + Math.sin(spark.age * 28 + i) * .25 : .9);
        const size = spark.size * 6;
        context!.drawImage(glows[spark.color], spark.x - size / 2, spark.y - size / 2, size, size);
        context!.fillStyle = colors[spark.color];
        context!.fillRect(spark.x - .5, spark.y - .5, 1, 1);
      }
      context!.globalAlpha = 1;
      context!.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(animate);
    }

    function sync() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!motion.matches && visible && !document.hidden) frame = requestAnimationFrame(animate);
      else context!.clearRect(0, 0, width, height);
    }
    resize();
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    visibilityObserver.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
