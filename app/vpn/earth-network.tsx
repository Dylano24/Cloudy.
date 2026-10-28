"use client";

import { useEffect, useRef, useState } from "react";
import { LAND_POINTS, LAND_COASTS } from "./globe-land";
import styles from "./vpn.module.css";

/**
 * Cloudy VPN visual network. Natural Earth public-domain geography.
 * Real spherical rotation in a bounded 2D canvas (no WebGL / external assets).
 * Geography only: no server markers, routes or traffic signals.
 */
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const CENTER = 350;
const RADIUS = 302;
const INCLINATION = 0.19;
const SIN_I = Math.sin(INCLINATION);
const COS_I = Math.cos(INCLINATION);

type Vec = readonly [number, number, number];
type Pt = { x: number; y: number; z: number };

function vector(lon: number, lat: number): Vec {
  const a = lat * DEG, b = lon * DEG;
  const c = Math.cos(a);
  return [c * Math.sin(b), Math.sin(a), c * Math.cos(b)];
}
let cachedAngle = NaN, c = 1, s = 0;
function project(v: Vec, rotation: number): Pt {
  if (rotation !== cachedAngle) { cachedAngle = rotation; c = Math.cos(rotation); s = Math.sin(rotation); }
  const x = v[0] * c + v[2] * s;
  const z = v[2] * c - v[0] * s;
  const y = v[1] * COS_I + z * SIN_I;
  return { x: CENTER + RADIUS * x, y: CENTER - RADIUS * y, z: z * COS_I - v[1] * SIN_I };
}

const dots: Vec[] = [];
for (let i = 0; i + 1 < LAND_POINTS.length; i += 2) {
  dots.push(vector(LAND_POINTS[i], LAND_POINTS[i + 1]));
}
const coastlines: Vec[][] = LAND_COASTS.map(coast => {
  const result: Vec[] = [];
  for (let i = 0; i + 1 < coast.length; i += 2) result.push(vector(coast[i], coast[i + 1]));
  return result;
});
const grid: Vec[][] = [];
for (let lat = -60; lat <= 60; lat += 30) {
  grid.push(Array.from({length: 145}, (_, i) => vector(-180 + i * 2.5, lat)));
}
for (let lon = -180; lon < 180; lon += 30) {
  grid.push(Array.from({length: 73}, (_, i) => vector(lon, -90 + i * 2.5)));
}
function line(ctx: CanvasRenderingContext2D, points: readonly Vec[], angle: number, threshold = 0.012) {
  let active = false;
  for(const v of points) {
    const p = project(v,angle);
    if(p.z > threshold) {
      if(!active){ctx.moveTo(p.x,p.y);active=true;}
      else ctx.lineTo(p.x,p.y);
    } else active=false;
  }
}
function draw(ctx: CanvasRenderingContext2D, rotation: number) {
  ctx.clearRect(0,0,700,700);
  const globe = ctx.createRadialGradient(268,225,40,350,350,315);
  globe.addColorStop(0,"#290609");
  globe.addColorStop(.35,"#140507");
  globe.addColorStop(.7,"#090909");
  globe.addColorStop(1,"#020202");
  ctx.beginPath(); ctx.arc(CENTER,CENTER,RADIUS,0,TAU);
  ctx.fillStyle=globe;ctx.fill();

  ctx.save();
  ctx.beginPath();ctx.arc(CENTER,CENTER,RADIUS-1.5,0,TAU);ctx.clip();

  // Light geometrics, located on the surface. No free-floating orbits.
  ctx.strokeStyle="rgba(229,27,46,.11)"; ctx.lineWidth=.65;
  ctx.beginPath();
  for(const row of grid) line(ctx,row,rotation);
  ctx.stroke();

  // Continental micro-particles are grouped to avoid a stroke/fill per dot.
  const near:Pt[] = [], middle:Pt[] = [], far:Pt[] = [];
  for(const v of dots){
    const p=project(v,rotation);
    if(p.z>.62)near.push(p);
    else if(p.z>.32)middle.push(p);
    else if(p.z>.018)far.push(p);
  }
  for(const [bucket,color,sz] of [
    [far,"rgba(229,27,46,.27)",.72],
    [middle,"rgba(229,27,46,.47)",.88],
    [near,"rgba(229,27,46,.68)",1.16],
  ] as const){
    ctx.fillStyle=color; ctx.beginPath();
    for(const p of bucket) ctx.rect(p.x,p.y,sz,sz);
    ctx.fill();
  }

  ctx.strokeStyle="rgba(229,27,46,.46)";
  ctx.lineWidth=.88;ctx.lineJoin="round";
  ctx.beginPath();
  for(const coast of coastlines) line(ctx,coast,rotation,.014);
  ctx.stroke();

  const shade=ctx.createRadialGradient(260,216,45,350,350,350);
  shade.addColorStop(0,"rgba(229,27,46,0)");
  shade.addColorStop(.55,"rgba(229,27,46,0)");
  shade.addColorStop(.77,"rgba(229,27,46,.12)");
  shade.addColorStop(1,"rgba(229,27,46,.55)");
  ctx.fillStyle=shade;ctx.fillRect(0,0,700,700);
  ctx.restore();

  const rim=ctx.createLinearGradient(110,70,625,660);
  rim.addColorStop(0,"rgba(229,27,46,.11)");
  rim.addColorStop(.29,"rgba(229,27,46,.79)");
  rim.addColorStop(.5,"rgba(229,27,46,.25)");
  rim.addColorStop(.83,"rgba(229,27,46,.58)");
  rim.addColorStop(1,"rgba(229,27,46,.07)");
  ctx.beginPath();ctx.arc(CENTER,CENTER,RADIUS,0,TAU);
  ctx.strokeStyle=rim;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle="rgba(229,27,46,.075)";ctx.lineWidth=6;ctx.stroke();
}

export function EarthNetwork() {
  const [paused,setPaused]=useState(false);
  const position=useRef({angle:.49});
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current, holder=containerRef.current;
    if(!canvas||!holder)return;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return;

    let raf=0,alive=true,visible=false,last=0,lastDraw=0;
    let {angle}=position.current; // Preserve rotation across pause/resume.
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced=motion.matches;
    let quality=700;
    const resize=()=>{
      const width=canvas.getBoundingClientRect().width;
      quality=Math.max(340,Math.min(850,Math.round(width*Math.min(window.devicePixelRatio||1,1.45))));
      if(canvas.width!==quality){canvas.width=quality;canvas.height=quality;}
      ctx.setTransform(quality/700,0,0,quality/700,0,0);
      draw(ctx,angle);
    };
    const onMotion=()=>{
      reduced=motion.matches;
      if(reduced||paused){cancelAnimationFrame(raf);raf=0;draw(ctx,angle);}
      else if(visible&&document.visibilityState==="visible"&&!raf)raf=requestAnimationFrame(frame);
    };
    const frame=(now:number)=>{
      raf=0;
      if(!alive||reduced||paused||!visible||document.visibilityState!=="visible")return;
      if(!last)last=now;
      const elapsed=Math.min(.08,(now-last)/1000);last=now;
      const fps=30;
      angle+=elapsed*(TAU/82);
      if(now-lastDraw>=1000/fps){
        lastDraw=now;
        draw(ctx,angle);
        position.current={angle};
      }
      raf=requestAnimationFrame(frame);
    };
    const onVisible=()=>{
      if(visible&&!reduced&&!paused&&document.visibilityState==="visible"&&!raf){last=0;lastDraw=0;raf=requestAnimationFrame(frame);}
      else if(document.visibilityState!=="visible"){cancelAnimationFrame(raf);raf=0;}
    };
    const intersection=new IntersectionObserver(entries=>{
      visible=entries[0]?.isIntersecting??true;
      if(!visible){cancelAnimationFrame(raf);raf=0;}
      else onVisible();
    },{rootMargin:"0px"});
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    intersection.observe(holder);
    motion.addEventListener("change",onMotion);
    document.addEventListener("visibilitychange",onVisible);
    resize();
    onVisible();
    return()=>{
      alive=false;cancelAnimationFrame(raf);
      observer.disconnect();intersection.disconnect();
      motion.removeEventListener("change",onMotion);
      document.removeEventListener("visibilitychange",onVisible);
    };
  },[paused]);
  return (
    <div className={styles.earthVisual} ref={containerRef}>
      <div className={styles.earthAura} aria-hidden="true"/>
      <div className={styles.earthSphereFallback} aria-hidden="true"/>
      <canvas
        ref={canvasRef}
        className={styles.earthCanvas}
        width={700}
        height={700}
        role="img"
        aria-label="Rotating red and black Earth with detailed continents and coastlines."
      />
      <button type="button" className={styles.motionButton} onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label="Pause globe animation">
        <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>{paused ? "Resume globe" : "Pause globe"}
      </button>
    </div>
  );
}
