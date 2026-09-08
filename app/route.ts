const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
const DISCORD_EMOJI_URL = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=96&quality=lossless';

export const dynamic = 'force-dynamic';

function updateHomeNavigation(html: string) {
  const navigation = `<div class="top-links policy-top-links"><a class="is-active" href="/" aria-current="page">HOME</a><a href="/#server">SERVER</a><a href="/appeal">APPEAL FORM</a></div>`;
  return html.replace(/<div class="top-links policy-top-links">[\s\S]*?<\/div>/, navigation);
}

function updateHomeActions(html: string) {
  const actions = `<div class="top-actions cloudy-home-actions">
    <button class="basket-button" id="basket-open" aria-label="Open basket"><svg><use href="#i-bag"/></svg><span class="basket-label">Basket</span><span id="basket-count">0</span></button>
    <button class="icon-button cloudy-home-menu-toggle" id="cloudy-home-menu-toggle" type="button" aria-label="Menu" aria-expanded="false"><span aria-hidden="true">☰</span></button>
  </div>
  <div class="cloudy-home-menu" id="cloudy-home-menu" hidden>
    <button type="button" id="account-open">Login</button>
  </div>`;
  return html.replace(/<div class="top-actions">[\s\S]*?<\/div>/, actions);
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
.reference-topbar .top-actions{position:absolute;right:0;display:flex;align-items:center;gap:8px}
.cloudy-home-menu-toggle{font-size:21px!important;line-height:1!important}
.cloudy-home-menu{position:absolute;top:68px;right:0;z-index:80;min-width:170px;padding:8px;background:#0b0b0b;border:1px solid #303030;border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.cloudy-home-menu button{width:100%;padding:12px 13px;border:0;border-radius:7px;background:transparent;color:#d8d8d8;text-align:left;font:inherit;font-size:13px;cursor:pointer}
.cloudy-home-menu button:hover{background:#171717;color:#fff}
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
.reference-topbar{justify-content:flex-start!important;overflow:visible!important;padding-right:92px!important}.reference-topbar .policy-top-links{justify-content:flex-start;margin:0!important}.reference-topbar .top-actions{display:flex!important;right:8px!important}.reference-topbar .policy-top-links a{padding:10px 9px!important;font-size:9px!important}.reference-topbar .basket-label{display:none!important}.reference-topbar .basket-button{min-width:42px!important;width:42px!important;padding:0!important}.reference-topbar #basket-count{display:grid!important;place-items:center!important;box-sizing:border-box!important;line-height:1!important;padding-top:1px!important}.cloudy-home-menu{right:8px!important}
.cloudy-shared-footer-inner{width:calc(100% - 40px);padding:40px 0 34px}
.cloudy-shared-footer-grid{grid-template-columns:1fr;gap:34px}
.cloudy-shared-footer-brand{margin-bottom:4px}
.cloudy-shared-footer-title{margin-bottom:14px}
.cloudy-shared-footer-bottom{margin-top:36px}
}

/* Subtle luxury motion — visual only */
.product-card{transition:transform .38s cubic-bezier(.2,.7,.2,1),border-color .38s ease,box-shadow .38s ease;will-change:transform}
.product-art{overflow:hidden}
.product-art img{filter:drop-shadow(0 0 10px rgba(255,255,255,.12));transition:transform .55s cubic-bezier(.2,.7,.2,1),filter .4s ease}
.product-art:after{content:"";position:absolute;inset:-40% auto -40% -65%;width:42%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.13),transparent);transform:skewX(-16deg);transition:left .72s cubic-bezier(.2,.7,.2,1)}
.hero-logo,.cloudy-shared-footer-brand img{filter:drop-shadow(0 0 13px rgba(255,255,255,.16))!important;transition:filter .35s ease,transform .35s ease}
.detail-button,.save-button,.games-back,.basket-button,.discord-link,.cloudy-home-menu button{position:relative;overflow:hidden}
.detail-button:after,.games-back:after,.basket-button:after,.discord-link:after,.cloudy-home-menu button:after{content:"";position:absolute;top:-80%;bottom:-80%;left:-55%;width:30%;pointer-events:none;background:linear-gradient(100deg,transparent,rgba(255,255,255,.13),transparent);transform:skewX(-18deg);transition:left .6s ease}
.product-dialog[open],.basket-dialog[open],.account-dialog[open]{animation:cloudy-dialog-in .24s cubic-bezier(.2,.72,.2,1)}
.product-dialog::backdrop,.basket-dialog::backdrop,.account-dialog::backdrop{animation:cloudy-backdrop-in .22s ease both}
.cloud-layer-far{animation-duration:82s!important}
.cloud-layer-near{animation-duration:58s!important}
.luxury-motion-ready .luxury-reveal{opacity:0;transform:translateY(14px);transition:opacity .58s ease,transform .58s cubic-bezier(.2,.7,.2,1)}
.luxury-motion-ready .luxury-reveal.is-visible{opacity:1;transform:none}
#basket-count.cloudy-basket-pulse{animation:cloudy-basket-pulse .42s cubic-bezier(.2,.8,.2,1)}
@keyframes cloudy-dialog-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
@keyframes cloudy-backdrop-in{from{background:rgba(0,0,0,0)}to{background:rgba(0,0,0,.72)}}
@keyframes cloudy-basket-pulse{0%,100%{transform:scale(1)}45%{transform:scale(1.13);box-shadow:0 0 16px rgba(255,255,255,.22)}}
@media(hover:hover){
.product-card:hover{transform:translateY(-5px);border-color:rgba(255,255,255,.2);box-shadow:0 24px 50px rgba(0,0,0,.34),0 0 0 1px rgba(255,255,255,.035)}
.product-card:hover .product-art img{transform:scale(1.045);filter:drop-shadow(0 0 15px rgba(255,255,255,.2))}
.product-card:hover .product-art:after{left:130%}
.hero-logo:hover{filter:drop-shadow(0 0 18px rgba(255,255,255,.23))!important;transform:translateY(-1px)}
.detail-button:hover:after,.games-back:hover:after,.basket-button:hover:after,.discord-link:hover:after,.cloudy-home-menu button:hover:after{left:135%}
}
@media(prefers-reduced-motion:reduce){
.product-card,.product-art img,.hero-logo,.cloudy-shared-footer-brand img,.luxury-reveal{animation:none!important;transition:none!important;transform:none!important}
.product-art:after,.detail-button:after,.games-back:after,.basket-button:after,.discord-link:after,.cloudy-home-menu button:after{display:none!important}
.cloud-layer-far,.cloud-layer-near{animation:none!important}
}
</style>`;
  return html.replace('</head>', `${styles}</head>`);
}

function injectHomeInteractions(html: string) {
  const script = `<script>
(function(){
  function initCloudyHeader(){
    const toggle=document.getElementById('cloudy-home-menu-toggle');
    const menu=document.getElementById('cloudy-home-menu');
    const basket=document.getElementById('basket-open');
    if(toggle&&menu){
      toggle.addEventListener('click',function(){
        const next=menu.hasAttribute('hidden');
        if(next) menu.removeAttribute('hidden'); else menu.setAttribute('hidden','');
        toggle.setAttribute('aria-expanded',String(next));
      });
    }
    const open=new URLSearchParams(location.search).get('open');
    if(open==='basket'&&basket) setTimeout(function(){basket.click();},50);
    if(open==='account'){
      const account=document.getElementById('account-open');
      if(account) setTimeout(function(){account.click();},50);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initCloudyHeader); else initCloudyHeader();
})();
</script>`;
  return html.replace('</body>', `${script}</body>`);
}


function injectLuxuryMotion(html: string) {
  const script = `<script>
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function initLuxuryMotion(){
    document.body.classList.add('luxury-motion-ready');
    const targets=document.querySelectorAll('.store-navigation,#game-panel,.kit-panel,.product-card,.cloudy-shared-footer');
    targets.forEach(function(element){element.classList.add('luxury-reveal');});
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
        });
      },{threshold:.08,rootMargin:'0px 0px -24px'});
      targets.forEach(function(element){observer.observe(element);});
    }else{
      targets.forEach(function(element){element.classList.add('is-visible');});
    }
    const basketCount=document.getElementById('basket-count');
    if(basketCount&&'MutationObserver' in window){
      new MutationObserver(function(){
        basketCount.classList.remove('cloudy-basket-pulse');
        void basketCount.offsetWidth;
        basketCount.classList.add('cloudy-basket-pulse');
      }).observe(basketCount,{childList:true,characterData:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initLuxuryMotion); else initLuxuryMotion();
})();
</script>`;
  return html.replace('</body>', `${script}</body>`);
}

export async function GET() {
  try {
    const response = await fetch(`${LEGACY_SITE}/`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Legacy home returned ${response.status}`);

    let html = await response.text();
    html = updateHomeNavigation(html);
    html = updateHomeActions(html);
    html = updateHomeDiscordEmoji(html);
    html = updateHomeLegalLinks(html);
    html = replaceHomeFooter(html);
    html = injectHomeStyles(html);
    html = injectHomeInteractions(html);
    html = injectLuxuryMotion(html);

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
