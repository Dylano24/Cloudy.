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

/* Company introduction callout: faster animated white/red border with luxury glow. */
@property --cloudy-intro-angle{
  syntax:'<angle>';
  inherits:false;
  initial-value:0deg;
}
.game-home::before{
  --cloudy-intro-angle:0deg;
  content:'Cloudy Inc. is a gaming company focused on developing and operating within the gaming industry, currently starting with Rust game servers, alongside digital products and services, a dedicated website, and a community that bring our services and platform together.';
  display:block;
  width:min(920px,calc(100% - 32px));
  margin:8px auto 34px;
  padding:24px 34px;
  box-sizing:border-box;
  border:1px solid transparent;
  border-radius:16px;
  background:
    linear-gradient(rgba(7,7,7,.96),rgba(7,7,7,.96)) padding-box,
    conic-gradient(
      from var(--cloudy-intro-angle),
      rgba(255,255,255,.96) 0deg,
      rgba(255,255,255,.98) 36deg,
      rgba(255,70,70,.98) 88deg,
      rgba(190,0,0,1) 132deg,
      rgba(255,255,255,.96) 205deg,
      rgba(255,110,110,.96) 272deg,
      rgba(255,255,255,.96) 360deg
    ) border-box;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.035),
    0 0 20px rgba(255,255,255,.07),
    0 0 30px rgba(185,0,0,.22),
    0 0 54px rgba(255,32,32,.13),
    inset 0 1px rgba(255,255,255,.045);
  color:#c5c5c9;
  font-size:16px;
  font-weight:400;
  line-height:1.6;
  text-align:center;
  letter-spacing:0;
  white-space:normal;
  animation:cloudy-intro-spin 2.8s linear infinite,cloudy-intro-flash 1.45s ease-in-out infinite;
}
@keyframes cloudy-intro-spin{
  to{--cloudy-intro-angle:360deg}
}
@keyframes cloudy-intro-flash{
  0%,100%{
    box-shadow:
      0 0 0 1px rgba(255,255,255,.035),
      0 0 20px rgba(255,255,255,.07),
      0 0 30px rgba(185,0,0,.22),
      0 0 54px rgba(255,32,32,.13),
      inset 0 1px rgba(255,255,255,.045);
  }
  50%{
    box-shadow:
      0 0 0 1px rgba(255,255,255,.07),
      0 0 26px rgba(255,255,255,.12),
      0 0 42px rgba(220,0,0,.32),
      0 0 72px rgba(255,45,45,.20),
      inset 0 1px rgba(255,255,255,.07);
  }
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
    width:calc(100% - 20px);
    margin:4px auto 26px;
    padding:18px 18px;
    border-radius:13px;
    font-size:14px;
    line-height:1.55;
  }
}

/* Game-neutral homepage atmosphere. Higher specificity intentionally overrides the inline cinematic Rust background. */
html body .site-clouds{
  background:
    linear-gradient(180deg,rgba(2,2,3,.90) 0%,rgba(4,4,5,.94) 36%,rgba(3,3,4,.97) 72%,#020202 100%),
    linear-gradient(90deg,rgba(0,0,0,.52),rgba(255,255,255,.012) 34%,rgba(255,255,255,.012) 66%,rgba(0,0,0,.52))!important;
  background-color:#020202!important;
}
html body .site-clouds::before{
  content:''!important;
  position:absolute!important;
  inset:-14%!important;
  pointer-events:none!important;
  background:
    radial-gradient(ellipse at 8% 20%,rgba(240,242,244,.08) 0%,rgba(165,169,173,.025) 30%,transparent 58%),
    radial-gradient(ellipse at 31% 38%,rgba(225,228,231,.065) 0%,rgba(150,154,158,.022) 31%,transparent 59%),
    radial-gradient(ellipse at 58% 21%,rgba(245,246,247,.055) 0%,rgba(165,168,172,.020) 30%,transparent 57%),
    radial-gradient(ellipse at 82% 36%,rgba(226,229,232,.07) 0%,rgba(153,157,161,.022) 31%,transparent 60%),
    radial-gradient(ellipse at 21% 79%,rgba(220,223,226,.055) 0%,rgba(145,149,153,.018) 30%,transparent 59%),
    radial-gradient(ellipse at 51% 81%,rgba(236,238,240,.06) 0%,rgba(157,161,165,.020) 30%,transparent 58%),
    radial-gradient(ellipse at 86% 76%,rgba(222,225,228,.055) 0%,rgba(148,152,156,.018) 30%,transparent 60%)!important;
  filter:blur(46px)!important;
  opacity:.54!important;
  animation:cloudy-neutral-drift 64s ease-in-out infinite alternate!important;
}
html body .cloud-layer-far{
  display:block!important;
  inset:-24%!important;
  opacity:.22!important;
  filter:blur(58px)!important;
  mix-blend-mode:screen!important;
  background:
    radial-gradient(ellipse at 12% 30%,rgba(255,255,255,.09) 0%,rgba(190,194,198,.025) 30%,transparent 58%),
    radial-gradient(ellipse at 39% 18%,rgba(230,232,234,.07) 0%,rgba(170,174,178,.020) 31%,transparent 58%),
    radial-gradient(ellipse at 68% 31%,rgba(248,249,250,.06) 0%,rgba(176,180,184,.018) 30%,transparent 57%),
    radial-gradient(ellipse at 92% 20%,rgba(232,234,236,.055) 0%,rgba(168,172,176,.016) 30%,transparent 59%)!important;
  animation:cloudy-neutral-far 72s ease-in-out infinite alternate!important;
}
html body .cloud-layer-near{
  display:block!important;
  inset:-28%!important;
  opacity:.10!important;
  filter:blur(76px)!important;
  mix-blend-mode:screen!important;
  background:
    radial-gradient(ellipse at 17% 78%,rgba(255,255,255,.08) 0%,rgba(190,194,198,.020) 30%,transparent 58%),
    radial-gradient(ellipse at 52% 72%,rgba(232,234,236,.065) 0%,rgba(170,174,178,.018) 31%,transparent 60%),
    radial-gradient(ellipse at 86% 76%,rgba(244,245,246,.055) 0%,rgba(176,180,184,.016) 30%,transparent 59%)!important;
  animation:cloudy-neutral-near 84s ease-in-out infinite alternate!important;
}
html body .site-clouds::after{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  pointer-events:none!important;
  background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.08) 34%,rgba(0,0,0,.12) 68%,rgba(0,0,0,.44) 100%)!important;
}
html body .cloudy-cinematic-hero::before{
  content:none!important;
  display:none!important;
  background:none!important;
  box-shadow:none!important;
}
@keyframes cloudy-neutral-drift{
  from{transform:translate3d(-2.2%,-1%,0) scale(1.03)}
  to{transform:translate3d(2.6%,1.4%,0) scale(1.07)}
}
@keyframes cloudy-neutral-far{
  from{transform:translate3d(-2.5%,-1%,0) scale(1.04)}
  to{transform:translate3d(3%,1.5%,0) scale(1.08)}
}
@keyframes cloudy-neutral-near{
  from{transform:translate3d(2.2%,1.2%,0) scale(1.06)}
  to{transform:translate3d(-2.7%,-1%,0) scale(1.03)}
}
@media(max-width:780px){
  html body .cloud-layer-far{inset:-32% -52%!important;opacity:.18!important;filter:blur(50px)!important}
  html body .cloud-layer-near{inset:-34% -56%!important;opacity:.08!important;filter:blur(66px)!important}
}
@media(prefers-reduced-motion:reduce){
  .game-home::before,html body .site-clouds::before,html body .cloud-layer-far,html body .cloud-layer-near{animation:none!important;transform:none!important;will-change:auto!important}
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
