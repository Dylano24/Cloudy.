import { GET as getBaseCss } from './base';

export const dynamic = 'force-dynamic';

const FINAL_VISUAL_OVERRIDES = `
/* Keep the exact 33816109 rotating red/white border, but make the card interior fully opaque and static. */
html body .cloudy-intro-card{
  --cloudy-intro-angle:0deg;
  background:
    linear-gradient(#050505,#050505) padding-box,
    conic-gradient(
      from var(--cloudy-intro-angle),
      #fff 0 8%,
      #ff4c4c 14%,
      #a60000 22%,
      #fff 34% 48%,
      #ff2c2c 58%,
      #7a0000 66%,
      #fff 78% 92%,
      #ff3b3b 100%
    ) border-box!important;
  box-shadow:
    0 0 22px rgba(255,255,255,.07),
    0 0 36px rgba(185,0,0,.26),
    0 0 72px rgba(255,30,30,.12)!important;
  filter:none!important;
  animation:cloudy-intro-spin 2.8s linear infinite!important;
}
html body .cloudy-intro-card::before,
html body .cloudy-intro-card::after{
  content:none!important;
  display:none!important;
}

/* Footer only: brighter flashy white highlights move continuously from right to left over a permanent red base. */
html body .cloudy-footer-glow{
  position:absolute!important;
  overflow:hidden!important;
  background:#ff3434!important;
  box-shadow:
    0 0 10px rgba(255,40,40,.82),
    0 0 20px rgba(255,28,28,.38),
    0 0 5px rgba(255,255,255,.20)!important;
  animation:none!important;
}
html body .cloudy-footer-glow::before{
  content:''!important;
  position:absolute!important;
  top:0!important;
  bottom:0!important;
  left:0!important;
  width:calc(100% + 620px)!important;
  display:block!important;
  pointer-events:none!important;
  background:repeating-linear-gradient(90deg,
    transparent 0px,
    transparent 132px,
    rgba(255,52,52,.22) 150px,
    rgba(255,105,105,.42) 164px,
    rgba(255,255,255,.62) 174px,
    #ffffff 184px,
    #ffffff 204px,
    rgba(255,255,255,.92) 214px,
    rgba(255,255,255,.46) 226px,
    rgba(255,70,70,.28) 242px,
    transparent 260px,
    transparent 620px
  )!important;
  background-size:620px 100%!important;
  filter:
    drop-shadow(0 0 5px rgba(255,255,255,.95))
    drop-shadow(0 0 10px rgba(255,255,255,.58))
    drop-shadow(0 0 14px rgba(255,35,35,.75))!important;
  will-change:transform!important;
  animation:cloudy-footer-right-to-left 2.8s linear infinite!important;
}
@keyframes cloudy-footer-right-to-left{
  from{transform:translate3d(0,0,0)}
  to{transform:translate3d(-620px,0,0)}
}
`;

export async function GET() {
  const response = await getBaseCss();
  const css = await response.text();
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/css; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');

  return new Response(`${css}\n${FINAL_VISUAL_OVERRIDES}`, {
    status: response.status,
    headers,
  });
}