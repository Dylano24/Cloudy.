const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
const DISCORD_EMOJI_URL = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=96&quality=lossless';

export const dynamic = 'force-dynamic';

function updateHomeNavigation(html: string) {
  const navigation = `<div class="top-links policy-top-links"><a class="is-active" href="/" aria-current="page">Home</a><a href="/#server">Server</a><a href="/appeal">Appeal form</a></div>`;
  return html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div>/, navigation);
}

function updateHomeDiscordEmoji(html: string) {
  return html.replace(
    /(<a class="discord-link"[\s\S]*?<span class="discord-icon" aria-hidden="true">)[\s\S]*?(<\/span><span><strong>Discord<\/strong><small>Join us<\/small><\/span><\/a>)/,
    `$1<img class="discord-custom-emoji" src="${DISCORD_EMOJI_URL}" alt="">$2`,
  );
}

function updateHomeLegalLinks(html: string) {
  return html
    .replace(/<a href="\/legal#privacy">Privacy Policy<\/a>/g, '')
    .replace(/<a href="\/legal#notice">Legal Notice<\/a>/g, '')
    .replace(/Terms of Service/g, 'Terms of service')
    .replace(/Terms of Sale/g, 'Terms of sale');
}

function replaceHomeFooter(html: string) {
  const footer = `<footer class="cloudy-shared-footer">
    <div class="cloudy-shared-footer-inner">
      <div class="cloudy-shared-footer-grid">
        <div class="cloudy-shared-footer-brand"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="Cloudy" width="45" height="45"><strong>CLOUDY INC.</strong></div>
        <div><div class="cloudy-shared-footer-title">Navigation</div><div class="cloudy-shared-footer-links"><a href="/">Home</a><a href="/#server">Server</a></div></div>
        <div><div class="cloudy-shared-footer-title">Community</div><div class="cloudy-shared-footer-links"><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Discord</a></div></div>
        <div><div class="cloudy-shared-footer-title">Information</div><div class="cloudy-shared-footer-links"><a href="/appeal">Appeal form</a><a href="/legal#terms">Terms of service</a><a href="/legal#sales">Terms of sale</a></div></div>
      </div>
      <div class="cloudy-shared-footer-bottom">© 2026 Cloudy Inc. All rights reserved.</div>
    </div>
  </footer>`;
  return html.replace(/<footer[\s\S]*?<\/footer>/, footer);
}

function injectHomeStyles(html: string) {
  const styles = `<style>
.reference-topbar{position:relative;min-height:78px;display:flex;align-items:center;justify-content:center!important;border:0!important;border-radius:0!important;background:#080808!important;box-shadow:none!important}
.reference-topbar .policy-top-links{display:flex!important;align-items:center;justify-content:center;gap:4px!important;margin:0 auto!important;padding:0!important;border:0!important;background:transparent!important}
.reference-topbar .policy-top-links a{position:relative;padding:11px 15px!important;border-radius:9px;color:#9b9b9b!important;background:transparent!important;font-size:11px!important;font-weight:850!important;letter-spacing:.09em!important;text-transform:none!important;transition:.2s ease!important}
.reference-topbar .policy-top-links a:hover,.reference-topbar .policy-top-links a.is-active{color:#fff!important;background:#181818!important}
.reference-topbar .policy-top-links a.is-active:after{content:"";position:absolute;left:14px;right:14px;bottom:3px;height:1px;background:#f0f0f0;box-shadow:0 0 8px rgba(255,255,255,.18)}
.reference-topbar .top-actions{position:absolute;right:0;display:flex;align-items:center}
.discord-link .discord-icon{display:grid;place-items:center;overflow:hidden;background:#000!important;border-radius:50%!important}
.discord-link .discord-custom-emoji{width:30px;height:30px;display:block;object-fit:contain}
.cloudy-shared-footer{background:#080808!important;border-top:1px solid #1f1f1f!important;color:#9f9f9f!important}
.cloudy-shared-footer-inner{width:min(1320px,calc(100% - 36px));margin:0 auto;padding:48px 0 30px}
.cloudy-shared-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:54px;align-items:start}
.cloudy-shared-footer-brand{display:flex;align-items:center;gap:12px;color:#f3f3f3}
.cloudy-shared-footer-brand img{width:45px;height:45px;object-fit:contain}
.cloudy-shared-footer-brand strong{font-size:16px;font-weight:900;letter-spacing:.04em}
.cloudy-shared-footer-title{margin-bottom:16px;color:#a6a6a6;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.cloudy-shared-footer-links{display:flex;flex-direction:column;gap:12px}
.cloudy-shared-footer-links a{color:#9f9f9f!important;font-size:14px;text-decoration:none}
.cloudy-shared-footer-links a:hover{color:#fff!important}
.cloudy-shared-footer-bottom{margin-top:42px;padding-top:24px;border-top:1px solid #1f1f1f;color:#8d8d8d;font-size:13px}
@media(max-width:760px){
.reference-topbar{justify-content:flex-start!important;overflow-x:auto}.reference-topbar .policy-top-links{justify-content:flex-start;margin:0!important}.reference-topbar .top-actions{display:none}.reference-topbar .policy-top-links a{padding:10px 11px!important;font-size:10px!important}
.cloudy-shared-footer-inner{width:calc(100% - 40px);padding:40px 0 34px}
.cloudy-shared-footer-grid{grid-template-columns:1fr;gap:34px}
.cloudy-shared-footer-brand{margin-bottom:4px}
.cloudy-shared-footer-title{margin-bottom:14px}
.cloudy-shared-footer-bottom{margin-top:36px}
}
</style>`;
  return html.replace('</head>', `${styles}</head>`);
}

export async function GET() {
  try {
    const response = await fetch(`${LEGACY_SITE}/`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy home returned ${response.status}`);

    let html = await response.text();
    html = updateHomeNavigation(html);
    html = updateHomeDiscordEmoji(html);
    html = updateHomeLegalLinks(html);
    html = replaceHomeFooter(html);
    html = injectHomeStyles(html);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[LegacyHome] Failed to load restored storefront', error);
    return new Response('Cloudy is temporarily unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
