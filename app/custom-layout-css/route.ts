import { GET as getBaseCss } from './base';

export const dynamic = 'force-dynamic';

const FINAL_VISUAL_OVERRIDES = `
/* Keep the exact 33816109 intro border and its rotation, but stop the extra pulse/glow animation inside the card. */
html body .cloudy-intro-card{
  animation:cloudy-intro-spin 2.8s linear infinite!important;
  filter:none!important;
}

/* Make the footer bar use the same red/white palette and motion feel as the intro border. */
html body .cloudy-footer-glow{
  background:linear-gradient(90deg,
    #ffffff 0% 8%,
    #ff4c4c 14%,
    #a60000 22%,
    #ffffff 34% 48%,
    #ff2c2c 58%,
    #7a0000 66%,
    #ffffff 78% 92%,
    #ff3b3b 100%
  ) 0 0 / 420px 100% repeat-x!important;
  box-shadow:0 0 12px rgba(255,40,40,.70)!important;
  animation:cloudy-footer-match-intro 2.8s linear infinite!important;
}
@keyframes cloudy-footer-match-intro{
  from{background-position:0 0}
  to{background-position:420px 0}
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