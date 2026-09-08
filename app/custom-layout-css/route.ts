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

/* Footer: permanent red base with a clearly moving white highlight, seamless with no black reset gap. */
html body .cloudy-footer-glow{
  position:absolute!important;
  overflow:hidden!important;
  background:#ff3434!important;
  box-shadow:0 0 12px rgba(255,40,40,.70)!important;
  animation:none!important;
}
html body .cloudy-footer-glow::before{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  display:block!important;
  pointer-events:none!important;
  background:repeating-linear-gradient(90deg,
    transparent 0px,
    transparent 132px,
    rgba(255,255,255,.22) 138px,
    #ffffff 146px,
    #ffffff 154px,
    rgba(255,255,255,.22) 162px,
    transparent 168px,
    transparent 360px
  )!important;
  background-size:360px 100%!important;
  will-change:background-position!important;
  animation:cloudy-footer-sweep-fixed 2.8s linear infinite!important;
}
@keyframes cloudy-footer-sweep-fixed{
  from{background-position:0 0}
  to{background-position:360px 0}
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