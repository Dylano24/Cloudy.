'use client';
import { useEffect, useRef } from 'react';
export function AstraBackground(){
 const canvasRef=useRef(null);
 useEffect(()=>{
const hero=document.querySelector('.cloudy-classic-hero');if(!hero||!canvasRef.current)return;
const canvas=canvasRef.current;
const ctx=canvas.getContext('2d');if(!ctx)return;let frameId=0;
const paths=[[[0,0,0],[0.37,-0.19,0.08],[0.31,-0.45,-0.12],[-0.14,-0.58,0.16],[-0.59,-0.32,-0.1],[-0.72,0.13,0.12],[-0.46,0.58,-0.16],[0.12,0.77,0.14],[0.69,0.58,-0.08],[1.01,0.06,0.18],[0.88,-0.58,-0.14],[0.31,-1.03,0.08],[-0.53,-1.03,-0.18],[-1.23,-0.58,0.12],[-1.49,0.13,-0.08],[-1.3,0.9,0.16],[-0.65,1.47,-0.12],[0.12,1.6,0.1],[0.95,1.28,-0.16],[1.59,0.58,0.12],[1.72,-0.38,-0.1],[1.33,-1.22,0.18],[0.5,-1.73,-0.16],[-0.53,-1.67,0.12],[-1.42,-1.09,-0.08],[-1.81,-0.19,0.16],[-1.74,0.9,-0.12],[-1.49,1.86,0.1],[-0.97,2.69,-0.08],[-0.14,3.46,0.04]],[[-1.25,1.05,0.06],[-1.2,1.62,-0.08],[-0.9,2.18,0.1],[-0.4,2.66,-0.1],[0.2,3.02,0.08],[0.92,3.14,-0.06],[1.66,3.07,0.02]]],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let width,height,dpr,anchorX=0,anchorY=0,seed=27,time=0,last=0,yaw=0,pitch=0,targetYaw=0,targetPitch=0,drag=false,px=0,py=0,mx=-9999,my=-9999,pressed=false;
function rnd(){seed=seed*16807%2147483647;return(seed-1)/2147483646}
function gauss(){return Math.sqrt(-2*Math.log(Math.max(.0001,rnd())))*Math.cos(6.283185*rnd())}
function curve(path,t){const f=Math.min(.999999,Math.max(0,t))*(path.length-1),i=Math.floor(f),u=f-i;return [0,1,2].map(k=>{let a=path[Math.max(0,i-1)][k],b=path[i][k],c=path[Math.min(path.length-1,i+1)][k],d=path[Math.min(path.length-1,i+2)][k];return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)})}
const particles=Array.from({length:6200},(_,i)=>{const path=i<5500?0:1,t=rnd(),spread=.012+Math.pow(rnd(),4)*.13;return {path,t,ox:gauss()*spread,oy:gauss()*spread,oz:gauss()*.12,r:rnd()<.035?1.8+rnd()*2.4:.3+rnd()*.7,phase:rnd()*6.28,alpha:.2+rnd()*.65,dx:0,dy:0}});
const core=Array.from({length:650},()=>({x:gauss()*.085,y:gauss()*.085,z:gauss()*.12,r:.2+rnd()*1.1,a:.2+rnd()*.6}));
function resize(){let r={left:0,top:0};width=document.documentElement.clientWidth;height=innerHeight;const logo=hero.querySelector('.cloudy-classic-logo-shell img');const lr=logo?logo.getBoundingClientRect():r;anchorX=lr.left-r.left+lr.width/2;anchorY=lr.top+scrollY+lr.height/2;dpr=Math.min(4,7680/width,4320/height);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
const ro=new ResizeObserver(resize);ro.observe(hero);const logo=hero.querySelector('.cloudy-classic-logo-shell img');if(logo){ro.observe(logo);logo.addEventListener('load',resize)}addEventListener('resize',resize);resize();
canvas.onpointerdown=e=>{if(e.button!==0)return;drag=true;pressed=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true})};
canvas.onpointermove=e=>{const r=canvas.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;if(!drag)return;targetYaw+=(e.clientX-px)*.005;targetPitch+=(e.clientY-py)*.005;px=e.clientX;py=e.clientY};
canvas.onpointerup=canvas.onpointercancel=()=>{drag=pressed=false};
canvas.onpointerleave=()=>{if(!drag){mx=my=-9999}};
canvas.onkeydown=e=>{let dy=0,dx=0;switch(e.key){case'ArrowLeft':dx=-.08;break;case'ArrowRight':dx=.08;break;case'ArrowUp':dy=-.08;break;case'ArrowDown':dy=.08;break;default:return}e.preventDefault();targetYaw+=dx;targetPitch+=dy};
function frame(now){
 const dt=Math.min(.04,(now-last)/1000||0);last=now;if(!reduce)time+=dt;
 const damping=1-Math.exp(-6*dt);yaw+=(targetYaw-yaw)*damping;pitch+=(targetPitch-pitch)*damping;
 const ry=yaw+(reduce?0:Math.sin(time*.22)*.18)-.06,rx=pitch+.08+(reduce?0:Math.sin(time*.17)*.10),cz=Math.cos(-.025),sz=Math.sin(-.025),cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
 const scale=Math.min(height/2.8,width/3.2);
 ctx.clearRect(0,0,width,height);
 function project(x,y,z){let xx=x*cz-y*sz,yy=x*sz+y*cz;let zz=xx*sy+z*cy;xx=xx*cy-z*sy;let y2=yy*cx-zz*sx;zz=yy*sx+zz*cx;let f=8/(8-zz);return {x:anchorX+xx*scale*f,y:anchorY-y2*scale*f,f}}
 const glow=ctx.createRadialGradient(anchorX,anchorY,0,anchorX,anchorY,Math.max(width,height)*.65);glow.addColorStop(0,'rgba(110,5,22,.10)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 ctx.globalCompositeOperation='lighter';
 function dot(p,r,a,bright){ctx.globalAlpha=a;ctx.fillStyle=bright?'#ffc3c6':'#e82b42';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.25,r*p.f),0,6.283);ctx.fill();if(r>1.3){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*6);g.addColorStop(0,'rgba(255,95,110,.38)');g.addColorStop(.25,'rgba(230,24,50,.13)');g.addColorStop(1,'rgba(140,0,20,0)');ctx.fillStyle=g;ctx.fillRect(p.x-r*6,p.y-r*6,r*12,r*12);}}
 for(const s of particles){const t=reduce?s.t:(s.t-time*.008*.8+100)%1;const q=curve(paths[s.path],t);const p=project(q[0]+s.ox,q[1]+s.oy,q[2]*1.4+s.oz);
 let dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy),radius=85,force=d<radius?(1-d/radius)*(pressed?30:14):0;
 const tx=d>0?dx/d*force:0,ty=d>0?dy/d*force:0;s.dx+=(tx-s.dx)*Math.min(1,dt*7);s.dy+=(ty-s.dy)*Math.min(1,dt*7);p.x+=s.dx;p.y+=s.dy;
 dot(p,s.r,s.alpha*(.78+.22*Math.sin(time*.62+s.phase)),s.r>1.3)}
 for(const s of core)dot(project(s.x,s.y,s.z),s.r,s.a,true);
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';frameId=requestAnimationFrame(frame)
}frameId=requestAnimationFrame(frame);
return ()=>{cancelAnimationFrame(frameId);ro.disconnect();removeEventListener('resize',resize);if(logo)logo.removeEventListener('load',resize);};
},[]);
 return <canvas ref={canvasRef} className="cloudy-astra-background" tabIndex={0} aria-label="Drag or use arrow keys to rotate the red star field" />;
}

