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

/* Company introduction: text only, before game selection. */
.game-home::before{
  content:'Cloudy Inc. is a gaming company focused on developing and operating within the gaming industry, currently starting with Rust game servers, alongside digital products and services, a dedicated website, and a community that bring our services and platform together.';
  display:block;
  width:min(760px,100%);
  margin:4px auto 28px;
  color:#a9a9ad;
  font-size:16px;
  font-weight:400;
  line-height:1.55;
  text-align:center;
  letter-spacing:0;
  white-space:normal;
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
  .game-home::before{
    width:100%;
    margin:2px auto 24px;
    padding:0 14px;
    box-sizing:border-box;
    font-size:14px;
    line-height:1.55;
  }
}

/* Background only: neutral monochrome CSS clouds. No image asset, no oval/vignette shapes. */
.site-clouds{
  background:#070707!important;
}
.cloud-layer-far{
  display:block!important;
  inset:-20%!important;
  opacity:.72!important;
  filter:blur(42px)!important;
  mix-blend-mode:normal!important;
  background:
    radial-gradient(ellipse at 8% 18%,rgba(245,246,247,.14) 0%,rgba(180,184,188,.06) 28%,transparent 55%),
    radial-gradient(ellipse at 31% 34%,rgba(225,228,230,.11) 0%,rgba(164,169,173,.045) 30%,transparent 57%),
    radial-gradient(ellipse at 55% 20%,rgba(242,243,244,.10) 0%,rgba(174,178,182,.04) 29%,transparent 56%),
    radial-gradient(ellipse at 79% 35%,rgba(229,232,234,.12) 0%,rgba(168,173,177,.05) 30%,transparent 58%),
    radial-gradient(ellipse at 96% 17%,rgba(242,243,244,.10) 0%,rgba(172,176,180,.04) 28%,transparent 55%),
    radial-gradient(ellipse at 19% 78%,rgba(218,221,224,.09) 0%,rgba(151,156,161,.035) 30%,transparent 58%),
    radial-gradient(ellipse at 50% 82%,rgba(236,238,240,.10) 0%,rgba(163,168,172,.04) 30%,transparent 57%),
    radial-gradient(ellipse at 84% 76%,rgba(222,226,229,.10) 0%,rgba(155,160,165,.04) 30%,transparent 59%)!important;
  background-color:#070707!important;
  animation:cloudy-bank-drift 56s ease-in-out infinite alternate!important;
  will-change:transform;
}
.cloud-layer-near{
  display:block!important;
  inset:-24%!important;
  opacity:.25!important;
  filter:blur(60px)!important;
  mix-blend-mode:normal!important;
  background:
    radial-gradient(ellipse at 14% 48%,rgba(255,255,255,.14) 0%,rgba(193,197,200,.055) 28%,transparent 56%),
    radial-gradient(ellipse at 40% 63%,rgba(234,236,238,.12) 0%,rgba(177,181,185,.045) 29%,transparent 57%),
    radial-gradient(ellipse at 66% 45%,rgba(248,249,249,.13) 0%,rgba(186,190,194,.05) 28%,transparent 56%),
    radial-gradient(ellipse at 89% 60%,rgba(228,231,233,.11) 0%,rgba(166,171,175,.04) 29%,transparent 58%)!important;
  background-color:transparent!important;
  animation:cloudy-bank-drift-near 68s ease-in-out infinite alternate!important;
  will-change:transform;
}
.site-clouds::after{
  content:'';
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(180deg,rgba(0,0,0,.20) 0%,rgba(0,0,0,.04) 42%,rgba(0,0,0,.07) 68%,rgba(0,0,0,.24) 100%)!important;
}
@keyframes cloudy-bank-drift{
  from{transform:translate3d(-2.5%,-1%,0) scale(1.04)}
  to{transform:translate3d(3%,1.8%,0) scale(1.08)}
}
@keyframes cloudy-bank-drift-near{
  from{transform:translate3d(2.5%,1.5%,0) scale(1.07)}
  to{transform:translate3d(-3%,-1%,0) scale(1.04)}
}
@media(max-width:780px){
  .cloud-layer-far{inset:-28% -48%!important;opacity:.62!important;filter:blur(36px)!important}
  .cloud-layer-near{inset:-30% -52%!important;opacity:.20!important;filter:blur(50px)!important}
}
@media(prefers-reduced-motion:reduce){
  .cloud-layer-far,.cloud-layer-near{animation:none!important;transform:none!important;will-change:auto!important}
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
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[CloudyLayout] Failed to load layout CSS', error);
    return new Response(CLOUDY_LAYOUT_OVERRIDES, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }
}
