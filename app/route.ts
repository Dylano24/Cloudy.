const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export const dynamic = 'force-dynamic';

function updateHomeNavigation(html: string) {
  const navigation = `<div class="top-links policy-top-links"><a href="/" aria-current="page">Home</a><a href="/appeal">Ban appeal</a><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Support</a></div>`;
  return html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div>/, navigation);
}

export async function GET() {
  try {
    const response = await fetch(`${LEGACY_SITE}/`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy home returned ${response.status}`);

    const html = updateHomeNavigation(await response.text());
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
