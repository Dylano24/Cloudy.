const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export const dynamic = 'force-dynamic';

function updateLegalPage(html: string) {
  const nav = `<div class="top-links policy-top-links"><a href="/">Home</a><a href="/appeal">Ban appeal</a><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Support</a></div><div class="legal-actions"><button class="legal-back-button" type="button" onclick="history.back()" aria-label="Go back">← Back</button><a class="legal-home" href="/" aria-label="Back to Cloudy"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="" width="36" height="36"><span>Cloudy</span></a></div>`;

  let updated = html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div><a class="legal-home"[\s\S]*?<\/a>/, nav);

  updated = updated.replace('</head>', `<style>
    .legal-actions{display:flex;align-items:center;gap:12px;margin-left:auto}
    .legal-back-button{background:transparent;border:1px solid #3a3a3a;color:#ddd;border-radius:6px;padding:9px 12px;font-size:13px}
    .legal-back-button:hover{border-color:#8d8d8d;color:#fff;background:#1b1b1b}
    .compact-footer .footer-bottom{display:flex;align-items:center;gap:20px}
    .compact-footer .footer-bottom>div{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}
    .compact-footer .footer-bottom>div a{display:inline-block;white-space:nowrap}
    .legal-jump{display:flex;flex-wrap:wrap;gap:10px}
    @media(max-width:780px){.legal-actions{gap:8px}.legal-home span{display:none}.compact-footer .footer-bottom{align-items:flex-start}.compact-footer .footer-bottom>div{margin-left:0;justify-content:flex-start}}
  </style></head>`);

  return updated;
}

export async function GET() {
  try {
    const response = await fetch(`${LEGACY_SITE}/legal`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy legal returned ${response.status}`);

    return new Response(updateLegalPage(await response.text()), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Legal] Failed to load restored legal page', error);
    return new Response('Cloudy legal is temporarily unavailable.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
