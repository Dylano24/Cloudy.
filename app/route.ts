const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_EMOJI_URL = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=96&quality=lossless';

export const dynamic = 'force-dynamic';

function updateHomeNavigation(html: string) {
  const navigation = `<div class="top-links policy-top-links"><a class="is-active" href="/" aria-current="page">Home</a><a href="/#server">Server</a><a href="/appeal">Appeal Form</a></div>`;
  return html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div>/, navigation);
}

function updateHomeDiscordEmoji(html: string) {
  return html.replace(
    /(<a class="discord-link"[\s\S]*?<span class="discord-icon" aria-hidden="true">)[\s\S]*?(<\/span><span><strong>Discord<\/strong><small>Join us<\/small><\/span><\/a>)/,
    `$1<img class="discord-custom-emoji" src="${DISCORD_EMOJI_URL}" alt="">$2`,
  );
}

function injectHomeStyles(html: string) {
  const styles = `<style>
.reference-topbar{position:relative;min-height:78px;display:flex;align-items:center;justify-content:center!important;border:0!important;border-radius:0!important;background:#080808!important;box-shadow:none!important}
.reference-topbar .policy-top-links{display:flex!important;align-items:center;justify-content:center;gap:4px!important;margin:0 auto!important;padding:0!important;border:0!important;background:transparent!important}
.reference-topbar .policy-top-links a{position:relative;padding:11px 15px!important;border-radius:9px;color:#9b9b9b!important;background:transparent!important;font-size:11px!important;font-weight:850!important;letter-spacing:.09em!important;text-transform:uppercase!important;transition:.2s ease!important}
.reference-topbar .policy-top-links a:hover,.reference-topbar .policy-top-links a.is-active{color:#fff!important;background:#181818!important}
.reference-topbar .policy-top-links a.is-active:after{content:"";position:absolute;left:14px;right:14px;bottom:3px;height:1px;background:#f0f0f0;box-shadow:0 0 8px rgba(255,255,255,.18)}
.reference-topbar .top-actions{position:absolute;right:0;display:flex;align-items:center}
.discord-link .discord-icon{display:grid;place-items:center;overflow:hidden;background:#000!important;border-radius:50%!important}
.discord-link .discord-custom-emoji{width:30px;height:30px;display:block;object-fit:contain}
@media(max-width:760px){.reference-topbar{justify-content:flex-start!important;overflow-x:auto}.reference-topbar .policy-top-links{justify-content:flex-start;margin:0!important}.reference-topbar .top-actions{display:none}.reference-topbar .policy-top-links a{padding:10px 11px!important;font-size:10px!important}}
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
