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

/* Background only: neutral monochrome CSS clouds. No external image asset. */
.site-clouds{
  background:#070707!important;
}
.cloud-layer-far{
  display:block!important;
  inset:-20%!important;
  opacity:.78!important;
  filter:blur(34px)!important;
  mix-blend-mode:normal!important;
  background:
    radial-gradient(42% 23% at 8% 21%,rgba(245,246,247,.16) 0 26%,rgba(184,188,191,.07) 42%,transparent 67%),
    radial-gradient(34% 22% at 28% 31%,rgba(222,225,227,.13) 0 28%,rgba(170,174,178,.055) 47%,transparent 70%),
    radial-gradient(39% 24% at 51% 18%,rgba(242,243,244,.12) 0 24%,rgba(180,184,188,.05) 46%,transparent 69%),
    radial-gradient(36% 25% at 73% 37%,rgba(226,229,231,.14) 0 27%,rgba(173,177,181,.06) 47%,transparent 71%),
    radial-gradient(38% 24% at 94% 23%,rgba(241,242,243,.13) 0 25%,rgba(177,181,184,.055) 46%,transparent 68%),
    radial-gradient(44% 27% at 17% 74%,rgba(214,218,221,.11) 0 24%,rgba(154,159,164,.045) 48%,transparent 71%),
    radial-gradient(42% 26% at 47% 82%,rgba(236,238,240,.12) 0 25%,rgba(168,173,177,.05) 47%,transparent 70%),
    radial-gradient(45% 27% at 83% 73%,rgba(219,223,226,.13) 0 24%,rgba(159,164,168,.05) 48%,transparent 72%)!important;
  background-color:#070707!important;
  animation:cloudy-bank-drift 50s ease-in-out infinite alternate!important;
  will-change:transform;
}
.cloud-layer-near{
  display:block!important;
  inset:-24%!important;
  opacity:.34!important;
  filter:blur(52px)!important;
  mix-blend-mode:normal!important;
  background:
    radial-gradient(33% 20% at 16% 48%,rgba(255,255,255,.18) 0 25%,rgba(196,199,202,.07) 44%,transparent 68%),
    radial-gradient(30% 19% at 38% 61%,rgba(232,234,236,.15) 0 26%,rgba(181,185,188,.06) 45%,transparent 69%),
    radial-gradient(35% 21% at 62% 45%,rgba(249,250,250,.16) 0 24%,rgba(190,194,197,.065) 44%,transparent 68%),
    radial-gradient(32% 20% at 86% 59%,rgba(226,229,231,.14) 0 25%,rgba(170,175,179,.055) 46%,transparent 70%)!important;
  background-color:transparent!important;
  animation:cloudy-bank-drift-near 64s ease-in-out infinite alternate!important;
  will-change:transform;
}
.site-clouds::after{
  content:'';
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.06) 36%,rgba(0,0,0,.08) 68%,rgba(0,0,0,.30) 100%),
    radial-gradient(circle at 50% 44%,transparent 0 38%,rgba(0,0,0,.12) 72%,rgba(0,0,0,.28) 100%);
}
@keyframes cloudy-bank-drift{
  from{transform:translate3d(-3%,-1.5%,0) scale(1.05)}
  to{transform:translate3d(3.5%,2%,0) scale(1.09)}
}
@keyframes cloudy-bank-drift-near{
  from{transform:translate3d(3%,2%,0) scale(1.08)}
  to{transform:translate3d(-3.5%,-1.5%,0) scale(1.04)}
}
@media(max-width:780px){
  .cloud-layer-far{inset:-28% -48%!important;opacity:.68!important;filter:blur(30px)!important}
  .cloud-layer-near{inset:-30% -52%!important;opacity:.27!important;filter:blur(44px)!important}
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
