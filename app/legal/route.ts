const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

export const dynamic = 'force-dynamic';

function sharedFooter() {
  return `<footer class="cloudy-shared-footer">
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
}

function updateLegalPage(html: string) {
  const nav = `<div class="top-links policy-top-links"><a href="/">Home</a><a href="/appeal">Appeal form</a><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Support</a></div><div class="legal-actions"><button class="legal-back-button" type="button" onclick="history.back()" aria-label="Go back">← BACK</button><a class="legal-home" href="/" aria-label="Back to Cloudy"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="" width="36" height="36"><span>CLOUDY</span></a></div>`;

  let updated = html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div><a class="legal-home"[\s\S]*?<\/a>/, nav);
  updated = updated.replace(/<p class="overline">Cloudy legal<\/p>\s*<h1>Policies & information<\/h1>/, '');
  updated = updated.replace(/<p class="legal-intro">[\s\S]*?<\/p>/, '');

  updated = updated.replace(
    '<nav class="legal-jump" aria-label="Documents"><a href="#terms">Terms of Service</a><a href="#sales">Terms of Sale</a><a href="#privacy">Privacy Policy</a><a href="#notice">Legal Notice</a></nav>',
    '<nav class="legal-jump" aria-label="Documents"><a href="/legal#terms" data-legal-tab="terms">Terms of service</a><a href="/legal#sales" data-legal-tab="sales">Terms of sale</a></nav>',
  );

  updated = updated.replace(/Terms of Service/g, 'Terms of service');
  updated = updated.replace(/Terms of Sale/g, 'Terms of sale');
  updated = updated.replace(/<section id="privacy">[\s\S]*?<\/section>/, '');
  updated = updated.replace(/<section id="notice">[\s\S]*?<\/section>/, '');
  updated = updated.replace(/<a href="#privacy">Privacy Policy<\/a>/g, '');
  updated = updated.replace(/<a href="#notice">Legal Notice<\/a>/g, '');
  updated = updated.replace(/<footer[\s\S]*?<\/footer>/, sharedFooter());

  updated = updated.replace('</head>', `<style>
    html,body{background:#090909!important;color:#f3f3f3!important}
    .legal-page,.site-header,.solid-header,.reference-topbar,.legal-main,.legal-shell,.site-footer{background:#090909!important}
    .reference-topbar{border-color:#2b2b2b!important;box-shadow:none!important}
    .policy-top-links a{color:#d7d7d7!important;text-transform:none!important;font-weight:800!important;letter-spacing:.04em}
    .policy-top-links a:hover{color:#fff!important;background:#171717!important}
    .legal-actions{display:flex;align-items:center;gap:12px;margin-left:auto}
    .legal-back-button{background:#111!important;border:1px solid #3a3a3a!important;color:#ddd!important;border-radius:6px;padding:9px 12px;font-size:13px;text-transform:uppercase}
    .legal-back-button:hover{border-color:#8d8d8d!important;color:#fff!important;background:#1b1b1b!important}
    .legal-home{color:#e8e8e8!important}
    .legal-jump{display:flex;flex-wrap:wrap;gap:10px}
    .legal-jump a{background:#101010!important;border:1px solid #3a3a3a!important;color:#e6e6e6!important}
    .legal-jump a:hover,.legal-jump a.is-active{background:#1b1b1b!important;border-color:#737373!important;color:#fff!important}
    .legal-document{background:#0d0d0d!important;border-color:#333!important;color:#d6d6d6!important;display:none}
    .legal-document.is-active{display:block}
    .legal-document h2,.legal-document h3{color:#f5f5f5!important}
    .policy-clause{border-color:#2f2f2f!important}
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
    @media(max-width:780px){
      .legal-actions{gap:8px}.legal-home span{display:none}
      .cloudy-shared-footer-inner{width:calc(100% - 40px);padding:40px 0 34px}
      .cloudy-shared-footer-grid{grid-template-columns:1fr;gap:34px}
      .cloudy-shared-footer-brand{margin-bottom:4px}
      .cloudy-shared-footer-title{margin-bottom:14px}
      .cloudy-shared-footer-bottom{margin-top:36px}
    }
  </style></head>`);

  updated = updated.replace('</body>', `<script>
    (function () {
      const allowed = ['terms', 'sales'];
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
