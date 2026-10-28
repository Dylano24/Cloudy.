"use client";
import { useEffect, useRef, useState } from "react";
import { VpnGlobeBackground } from "./vpn-globe";
import styles from "./vpn-cinematic.module.css";

/** Original Cloudy globe. Scientific satellite imagery; network connections are illustrative, not operational. */
const vertex = "attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=(aPosition+1.0)*0.5;gl_Position=vec4(aPosition,0.,1.);}";
const fragment = "precision highp float;\nvarying vec2 vUv;\nuniform vec2 uResolution,uCenter;\nuniform float uRadius,uRotation,uNightAvailable;\nuniform sampler2D uDay,uNight;\nconst float PI=3.141592653589793;\nvoid main(){\n vec2 p=(vUv*uResolution-uCenter)/uRadius;\n float r=length(p);\n vec3 bg=vec3(.0049,.004,.009);\n float glow=exp(-pow((r-1.04)*9.5,2.));\n float halo=exp(-pow((r-1.19)*3.9,2.));\n bg+=vec3(.22,.024,.054)*glow*.47 +vec3(.058,.004,.014)*halo*.18;\n if(r>=1.){gl_FragColor=vec4(bg,1.);return;}\n vec3 n=vec3(p,sqrt(max(0.,1.-dot(p,p))));\n float cs=cos(uRotation),sn=sin(uRotation);\n vec3 q=vec3(cs*n.x-sn*n.z,n.y,sn*n.x+cs*n.z);\n vec2 uv=vec2(fract(atan(q.x,q.z)/(PI*2.)+.5),asin(clamp(q.y,-1.,1.))/PI+.5);\n vec3 day=texture2D(uDay,uv).rgb,night=texture2D(uNight,uv).rgb;\n float light=dot(n,normalize(vec3(-.28,.35,.89)));\n float dayFactor=smoothstep(-.29,.33,light);\n vec3 daySurface=day*vec3(.74,.79,.90)*(.21+.79*max(0.,light));\n float sea=clamp((day.b-day.r)*2.5,0.,1.);\n daySurface+=vec3(.0,.004,.017)*sea;\n float lamp=pow(clamp(max(max(night.r,night.g),night.b)*1.9,0.,1.),1.18);\n vec3 darkSurface=day*vec3(.066,.07,.1)+vec3(1.,.57,.43)*lamp*(.32+.68*uNightAvailable);\n vec3 surface=mix(darkSurface,daySurface,dayFactor);\n float limb=pow(1.-n.z,4.);\n surface+=vec3(.2,.024,.06)*limb;\n surface+=vec3(.19,.052,.08)*pow(1.-n.z,11.)*.65;\n surface=mix(surface,surface*vec3(1.055,.91,.95),.2);\n surface=pow(surface/(surface+vec3(.73)),vec3(.91));\n gl_FragColor=vec4(surface+bg*.03,1.);\n}";
const BASES = [
  "https://threejs.org/examples/textures/planets/",
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/",
];
const POINTS = [
  ["AMSTERDAM",52.3676,4.9041],["NEW YORK",40.7128,-74.006],
  ["LONDON",51.5074,-.1278],["LOS ANGELES",34.0522,-118.2437],
  ["SÃO PAULO",-23.5505,-46.6333],["DUBAI",25.2048,55.2708],
  ["SINGAPORE",1.3521,103.8198],["TOKYO",35.6762,139.6503],
  ["SYDNEY",-33.8688,151.2093],["CAPE TOWN",-33.9249,18.4241],
] as const;
const PAIRS: readonly [number,number][] = [[0,1],[0,2],[0,5],[1,3],[1,4],[2,5],[5,6],[6,7],[6,8],[9,5],[4,9],[7,8]];
const D=Math.PI/180,TAU=2*Math.PI;
type Vec={x:number;y:number;z:number};
const VECTORS=POINTS.map(([name,lat,lon]):Vec=>({x:Math.cos(lat*D)*Math.sin(lon*D),y:Math.sin(lat*D),z:Math.cos(lat*D)*Math.cos(lon*D)}));
function rotated(v:Vec,a:number):Vec {const c=Math.cos(a),s=Math.sin(a);return {x:c*v.x+s*v.z,y:v.y,z:c*v.z-s*v.x};}
function between(a:Vec,b:Vec,t:number):Vec{
 const dot=Math.max(-1,Math.min(1,a.x*b.x+a.y*b.y+a.z*b.z)),angle=Math.acos(dot),s=Math.sin(angle);
 if(Math.abs(s)<1e-6)return a;
 const x=Math.sin((1-t)*angle)/s,y=Math.sin(t*angle)/s;
 return {x:a.x*x+b.x*y,y:a.y*x+b.y*y,z:a.z*x+b.z*y};
}
function sphere(w:number,h:number){
 const m=w<=800;
 return {x:w*(m?.51:.742),y:h*(m?.685:.515),r:m?Math.min(w*.49,h*.325,330):Math.min(w*.35,h*.67,600)};
}
function signals(ctx:CanvasRenderingContext2D,w:number,h:number,angle:number,time:number){
 ctx.clearRect(0,0,w,h);
 const {x,y,r}=sphere(w,h),mobile=w<=800;
 const project=(p:Vec,e=1.006)=>{const v=rotated(p,angle);return {x:x+v.x*r*e,y:y-v.y*r*e,z:v.z};};
 const routes=PAIRS.map(([a,b],index)=>({a,b,index,za:project(VECTORS[a]).z,zb:project(VECTORS[b]).z}))
  .filter(t=>t.za>.09&&t.zb>.09).sort((a,b)=>(b.za+b.zb)-(a.za+a.zb)).slice(0,mobile?3:4);
 const endpointIds=new Set<number>();
 for(const {a,b,index} of routes){
  endpointIds.add(a);endpointIds.add(b);
  const curve=[] as ReturnType<typeof project>[];
  for(let i=0;i<=92;i++){const t=i/92;curve.push(project(between(VECTORS[a],VECTORS[b],t),1.007+.036*Math.sin(Math.PI*t)));}
  ctx.beginPath();curve.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.strokeStyle="rgba(255,60,106,.085)";ctx.lineWidth=mobile?4:6;ctx.stroke();
  ctx.strokeStyle="rgba(255,113,147,.48)";ctx.lineWidth=mobile?.9:1.05;ctx.stroke();
  const progress=(time*(index%3===0?.16:.125)+index*.21)%1;
  for(let dir=0;dir<2;dir++){
   const t=dir===0?progress:1-progress;
   const n=Math.min(curve.length-1,Math.round(t*(curve.length-1)));
   const p=curve[n];
   ctx.save();ctx.beginPath();let started=false;
   for(let i=0;i<=12;i++){
     const k=dir===0?n-i:n+i;if(k<0||k>=curve.length)break;
     const q=curve[k];if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);
   }
   ctx.strokeStyle="rgba(255,140,166,.70)";ctx.lineWidth=mobile?1.8:2.5;ctx.shadowColor="#ff355e";ctx.shadowBlur=mobile?8:13;ctx.stroke();ctx.restore();
   const gradient=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,mobile?9:13);
   gradient.addColorStop(0,"rgba(255,245,246,.94)");gradient.addColorStop(.18,"rgba(255,125,155,.81)");
   gradient.addColorStop(.6,"rgba(245,48,91,.19)");gradient.addColorStop(1,"rgba(245,48,91,0)");
   ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,mobile?9:13,0,TAU);ctx.fill();
  }
 }
 const labels=[] as {id:number;x:number;y:number;z:number}[];
 for(const i of endpointIds){
  const p=project(VECTORS[i],1.008);if(p.z<.07)continue;
  ctx.shadowColor="#ff3c66";ctx.shadowBlur=13;ctx.fillStyle="#ffd4dd";
  ctx.beginPath();ctx.arc(p.x,p.y,mobile?2.6:3.2,0,TAU);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle="rgba(255,144,170,.66)";ctx.lineWidth=.8;
  ctx.beginPath();ctx.arc(p.x,p.y,6,0,TAU);ctx.stroke();
  labels.push({id:i,x:p.x,y:p.y,z:p.z});
 }
 const selected=[...labels.filter(p=>[0,1,2,5].includes(p.id)),...labels].filter((p,i,a)=>a.findIndex(z=>z.id===p.id)===i).slice(0,mobile?2:4);
 ctx.font=(mobile?"600 9px ":"600 10px ")+"Manrope, system-ui, sans-serif";
 ctx.textBaseline="middle";ctx.fillStyle="rgba(255,226,235,.9)";
 for(const p of selected){
  const dir=p.x>x?-1:1,ox=dir*16;
  ctx.beginPath();ctx.moveTo(p.x+dir*5,p.y-3);ctx.lineTo(p.x+ox,p.y-13);
  ctx.strokeStyle="rgba(250,145,177,.46)";ctx.lineWidth=.7;ctx.stroke();
  ctx.textAlign=dir===1?"left":"right";
  ctx.fillText(POINTS[p.id][0],p.x+ox+dir*5,p.y-17);
 }
}
function compile(gl:WebGLRenderingContext,kind:number,source:string){
 const sh=gl.createShader(kind);if(!sh)return null;
 gl.shaderSource(sh,source);gl.compileShader(sh);
 if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){gl.deleteShader(sh);return null;}
 return sh;
}
function initialize(gl:WebGLRenderingContext){
 const v=compile(gl,gl.VERTEX_SHADER,vertex),f=compile(gl,gl.FRAGMENT_SHADER,fragment);
 if(!v||!f)return null;
 const program=gl.createProgram();if(!program)return null;
 gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
 gl.deleteShader(v);gl.deleteShader(f);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
 const buffer=gl.createBuffer();if(!buffer){gl.deleteProgram(program);return null;}
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 gl.useProgram(program);
 const pos=gl.getAttribLocation(program,"aPosition");
 gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const loc=(n:string)=>gl.getUniformLocation(program,n);
 return {program,buffer,u:{resolution:loc("uResolution"),center:loc("uCenter"),radius:loc("uRadius"),rotation:loc("uRotation"),day:loc("uDay"),night:loc("uNight"),nightAvailable:loc("uNightAvailable")}};
}
function texture(gl:WebGLRenderingContext,img:HTMLImageElement,unit:number) {
 const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 return t;
}
async function photo(name:string){
 const route=name.includes("_day_")?"/api/vpn/earth/day":"/api/vpn/earth/night";
 const sources=[route,...BASES.map(base=>base+name)];
 for(const url of sources){
  try{const im=new Image();im.crossOrigin="anonymous";im.decoding="async";im.src=url;await im.decode();return im;}
  catch{/* Fall back to the next source */}
 }
 return null;
}
export function VpnCinematicEarth(){
 const holder=useRef<HTMLDivElement>(null),gpu=useRef<HTMLCanvasElement>(null),lines=useRef<HTMLCanvasElement>(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const node=holder.current,canvas=gpu.current,overlay=lines.current;
  if(!node||!canvas||!overlay)return;
  const gl=(canvas.getContext("webgl",{alpha:false,antialias:true,preserveDrawingBuffer:false,powerPreference:"high-performance"})||canvas.getContext("experimental-webgl")) as WebGLRenderingContext|null;
  const ctx=overlay.getContext("2d");
  if(!gl||!ctx)return;
  const gpuState=initialize(gl);if(!gpuState)return;
  let active=true,visible=true,raf=0,w=1,h=1,dpr=1,last=0,started=performance.now();
  let dayTex:WebGLTexture|null=null,nightTex:WebGLTexture|null=null;
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced=media.matches;
  const onMotion=()=>{reduced=media.matches;last=0;};
  const size=()=>{
   const rect=node.getBoundingClientRect();w=Math.max(rect.width,1);h=Math.max(rect.height,1);
   dpr=Math.min(window.devicePixelRatio||1,w<800?1.35:1.7);
   canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
   overlay.width=canvas.width;overlay.height=canvas.height;
   canvas.style.width=w+"px";canvas.style.height=h+"px";
   overlay.style.width=w+"px";overlay.style.height=h+"px";
   gl.viewport(0,0,canvas.width,canvas.height);ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  size();const resize=new ResizeObserver(size);resize.observe(node);
  const intersect=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{rootMargin:"160px"});
  intersect.observe(node);
  const tick=(now:number)=>{
   if(!active)return;
   if(visible&&document.visibilityState==="visible"&&dayTex&&now-last>=(w<800?40:27)){
    last=now;const seconds=reduced?0:(now-started)/1000,angle=.61+(reduced?0:seconds*.027);
    const {x,y,r}=sphere(w,h);
    gl.useProgram(gpuState.program);
    gl.uniform2f(gpuState.u.resolution,canvas.width,canvas.height);
    gl.uniform2f(gpuState.u.center,x*dpr,(h-y)*dpr);
    gl.uniform1f(gpuState.u.radius,r*dpr);
    gl.uniform1f(gpuState.u.rotation,angle);
    gl.uniform1i(gpuState.u.day,0);
    gl.uniform1i(gpuState.u.night,1);
    gl.uniform1f(gpuState.u.nightAvailable,nightTex?1:0);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,dayTex);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,nightTex||dayTex);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    signals(ctx,w,h,angle,seconds);
   }
   raf=requestAnimationFrame(tick);
  };
  const load=async()=>{
   const [day,night]=await Promise.all([photo("earth_day_4096.jpg"),photo("earth_night_4096.jpg")]);
   if(!active||!day)return;
   dayTex=texture(gl,day,0);
   if(night)nightTex=texture(gl,night,1);
   if(active){setReady(true);started=performance.now();}
  };
  media.addEventListener("change",onMotion);
  void load();raf=requestAnimationFrame(tick);
  return ()=>{
   active=false;cancelAnimationFrame(raf);
   resize.disconnect();intersect.disconnect();media.removeEventListener("change",onMotion);
   if(dayTex)gl.deleteTexture(dayTex);if(nightTex)gl.deleteTexture(nightTex);
   gl.deleteBuffer(gpuState.buffer);gl.deleteProgram(gpuState.program);
  };
 },[]);
 return <div ref={holder} className={styles.layer} aria-hidden="true">
  <div className={ready?styles.fallbackHidden:styles.fallback}><VpnGlobeBackground/></div>
  <canvas ref={gpu} className={ready?styles.gpuVisible:styles.gpuHidden}/>
  <canvas ref={lines} className={ready?styles.routesVisible:styles.routesHidden}/>
  <div className={styles.fade}/><div className={styles.vignette}/>
 </div>;
}
