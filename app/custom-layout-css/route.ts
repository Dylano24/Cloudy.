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

/* Background only: actual silver cloud texture, darkened to match the current site. */
.site-clouds{
  background:#060606!important;
}
.cloud-layer-far{
  inset:-10%!important;
  opacity:.76!important;
  filter:brightness(.72) contrast(1.06)!important;
  background-image:url('/assets/cloudy-silver-clouds.png')!important;
  background-repeat:no-repeat!important;
  background-size:cover!important;
  background-position:50% 48%!important;
  animation:cloudy-real-drift 46s ease-in-out infinite alternate!important;
}
.cloud-layer-near{
  display:block!important;
  inset:-18%!important;
  opacity:.24!important;
  filter:blur(2px) brightness(.68)!important;
  mix-blend-mode:screen!important;
  background-image:url('/assets/cloudy-silver-clouds.png')!important;
  background-repeat:no-repeat!important;
  background-size:cover!important;
  background-position:18% 78%!important;
  animation:cloudy-real-drift-near 58s ease-in-out infinite alternate!important;
}
.site-clouds::after{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse at 50% 30%,transparent 0%,rgba(0,0,0,.12) 48%,rgba(0,0,0,.42) 100%),linear-gradient(180deg,rgba(0,0,0,.20),rgba(0,0,0,.10) 45%,rgba(0,0,0,.28));
}
@keyframes cloudy-real-drift{
  from{transform:translate3d(-2%,1%,0) scale(1.04)}
  to{transform:translate3d(3%,-2%,0) scale(1.10)}
}
@keyframes cloudy-real-drift-near{
  from{transform:translate3d(4%,3%,0) scale(1.12)}
  to{transform:translate3d(-4%,-2%,0) scale(1.05)}
}
@media(max-width:780px){
  .cloud-layer-far{inset:-12% -34%!important;opacity:.66!important;background-position:38% 50%!important}
  .cloud-layer-near{inset:-20% -38%!important;opacity:.18!important;background-position:24% 76%!important}
}
@media(prefers-reduced-motion:reduce){
  .cloud-layer-far,.cloud-layer-near{animation:none!important;transform:none!important}
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
