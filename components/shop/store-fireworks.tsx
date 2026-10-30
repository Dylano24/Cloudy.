'use client';

import { useEffect, useRef } from 'react';
import styles from './store-fireworks.module.css';

type Trail = { points: Float64Array; head: number; length: number };
type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; color: number; size: number; trail: Trail };
type Rocket = { x: number; y: number; targetY: number; speed: number; color: number; trail: Trail };
const colors = ['#fff3ce', '#ff344f', '#ffffff'];
const lanes = [.17, .82, .38, .68];
const createTrail = (capacity: number): Trail => ({ points: new Float64Array(capacity * 2), head: 0, length: 0 });
function pushTrail(trail: Trail, x: number, y: number) {
  const capacity = trail.points.length / 2;
  trail.head = (trail.head + capacity - 1) % capacity;
  trail.points[trail.head * 2] = x;
  trail.points[trail.head * 2 + 1] = y;
  trail.length = Math.min(trail.length + 1, capacity);
}

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
        const angle = i * 2.399963 + Math.random() * .04;
        const center = i < count / 3;
        const speed = (center ? Math.random() * 20 : 20 + Math.random() * 110) * Math.min(width / 800, 1);
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          age: 0, life: center ? 2.8 : 1.6 + Math.random() * .8, color: i % 5 === 0 ? 2 : color,
          size: .6 + Math.random() * .6, trail: createTrail(14) });
      }
      if (sparks.length > 650) sparks.splice(0, sparks.length - 650);
    }

    function animate(time: number) {
      const delta = Math.min((time - previous) / 1000 || .016, .04);
      previous = time;
      const horizontalDamping = Math.exp(-.55 * delta);
      const verticalDamping = Math.exp(-.4 * delta);
      context!.clearRect(0, 0, width, height);
      context!.globalCompositeOperation = 'lighter';
      countdown -= delta;
      if (countdown <= 0) {
        const lane = lanes[launches % 4];
        rockets.push({ x: width * (lane + (Math.random() - .5) * .06), y: height,
          targetY: 65 + Math.random() * 90, speed: 310 + Math.random() * 70,
          color: launches % 2, trail: createTrail(18) });
        launches++;
        countdown = 1.2 + Math.random() * .6;
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        pushTrail(rocket.trail, rocket.x, rocket.y);
        rocket.y -= rocket.speed * delta;
        for (let index = 0; index < rocket.trail.length; index++) {
          const offset = (rocket.trail.head + index) % 18 * 2;
          const x = rocket.trail.points[offset], y = rocket.trail.points[offset + 1];
          context!.globalAlpha = (1 - index / 18) * .6;
          context!.drawImage(glows[rocket.color], x - 5, y - 5, 10, 10);
        }
        if (rocket.y <= rocket.targetY) {
          burst(rocket.x, rocket.y, rocket.color);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.age += delta;
        if (spark.age >= spark.life) { sparks.splice(i, 1); continue; }
        pushTrail(spark.trail, spark.x, spark.y);
        spark.vx *= horizontalDamping;
        spark.vy = spark.vy * verticalDamping + 25 * delta;
        spark.x += spark.vx * delta;
        spark.y += spark.vy * delta;
        const fade = Math.pow(1 - spark.age / spark.life, .7);
        context!.strokeStyle = colors[spark.color];
        context!.lineWidth = spark.size * .7;
        context!.globalAlpha = fade * .55;
        context!.beginPath();
        context!.moveTo(spark.x, spark.y);
        for (let index = 0; index < spark.trail.length; index++) {
          const offset = (spark.trail.head + index) % 14 * 2;
          context!.lineTo(spark.trail.points[offset], spark.trail.points[offset + 1]);
        }
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
