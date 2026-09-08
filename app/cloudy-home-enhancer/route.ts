const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';

export const dynamic = 'force-dynamic';

const enhancer = String.raw`
;(function(){
  if (location.pathname !== '/') return;

  const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';

  function addStyles(){
    if(document.getElementById('cloudy-home-v2-styles')) return;
    const style=document.createElement('style');
    style.id='cloudy-home-v2-styles';
    style.textContent='\
      html{scroll-behavior:smooth}\
      .reference-topbar .policy-top-links a.is-active:after{content:none!important;display:none!important}\
      .cloudy-cinematic-hero{padding-bottom:38px!important}\
      .cloudy-cinematic-hero .cloudy-one-community{max-width:760px;margin-top:12px!important;font-size:17px!important;line-height:1.55!important;letter-spacing:.055em!important;color:#d8d8dc!important}\
      .cloudy-cinematic-hero .cloudy-one-community strong{color:#fff!important;font-weight:650!important}\
      .cloudy-v2-kicker{margin:2px 0 -2px;color:#ff4545;font-size:10px;font-weight:900;letter-spacing:.28em;text-transform:uppercase}\
      .cloudy-v2-section{width:min(1080px,calc(100% - 30px));margin:86px auto 0;position:relative}\
      .cloudy-v2-heading{text-align:center;margin:0 auto 34px;max-width:820px}\
      .cloudy-v2-eyebrow{margin:0 0 10px;color:#ff4343;font-size:10px;font-weight:900;letter-spacing:.24em;text-transform:uppercase}\
      .cloudy-v2-heading h2{margin:0;color:#fff;font-size:34px;line-height:1.08;font-weight:950;letter-spacing:.08em;text-transform:uppercase}\
      .cloudy-v2-heading p{margin:14px auto 0;color:#aaaab0;font-size:15px;line-height:1.7;max-width:720px}\
      .cloudy-v2-heading:after{content:"";display:block;width:74px;height:2px;margin:18px auto 0;background:linear-gradient(90deg,transparent,#ff3434 28%,#fff 50%,#ff3434 72%,transparent);box-shadow:0 0 15px rgba(255,52,52,.58)}\
      .cloudy-v2-panel{border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,rgba(13,13,14,.92),rgba(5,5,6,.96));box-shadow:0 26px 70px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.03);border-radius:16px}\
      .cloudy-v2-btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:46px;padding:0 24px;border:1px solid #ff3434;border-radius:999px;background:#080809;color:#fff!important;text-decoration:none!important;font-size:11px;font-weight:900;letter-spacing:.10em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 22px rgba(180,0,0,.12);transition:transform .22s ease,box-shadow .22s ease,background .22s ease}\
      .cloudy-v2-btn:hover{transform:translateY(-2px);background:#111;box-shadow:0 0 28px rgba(255,52,52,.24)}\
      .cloudy-benefits{display:none!important}\
      .store-navigation{margin-top:58px!important}\
      .store-navigation h2{font-size:30px!important}\
      .store-navigation::after{content:"Discover the games, servers and experiences created and operated by Cloudy."!important;max-width:720px;text-align:center;line-height:1.6}\
      .game-home .game-tabs{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr)!important;width:min(1080px,calc(100% - 20px))!important;gap:22px!important;margin-bottom:60px!important}\
      .game-home .game-tab{width:100%!important;max-width:none!important;height:100%!important;min-width:0!important;flex:none!important}\
      .game-home .game-tab .game-cover{height:390px!important}\
      .cloudy-coming-card{position:relative;min-height:390px;border:1px solid rgba(255,255,255,.12);border-radius:14px;overflow:hidden;background:radial-gradient(circle at 70% 20%,rgba(180,0,0,.16),transparent 34%),linear-gradient(145deg,#111113,#050506 70%);box-shadow:0 30px 70px rgba(0,0,0,.42);display:flex;flex-direction:column;justify-content:flex-end;padding:28px;box-sizing:border-box}\
      .cloudy-coming-card:before{content:"COMING SOON";position:absolute;left:22px;top:20px;padding:8px 12px;border-radius:4px;background:#111;color:#fff;font-size:10px;font-weight:900;letter-spacing:.14em;border-left:7px solid #ff3434}\
      .cloudy-coming-orbit{position:absolute;width:220px;height:220px;border-radius:50%;right:-62px;top:42px;border:1px solid rgba(255,255,255,.08);box-shadow:0 0 0 34px rgba(255,255,255,.012),0 0 0 68px rgba(255,52,52,.015)}\
      .cloudy-coming-orbit:after{content:"";position:absolute;width:8px;height:8px;border-radius:50%;left:21px;top:38px;background:#fff;box-shadow:0 0 12px #fff,0 0 24px #ff3434}\
      .cloudy-coming-card h3{position:relative;margin:0;color:#fff;font-size:34px;font-weight:950;letter-spacing:.07em;text-transform:uppercase}\
      .cloudy-coming-card p{position:relative;margin:10px 0 0;color:#9d9da3;font-size:13px;line-height:1.6}\
      .cloudy-store-feature{padding:42px 46px;display:grid;grid-template-columns:1.25fr auto;gap:34px;align-items:center}\
      .cloudy-store-feature h2{margin:0;color:#fff;font-size:34px;line-height:1.12;font-weight:950;letter-spacing:.04em}\
      .cloudy-store-feature p{margin:13px 0 0;max-width:670px;color:#aaaab0;font-size:15px;line-height:1.7}\
      .cloudy-store-tags{margin-top:18px;color:#d9d9dd;font-size:12px;font-weight:750;letter-spacing:.08em}\
      .cloudy-pay-grid,.cloudy-purpose-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}\
      .cloudy-pay-card{padding:28px 26px;min-height:190px;box-sizing:border-box;position:relative;overflow:hidden}\
      .cloudy-pay-card:before{content:"";position:absolute;left:0;top:0;width:74px;height:2px;background:linear-gradient(90deg,#ff3434,#fff);box-shadow:0 0 12px rgba(255,52,52,.7)}\
      .cloudy-v2-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;margin-bottom:22px;background:rgba(110,0,0,.18);border:1px solid rgba(255,60,60,.14);color:#ff4545;font-size:20px;font-weight:900}\
      .cloudy-pay-card h3,.cloudy-purpose-card h3{margin:0;color:#fff;font-size:15px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}\
      .cloudy-pay-card p,.cloudy-purpose-card p{margin:11px 0 0;color:#a9a9ae;font-size:13px;line-height:1.65}\
      .cloudy-payment-brands{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:18px}\
      .cloudy-payment-brands span{padding:8px 11px;border:1px solid rgba(255,255,255,.09);border-radius:6px;background:#080809;color:#d7d7db;font-size:9px;font-weight:850;letter-spacing:.10em}\
      .cloudy-community-card{padding:48px;display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;background:radial-gradient(circle at 88% 50%,rgba(140,0,0,.20),transparent 34%),linear-gradient(180deg,rgba(13,13,14,.94),rgba(5,5,6,.97))}\
      .cloudy-community-card h2{margin:0;color:#fff;font-size:32px;font-weight:950;letter-spacing:.06em;text-transform:uppercase}\
      .cloudy-community-card p{margin:14px 0 0;max-width:720px;color:#aaaab0;font-size:15px;line-height:1.7}\
      .cloudy-purpose-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}\
      .cloudy-purpose-card{position:relative;isolation:isolate;min-height:252px;padding:30px 28px 28px;box-sizing:border-box;overflow:hidden;border:1px solid rgba(255,255,255,.09)!important;border-radius:18px!important;background:radial-gradient(circle at 92% 8%,rgba(180,0,0,.12),transparent 31%),linear-gradient(180deg,rgba(15,15,17,.98),rgba(5,5,6,.99))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 22px 52px rgba(0,0,0,.36),0 0 0 1px rgba(255,255,255,.012)!important;transition:transform .30s cubic-bezier(.2,.7,.2,1),border-color .30s ease,box-shadow .30s ease,background .30s ease}\
      .cloudy-purpose-card:before{content:"";position:absolute;z-index:4;left:0;top:0;width:46%;height:2px;background:linear-gradient(90deg,transparent 0%,#ff3030 34%,#fff 50%,#ff3030 66%,transparent 100%);box-shadow:0 0 8px rgba(255,255,255,.72),0 0 17px rgba(255,45,45,.66),0 0 30px rgba(180,0,0,.34);transform:translate3d(-145%,0,0);animation:cloudy-purpose-sweep 4.3s linear infinite;will-change:transform}\
      .cloudy-purpose-card:after{content:"";position:absolute;z-index:3;inset:0;padding:1px;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.34),rgba(255,255,255,.035) 24%,rgba(255,52,52,.16) 52%,rgba(255,255,255,.03) 77%,rgba(255,70,70,.22));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.72}\
      .cloudy-purpose-card:hover{transform:translateY(-6px);border-color:rgba(255,70,70,.34)!important;background:radial-gradient(circle at 92% 8%,rgba(210,0,0,.17),transparent 34%),linear-gradient(180deg,rgba(18,18,20,.99),rgba(6,6,7,1))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.065),0 28px 62px rgba(0,0,0,.5),0 0 28px rgba(255,42,42,.10),0 0 0 1px rgba(255,54,54,.055)!important}\
      .cloudy-purpose-card:hover:after{opacity:1}\
      .cloudy-purpose-icon{position:relative;z-index:5;width:58px;height:58px;display:grid;place-items:center;margin-bottom:22px;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.075),transparent 48%),linear-gradient(180deg,rgba(105,0,0,.34),rgba(32,0,0,.25));border:1px solid rgba(255,65,65,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 0 22px rgba(255,35,35,.075);transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease}\
      .cloudy-purpose-icon svg{width:27px;height:27px;fill:none;stroke:#ff4141;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 8px rgba(255,42,42,.28))}\
      .cloudy-purpose-card:hover .cloudy-purpose-icon{transform:translateY(-2px) scale(1.04);border-color:rgba(255,78,78,.42);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 26px rgba(255,38,38,.15)}\
      .cloudy-purpose-card h3{position:relative;z-index:5;margin-top:0!important;font-size:16px!important;letter-spacing:.09em!important}\
      .cloudy-purpose-card p{position:relative;z-index:5;margin-top:12px!important;color:#b1b1b6!important;font-size:13px!important;line-height:1.7!important}\
      @keyframes cloudy-purpose-sweep{0%{transform:translate3d(-145%,0,0)}100%{transform:translate3d(320%,0,0)}}\
      .cloudy-future-card{padding:52px 54px;text-align:center}\
      .cloudy-future-card h2{margin:0;color:#fff;font-size:34px;font-weight:950;letter-spacing:.07em;text-transform:uppercase}\
      .cloudy-future-card p{margin:18px auto 0;max-width:780px;color:#adadb2;font-size:15px;line-height:1.8}\
      .cloudy-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:28px;border-top:1px solid rgba(255,255,255,.06)}\
      .cloudy-stat{padding:28px 18px 0;text-align:center}.cloudy-stat:not(:last-child){border-right:1px solid rgba(255,255,255,.06)}\
      .cloudy-stat strong{display:block;color:#fff;font-size:28px;letter-spacing:.05em}.cloudy-stat span{display:block;margin-top:8px;color:#87878d;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}\
      .cloudy-final-line{width:min(1080px,calc(100% - 30px));margin:72px auto 74px;padding:30px 0;border-top:1px solid rgba(255,52,52,.28);border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:center;gap:64px;color:#fff;font-size:14px;font-weight:850;letter-spacing:.16em;text-transform:uppercase;text-align:center}\
      .cloudy-final-line span:last-child{color:#ff4545}\
      .cloudy-v2-reveal{opacity:0;transform:translateY(16px);transition:opacity .58s ease,transform .58s cubic-bezier(.2,.7,.2,1)}.cloudy-v2-reveal.is-visible{opacity:1;transform:none}\
      @media(max-width:900px){.game-home .game-tabs{grid-template-columns:1fr!important}.cloudy-coming-card{min-height:300px}.cloudy-store-feature,.cloudy-community-card{grid-template-columns:1fr;text-align:center}.cloudy-store-feature p,.cloudy-community-card p{margin-left:auto;margin-right:auto}.cloudy-pay-grid{grid-template-columns:1fr}.cloudy-purpose-grid{grid-template-columns:repeat(2,1fr)}}\
      @media(max-width:640px){.cloudy-v2-section{margin-top:60px}.cloudy-v2-heading h2{font-size:26px}.cloudy-store-feature,.cloudy-community-card,.cloudy-future-card{padding:30px 22px}.cloudy-purpose-grid{grid-template-columns:1fr}.cloudy-purpose-card{min-height:auto;padding:28px 24px}.cloudy-final-line{gap:18px;flex-direction:column;margin-top:54px}.cloudy-stats{grid-template-columns:1fr}.cloudy-stat:not(:last-child){border-right:0;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:22px}.cloudy-cinematic-hero .cloudy-one-community{font-size:14px!important}.game-home .game-tab .game-cover{height:340px!important}}\
      @media(prefers-reduced-motion:reduce){.cloudy-v2-reveal{opacity:1!important;transform:none!important;transition:none!important}.cloudy-purpose-card:before{animation:none!important;transform:translate3d(115%,0,0)!important}}';
    document.head.appendChild(style);
  }

  function updateNavigation(){
    const links=document.querySelector('.reference-topbar .policy-top-links');
    if(!links) return;
    links.innerHTML='<a class="is-active" href="/" aria-current="page">HOME</a><a href="#cloudy-store-section">STORE</a><a href="'+DISCORD_URL+'" target="_blank" rel="noopener noreferrer">DISCORD</a><a href="/appeal">SUPPORT</a>';
  }

  function updateHero(){
    const hero=document.querySelector('.cloudy-cinematic-hero');
    if(!hero) return;
    const h1=hero.querySelector('h1');
    if(h1&&!hero.querySelector('.cloudy-v2-kicker')) h1.insertAdjacentHTML('beforebegin','<p class="cloudy-v2-kicker">WHERE GAMES MEET QUALITY.</p>');
    const tagline=hero.querySelector('.cloudy-one-community');
    if(tagline) tagline.innerHTML='Perfected through detail. <strong>Designed for excellence.</strong>';
  }

  function updateIntro(){
    const intro=document.querySelector('.cloudy-intro-card p');
    if(intro) intro.textContent='Cloudy creates and operates dedicated gaming experiences, bringing together immersive servers, active communities and in-game services';
    const benefits=document.querySelector('.cloudy-benefits');
    if(benefits) benefits.remove();
  }

  function updateGamesHeading(){
    const title=document.getElementById('collection-title');
    if(title) title.textContent='Inside Cloudy';
  }

  function ensureComingSoon(){
    const tabs=document.getElementById('game-tabs');
    if(!tabs||tabs.querySelector('.cloudy-coming-card')) return;
    const card=document.createElement('div');
    card.className='cloudy-coming-card';
    card.setAttribute('aria-label','More Cloudy games coming soon');
    card.innerHTML='<div class="cloudy-coming-orbit" aria-hidden="true"></div><h3>More games</h3><p>New projects are on the way.</p>';
    tabs.appendChild(card);
  }

  function buildSections(){
    const main=document.querySelector('main.game-home');
    if(!main||document.getElementById('cloudy-store-section')) return;
    const gamePanel=document.getElementById('game-panel');
    const anchor=gamePanel||main.lastElementChild;
    const markup='\
      <section class="cloudy-v2-section" id="cloudy-store-section">\
        <div class="cloudy-v2-panel cloudy-store-feature cloudy-v2-reveal">\
          <div><p class="cloudy-v2-eyebrow">Cloudy Store</p><h2>Enhance your experience.</h2><p>From in-game kits to exclusive features, Cloudy offers additional ways to personalize and enhance your gaming experience.</p><div class="cloudy-store-tags">Kits • In-game services • Exclusive features</div></div>\
          <button class="cloudy-v2-btn" id="cloudy-visit-store" type="button">Visit the store <span aria-hidden="true">→</span></button>\
        </div>\
      </section>\
      <section class="cloudy-v2-section" id="cloudy-payments">\
        <div class="cloudy-v2-heading cloudy-v2-reveal"><p class="cloudy-v2-eyebrow">Secure payments</p><h2>A Higher Standard of Gaming.</h2><p>Simple, secure and reliable checkout.</p></div>\
        <div class="cloudy-pay-grid">\
          <article class="cloudy-v2-panel cloudy-pay-card cloudy-v2-reveal"><div class="cloudy-v2-icon">✓</div><h3>Secure Checkout</h3><p>Protected payment processing.</p></article>\
          <article class="cloudy-v2-panel cloudy-pay-card cloudy-v2-reveal"><div class="cloudy-v2-icon">↗</div><h3>Instant Delivery</h3><p>Receive your digital purchases quickly.</p></article>\
          <article class="cloudy-v2-panel cloudy-pay-card cloudy-v2-reveal"><div class="cloudy-v2-icon">◇</div><h3>Trusted Payments</h3><p>Payments handled by secure, established providers.</p></article>\
        </div>\
        <div class="cloudy-payment-brands cloudy-v2-reveal"><span>VISA</span><span>MASTERCARD</span><span>PAYPAL</span><span>APPLE PAY</span><span>GOOGLE PAY</span></div>\
      </section>\
      <section class="cloudy-v2-section" id="cloudy-community">\
        <div class="cloudy-v2-panel cloudy-community-card cloudy-v2-reveal"><div><p class="cloudy-v2-eyebrow">Community</p><h2>Join the community.</h2><p>Connect with other players, stay up to date with Cloudy, get support and discover what’s coming next.</p></div><a class="cloudy-v2-btn" href="'+DISCORD_URL+'" target="_blank" rel="noopener noreferrer">Join our Discord <span aria-hidden="true">→</span></a></div>\
      </section>\
      <section class="cloudy-v2-section" id="cloudy-purpose">\
        <div class="cloudy-v2-heading cloudy-v2-reveal"><p class="cloudy-v2-eyebrow">Why Cloudy?</p><h2>Made with purpose.</h2></div>\
        <div class="cloudy-purpose-grid">\
          <article class="cloudy-v2-panel cloudy-purpose-card cloudy-v2-reveal"><div class="cloudy-purpose-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.8 19 5.7v5.1c0 4.9-3.1 8.4-7 10.4-3.9-2-7-5.5-7-10.4V5.7L12 2.8Z"/><path d="m8.7 12 2.1 2.1 4.6-5"/></svg></div><h3>Quality</h3><p>We focus on creating stable, polished and enjoyable gaming experiences.</p></article>\
          <article class="cloudy-v2-panel cloudy-purpose-card cloudy-v2-reveal"><div class="cloudy-purpose-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20v-1.4A5.6 5.6 0 0 1 8.6 13h.8a5.6 5.6 0 0 1 5.6 5.6V20"/><path d="M14.8 14.1c.6-.4 1.3-.6 2.1-.6h.5a3.6 3.6 0 0 1 3.6 3.6V19"/></svg></div><h3>Community</h3><p>Every detail is designed to enhance the player experience</p></article>\
          <article class="cloudy-v2-panel cloudy-purpose-card cloudy-v2-reveal"><div class="cloudy-purpose-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.3 2.5 5.2 13h5.7l-1 8.5 8.9-11.7h-6.2l.7-7.3Z"/></svg></div><h3>Innovation</h3><p>We continuously explore new ideas, features and ways to push what’s possible.</p></article>\
          <article class="cloudy-v2-panel cloudy-purpose-card cloudy-v2-reveal"><div class="cloudy-purpose-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></div><h3>Precision</h3><p>Every decision is carefully considered, with precision built into every element.</p></article>\
        </div>\
      </section>\
      <section class="cloudy-v2-section" id="cloudy-future">\
        <div class="cloudy-v2-panel cloudy-future-card cloudy-v2-reveal"><p class="cloudy-v2-eyebrow">What’s next?</p><h2>The future of Cloudy</h2><p>We aim to expand Cloudy across new games and experiences, while carrying the same attention to detail and commitment to quality into everything we create.</p><div class="cloudy-stats"><div class="cloudy-stat"><strong>XX,XXX+</strong><span>Players</span></div><div class="cloudy-stat"><strong>XX</strong><span>Servers</span></div><div class="cloudy-stat"><strong>XX,XXX+</strong><span>Community members</span></div></div></div>\
      </section>\
      <div class="cloudy-final-line cloudy-v2-reveal"><span>Carefully designed.</span><span>Experience differently.</span></div>';
    anchor.insertAdjacentHTML('afterend',markup);
  }

  function wireInteractions(){
    const visit=document.getElementById('cloudy-visit-store');
    if(visit&&!visit.dataset.wired){
      visit.dataset.wired='1';
      visit.addEventListener('click',function(){
        const first=document.querySelector('#game-tabs .game-tab');
        if(first){ first.dispatchEvent(new MouseEvent('click',{bubbles:true})); setTimeout(function(){document.getElementById('game-panel')?.scrollIntoView({behavior:'smooth',block:'start'});},80); }
        else document.getElementById('game-tabs')?.scrollIntoView({behavior:'smooth',block:'center'});
      });
    }
  }

  function initReveal(){
    const items=document.querySelectorAll('.cloudy-v2-reveal');
    if(!items.length) return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){items.forEach(function(x){x.classList.add('is-visible')});return;}
    if(!('IntersectionObserver' in window)){items.forEach(function(x){x.classList.add('is-visible')});return;}
    const observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}})},{threshold:.08,rootMargin:'0px 0px -30px'});
    items.forEach(function(x){observer.observe(x)});
  }

  function init(){
    addStyles();
    updateNavigation();
    updateHero();
    updateIntro();
    updateGamesHeading();
    ensureComingSoon();
    buildSections();
    wireInteractions();
    initReveal();
    const tabs=document.getElementById('game-tabs');
    if(tabs&&'MutationObserver' in window){new MutationObserver(function(){ensureComingSoon();wireInteractions();}).observe(tabs,{childList:true,subtree:true});}
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
`;

export async function GET() {
  let original = '';
  try {
    const response = await fetch(`${LEGACY_SITE}/clouds.js`, { cache: 'force-cache' });
    if (response.ok) original = await response.text();
  } catch {
    original = '';
  }

  return new Response(`${original}\n${enhancer}`, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}