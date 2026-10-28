"use client";

/**
 * Cloudy original canvas visualisation using public domain Natural Earth land geometry.
 * No third-party render scripts, tracking, requests or VPN connections.
 */
import { useEffect, useRef } from "react";
import { LAND_POINTS, LAND_COASTS } from "./globe-land";
import styles from "./vpn-globe.module.css";

const PI = Math.PI;
const rad = PI / 180;
const TAU = PI * 2;

type Vector = { x: number; y: number; z: number };
type Location = { name: string; lat: number; lon: number };

const cities: Location[] = [
  { name: "Amsterdam", lat: 52.37, lon: 4.9 },
  { name: "New York", lat: 40.71, lon: -74.0 },
  { name: "London", lat: 51.51, lon: -0.12 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Cape Town", lat: -33.92, lon: 18.42 },
];

const routes: [number, number][] = [
  [0,1], [0,3], [0,4], [1,8], [1,6],
  [2,7], [3,4], [3,5], [7,9], [6,9], [4,5], [2,1],
];

function worldVector(lat: number, lon: number): Vector {
  const a = lat * rad, b = lon * rad, c = Math.cos(a);
  return { x: c * Math.sin(b), y: -Math.sin(a), z: c * Math.cos(b) };
}

function rotate(v: Vector, angle: number): Vector {
  return { x: v.x * Math.cos(angle) + v.z * Math.sin(angle), y: v.y, z: v.z * Math.cos(angle) - v.x * Math.sin(angle) };
}

function between(a: Vector, b: Vector, t: number): Vector {
  const dot = Math.min(1,Math.max(-1,a.x*b.x+a.y*b.y+a.z*b.z));
  const angle=Math.acos(dot), sin=Math.sin(angle);
  if(sin<0.0001)return {x:a.x,y:a.y,z:a.z};
  const aa=Math.sin((1-t)*angle)/sin,bb=Math.sin(t*angle)/sin;
  return {x:a.x*aa+b.x*bb,y:a.y*aa+b.y*bb,z:a.z*aa+b.z*bb};
}

const land: Vector[] = [];
for(let i=0;i<LAND_POINTS.length;i+=2)land.push(worldVector(LAND_POINTS[i+1],LAND_POINTS[i]));
const outlines = LAND_COASTS.map(coast => {
  const p:Vector[]=[];
  for(let i=0;i<coast.length;i+=2)p.push(worldVector(coast[i+1],coast[i]));
  return p;
});
const nodes = cities.map(p=>worldVector(p.lat,p.lon));

function drawFrame(ctx:CanvasRenderingContext2D,w:number,h:number,seconds:number,reduced:boolean){
  const mobile=w<720;
  const r=mobile?Math.min(w*.68,h*.39,365):Math.min(w*.365,h*.66,570);
  const cx=mobile?w*.54:w*.74;
  const cy=mobile?h*.64:h*.51;
  const angle=(seconds*.047 + .53);
  const co=Math.cos(angle),si=Math.sin(angle);
  const pixel=mobile?1.0:1.2;
  ctx.clearRect(0,0,w,h);

  // Ultra-subtle background star dust.
  for(let i=0;i<115;i++){
    const x=((i*199.31+58)%997)/997*w;
    const y=((i*311.63+114)%991)/991*h;
    const alpha=(.07+(.5+.5*Math.sin(i*6.28))*.12);
    ctx.fillStyle="rgba(247,112,132,"+alpha+")";
    ctx.beginPath();ctx.arc(x,y,i%7===0?1.15:.65,0,TAU);ctx.fill();
  }

  const aura=ctx.createRadialGradient(cx,cy,r*.66,cx,cy,r*1.47);
  aura.addColorStop(0,"rgba(240,38,66,.055)");
  aura.addColorStop(.38,"rgba(224,32,63,.15)");
  aura.addColorStop(.7,"rgba(197,16,56,.055)");
  aura.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=aura;ctx.beginPath();ctx.arc(cx,cy,r*1.47,0,TAU);ctx.fill();

  // Earth rim and dark surface: creates volume even without heavy WebGL.
  const edge=ctx.createRadialGradient(cx-r*.32,cy-r*.3,r*.03,cx,cy,r*1.14);
  edge.addColorStop(0,"#231118");edge.addColorStop(.52,"#130b10");edge.addColorStop(.76,"#0d090e");edge.addColorStop(.93,"#08080a");edge.addColorStop(1,"#060507");
  ctx.fillStyle=edge;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
  const inner=ctx.createRadialGradient(cx-r*.27,cy-r*.23,r*.36,cx,cy,r*1.12);
  inner.addColorStop(0,"rgba(239,47,82,.06)");inner.addColorStop(.66,"rgba(210,37,69,.025)");inner.addColorStop(.91,"rgba(236,69,103,.13)");inner.addColorStop(1,"rgba(238,74,105,0)");
  ctx.fillStyle=inner;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();

  // Subtle projected latitude and longitude bands.
  ctx.strokeStyle="rgba(227,64,95,.12)";ctx.lineWidth=.65;
  const guide=(lat:number|null,lon:number|null)=>{
    ctx.beginPath();let drawing=false;
    for(let i=0;i<=110;i++){
      const v=lat===null?worldVector(-90+i*180/110,lon!):worldVector(lat,-180+i*360/110);
      const z=co*v.z-si*v.x;
      if(z>.025){const x=cx+r*(co*v.x+si*v.z),y=cy+r*v.y;if(!drawing)ctx.moveTo(x,y);else ctx.lineTo(x,y);drawing=true;}
      else drawing=false;
    }
    ctx.stroke();
  };
  for(let lat=-60;lat<=60;lat+=30)guide(lat,null);
  for(let lon=-180;lon<180;lon+=30)guide(null,lon);

  // Natural Earth geographic coastlines, occluded on the far hemisphere.
  ctx.strokeStyle="rgba(248,81,112,.23)";
  ctx.lineWidth=mobile?.62:.8;
  for(const coast of outlines){
    ctx.beginPath();let drawing=false;
    for(const p of coast){
      const z=co*p.z-si*p.x;
      if(z>.02){const x=cx+r*(co*p.x+si*p.z),y=cy+r*p.y;if(!drawing)ctx.moveTo(x,y);else ctx.lineTo(x,y);drawing=true;}
      else drawing=false;
    }
    ctx.stroke();
  }

  // Land particles, illuminated depending on how close they are to the camera.
  const nearCol="rgba(255,112,140,",farCol="rgba(216,65,102,";
  for(const p of land){
    const z=co*p.z-si*p.x;
    if(z<=.015)continue;
    const x=cx+r*(co*p.x+si*p.z),y=cy+r*p.y;
    const light=.14 + .59*Math.pow(z,.7);
    ctx.fillStyle=(z>.52?nearCol:farCol)+light.toFixed(3)+")";
    const size=pixel*(.42+z*.68);
    ctx.fillRect(x-size*.5,y-size*.5,size,size);
  }

  // Great-circle arcs with elevated connections and bidirectional travel.
  for(let ri=0;ri<routes.length;ri++){
    const [ai,bi]=routes[ri],start=nodes[ai],end=nodes[bi];
    const projection=(t:number)=>{
      const q=between(start,end,t);
      const v=rotate(q,angle);
      const altitude=1+.13+.2*Math.sin(PI*t);
      return {x:cx+r*v.x*altitude,y:cy+r*v.y*altitude,z:v.z};
    };
    ctx.beginPath();let drawing=false,visible=0;
    for(let step=0;step<=40;step++){
      const pos=projection(step/40);
      if(pos.z>-.10){if(!drawing)ctx.moveTo(pos.x,pos.y);else ctx.lineTo(pos.x,pos.y);drawing=true;visible++;}
      else drawing=false;
    }
    if(visible<2)continue;
    ctx.strokeStyle="rgba(255,72,107,.33)";ctx.lineWidth=mobile?.8:1.05;ctx.stroke();

    // Two signals travel in opposite directions along each arc.
    for(let dir=0;dir<2;dir++){
      const base=((seconds*(dir?-.20:.20))+ri*.137+dir*.43)%1;
      const t=(base+1)%1;
      const pos=projection(t);
      if(pos.z<-.10)continue;
      const glow=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,mobile?9:13);
      glow.addColorStop(0,"rgba(255,228,230,.9)");
      glow.addColorStop(.19,"rgba(255,86,116,.65)");
      glow.addColorStop(1,"rgba(249,50,83,0)");
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(pos.x,pos.y,mobile?9:13,0,TAU);ctx.fill();
      ctx.fillStyle="#ffc2cb";ctx.beginPath();ctx.arc(pos.x,pos.y,mobile?1.3:1.85,0,TAU);ctx.fill();
      const tail=(dir?1:-1)*.027;
      const near=projection(Math.min(1,Math.max(0,t+tail)));
      if(near.z>-.10){ctx.strokeStyle="rgba(255,84,118,.73)";ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(pos.x,pos.y);ctx.lineTo(near.x,near.y);ctx.stroke();}
    }
  }

  // Endpoints glow only on the front of the globe.
  for(const node of nodes){
    const z=co*node.z-si*node.x;
    if(z<0)continue;
    const x=cx+r*(co*node.x+si*node.z),y=cy+r*node.y;
    ctx.strokeStyle="rgba(255,112,139,.52)";ctx.lineWidth=.7;
    ctx.beginPath();ctx.arc(x,y,mobile?4:5.2,0,TAU);ctx.stroke();
    ctx.fillStyle="#ff8fa5";ctx.beginPath();ctx.arc(x,y,1.8,0,TAU);ctx.fill();
  }

  const sphereEdge=ctx.createRadialGradient(cx,cy,r*.92,cx,cy,r*1.13);
  sphereEdge.addColorStop(0,"rgba(243,55,91,0)");
  sphereEdge.addColorStop(.43,"rgba(244,76,112,.12)");
  sphereEdge.addColorStop(.7,"rgba(241,55,89,.09)");
  sphereEdge.addColorStop(1,"rgba(242,65,99,0)");
  ctx.fillStyle=sphereEdge;ctx.beginPath();ctx.arc(cx,cy,r*1.13,0,TAU);ctx.fill();
  ctx.strokeStyle="rgba(244,83,108,.36)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();

  // Decorative polar orbits extend outside the sphere without blocking content.
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.24);
  ctx.strokeStyle="rgba(247,73,104,.12)";ctx.lineWidth=.85;
  ctx.beginPath();ctx.ellipse(0,0,r*1.29,r*.37,0,0,TAU);ctx.stroke();
  ctx.rotate(.95);
  ctx.strokeStyle="rgba(239,59,98,.08)";ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*.55,0,0,TAU);ctx.stroke();
  ctx.restore();

  if(reduced)return;
}

export function VpnGlobeBackground(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current,holder=canvas?.parentElement;
    if(!canvas||!holder)return;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return;
    let w=1,h=1,id=0,active=true,visible=true,reduce=false,last=0;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    reduce=media.matches;
    const onMedia=()=>{reduce=media.matches;drawFrame(ctx,w,h,0,reduce);};
    const observer=new ResizeObserver(()=>{
      const rect=holder.getBoundingClientRect();
      w=Math.max(1,rect.width);h=Math.max(1,rect.height);
      const dpr=Math.min(window.devicePixelRatio||1,1.7);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=w+"px";canvas.style.height=h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      drawFrame(ctx,w,h,0,reduce);
    });
    observer.observe(holder);
    const intersect=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{rootMargin:"100px"});
    intersect.observe(canvas);
    const draw=(timestamp:number)=>{
      if(!active)return;
      if(!reduce&&visible&&document.visibilityState==="visible"&&timestamp-last>=32){
        last=timestamp;
        drawFrame(ctx,w,h,timestamp/1000,false);
      }
      id=requestAnimationFrame(draw);
    };
    media.addEventListener("change",onMedia);
    id=requestAnimationFrame(draw);
    return()=>{active=false;cancelAnimationFrame(id);observer.disconnect();intersect.disconnect();media.removeEventListener("change",onMedia);};
  },[]);
  return (
    <div className={styles.globeLayer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.globeCanvas}/>
      <div className={styles.globeFade}/>
      <div className={styles.globeVignette}/>
    </div>
  );
}
