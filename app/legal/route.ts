const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export const dynamic = 'force-dynamic';

function updateLegalPage(html: string) {
  const nav = `<div class="top-links policy-top-links"><a href="/">HOME</a><a href="/appeal">APPEAL FORM</a><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">SUPPORT</a></div><div class="legal-actions"><button class="legal-back-button" type="button" onclick="history.back()" aria-label="Go back">← BACK</button><a class="legal-home" href="/" aria-label="Back to Cloudy"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="" width="36" height="36"><span>CLOUDY</span></a></div>`;

  let updated = html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div><a class="legal-home"[\s\S]*?<\/a>/, nav);

  updated = updated.replace(
    '<nav class="legal-jump" aria-label="Documents"><a href="#terms">Terms of Service</a><a href="#sales">Terms of Sale</a><a href="#privacy">Privacy Policy</a><a href="#notice">Legal Notice</a></nav>',
    '<nav class="legal-jump" aria-label="Documents"><a href="/legal#terms" data-legal-tab="terms">Terms of Service</a><a href="/legal#sales" data-legal-tab="sales">Terms of Sale</a><a href="/legal#privacy" data-legal-tab="privacy">Privacy Policy</a><a href="/legal#notice" data-legal-tab="notice">Legal Notice</a></nav>',
  );

  updated = updated.replace('</head>', `<style>
    html,body{background:#090909!important;color:#f3f3f3!important}
    .legal-page,.site-header,.solid-header,.reference-topbar,.legal-main,.legal-shell,.site-footer{background:#090909!important}
    .reference-topbar{border-color:#2b2b2b!important;box-shadow:none!important}
    .policy-top-links a{color:#d7d7d7!important;text-transform:uppercase!important;font-weight:800!important;letter-spacing:.04em}
    .policy-top-links a:hover{color:#fff!important;background:#171717!important}
    .legal-actions{display:flex;align-items:center;gap:12px;margin-left:auto}
    .legal-back-button{background:#111!important;border:1px solid #3a3a3a!important;color:#ddd!important;border-radius:6px;padding:9px 12px;font-size:13px;text-transform:uppercase}
    .legal-back-button:hover{border-color:#8d8d8d!important;color:#fff!important;background:#1b1b1b!important}
    .legal-home{color:#e8e8e8!important}
    .legal-jump{display:flex;flex-wrap:wrap;gap:10px}
    .legal-jump a{background:#101010!important;border:1px solid #3a3a3a!important;color:#e6e6e6!important}
    .legal-jump a:hover,.legal-jump a.is-active{background:#1b1b1b!important;border-color:#737373!important;color:#fff!important}
    .legal-intro,.legal-document,#privacy,#notice{background:#0d0d0d!important;border-color:#333!important;color:#d6d6d6!important}
    .legal-document,#privacy,#notice{display:none}
    .legal-document.is-active,#privacy.is-active,#notice.is-active{display:block}
    .legal-document h2,.legal-document h3,#privacy h2,#notice h2{color:#f5f5f5!important}
    .policy-clause{border-color:#2f2f2f!important}
    .compact-footer .footer-bottom{display:flex;align-items:center;gap:20px}
    .compact-footer .footer-bottom>div{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}
    .compact-footer .footer-bottom>div a{display:inline-block;white-space:nowrap;color:#bdbdbd!important}
    .compact-footer .footer-bottom>div a:hover{color:#fff!important}
    @media(max-width:780px){.legal-actions{gap:8px}.legal-home span{display:none}.compact-footer .footer-bottom{align-items:flex-start}.compact-footer .footer-bottom>div{margin-left:0;justify-content:flex-start}}
  </style></head>`);

  updated = updated.replace('</body>', `<script>
    (function () {
      const allowed = ['terms', 'sales', 'privacy', 'notice'];
      function showLegalDocument() {
        const requested = window.location.hash.replace('#', '');
        const active = allowed.includes(requested) ? requested : 'terms';
        allowed.forEach((id) => {
          const section = document.getElementById(id);
          if (section) section.classList.toggle('is-active', id === active);
        });
        document.querySelectorAll('[data-legal-tab]').forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('data-legal-tab') === active);
        });
      }
      window.addEventListener('hashchange', showLegalDocument);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showLegalDocument);
      } else {
        showLegalDocument();
      }
    })();
  </script></body>`);

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
