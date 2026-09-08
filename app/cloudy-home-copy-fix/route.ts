export const dynamic = 'force-dynamic';

const copyFix = String.raw`
;(function(){
  if (location.pathname !== '/') return;

  function setText(selector, value){
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
    return node;
  }

  function apply(){
    const kicker = document.querySelector('.cloudy-v2-kicker');
    if (kicker) kicker.textContent = 'WHERE GAMES MEET QUALITY.';

    const tagline = document.querySelector('.cloudy-cinematic-hero .cloudy-one-community');
    if (tagline) tagline.innerHTML = 'Perfected through detail. <strong>Designed for excellence.</strong>';

    const heroBonus = document.querySelector('.cloudy-user-copy-bonus');
    if (heroBonus) heroBonus.textContent = 'Cloudy creates and operates unique gaming experiences across the games you love.';

    setText('.cloudy-intro-card p', 'Cloudy creates and operates dedicated gaming experiences, bringing together immersive servers, active communities and in-game services');

    const gamesStyleId = 'cloudy-copy-fix-games';
    if (!document.getElementById(gamesStyleId)) {
      const style = document.createElement('style');
      style.id = gamesStyleId;
      style.textContent = '.store-navigation::after{content:"Discover the games, servers and experiences created and operated by Cloudy."!important}.cloudy-coming-card h3,.cloudy-coming-card p{display:none!important}';
      document.head.appendChild(style);
    }

    setText('.cloudy-store-feature .cloudy-v2-eyebrow', 'Cloudy Store');
    setText('.cloudy-store-feature h2', 'Enhance your experience.');
    setText('.cloudy-store-feature > div > p:not(.cloudy-v2-eyebrow)', 'From in-game kits to exclusive features, Cloudy offers additional ways to personalize and enhance your gaming experience.');
    setText('.cloudy-store-tags', 'Kits • In-game services • Exclusive features');

    setText('#cloudy-payments .cloudy-v2-eyebrow', 'Secure payments');
    setText('#cloudy-payments .cloudy-v2-heading h2', 'A Higher Standard of Gaming.');
    const paymentSub = document.querySelector('#cloudy-payments .cloudy-v2-heading > p:not(.cloudy-v2-eyebrow)');
    if (paymentSub) paymentSub.remove();

    const payments = [...document.querySelectorAll('.cloudy-pay-card')];
    const paymentCopy = {
      'secure checkout': 'Protected payment processing.',
      'instant delivery': 'Receive your digital purchases quickly.',
      'trusted payments': 'Payments handled by secure, established providers.'
    };
    payments.forEach(function(card){
      const title = card.querySelector('h3')?.textContent?.trim().toLowerCase();
      const body = card.querySelector('p');
      if (title && body && paymentCopy[title]) body.textContent = paymentCopy[title];
    });

    setText('#cloudy-community .cloudy-v2-eyebrow', 'Community');
    setText('#cloudy-community h2', 'Join the community.');
    setText('#cloudy-community p:not(.cloudy-v2-eyebrow)', 'Connect with other players, stay up to date with Cloudy, get support and discover what’s coming next.');

    const purposeCopy = {
      'quality': 'We focus on creating stable, polished and enjoyable gaming experiences.',
      'community': 'Every detail is designed to enhance the player experience',
      'innovation': 'We continuously explore new ideas, features and ways to push what’s possible.',
      'precision': 'Every decision is carefully considered, with precision built into every element.'
    };
    document.querySelectorAll('.cloudy-purpose-card').forEach(function(card){
      const title = card.querySelector('h3')?.textContent?.trim().toLowerCase();
      const body = card.querySelector('p');
      if (title && body && purposeCopy[title]) body.textContent = purposeCopy[title];
    });

    setText('#cloudy-future .cloudy-v2-eyebrow', 'What’s next?');
    setText('#cloudy-future h2', 'The future of Cloudy');
    setText('#cloudy-future p:not(.cloudy-v2-eyebrow)', 'We aim to expand Cloudy across new games and experiences, while carrying the same attention to detail and commitment to quality into everything we create.');

    const stats = [...document.querySelectorAll('.cloudy-stat')];
    if (stats[0]) { setText('.cloudy-stat:nth-child(1) strong', 'XX,XXX+'); setText('.cloudy-stat:nth-child(1) span', 'Players'); }
    if (stats[1]) { setText('.cloudy-stat:nth-child(2) strong', 'XX'); setText('.cloudy-stat:nth-child(2) span', 'Servers'); }
    if (stats[2]) { setText('.cloudy-stat:nth-child(3) strong', 'XX,XXX+'); setText('.cloudy-stat:nth-child(3) span', 'Community members'); }

    const final = [...document.querySelectorAll('.cloudy-final-line span')];
    if (final[0]) final[0].textContent = 'Carefully designed.';
    if (final[1]) final[1].textContent = 'Experience differently.';
  }

  function run(){
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 120);
    setTimeout(apply, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();
`;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let base = '';
  try {
    const response = await fetch(`${origin}/cloudy-home-final`, { cache: 'no-store' });
    if (response.ok) base = await response.text();
  } catch {
    base = '';
  }

  return new Response(`${base}\n${copyFix}`, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
