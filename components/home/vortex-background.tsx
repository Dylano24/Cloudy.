'use client';

import { useEffect, useRef } from 'react';
import { FRAGMENT_SHADER, VERTEX_SHADER, renderScale, vortexCenter } from './vortex-shader';
import styles from './vortex-background.module.css';

// The homepage backdrop: a red space vortex around the Cloudy logo, drawn by a
// WebGL shader. The vortex follows the logo as the page scrolls. Without WebGL
// the layer shows its CSS glow; with reduced motion it shows one still frame.

const LOGO = '.cloudy-classic-logo-shell';
const STILL_TIME = 14;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

function program(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER), fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const linked = gl.createProgram();
  if (!vertex || !fragment || !linked) return null;
  gl.attachShader(linked, vertex); gl.attachShader(linked, fragment);
  gl.linkProgram(linked);
  if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) return null;
  return linked;
}

export function VortexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!canvas || !gl) return;
    const linked = program(gl);
    if (!linked) return;
    gl.useProgram(linked);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(linked, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(linked, name);
    const uniforms = { resolution: u('uResolution'), center: u('uCenter'), unit: u('uUnit'), ring: u('uRing'), time: u('uTime'), pointer: u('uPointer') };
    canvas.dataset.ready = 'true';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phone = window.matchMedia('(max-width: 700px)').matches;
    const budget = phone ? 900_000 : 2_200_000;
    let width = 0, height = 0, scale = 1, quality = 1, frame = 0, start = performance.now(), lastTime = 0;
    let logo: { x: number; docY: number; radius: number } | null = null;
    const pointer = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
    const pace = { frames: 0, since: 0 };

    function measure() {
      const rect = document.querySelector(LOGO)?.getBoundingClientRect();
      logo = rect && rect.width ? { x: rect.left + rect.width / 2, docY: rect.top + window.scrollY + rect.height / 2, radius: rect.width / 2 } : null;
    }
    function resize() {
      width = canvas!.clientWidth; height = canvas!.clientHeight;
      scale = renderScale(width, height, Math.min(window.devicePixelRatio || 1, 2), budget) * quality;
      canvas!.width = Math.max(1, Math.round(width * scale));
      canvas!.height = Math.max(1, Math.round(height * scale));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      measure();
      // Resizing clears the canvas; draw again at once so it never flashes black.
      if (lastTime) render(lastTime);
    }
    function render(time: number) {
      lastTime = time;
      const seconds = reduced.matches ? STILL_TIME : (time - start) / 1000;
      pointer.x += (aim.x - pointer.x) * 0.04; pointer.y += (aim.y - pointer.y) * 0.04;
      const sx = canvas!.width / width, unit = (Math.min(width, height) / 2) * sx;
      const center = vortexCenter(logo && { x: logo.x, y: logo.docY - window.scrollY }, { width, height }, sx);
      gl!.uniform2f(uniforms.resolution, canvas!.width, canvas!.height);
      gl!.uniform2f(uniforms.center, center.x, center.y);
      gl!.uniform1f(uniforms.unit, unit);
      gl!.uniform1f(uniforms.ring, logo ? (logo.radius * sx) / unit : 0.16);
      gl!.uniform1f(uniforms.time, seconds);
      gl!.uniform2f(uniforms.pointer, pointer.x, -pointer.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function loop(time: number) {
      frame = requestAnimationFrame(loop);
      if (document.hidden) { pace.frames = 0; return; }
      render(time);
      // A slow GPU gets fewer pixels rather than a stuttering page: every
      // 1.5 seconds, below about 40 frames a second, render a quarter fewer.
      if (!pace.frames) pace.since = time;
      pace.frames++;
      const elapsed = time - pace.since;
      if (elapsed > 1500 && pace.frames >= 6) {
        if (elapsed / (pace.frames - 1) > 24 && quality > 0.25) { quality = Math.max(0.25, quality * 0.75); resize(); }
        pace.frames = 0;
      }
    }
    const still = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(render); };
    const onResize = () => { resize(); if (reduced.matches) still(); };
    const onScroll = () => { if (reduced.matches) still(); };
    const onMotion = () => { cancelAnimationFrame(frame); if (reduced.matches) still(); else { start = performance.now() - STILL_TIME * 1000; frame = requestAnimationFrame(loop); } };
    const onPointer = (event: PointerEvent) => { aim.x = (event.clientX / window.innerWidth) * 2 - 1; aim.y = (event.clientY / window.innerHeight) * 2 - 1; };
    const onLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); canvas.dataset.ready = 'false'; };

    resize();
    start = performance.now() - STILL_TIME * 1000;
    if (reduced.matches) still(); else frame = requestAnimationFrame(loop);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    reduced.addEventListener('change', onMotion);
    canvas.addEventListener('webglcontextlost', onLost);
    // The logo image can change the hero's height once it loads.
    const settle = window.setTimeout(measure, 1200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      reduced.removeEventListener('change', onMotion);
      canvas.removeEventListener('webglcontextlost', onLost);
    };
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.shade} />
      <div className={styles.dim} />
    </div>
  );
}
