import { LAND_POINTS, LAND_COASTS } from "./globe-land";
import styles from "./vpn.module.css";

/**
 * Original Cloudy digital Earth. Natural Earth public-domain coastlines.
 * Network paths are illustrative arcs between real geographic coordinates,
 * rendered on the visible hemisphere and CLIPPED to the sphere boundary.
 * No WebGL, requestAnimationFrame, external images, or active VPN claims.
 */
const R=305, CX=350, CY=350, DEG=Math.PI/180;
const originLon=-28*DEG, originLat=14*DEG;
const sinO=Math.sin(originLat),cosO=Math.cos(originLat);

function project(lon:number,lat:number){
  const phi=lat*DEG,lam=lon*DEG-originLon;
  const sp=Math.sin(phi),cp=Math.cos(phi),sl=Math.sin(lam),cl=Math.cos(lam);
  const depth=sinO*sp+cosO*cp*cl;
  return {x:CX+R*cp*sl,y:CY-R*(cosO*sp-sinO*cp*cl),depth};
}
function round(v:number){return Math.round(v*10)/10;}
function gridLine(points:[number,number][]) {
  let path="",drawing=false,previous:{x:number;y:number}|null=null;
  for(const [lon,lat] of points){
    const p=project(lon,lat);
    if(p.depth>0.015&&(!previous||Math.hypot(p.x-previous.x,p.y-previous.y)<39)){
      path+=(drawing?"L":"M")+round(p.x)+" "+round(p.y)+" ";
      drawing=true;
    }else drawing=false;
    previous=p.depth>.015?p:null;
  }
  return path;
}
function vec(lon:number,lat:number){
  const a=lon*DEG,b=lat*DEG;
  return [Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)];
}
function route(a:[number,number],b:[number,number]){
  const av=vec(a[0],a[1]),bv=vec(b[0],b[1]);
  const dot=Math.min(1,Math.max(-1,av[0]*bv[0]+av[1]*bv[1]+av[2]*bv[2]));
  const angle=Math.acos(dot),denom=Math.sin(angle);
  const coords:[number,number][]=[];
  for(let i=0;i<=85;i++){
    const t=i/85,aa=denom<.00001?1-t:Math.sin((1-t)*angle)/denom,bb=denom<.00001?t:Math.sin(t*angle)/denom;
    const x=av[0]*aa+bv[0]*bb,y=av[1]*aa+bv[1]*bb,z=av[2]*aa+bv[2]*bb;
    coords.push([Math.atan2(y,x)/DEG,Math.atan2(z,Math.hypot(x,y))/DEG]);
  }
  return gridLine(coords);
}
const cities = [
  {name:"New York",loc:[-74.006,40.713] as [number,number]},
  {name:"Amsterdam",loc:[4.904,52.368] as [number,number]},
  {name:"London",loc:[-.128,51.507] as [number,number]},
  {name:"São Paulo",loc:[-46.633,-23.55] as [number,number]},
  {name:"Lagos",loc:[3.379,6.524] as [number,number]},
  {name:"Cape Town",loc:[18.424,-33.925] as [number,number]},
  {name:"Mexico City",loc:[-99.133,19.433] as [number,number]},
  {name:"Lisbon",loc:[-9.139,38.723] as [number,number]},
  {name:"Buenos Aires",loc:[-58.382,-34.604] as [number,number]},
  {name:"Miami",loc:[-80.192,25.762] as [number,number]},
];
const edges:[number,number][]=[[0,1],[0,2],[0,4],[3,1],[3,4],[5,2],[0,6],[6,7],[8,3],[9,5],[7,4],[3,5]];
const edgePaths=edges.map(([a,b])=>route(cities[a].loc,cities[b].loc)).filter(Boolean);
const globeDots:string[]=[];
for(let i=0;i<LAND_POINTS.length;i+=4){
  const p=project(LAND_POINTS[i],LAND_POINTS[i+1]);
  if(p.depth>.01)globeDots.push("M"+round(p.x)+" "+round(p.y)+"h"+(p.depth>.65?1.15:.75));
}
const rimDots:string[]=[];
for(let i=2;i<LAND_POINTS.length;i+=8){
 const p=project(LAND_POINTS[i],LAND_POINTS[i+1]);
 if(p.depth>.3)rimDots.push("M"+round(p.x)+" "+round(p.y)+"h.55");
}
const geographicLines = LAND_COASTS.map(coast=>{
 let d="",open=false,last:{x:number;y:number}|null=null;
 for(let i=0;i<coast.length;i+=2){
  const p=project(coast[i],coast[i+1]);
  if(p.depth>.025&&(!last||Math.hypot(p.x-last.x,p.y-last.y)<26)){
   d+=(open?"L":"M")+round(p.x)+" "+round(p.y)+" ";open=true;
  }else open=false;
  last=p.depth>.025?p:null;
 }
 return d;
}).filter(Boolean);
const graticule=[
 ...[-60,-30,0,30,60].map(lat=>gridLine(Array.from({length:181},(_,i)=>[-180+i*2,lat] as [number,number]))),
 ...[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lon=>gridLine(Array.from({length:91},(_,i)=>[lon,-90+i*2] as [number,number]))),
];

export function EarthNetwork(){
 return (
  <div className={styles.earthVisual}>
   <div className={styles.earthAura} aria-hidden="true"/>
   <svg className={styles.earthSvg} viewBox="0 0 700 700" role="img"
    aria-label="Digital red and black globe with illustrated connections between real geographic locations. Paths remain inside the Earth.">
    <defs>
      <radialGradient id="cvpn-bg" cx="30%" cy="25%" r="83%">
        <stop offset="0" stopColor="#3F101E"/>
        <stop offset=".35" stopColor="#17050D"/>
        <stop offset=".7" stopColor="#0A0308"/>
        <stop offset="1" stopColor="#020204"/>
      </radialGradient>
      <radialGradient id="cvpn-land" cx="42%" cy="31%" r="68%">
        <stop offset="0" stopColor="#FA6D8A" stopOpacity=".17"/>
        <stop offset=".4" stopColor="#C91E43" stopOpacity=".065"/>
        <stop offset="1" stopColor="#000" stopOpacity=".0"/>
      </radialGradient>
      <radialGradient id="cvpn-shade" cx="32%" cy="27%" r="80%">
        <stop offset="0" stopColor="#000" stopOpacity="0"/>
        <stop offset=".55" stopColor="#000" stopOpacity=".1"/>
        <stop offset=".8" stopColor="#000" stopOpacity=".27"/>
        <stop offset="1" stopColor="#010103" stopOpacity=".78"/>
      </radialGradient>
      <radialGradient id="cvpn-atmo" cx="50%" cy="50%" r="50%">
        <stop offset=".83" stopColor="#D21F47" stopOpacity="0"/>
        <stop offset=".945" stopColor="#E53659" stopOpacity=".08"/>
        <stop offset=".975" stopColor="#F85675" stopOpacity=".24"/>
        <stop offset="1" stopColor="#FF5476" stopOpacity=".04"/>
      </radialGradient>
      <linearGradient id="cvpn-edge" x1="9%" y1="0%" x2="87%" y2="96%">
        <stop offset="0" stopColor="#EF4D70" stopOpacity=".2"/>
        <stop offset=".23" stopColor="#FF94A5" stopOpacity=".68"/>
        <stop offset=".5" stopColor="#CC153A" stopOpacity=".29"/>
        <stop offset=".79" stopColor="#E93D60" stopOpacity=".46"/>
        <stop offset="1" stopColor="#8B1A36" stopOpacity=".09"/>
      </linearGradient>
      <linearGradient id="cvpn-route" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#AE183A"/><stop offset=".45" stopColor="#F75A7D"/><stop offset="1" stopColor="#FC8499"/>
      </linearGradient>
      <clipPath id="cvpn-clip"><circle cx={CX} cy={CY} r={R-1}/></clipPath>
      <filter id="cvpn-smallglow" x="-130%" y="-130%" width="360%" height="360%">
        <feGaussianBlur stdDeviation="3.7"/>
      </filter>
    </defs>
    <circle cx={CX} cy={CY} r={R+13} fill="#6D0C28" opacity=".06"/>
    <circle cx={CX} cy={CY} r={R+5} fill="none" stroke="#DB2451" strokeWidth="1.2" opacity=".28"/>
    <circle cx={CX} cy={CY} r={R} fill="url(#cvpn-bg)"/>
    <g clipPath="url(#cvpn-clip)">
      <circle cx={CX} cy={CY} r={R} fill="url(#cvpn-land)"/>
      {graticule.map((d,i)=><path key={"grid"+i} d={d} fill="none" stroke="#D52951" strokeOpacity=".115" strokeWidth=".65"/>)}
      <path d={globeDots.join(" ")} stroke="#FD5E7E" strokeOpacity=".58" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d={rimDots.join(" ")} stroke="#FFB0BD" strokeOpacity=".26" strokeWidth=".65" strokeLinecap="round" fill="none"/>
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {geographicLines.map((d,i)=><path key={"coast"+i} d={d} stroke="#EF4569" strokeOpacity=".55" strokeWidth={i%4===0?1.25:.9}/>)}
      </g>
      {edgePaths.map((d,i)=><path key={"soft"+i} d={d} fill="none" stroke="#EA3158" strokeOpacity=".23" strokeWidth="2.2"/>)}
      {edgePaths.map((d,i)=><path key={"thin"+i} d={d} fill="none" stroke="#FF829A" strokeOpacity=".54" strokeWidth=".9"/>)}
      {edgePaths.slice(0,7).map((d,i)=><path key={"signal"+i} d={d} fill="none" stroke="#FFC4D0" strokeWidth={2} strokeLinecap="round" strokeDasharray="7 330" className={styles.earthSignal} style={{animationDelay:-(i*1.35)+"s"}}/>)}
      <circle cx={CX} cy={CY} r={R} fill="url(#cvpn-shade)"/>
      {cities.map((city,i)=>{
        const p=project(city.loc[0],city.loc[1]);
        if(p.depth<.07)return null;
        return <g key={city.name} aria-hidden="true">
          <circle cx={p.x} cy={p.y} r={i%3===0?12:8} fill="#FA456A" opacity=".23" filter="url(#cvpn-smallglow)"/>
          <circle cx={p.x} cy={p.y} r={i%3===0?5.2:4} fill="#21060D" stroke="#FF728C" strokeWidth="1.25"/>
          <circle cx={p.x} cy={p.y} r={i%3===0?2.15:1.6} fill="#FFB4C1"/>
        </g>;
      })}
      <circle cx={CX} cy={CY} r={R} fill="url(#cvpn-atmo)"/>
    </g>
    <circle cx={CX} cy={CY} r={R} fill="none" stroke="url(#cvpn-edge)" strokeWidth="2.4"/>
    <circle cx={CX} cy={CY} r={R-4} fill="none" stroke="#FF6383" strokeOpacity=".09" strokeWidth="1.5"/>
   </svg>
  </div>
 );
}
