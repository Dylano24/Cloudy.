"use client";

import { useEffect, useRef } from "react";
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

function vector(lon: number, lat: number): Vec {
  const a = lat * DEG, b = lon * DEG;
  const c = Math.cos(a);
  return [c * Math.sin(b), Math.sin(a), c * Math.cos(b)];
}
let cachedAngle = NaN, c = 1, s = 0;
let projectedX = 0, projectedY = 0, projectedZ = 0;
function project(v: Vec, rotation: number) {
  if (rotation !== cachedAngle) { cachedAngle = rotation; c = Math.cos(rotation); s = Math.sin(rotation); }
  const x = v[0] * c + v[2] * s;
  const z = v[2] * c - v[0] * s;
  const y = v[1] * COS_I + z * SIN_I;
  projectedX = CENTER + RADIUS * x;
  projectedY = CENTER - RADIUS * y;
  projectedZ = z * COS_I - v[1] * SIN_I;
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
    project(v,angle);
    if(projectedZ > threshold) {
      if(!active){ctx.moveTo(projectedX,projectedY);active=true;}
      else ctx.lineTo(projectedX,projectedY);
    } else active=false;
  }
}
// The sphere lighting never rotates. Reuse its gradients until the backing
// resolution changes, and reuse coordinate storage instead of thousands of
// temporary point objects and bucket arrays on every animation frame.
type Paints = { globe: CanvasGradient; shade: CanvasGradient; rim: CanvasGradient; buckets: Float64Array[] };
const paints = new WeakMap<CanvasRenderingContext2D, Paints>();
function cachePaints(ctx: CanvasRenderingContext2D) {
  const globe = ctx.createRadialGradient(268,225,40,350,350,315);
  globe.addColorStop(0,"#290609");
  globe.addColorStop(.35,"#140507");
  globe.addColorStop(.7,"#090909");
  globe.addColorStop(1,"#020202");
  const shade=ctx.createRadialGradient(260,216,45,350,350,350);
  shade.addColorStop(0,"rgba(229,27,46,0)");
  shade.addColorStop(.55,"rgba(229,27,46,0)");
  shade.addColorStop(.77,"rgba(229,27,46,.12)");
  shade.addColorStop(1,"rgba(229,27,46,.55)");
  const rim=ctx.createLinearGradient(110,70,625,660);
  rim.addColorStop(0,"rgba(229,27,46,.11)");
  rim.addColorStop(.29,"rgba(229,27,46,.79)");
  rim.addColorStop(.5,"rgba(229,27,46,.25)");
  rim.addColorStop(.83,"rgba(229,27,46,.58)");
  rim.addColorStop(1,"rgba(229,27,46,.07)");
  const value = { globe, shade, rim, buckets: [new Float64Array(dots.length * 2), new Float64Array(dots.length * 2), new Float64Array(dots.length * 2)] };
  paints.set(ctx, value);
  return value;
}
function draw(ctx: CanvasRenderingContext2D, rotation: number) {
  const { globe, shade, rim, buckets } = paints.get(ctx) || cachePaints(ctx);
  ctx.clearRect(0,0,700,700);
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
  let near = 0, middle = 0, far = 0;
  for(const v of dots){
    project(v,rotation);
    if(projectedZ>.62){buckets[2][near++]=projectedX;buckets[2][near++]=projectedY;}
    else if(projectedZ>.32){buckets[1][middle++]=projectedX;buckets[1][middle++]=projectedY;}
    else if(projectedZ>.018){buckets[0][far++]=projectedX;buckets[0][far++]=projectedY;}
  }
  for(let index=0;index<3;index++){
    const bucket=buckets[index], length=index===0?far:index===1?middle:near;
    const sz=index===0?.72:index===1?.88:1.16;
    ctx.fillStyle=index===0?"rgba(229,27,46,.27)":index===1?"rgba(229,27,46,.47)":"rgba(229,27,46,.68)";
    ctx.beginPath();
    for(let i=0;i<length;i+=2) ctx.rect(bucket[i],bucket[i+1],sz,sz);
    ctx.fill();
  }

  ctx.strokeStyle="rgba(229,27,46,.46)";
  ctx.lineWidth=.88;ctx.lineJoin="round";
  ctx.beginPath();
  for(const coast of coastlines) line(ctx,coast,rotation,.014);
  ctx.stroke();

  ctx.fillStyle=shade;ctx.fillRect(0,0,700,700);
  ctx.restore();

  ctx.beginPath();ctx.arc(CENTER,CENTER,RADIUS,0,TAU);
  ctx.strokeStyle=rim;ctx.lineWidth=2.2;ctx.stroke();
  ctx.strokeStyle="rgba(229,27,46,.075)";ctx.lineWidth=6;ctx.stroke();
}

export function EarthNetwork() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current, holder=containerRef.current;
    if(!canvas||!holder)return;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return;

    let raf=0,alive=true,visible=false,last=0,lastDraw=0;
    let angle=.49;
    let decorationFps=60,drawCost=0,drawSamples=0,recoverySamples=0;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced=motion.matches;
    let quality=700;
    const resize=()=>{
      const width=canvas.getBoundingClientRect().width;
      quality=Math.max(340,Math.min(850,Math.round(width*Math.min(window.devicePixelRatio||1,1.45))));
      if(canvas.width!==quality){canvas.width=quality;canvas.height=quality;}
      ctx.setTransform(quality/700,0,0,quality/700,0,0);
      cachePaints(ctx);
      draw(ctx,angle);
    };
    const onMotion=()=>{
      reduced=motion.matches;
      if(reduced){cancelAnimationFrame(raf);raf=0;draw(ctx,angle);}
      else if(visible&&document.visibilityState==="visible"&&!raf)raf=requestAnimationFrame(frame);
    };
    const frame=(now:number)=>{
      raf=0;
      if(!alive||reduced||!visible||document.visibilityState!=="visible")return;
      if(!last)last=now;
      const elapsed=Math.min(.08,(now-last)/1000);last=now;
      angle+=elapsed*(TAU/82);
      if(now-lastDraw>=1000/decorationFps-.5){
        lastDraw=now;
        const started=performance.now();
        draw(ctx,angle);
        const cost=performance.now()-started;
        drawCost=drawSamples===0?cost:drawCost*.9+cost*.1;
        drawSamples++;
        // Leave room for input, scrolling and the rest of the page. Only
        // decoration cadence changes; the geometry and rotation speed do not.
        if(decorationFps===60&&drawSamples>=30&&drawCost>6){
          decorationFps=30;recoverySamples=0;
        }else if(decorationFps===30){
          recoverySamples=drawCost<3?recoverySamples+1:0;
          if(recoverySamples>=120){decorationFps=60;recoverySamples=0;}
        }
      }
      raf=requestAnimationFrame(frame);
    };
    const onVisible=()=>{
      if(visible&&!reduced&&document.visibilityState==="visible"&&!raf){last=0;lastDraw=0;raf=requestAnimationFrame(frame);}
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
  },[]);
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
    </div>
  );
}
