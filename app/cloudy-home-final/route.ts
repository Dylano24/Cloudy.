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

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let enhancer = '';
  try {
    const response = await fetch(`${origin}/cloudy-home-enhancer`, { cache: 'no-store' });
    if (response.ok) enhancer = await response.text();
  } catch {
    enhancer = '';
  }

  return new Response(`${enhancer}\n${exactCopy}`, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
