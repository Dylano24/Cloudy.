import { GET as getBaseCss } from './base';

export const dynamic = 'force-dynamic';

const FINAL_VISUAL_OVERRIDES = `
/* Keep the exact 33816109 rotating red/white intro border, but remove only the pulsing/moving interior glow. */
html body .cloudy-intro-card{
  animation:cloudy-intro-spin 2.8s linear infinite!important;
  filter:none!important;
  box-shadow:
    0 0 22px rgba(255,255,255,.07),
    0 0 36px rgba(185,0,0,.26),
    0 0 72px rgba(255,30,30,.12)!important;
}

/* Footer top bar gets the same red/white flashy movement, with a permanent red base so it never resets to black. */
html body .cloudy-footer-glow{
  background:
    linear-gradient(90deg,
      transparent 0%,
      transparent 36%,
      rgba(255,255,255,.18) 42%,
      #ffffff 48%,
      #ffffff 52%,
      rgba(255,255,255,.18) 58%,
      transparent 64%,
      transparent 100%
    ) 0 0 / 360px 100% repeat-x,
    #ff3434!important;
  box-shadow:0 0 12px rgba(255,40,40,.70),0 0 9px rgba(255,255,255,.18)!important;
  animation:cloudy-footer-highlight-flow-final 2.8s linear infinite!important;
}
@keyframes cloudy-footer-highlight-flow-final{
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
