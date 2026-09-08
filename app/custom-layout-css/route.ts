const LEGACY_LAYOUT = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app/layout.css';

export const dynamic = 'force-dynamic';

const CLOUDY_LAYOUT_OVERRIDES = `
/* Keep the selected-game navigation balanced on desktop and mobile. */
.game-home:has(#game-panel:not([hidden])) .store-navigation{
  justify-content:center!important;
}
.game-home:has(#game-panel:not([hidden])) .store-navigation #collection-title{
  display:none!important;
}
.game-home:has(#game-panel:not([hidden])) .store-navigation .games-back{
  position:static!important;
  margin:0 auto!important;
}

/* Keep the selected game inside the server box, directly above its Discord action. */
.server-panel #server-list:has(.server-empty){
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  grid-template-rows:auto auto!important;
  align-items:center!important;
  column-gap:16px!important;
  row-gap:10px!important;
}
.server-panel #server-list:has(.server-empty)::before{
  content:'Rust';
  grid-column:2;
  grid-row:1;
  display:flex;
  align-items:center;
  justify-content:center;
  justify-self:end;
  align-self:start;
  width:max-content;
  min-height:30px;
  padding:5px 11px;
  border-radius:5px;
  background:#252525;
  color:#f5f5f5;
  font-size:12px;
  font-weight:600;
  line-height:1.3;
  white-space:nowrap;
}
.server-panel #server-list:has(.server-empty) .server-empty{
  grid-column:1;
  grid-row:1 / span 2;
  align-self:center;
}
.server-panel #server-list:has(.server-empty) .outline-button{
  grid-column:2;
  grid-row:2;
  justify-self:stretch!important;
  margin:0!important;
}

@media(max-width:520px){
  .server-panel #server-list:has(.server-empty){
    grid-template-columns:minmax(0,1fr) auto!important;
    column-gap:12px!important;
    row-gap:8px!important;
  }
  .server-panel #server-list:has(.server-empty)::before{
    min-height:28px;
    padding:4px 9px;
    font-size:12px;
  }
  .server-panel #server-list:has(.server-empty) .outline-button{
    padding:9px 12px!important;
    font-size:13px!important;
  }
}

/* Premium Cloudy silver-cloud atmosphere — background only. */
body{
  background:#070707!important;
}
.site-clouds{
  position:fixed!important;
  inset:0!important;
  z-index:-1!important;
  display:block!important;
  overflow:hidden!important;
  pointer-events:none!important;
  background:
    radial-gradient(ellipse at 50% -8%,rgba(255,255,255,.055),transparent 42%),
    radial-gradient(ellipse at 12% 62%,rgba(255,255,255,.025),transparent 36%),
    radial-gradient(ellipse at 88% 72%,rgba(210,216,220,.03),transparent 39%),
    linear-gradient(180deg,#080808 0%,#090909 42%,#070707 100%)!important;
  isolation:isolate!important;
}
.site-clouds::before{
  content:'';
  position:absolute;
  inset:-18%;
  z-index:2;
  pointer-events:none;
  background:
    radial-gradient(ellipse at 18% 42%,rgba(255,255,255,.070) 0 8%,rgba(228,232,235,.036) 18%,transparent 42%),
    radial-gradient(ellipse at 52% 22%,rgba(248,248,248,.055) 0 7%,rgba(220,224,228,.028) 18%,transparent 40%),
    radial-gradient(ellipse at 82% 55%,rgba(255,255,255,.060) 0 7%,rgba(220,224,228,.026) 17%,transparent 39%);
  filter:blur(42px);
  opacity:.72;
  animation:cloudy-silver-veil 36s cubic-bezier(.45,.05,.55,.95) infinite alternate;
  will-change:transform,opacity;
}
.site-clouds::after{
  content:'';
  position:absolute;
  inset:0;
  z-index:5;
  pointer-events:none;
  background:
    linear-gradient(110deg,transparent 18%,rgba(255,255,255,.022) 46%,transparent 72%),
    radial-gradient(ellipse at 50% 35%,transparent 0 38%,rgba(0,0,0,.13) 76%,rgba(0,0,0,.32) 100%),
    repeating-radial-gradient(circle at 40% 35%,rgba(255,255,255,.010) 0 1px,transparent 1px 4px);
  mix-blend-mode:screen;
  opacity:.55;
  animation:cloudy-light-sweep 24s ease-in-out infinite alternate;
}
.cloud-layer{
  position:absolute!important;
  display:block!important;
  pointer-events:none!important;
  background-image:none!important;
  background-repeat:no-repeat!important;
  filter:blur(54px)!important;
  transform:translate3d(0,0,0);
  will-change:transform,opacity;
}
.cloud-layer-far{
  inset:-26% -22%!important;
  z-index:1!important;
  opacity:.54!important;
  background:
    radial-gradient(ellipse at 8% 28%,rgba(246,248,250,.19) 0 7%,rgba(208,214,218,.075) 17%,transparent 37%),
    radial-gradient(ellipse at 27% 58%,rgba(255,255,255,.16) 0 8%,rgba(220,224,228,.065) 19%,transparent 41%),
    radial-gradient(ellipse at 52% 34%,rgba(238,241,243,.17) 0 7%,rgba(207,213,218,.065) 18%,transparent 38%),
    radial-gradient(ellipse at 74% 70%,rgba(255,255,255,.145) 0 7%,rgba(216,220,224,.055) 18%,transparent 39%),
    radial-gradient(ellipse at 94% 38%,rgba(240,242,244,.13) 0 6%,rgba(210,216,220,.05) 17%,transparent 36%)!important;
  animation:cloudy-silver-far 52s cubic-bezier(.45,.05,.55,.95) infinite alternate!important;
}
.cloud-layer-near{
  inset:-30% -30%!important;
  z-index:3!important;
  opacity:.30!important;
  background:
    radial-gradient(ellipse at 14% 72%,rgba(255,255,255,.17) 0 6%,rgba(225,229,232,.07) 16%,transparent 34%),
    radial-gradient(ellipse at 38% 24%,rgba(245,247,249,.14) 0 6%,rgba(212,218,222,.055) 16%,transparent 34%),
    radial-gradient(ellipse at 64% 58%,rgba(255,255,255,.18) 0 6%,rgba(225,229,232,.066) 17%,transparent 35%),
    radial-gradient(ellipse at 88% 24%,rgba(244,246,248,.13) 0 6%,rgba(210,216,220,.05) 15%,transparent 33%)!important;
  filter:blur(68px)!important;
  mix-blend-mode:screen!important;
  animation:cloudy-silver-near 34s cubic-bezier(.45,.05,.55,.95) infinite alternate!important;
}
@keyframes cloudy-silver-far{
  0%{transform:translate3d(-5%,-2%,0) scale(1.04) rotate(-.2deg)}
  48%{transform:translate3d(1.5%,2.5%,0) scale(1.10) rotate(.15deg)}
  100%{transform:translate3d(6%,-1%,0) scale(1.15) rotate(-.1deg)}
}
@keyframes cloudy-silver-near{
  0%{transform:translate3d(5%,4%,0) scale(1.13) rotate(.2deg)}
  52%{transform:translate3d(-1%,-2%,0) scale(1.06) rotate(-.15deg)}
  100%{transform:translate3d(-6%,2%,0) scale(1.12) rotate(.1deg)}
}
@keyframes cloudy-silver-veil{
  0%{transform:translate3d(-3%,1%,0) scale(1.05);opacity:.58}
  100%{transform:translate3d(4%,-2%,0) scale(1.12);opacity:.80}
}
@keyframes cloudy-light-sweep{
  0%{transform:translate3d(-2%,0,0);opacity:.42}
  100%{transform:translate3d(2%,0,0);opacity:.62}
}
@media(max-width:780px){
  .cloud-layer-far{inset:-28% -48%!important;opacity:.48!important}
  .cloud-layer-near{inset:-32% -50%!important;opacity:.25!important}
  .site-clouds::before{inset:-24% -36%;filter:blur(38px);opacity:.62}
  .site-clouds::after{opacity:.45}
}
@media(max-width:480px){
  .cloud-layer-far{opacity:.44!important}
  .cloud-layer-near{opacity:.22!important}
  .site-clouds::before{opacity:.57}
}
@media(prefers-reduced-motion:reduce){
  .cloud-layer-far,.cloud-layer-near,.site-clouds::before,.site-clouds::after{
    animation:none!important;
    transform:none!important;
    will-change:auto!important;
  }
}
`;

export async function GET() {
  try {
    const response = await fetch(LEGACY_LAYOUT, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy layout returned ${response.status}`);

    const css = await response.text();
    return new Response(`${css}\n${CLOUDY_LAYOUT_OVERRIDES}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[CloudyLayout] Failed to load layout CSS', error);
    return new Response(CLOUDY_LAYOUT_OVERRIDES, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  }
}
