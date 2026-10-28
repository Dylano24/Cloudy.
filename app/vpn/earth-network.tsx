"use client";

import { useEffect, useRef, useState } from "react";
import { LAND_POINTS, LAND_COASTS } from "./globe-land";
import styles from "./vpn.module.css";

/**
 * Cloudy VPN visual network. Natural Earth public-domain geography.
 * Real spherical rotation in a bounded 2D canvas (no WebGL / external assets).
 * Illustrated traffic is a design visual, NOT a live server-status feed.
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
const cities = [
  { name:"Amsterdam", lon:4.904, lat:52.368 },
  { name:"New York", lon:-74.006, lat:40.713 },
  { name:"London", lon:-.127, lat:51.508 },
  { name:"São Paulo", lon:-46.633, lat:-23.55 },
  { name:"Lagos", lon:3.379, lat:6.524 },
  { name:"Cape Town", lon:18.424, lat:-33.925 },
  { name:"Mexico City", lon:-99.133, lat:19.433 },
  { name:"Lisbon", lon:-9.139, lat:38.723 },
  { name:"Buenos Aires", lon:-58.382, lat:-34.604 },
  { name:"Miami", lon:-80.192, lat:25.762 },
  { name:"Tokyo", lon:139.65, lat:35.68 },
  { name:"Singapore", lon:103.819, lat:1.35 },
  { name:"Sydney", lon:151.21, lat:-33.87 },
  { name:"Dubai", lon:55.271, lat:25.205 },
  { name:"Los Angeles", lon:-118.244, lat:34.052 },
];
const nodeVectors = cities.map(c => vector(c.lon,c.lat));
const pairs: [number,number][] = [
  [0,1],[0,2],[0,3],[0,4],[0,5],[1,6],[1,9],[1,14],[3,8],
  [4,5],[2,7],[7,9],[0,13],[13,11],[11,10],[10,12],[11,12],[10,14],
];
function slerp(a:Vec,b:Vec,t:number): Vec {
  const dot = Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
  const angle = Math.acos(dot), d = Math.sin(angle);
  if(d < 1e-5) return a;
  const x = Math.sin((1-t)*angle)/d, y = Math.sin(t*angle)/d;
  return [a[0]*x+b[0]*y,a[1]*x+b[1]*y,a[2]*x+b[2]*y];
}
const routes = pairs.map(([a,b],index)=>({
  a,b,index,
  points: Array.from({length:49},(_,i)=>slerp(nodeVectors[a],nodeVectors[b],i/48))
}));

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
function draw(ctx: CanvasRenderingContext2D, rotation: number, t: number, move: boolean, lowPower: boolean) {
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

  // Connections are strictly front-facing geodesics on the globe.
  const nodes=nodeVectors.map(v=>project(v,rotation));
  const visible=routes.filter(r=>nodes[r.a].z>.085&&nodes[r.b].z>.085);
  const chosen=visible.slice(0,lowPower?5:9);
  for(const r of chosen){
    const path=r.points.map(v=>project(v,rotation));
    ctx.beginPath();let drawing=false;
    for(const p of path){
      if(p.z>.012) { if(!drawing){ctx.moveTo(p.x,p.y);drawing=true;}else ctx.lineTo(p.x,p.y); }
      else drawing=false;
    }
    ctx.strokeStyle="rgba(229,27,46,.14)";
    ctx.lineWidth=lowPower?3:4.5;
    ctx.stroke();
    ctx.strokeStyle="rgba(229,27,46,.57)";
    ctx.lineWidth=.95;
    ctx.stroke();
    if(move) {
      for(let direction=0;direction<2;direction++){
        const progress=((t*(direction===0?.105:-.105)+r.index*.137+direction*.47)%1+1)%1;
        const point=project(slerp(nodeVectors[r.a],nodeVectors[r.b],progress),rotation);
        if(point.z<.025)continue;
        const tailProgress=Math.max(0,Math.min(1,progress+(direction===0?-.025:.025)));
        const previous=project(slerp(nodeVectors[r.a],nodeVectors[r.b],tailProgress),rotation);
        ctx.strokeStyle="rgba(229,27,46,.88)";
        ctx.lineWidth=2.2;
        ctx.beginPath();ctx.moveTo(previous.x,previous.y);ctx.lineTo(point.x,point.y);ctx.stroke();
        const glow=ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,8);
        glow.addColorStop(0,"rgba(229,27,46,.94)");
        glow.addColorStop(.2,"rgba(229,27,46,.77)");
        glow.addColorStop(1,"rgba(229,27,46,0)");
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(point.x,point.y,8,0,TAU);ctx.fill();
      }
    }
  }

  for (const p of nodes) {
    if(p.z<.1)continue;
    ctx.fillStyle="rgba(229,27,46,.13)";
    ctx.beginPath();ctx.arc(p.x,p.y,9,0,TAU);ctx.fill();
    ctx.strokeStyle="rgba(229,27,46,.77)";
    ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,4.1,0,TAU);ctx.stroke();
    ctx.fillStyle="#e51b2e";ctx.beginPath();ctx.arc(p.x,p.y,1.9,0,TAU);ctx.fill();
  }

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
  const position=useRef({angle:.49,time:0});
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current, holder=containerRef.current;
    if(!canvas||!holder)return;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return;

    let raf=0,alive=true,visible=false,last=0,lastDraw=0;
    let {angle,time}=position.current; // Preserve rotation across pause/resume.
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced=motion.matches;
    let quality=700;
    let lowPower=false;
    const resize=()=>{
      const width=canvas.getBoundingClientRect().width;
      lowPower=width<600;
      quality=Math.max(340,Math.min(850,Math.round(width*Math.min(window.devicePixelRatio||1,1.45))));
      if(canvas.width!==quality){canvas.width=quality;canvas.height=quality;}
      ctx.setTransform(quality/700,0,0,quality/700,0,0);
      draw(ctx,angle,time,!reduced&&!paused,lowPower);
    };
    const onMotion=()=>{
      reduced=motion.matches;
      if(reduced||paused){cancelAnimationFrame(raf);raf=0;draw(ctx,angle,time,false,lowPower);}
      else if(visible&&document.visibilityState==="visible"&&!raf)raf=requestAnimationFrame(frame);
    };
    const frame=(now:number)=>{
      raf=0;
      if(!alive||reduced||paused||!visible||document.visibilityState!=="visible")return;
      if(!last)last=now;
      const elapsed=Math.min(.08,(now-last)/1000);last=now;
      const fps=30;
      angle+=elapsed*(TAU/82);
      time+=elapsed;
      if(now-lastDraw>=1000/fps){
        lastDraw=now;
        draw(ctx,angle,time,true,lowPower);
        position.current={angle,time};
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
        aria-label="Rotating digital Earth with illustrated connection routes between cities, contained on the globe."
      />
      <button type="button" className={styles.motionButton} onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label="Pause globe animation">
        <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>{paused ? "Resume globe" : "Pause globe"}
      </button>
    </div>
  );
}
