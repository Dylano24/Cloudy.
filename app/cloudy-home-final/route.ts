export const dynamic = 'force-dynamic';

const exactCopy = String.raw`
;(function(){
  if (location.pathname !== '/') return;

  const copy = {
    hero: 'Perfected through detail. Designed for excellence.',
    intro: 'Cloudy creates and operates dedicated gaming experiences, bringing together immersive servers, active communities and in-game services',
    games: 'Discover the games, servers and experiences created and operated by Cloudy.',
    store: 'From in-game kits to exclusive features, Cloudy offers additional ways to personalize and enhance your gaming experience.',
    quality: 'We focus on creating stable, polished and enjoyable gaming experiences.',
    community: 'Every detail is designed to enhance the player experience',
    innovation: 'We continuously explore new ideas, features and ways to push what’s possible.',
    precision: 'Every decision is carefully considered, with precision built into every element.',
    future: 'We aim to expand Cloudy across new games and experiences, while carrying the same attention to detail and commitment to quality into everything we create.',
    bonus: 'Cloudy creates and operates unique gaming experiences across the games you love.'
  };

  function setText(selector, value){
    const node=document.querySelector(selector);
    if(node) node.textContent=value;
    return node;
  }

  function setCardText(title, body){
    const cards=[...document.querySelectorAll('.cloudy-purpose-card')];
    const card=cards.find(function(item){return item.querySelector('h3')?.textContent?.trim().toLowerCase()===title.toLowerCase()});
    if(!card) return;
    const h=card.querySelector('h3');
    const p=card.querySelector('p');
    if(h) h.textContent=title;
    if(p) p.textContent=body;
  }

  function setPaymentText(title, body){
    const cards=[...document.querySelectorAll('.cloudy-pay-card')];
    const card=cards.find(function(item){return item.querySelector('h3')?.textContent?.trim().toLowerCase()===title.toLowerCase()});
    if(!card) return;
    const h=card.querySelector('h3');
    const p=card.querySelector('p');
    if(h) h.textContent=title;
    if(p) p.textContent=body;
  }

  function applyExactCopy(){
    const kicker=document.querySelector('.cloudy-v2-kicker');
    if(kicker) kicker.textContent='WHERE GAMES MEET QUALITY.';

    const tagline=document.querySelector('.cloudy-cinematic-hero .cloudy-one-community');
    if(tagline) tagline.innerHTML='Perfected through detail. <strong>Designed for excellence.</strong>';

    const hero=document.querySelector('.cloudy-cinematic-hero');
    if(hero && !hero.querySelector('.cloudy-user-copy-bonus')){
      const p=document.createElement('p');
      p.className='cloudy-user-copy-bonus';
      p.textContent=copy.bonus;
      tagline?.insertAdjacentElement('afterend',p);
    }

    setText('.cloudy-intro-card p', copy.intro);
    setText('#collection-title', 'Inside Cloudy');

    const styleId='cloudy-exact-copy-style';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');
      style.id=styleId;
      style.textContent='.store-navigation::after{content:"Discover the games, servers and experiences created and operated by Cloudy."!important}.cloudy-user-copy-bonus{margin:8px auto 0;max-width:720px;color:#9f9fa5;font-size:13px;line-height:1.65;letter-spacing:.02em;text-align:center}';
      document.head.appendChild(style);
    }

    setText('.cloudy-store-feature h2', 'Enhance your experience.');
    setText('.cloudy-store-feature p', copy.store);
    setText('.cloudy-store-tags', 'Kits • In-game services • Exclusive features');
    setText('#cloudy-visit-store', 'Visit the store →');

    const paymentHeading=document.querySelector('#cloudy-payments .cloudy-v2-heading');
    if(paymentHeading){
      setText('#cloudy-payments .cloudy-v2-eyebrow', 'Secure payments');
      setText('#cloudy-payments .cloudy-v2-heading h2', 'A Higher Standard of Gaming.');
    }
    setPaymentText('Secure Checkout', 'Protected payment processing.');
    setPaymentText('Instant Delivery', 'Receive your digital purchases quickly.');
    setPaymentText('Trusted Payments', 'Payments handled by secure, established providers.');

    setText('#cloudy-community .cloudy-v2-eyebrow', 'Community');
    setText('#cloudy-community h2', 'Join the community.');
    setText('#cloudy-community p:not(.cloudy-v2-eyebrow)', 'Connect with other players, stay up to date with Cloudy, get support and discover what’s coming next.');
    const discordBtn=document.querySelector('#cloudy-community .cloudy-v2-btn');
    if(discordBtn) discordBtn.textContent='Join our Discord →';

    setText('#cloudy-purpose .cloudy-v2-eyebrow', 'Why Cloudy?');
    setText('#cloudy-purpose .cloudy-v2-heading h2', 'Made with purpose.');
    setCardText('Quality', copy.quality);
    setCardText('Community', copy.community);
    setCardText('Innovation', copy.innovation);
    setCardText('Precision', copy.precision);

    setText('#cloudy-future .cloudy-v2-eyebrow', 'What’s next?');
    setText('#cloudy-future h2', 'The future of Cloudy');
    setText('#cloudy-future p:not(.cloudy-v2-eyebrow)', copy.future);

    const stats=[...document.querySelectorAll('.cloudy-stat')];
    if(stats[0]){ stats[0].querySelector('strong').textContent='XX,XXX+'; stats[0].querySelector('span').textContent='Players'; }
    if(stats[1]){ stats[1].querySelector('strong').textContent='XX'; stats[1].querySelector('span').textContent='Servers'; }
    if(stats[2]){ stats[2].querySelector('strong').textContent='XX,XXX+'; stats[2].querySelector('span').textContent='Community members'; }

    const final=[...document.querySelectorAll('.cloudy-final-line span')];
    if(final[0]) final[0].textContent='Carefully designed.';
    if(final[1]) final[1].textContent='Experience differently.';
  }

  function run(){
    applyExactCopy();
    requestAnimationFrame(applyExactCopy);
    setTimeout(applyExactCopy,120);
    setTimeout(applyExactCopy,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
`;

const premiumPolish = String.raw`
;(function(){
  if (location.pathname !== '/') return;

  const icons = {
    'secure checkout': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-2.9 8.1-7 10-4.1-1.9-7-5.3-7-10V6l7-3Z"/><path d="m8.8 12.1 2 2 4.4-4.8"/></svg>',
    'instant delivery': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13.5 2.8-8 10.4h5.7l-1 8 8.6-11.3h-6.1l.8-7.1Z"/></svg>',
    'trusted payments': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.4"/><path d="M3.5 10h17M7 14h3"/><path d="M16.8 13.1 18 14.3l2.2-2.4"/></svg>'
  };

  function addStyles(){
    if(document.getElementById('cloudy-premium-polish')) return;
    const style=document.createElement('style');
    style.id='cloudy-premium-polish';
    style.textContent='\
      .cloudy-v2-section{width:min(1160px,calc(100% - 40px))!important;margin-top:104px!important}\
      .cloudy-v2-heading{max-width:850px!important;margin-bottom:38px!important}\
      .cloudy-v2-heading h2{font-size:clamp(31px,3.1vw,43px)!important;letter-spacing:.065em!important}\
      .cloudy-v2-heading p{max-width:760px!important;color:#b1b1b6!important}\
      .cloudy-v2-heading:after{width:94px!important;height:2px!important;margin-top:20px!important;background:linear-gradient(90deg,transparent 0%,#ff2f2f 24%,#fff 50%,#ff2f2f 76%,transparent 100%)!important;box-shadow:0 0 10px rgba(255,255,255,.28),0 0 24px rgba(255,45,45,.42)!important}\
      .store-navigation{margin-top:72px!important}\
      .store-navigation h2{font-size:clamp(31px,3.1vw,43px)!important;letter-spacing:.07em!important}\
      .game-home .game-tabs{width:min(1160px,calc(100% - 20px))!important;gap:24px!important;margin-bottom:76px!important;grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr)!important}\
      .game-home .game-tab,.cloudy-coming-card{border-radius:18px!important}\
      .game-home .game-tab{box-shadow:0 30px 80px rgba(0,0,0,.42)!important}\
      .game-home .game-tab .game-cover{height:420px!important}\
      .cloudy-coming-card{min-height:420px!important;border-color:rgba(255,255,255,.10)!important;background:radial-gradient(circle at 78% 20%,rgba(160,0,0,.12),transparent 34%),linear-gradient(145deg,#0e0e10,#050506 72%)!important;box-shadow:0 30px 80px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.03)!important}\
      .cloudy-coming-card:before{top:24px!important;left:24px!important;border-left-width:4px!important;background:#0b0b0c!important;border:1px solid rgba(255,255,255,.08)!important;border-left-color:#ff3434!important;padding:9px 12px!important}\
      .cloudy-coming-orbit{opacity:.58!important}\
      .cloudy-store-feature{position:relative!important;overflow:hidden!important;padding:52px 56px!important;grid-template-columns:minmax(0,1.4fr) auto!important;gap:52px!important;border-radius:20px!important;border-color:rgba(255,255,255,.10)!important;background:linear-gradient(135deg,rgba(15,15,17,.98),rgba(6,6,7,.99))!important}\
      .cloudy-store-feature:before{content:""!important;position:absolute!important;left:0!important;top:0!important;width:42%!important;height:2px!important;background:linear-gradient(90deg,transparent,#ff3030 34%,#fff 50%,#ff3030 66%,transparent)!important;transform:translate3d(-140%,0,0)!important;animation:cloudy-premium-sweep 4.8s linear infinite!important;box-shadow:0 0 10px rgba(255,255,255,.34),0 0 20px rgba(255,45,45,.38)!important}\
      .cloudy-store-feature h2{font-size:clamp(29px,3vw,41px)!important;letter-spacing:.035em!important}\
      .cloudy-store-feature p{font-size:15px!important;line-height:1.75!important;color:#b2b2b7!important}\
      .cloudy-store-tags{margin-top:22px!important;color:#f0f0f2!important;font-size:11px!important;letter-spacing:.10em!important}\
      .cloudy-v2-btn{min-height:50px!important;padding:0 28px!important;border-color:rgba(255,52,52,.88)!important;background:linear-gradient(180deg,#0d0d0e,#070708)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 34px rgba(0,0,0,.32),0 0 18px rgba(255,40,40,.08)!important}\
      .cloudy-v2-btn:hover{transform:translateY(-2px)!important;border-color:#ff5353!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 40px rgba(0,0,0,.42),0 0 24px rgba(255,40,40,.17)!important}\
      .cloudy-pay-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:18px!important}\
      .cloudy-pay-card{position:relative!important;isolation:isolate!important;min-height:226px!important;padding:32px 30px!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.09)!important;background:radial-gradient(circle at 95% 8%,rgba(145,0,0,.10),transparent 30%),linear-gradient(180deg,rgba(14,14,16,.98),rgba(5,5,6,.99))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 22px 54px rgba(0,0,0,.30)!important;transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease!important}\
      .cloudy-pay-card:before{content:""!important;position:absolute!important;z-index:4!important;left:0!important;top:0!important;width:44%!important;height:2px!important;background:linear-gradient(90deg,transparent,#ff3030 34%,#fff 50%,#ff3030 66%,transparent)!important;transform:translate3d(-145%,0,0)!important;animation:cloudy-premium-sweep 4.6s linear infinite!important;box-shadow:0 0 10px rgba(255,255,255,.34),0 0 22px rgba(255,45,45,.40)!important}\
      .cloudy-pay-card:after{content:"";position:absolute;z-index:2;inset:0;padding:1px;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.02) 28%,rgba(255,52,52,.12) 62%,rgba(255,255,255,.02));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.66}\
      .cloudy-pay-card:hover{transform:translateY(-5px)!important;border-color:rgba(255,72,72,.32)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 28px 64px rgba(0,0,0,.40),0 0 26px rgba(255,40,40,.08)!important}\
      .cloudy-v2-icon{position:relative!important;z-index:5!important;width:58px!important;height:58px!important;margin-bottom:24px!important;border-radius:16px!important;background:linear-gradient(180deg,rgba(86,5,8,.42),rgba(28,2,3,.42))!important;border:1px solid rgba(255,70,70,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 12px 28px rgba(0,0,0,.28)!important;color:#ff4545!important;font-size:0!important}\
      .cloudy-v2-icon svg{width:28px;height:28px;fill:none;stroke:#ff4545;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 7px rgba(255,45,45,.18))}\
      .cloudy-pay-card h3{position:relative;z-index:5;font-size:16px!important;letter-spacing:.075em!important}\
      .cloudy-pay-card p{position:relative;z-index:5;margin-top:13px!important;color:#b7b7bc!important;font-size:13px!important;line-height:1.7!important}\
      .cloudy-payment-brands{margin-top:24px!important;gap:9px!important}\
      .cloudy-payment-brands span{padding:9px 13px!important;border-color:rgba(255,255,255,.075)!important;background:#070708!important;color:#d8d8dc!important;border-radius:8px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}\
      .cloudy-community-card{position:relative!important;overflow:hidden!important;min-height:260px!important;padding:54px 58px!important;grid-template-columns:minmax(0,1fr) auto!important;gap:54px!important;border-radius:20px!important;border:1px solid rgba(255,255,255,.09)!important;background:radial-gradient(circle at 86% 50%,rgba(130,0,0,.14),transparent 31%),linear-gradient(135deg,rgba(14,14,16,.98),rgba(5,5,6,.99))!important;box-shadow:0 28px 70px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.035)!important}\
      .cloudy-community-card:before{content:"";position:absolute;left:0;top:0;width:42%;height:2px;background:linear-gradient(90deg,transparent,#ff3030 34%,#fff 50%,#ff3030 66%,transparent);transform:translate3d(-145%,0,0);animation:cloudy-premium-sweep 5.1s linear infinite;box-shadow:0 0 10px rgba(255,255,255,.30),0 0 22px rgba(255,45,45,.36)}\
      .cloudy-community-card h2{font-size:clamp(30px,3vw,42px)!important;letter-spacing:.055em!important}\
      .cloudy-community-card p{max-width:760px!important;color:#b4b4b9!important;line-height:1.75!important}\
      .cloudy-purpose-grid{gap:18px!important}\
      .cloudy-purpose-card{min-height:278px!important;padding:32px 30px 30px!important}\
      .cloudy-purpose-icon{width:60px!important;height:60px!important;border-radius:16px!important}\
      .cloudy-future-card{position:relative!important;overflow:hidden!important;display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr)!important;column-gap:58px!important;row-gap:10px!important;align-items:center!important;text-align:left!important;padding:58px 60px!important;border-radius:20px!important;background:linear-gradient(135deg,rgba(14,14,16,.98),rgba(5,5,6,.99))!important}\
      .cloudy-future-card:before{content:"";position:absolute;left:0;top:0;width:40%;height:2px;background:linear-gradient(90deg,transparent,#ff3030 34%,#fff 50%,#ff3030 66%,transparent);transform:translate3d(-145%,0,0);animation:cloudy-premium-sweep 5.2s linear infinite;box-shadow:0 0 10px rgba(255,255,255,.28),0 0 22px rgba(255,45,45,.34)}\
      .cloudy-future-card>.cloudy-v2-eyebrow,.cloudy-future-card>h2,.cloudy-future-card>p{grid-column:1!important}\
      .cloudy-future-card>.cloudy-v2-eyebrow{align-self:end!important;margin-bottom:0!important}\
      .cloudy-future-card>h2{font-size:clamp(31px,3vw,43px)!important;align-self:center!important}\
      .cloudy-future-card>p{margin:8px 0 0!important;max-width:650px!important;color:#b3b3b8!important;line-height:1.8!important;align-self:start!important}\
      .cloudy-stats{grid-column:2!important;grid-row:1 / span 3!important;display:grid!important;grid-template-columns:1fr!important;margin:0!important;border:1px solid rgba(255,255,255,.07)!important;border-radius:16px!important;background:rgba(3,3,4,.46)!important;overflow:hidden!important}\
      .cloudy-stat{padding:21px 24px!important;text-align:left!important;display:grid!important;grid-template-columns:150px 1fr!important;align-items:center!important;gap:18px!important}\
      .cloudy-stat:not(:last-child){border-right:0!important;border-bottom:1px solid rgba(255,255,255,.06)!important}\
      .cloudy-stat strong{font-size:26px!important;letter-spacing:.03em!important}\
      .cloudy-stat span{margin:0!important;color:#9a9aa0!important;font-size:10px!important}\
      .cloudy-final-line{width:min(1160px,calc(100% - 40px))!important;margin:86px auto 82px!important;padding:26px 0!important;gap:80px!important;border-top-color:rgba(255,52,52,.22)!important}\
      @keyframes cloudy-premium-sweep{0%{transform:translate3d(-145%,0,0)}100%{transform:translate3d(340%,0,0)}}\
      @media(max-width:980px){.cloudy-v2-section{width:min(920px,calc(100% - 32px))!important}.game-home .game-tabs{grid-template-columns:1fr!important}.cloudy-coming-card{min-height:300px!important}.cloudy-store-feature,.cloudy-community-card{grid-template-columns:1fr!important;gap:30px!important;text-align:left!important}.cloudy-store-feature .cloudy-v2-btn,.cloudy-community-card .cloudy-v2-btn{justify-self:start!important}.cloudy-purpose-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.cloudy-future-card{grid-template-columns:1fr!important}.cloudy-future-card>.cloudy-v2-eyebrow,.cloudy-future-card>h2,.cloudy-future-card>p,.cloudy-stats{grid-column:1!important}.cloudy-stats{grid-row:auto!important;margin-top:24px!important}}\
      @media(max-width:680px){.cloudy-v2-section{width:calc(100% - 24px)!important;margin-top:72px!important}.cloudy-v2-heading{margin-bottom:28px!important}.game-home .game-tabs{width:calc(100% - 8px)!important}.game-home .game-tab .game-cover{height:340px!important}.cloudy-store-feature,.cloudy-community-card,.cloudy-future-card{padding:34px 24px!important;border-radius:16px!important}.cloudy-pay-grid,.cloudy-purpose-grid{grid-template-columns:1fr!important}.cloudy-pay-card,.cloudy-purpose-card{min-height:auto!important}.cloudy-stat{grid-template-columns:1fr!important;gap:5px!important}.cloudy-final-line{width:calc(100% - 24px)!important;gap:18px!important;flex-direction:column!important;margin-top:64px!important}}\
      @media(prefers-reduced-motion:reduce){.cloudy-store-feature:before,.cloudy-pay-card:before,.cloudy-community-card:before,.cloudy-future-card:before{animation:none!important;transform:translate3d(115%,0,0)!important}}';
    document.head.appendChild(style);
  }

  function upgradePaymentIcons(){
    document.querySelectorAll('.cloudy-pay-card').forEach(function(card){
      const title=card.querySelector('h3')?.textContent?.trim().toLowerCase();
      const holder=card.querySelector('.cloudy-v2-icon');
      if(!holder || !title || !icons[title]) return;
      holder.innerHTML=icons[title];
      holder.setAttribute('aria-hidden','true');
    });
  }

  function run(){
    addStyles();
    upgradePaymentIcons();
    requestAnimationFrame(upgradePaymentIcons);
    setTimeout(upgradePaymentIcons,120);
    setTimeout(upgradePaymentIcons,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
`;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let enhancer = '';
  try {
    const response = await fetch(`${origin}/cloudy-home-enhancer`, { cache: 'no-store' });
    if (response.ok) enhancer = await response.text();
  } catch {
    enhancer = '';
  }

  return new Response(`${enhancer}\n${exactCopy}\n${premiumPolish}`, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
