const LEGACY_SITE = 'https://cloudy-store-l5gnmyiqr-cloudystore.vercel.app';
const DISCORD_URL = 'https://discord.gg/HGvtrSvK6w';
const DISCORD_EMOJI_URL = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=96&quality=lossless';

export const dynamic = 'force-dynamic';

function updateHomeNavigation(html: string) {
  const navigation = `<a class="cloudy-nav-brand" href="/" aria-label="Cloudy home"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="" width="34" height="34"><span>CLOUDY INC.</span></a>
  <div class="top-links policy-top-links"><a class="is-active" href="/" aria-current="page">HOME</a><a href="/#server">SERVER</a><a href="/appeal">APPEAL FORM</a></div>`;
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

function rebuildHomeHero(html: string) {
  const hero = `<div class="brand-hero wrap cloudy-cinematic-hero">
    <div class="cloudy-hero-logo-shell"><img class="hero-logo" src="/assets/cloudy-c-logo-auf-auf.gif" alt="Cloudy C logo" width="170" height="170"></div>
    <h1>CLOUDY</h1>
    <p class="cloudy-one-community"><span>One</span> <strong>community.</strong></p>
  </div>`;
  return html.replace(/<div class="brand-hero wrap">[\s\S]*?<\/header>/, `${hero}\n</header>`);
}

function injectHomeFeatureSections(html: string) {
  const featureMarkup = `
  <section class="cloudy-intro-card" aria-label="About Cloudy">
    <p>Cloudy Inc. is a gaming company focused on developing and operating within the gaming industry, currently starting with Rust game servers, alongside digital products and services, a dedicated website, and a community that bring our services and platform together.</p>
  </section>
  <section class="cloudy-benefits" aria-label="Cloudy benefits">
    <div class="cloudy-benefit">
      <span class="cloudy-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.2 2 5 13h6l-1 9 8.2-12H12l1.2-8Z"/></svg></span>
      <span><strong>FAST SUPPORT</strong><small>We're always here</small></span>
    </div>
    <div class="cloudy-benefit">
      <span class="cloudy-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg></span>
      <span><strong>SECURE PURCHASES</strong><small>Safe &amp; trusted</small></span>
    </div>
    <div class="cloudy-benefit">
      <span class="cloudy-benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20v-1.5A5.5 5.5 0 0 1 8.5 13h1A5.5 5.5 0 0 1 15 18.5V20"/><path d="M14.5 14.2c.6-.4 1.3-.7 2.2-.7h.6A3.7 3.7 0 0 1 21 17.2V19"/></svg></span>
      <span><strong>COMMUNITY DRIVEN</strong><small>Built for players</small></span>
    </div>
  </section>`;
  return html.replace('<main id="store" class="game-home wrap">', `<main id="store" class="game-home wrap">${featureMarkup}`);
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
    <div class="cloudy-footer-glow" aria-hidden="true"></div>
    <div class="cloudy-shared-footer-inner">
      <div class="cloudy-footer-row">
        <a class="cloudy-shared-footer-brand" href="/" aria-label="Cloudy home"><img src="/assets/cloudy-c-logo-auf-auf.gif" alt="" width="58" height="58"><strong>CLOUDY INC.</strong></a>
        <nav class="cloudy-footer-nav" aria-label="Footer navigation"><a href="/legal#terms">Terms of service</a><a href="/legal#sales">Terms of sale</a><a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Support</a></nav>
        <a class="cloudy-footer-discord" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer" aria-label="Cloudy Discord"><img src="${DISCORD_EMOJI_URL}" alt="" width="26" height="26"><span>Discord</span></a>
      </div>
      <div class="cloudy-shared-footer-bottom">© 2026 Cloudy Inc. • Quality. Innovation. Performance.</div>
    </div>
  </footer>`;
  return html.replace(/<footer[\s\S]*?<\/footer>/, footer);
}

function injectHomeStyles(html: string) {
  const styles = `<style>
:root{--cloudy-red:#ff3434;--cloudy-red-deep:#9b0000;--cloudy-white:#f7f7f7;--cloudy-ink:#050505}
body{background:#030303!important;color:#f5f5f5!important}
.site-clouds{position:fixed!important;inset:0!important;z-index:-2!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(2,2,3,.58) 0%,rgba(3,3,4,.72) 34%,rgba(2,2,2,.82) 72%,#030303 100%),linear-gradient(90deg,rgba(0,0,0,.68),transparent 34%,transparent 66%,rgba(0,0,0,.72)),url('/assets/rust-keyart.jpg') center 24%/cover no-repeat!important;background-color:#030303!important}
.site-clouds::before{content:"";position:absolute;inset:-10%;pointer-events:none;background:radial-gradient(circle at 15% 74%,rgba(255,255,255,.11) 0 3%,transparent 17%),radial-gradient(circle at 31% 70%,rgba(150,150,150,.08) 0 4%,transparent 18%),radial-gradient(circle at 76% 61%,rgba(255,42,42,.15) 0 3%,transparent 20%),radial-gradient(circle at 88% 75%,rgba(128,0,0,.18) 0 5%,transparent 24%);filter:blur(34px);opacity:.72;animation:cloudy-smoke-drift 28s ease-in-out infinite alternate}
.cloud-layer-far{display:block!important;position:absolute!important;inset:-16%!important;opacity:.26!important;filter:blur(48px)!important;mix-blend-mode:screen!important;background:radial-gradient(circle at 12% 28%,rgba(255,255,255,.16) 0 5%,transparent 20%),radial-gradient(circle at 38% 19%,rgba(210,210,210,.11) 0 5%,transparent 22%),radial-gradient(circle at 67% 28%,rgba(255,255,255,.08) 0 5%,transparent 21%),radial-gradient(circle at 91% 18%,rgba(255,50,50,.11) 0 4%,transparent 22%)!important;animation:cloudy-smoke-far 42s ease-in-out infinite alternate!important}
.cloud-layer-near{display:block!important;position:absolute!important;inset:-20%!important;opacity:.18!important;filter:blur(64px)!important;mix-blend-mode:screen!important;background:radial-gradient(circle at 18% 81%,rgba(255,255,255,.14) 0 4%,transparent 20%),radial-gradient(circle at 54% 78%,rgba(190,190,190,.1) 0 4%,transparent 23%),radial-gradient(circle at 88% 77%,rgba(255,32,32,.16) 0 4%,transparent 24%)!important;animation:cloudy-smoke-near 36s ease-in-out infinite alternate!important}
.site-clouds::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.18),transparent 28%,rgba(0,0,0,.24) 68%,rgba(0,0,0,.58))!important}
@keyframes cloudy-smoke-drift{from{transform:translate3d(-2%,1%,0)}to{transform:translate3d(2%,-1%,0)}}
@keyframes cloudy-smoke-far{from{transform:translate3d(-3%,-1%,0) scale(1.02)}to{transform:translate3d(3%,1%,0) scale(1.07)}}
@keyframes cloudy-smoke-near{from{transform:translate3d(2%,1%,0) scale(1.04)}to{transform:translate3d(-2%,-1%,0) scale(1.08)}}
.masthead{position:relative;z-index:5;background:transparent!important}
.reference-topbar{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;max-width:none!important;min-height:72px!important;margin:0!important;padding:0 42px!important;box-sizing:border-box!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;border-radius:0!important;background:rgba(4,4,6,.94)!important;box-shadow:0 14px 34px rgba(0,0,0,.32)!important;backdrop-filter:blur(16px)}
.cloudy-nav-brand{position:absolute;left:42px;display:flex;align-items:center;gap:10px;color:#f4f4f4!important;text-decoration:none!important}.cloudy-nav-brand img{width:34px;height:34px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(255,255,255,.16))}.cloudy-nav-brand span{font-size:10px;font-weight:900;letter-spacing:.18em;white-space:nowrap}
.reference-topbar .policy-top-links{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;margin:0!important;padding:0!important}.reference-topbar .policy-top-links a{position:relative;padding:12px 18px!important;border-radius:9px!important;color:#a6a6a9!important;background:transparent!important;font-size:11px!important;font-weight:850!important;letter-spacing:.11em!important;text-decoration:none!important;transition:.22s ease!important}.reference-topbar .policy-top-links a:hover,.reference-topbar .policy-top-links a.is-active{color:#fff!important;background:linear-gradient(180deg,#171717,#0d0d0d)!important}.reference-topbar .policy-top-links a.is-active:after{content:"";position:absolute;left:16px;right:16px;bottom:3px;height:1px;background:linear-gradient(90deg,transparent,#fff 35%,var(--cloudy-red) 68%,transparent);box-shadow:0 0 10px rgba(255,45,45,.55)}
.reference-topbar .top-actions{position:absolute!important;right:42px!important;display:flex!important;align-items:center!important;gap:8px!important}.reference-topbar .basket-button,.reference-topbar .icon-button{color:#f3f3f3!important}.reference-topbar #basket-count{background:#f3f3f3!important;color:#111!important}.cloudy-home-menu-toggle{font-size:21px!important;line-height:1!important}.cloudy-home-menu{position:absolute;top:62px;right:42px;z-index:80;min-width:170px;padding:8px;background:#080808;border:1px solid #2b2b2b;border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,.55)}.cloudy-home-menu button{width:100%;padding:12px 13px;border:0;border-radius:7px;background:transparent;color:#d8d8d8;text-align:left;font:inherit;font-size:13px;cursor:pointer}.cloudy-home-menu button:hover{background:#171717;color:#fff}
.cloudy-cinematic-hero{min-height:334px!important;padding:34px 20px 28px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:8px!important;text-align:center!important;position:relative!important}.cloudy-cinematic-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(150,0,0,.13),transparent 28%);pointer-events:none}.cloudy-hero-logo-shell{position:relative;width:152px;height:152px;display:grid;place-items:center;border-radius:50%;background:rgba(5,5,5,.72);box-shadow:0 0 0 1px rgba(255,255,255,.04),0 18px 44px rgba(0,0,0,.55)}.cloudy-hero-logo-shell::before{content:"";position:absolute;left:-2px;top:34%;width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 10px #fff,0 0 20px var(--cloudy-red),0 0 34px var(--cloudy-red);animation:cloudy-logo-spark 2.4s ease-in-out infinite}@keyframes cloudy-logo-spark{0%,100%{opacity:.45;transform:scale(.75)}50%{opacity:1;transform:scale(1.25)}}.cloudy-cinematic-hero .hero-logo{width:144px!important;height:144px!important;object-fit:contain!important;filter:drop-shadow(0 0 16px rgba(255,255,255,.15))!important}.cloudy-cinematic-hero h1{margin:8px 0 0!important;color:#fff!important;font-size:66px!important;line-height:1!important;font-weight:950!important;letter-spacing:.08em!important;text-shadow:0 3px 18px rgba(0,0,0,.6),0 0 14px rgba(255,255,255,.08)}.cloudy-one-community{margin:5px 0 0!important;font-size:20px!important;letter-spacing:.22em!important;color:#ececee!important;font-weight:400!important}.cloudy-one-community strong{color:#ff4a4a!important;font-weight:500!important}.brand-hero .hero-bottom{display:none!important}
.game-home::before{content:none!important;display:none!important}.game-home{position:relative!important;padding-top:0!important;padding-bottom:90px!important;z-index:2}
@property --cloudy-intro-angle{syntax:'<angle>';inherits:false;initial-value:0deg}.cloudy-intro-card{--cloudy-intro-angle:0deg;position:relative;width:min(980px,calc(100% - 28px));margin:4px auto 30px;padding:28px 40px;box-sizing:border-box;border:2px solid transparent;border-radius:18px;background:linear-gradient(rgba(5,5,5,.93),rgba(5,5,5,.93)) padding-box,conic-gradient(from var(--cloudy-intro-angle),#fff 0 8%,#ff4c4c 14%,#a60000 22%,#fff 34% 48%,#ff2c2c 58%,#7a0000 66%,#fff 78% 92%,#ff3b3b 100%) border-box;box-shadow:0 0 22px rgba(255,255,255,.07),0 0 36px rgba(185,0,0,.26),0 0 72px rgba(255,30,30,.12),inset 0 1px rgba(255,255,255,.04);animation:cloudy-intro-spin 2.8s linear infinite,cloudy-intro-flash 1.45s ease-in-out infinite}.cloudy-intro-card p{margin:0;color:#dedee2;font-size:16px;line-height:1.7;text-align:center}@keyframes cloudy-intro-spin{to{--cloudy-intro-angle:360deg}}@keyframes cloudy-intro-flash{0%,100%{filter:saturate(.9);box-shadow:0 0 18px rgba(255,255,255,.06),0 0 34px rgba(180,0,0,.22),0 0 64px rgba(255,30,30,.10)}50%{filter:saturate(1.18);box-shadow:0 0 26px rgba(255,255,255,.11),0 0 48px rgba(220,0,0,.34),0 0 82px rgba(255,38,38,.18)}}
.cloudy-benefits{width:min(900px,calc(100% - 30px));margin:0 auto 58px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;border-top:1px solid rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.02);background:rgba(5,5,5,.34)}.cloudy-benefit{min-height:94px;display:flex;align-items:center;justify-content:center;gap:15px;padding:12px 22px;position:relative}.cloudy-benefit:not(:last-child)::after{content:"";position:absolute;right:0;top:24%;bottom:24%;width:1px;background:linear-gradient(transparent,rgba(255,255,255,.22),transparent)}.cloudy-benefit-icon{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border-radius:50%;background:rgba(95,0,0,.18);box-shadow:inset 0 0 0 1px rgba(255,60,60,.08),0 0 18px rgba(180,0,0,.08)}.cloudy-benefit-icon svg{width:28px;height:28px;fill:none;stroke:#ff4343;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.cloudy-benefit>span:last-child{display:flex;flex-direction:column;gap:6px}.cloudy-benefit strong{font-size:12px;letter-spacing:.07em;color:#fff}.cloudy-benefit small{font-size:12px;color:#a6a6aa}
.store-navigation{min-height:112px!important;margin:0 auto 22px!important;padding:8px 12px 18px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:10px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}.store-navigation h2{display:flex!important;align-items:center!important;justify-content:center!important;gap:22px!important;margin:0!important;padding:0!important;background:transparent!important;color:#fff!important;font-size:28px!important;font-weight:900!important;letter-spacing:.16em!important;text-transform:uppercase!important}.store-navigation h2::before,.store-navigation h2::after{content:"";width:138px;height:1px;background:linear-gradient(90deg,transparent,var(--cloudy-red),#fff);box-shadow:0 0 10px rgba(255,45,45,.32)}.store-navigation h2::after{transform:scaleX(-1)}.store-navigation::after{content:"Explore our games, servers and exclusive content.";color:#aaaab0;font-size:13px;letter-spacing:.01em}.store-navigation::before{content:"";order:3;width:54px;height:2px;margin-top:2px;background:linear-gradient(90deg,transparent,#fff 22%,var(--cloudy-red) 58%,transparent);box-shadow:0 0 12px rgba(255,45,45,.8)}.game-home:has(#game-panel:not([hidden])) .store-navigation{min-height:64px!important;padding:0!important;margin-bottom:20px!important}.game-home:has(#game-panel:not([hidden])) .store-navigation::before,.game-home:has(#game-panel:not([hidden])) .store-navigation::after{display:none!important}.game-home:has(#game-panel:not([hidden])) .store-navigation .games-back{margin:0 auto!important;padding:11px 18px!important;border:1px solid rgba(255,70,70,.45)!important;border-radius:999px!important;background:#070707!important;color:#fff!important}
.game-home .game-tabs{gap:24px!important;margin:0 auto 78px!important;align-items:start!important;justify-content:center!important;padding:4px 0 12px!important}.game-home .game-tab{position:relative!important;display:block!important;flex:0 1 760px!important;width:min(760px,100%)!important;max-width:760px!important;height:auto!important;padding:0!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:14px!important;background:#070707!important;overflow:hidden!important;box-shadow:0 30px 70px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.025)!important;transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease!important}.game-home .game-tab:hover{transform:translateY(-5px)!important;border-color:rgba(255,70,70,.54)!important;box-shadow:0 34px 76px rgba(0,0,0,.56),0 0 32px rgba(155,0,0,.14)!important}.game-cover{position:relative!important;isolation:isolate!important;display:block!important;height:430px!important;overflow:hidden!important;border-radius:14px!important;background:#111!important}.game-cover>img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:56% 42%!important;filter:saturate(.78) contrast(1.08) brightness(.82)!important;z-index:-3!important;transition:transform .55s ease,filter .35s ease!important}.game-tab:hover .game-cover>img{transform:scale(1.035)!important;filter:saturate(.9) contrast(1.1) brightness(.88)!important}.game-cover::before{content:"RUST";position:absolute;z-index:4;left:22px;top:20px;padding:8px 13px 8px 17px;border-radius:4px;background:rgba(12,12,12,.82);color:#fff;font-size:12px;font-weight:900;letter-spacing:.08em;border-left:8px solid var(--cloudy-red);box-shadow:0 8px 20px rgba(0,0,0,.3)}.game-home .game-cover .game-tab-shade{position:absolute!important;inset:0!important;z-index:-1!important;background:linear-gradient(0deg,rgba(0,0,0,.96) 0%,rgba(0,0,0,.62) 30%,rgba(0,0,0,.10) 67%,rgba(0,0,0,.12) 100%)!important}.game-home .game-cover .game-tab-content{position:absolute!important;inset:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-end!important;padding:28px 30px!important;height:auto!important;box-sizing:border-box!important}.game-home .game-tab-content>strong{font-size:56px!important;font-weight:950!important;letter-spacing:.045em!important;margin:0!important;color:white!important;line-height:1!important;text-shadow:0 4px 18px rgba(0,0,0,.7)!important}.game-home .game-tab-content::after{content:"SERVERS & KITS";margin-top:10px;color:#d3d3d6;font-size:14px;letter-spacing:.28em}.game-card-footer{position:absolute!important;right:28px!important;bottom:28px!important;z-index:6!important;width:auto!important;min-width:170px!important;margin:0!important;padding:13px 20px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:14px!important;border:1px solid var(--cloudy-red)!important;border-radius:999px!important;background:rgba(5,5,6,.86)!important;color:#fff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.08em!important;line-height:1.2!important;box-shadow:0 0 22px rgba(190,0,0,.16)!important;transition:background .22s ease,box-shadow .22s ease,transform .22s ease!important}.game-tab:hover .game-card-footer{background:#0a0a0b!important;box-shadow:0 0 26px rgba(255,45,45,.26)!important;transform:translateY(-1px)!important}
#game-panel{background:rgba(7,7,8,.92)!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:12px!important;box-shadow:0 26px 70px rgba(0,0,0,.42)!important}.detail-button{border-color:rgba(255,60,60,.35)!important}.detail-button:hover{border-color:rgba(255,60,60,.7)!important}
.cloudy-shared-footer{position:relative!important;background:rgba(3,3,4,.96)!important;border-top:0!important;color:#a7a7ab!important;overflow:hidden!important}.cloudy-footer-glow{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent 0%,var(--cloudy-red) 10%,#fff 18%,var(--cloudy-red) 27%,transparent 43%,transparent 57%,var(--cloudy-red) 72%,#fff 81%,var(--cloudy-red) 90%,transparent 100%);background-size:180% 100%;box-shadow:0 0 12px rgba(255,40,40,.7);animation:cloudy-footer-scan 6s linear infinite}@keyframes cloudy-footer-scan{to{background-position:180% 0}}.cloudy-shared-footer-inner{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:42px 0 28px}.cloudy-footer-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:34px}.cloudy-shared-footer-brand{display:flex;align-items:center;gap:13px;color:#f3f3f3!important;text-decoration:none!important;justify-self:start}.cloudy-shared-footer-brand img{width:58px;height:58px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(255,255,255,.12))}.cloudy-shared-footer-brand strong{font-size:12px;font-weight:900;letter-spacing:.18em}.cloudy-footer-nav{display:flex;align-items:center;justify-content:center;gap:38px}.cloudy-footer-nav a{color:#dedee0!important;text-decoration:none!important;font-size:13px}.cloudy-footer-nav a:hover{color:#fff!important}.cloudy-footer-discord{justify-self:end;display:flex;align-items:center;gap:10px;color:#f4f4f4!important;text-decoration:none!important;font-size:13px;font-weight:700}.cloudy-footer-discord img{width:26px;height:26px;object-fit:contain}.cloudy-shared-footer-bottom{margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05);color:#7f7f84;font-size:11px;text-align:center}
.product-card{transition:transform .38s cubic-bezier(.2,.7,.2,1),border-color .38s ease,box-shadow .38s ease;will-change:transform}.product-art{overflow:hidden}.product-art img{filter:drop-shadow(0 0 10px rgba(255,255,255,.12));transition:transform .55s cubic-bezier(.2,.7,.2,1),filter .4s ease}.product-art:after{content:"";position:absolute;inset:-40% auto -40% -65%;width:42%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.13),transparent);transform:skewX(-16deg)}.product-dialog[open],.basket-dialog[open],.account-dialog[open]{animation:cloudy-dialog-in .24s cubic-bezier(.2,.72,.2,1)}.product-dialog::backdrop,.basket-dialog::backdrop,.account-dialog::backdrop{animation:cloudy-backdrop-in .22s ease both}.luxury-motion-ready .luxury-reveal{opacity:0;transform:translateY(14px);transition:opacity .58s ease,transform .58s cubic-bezier(.2,.7,.2,1)}.luxury-motion-ready .luxury-reveal.is-visible{opacity:1;transform:none}#basket-count.cloudy-basket-pulse{animation:cloudy-basket-pulse .42s cubic-bezier(.2,.8,.2,1)}@keyframes cloudy-dialog-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}@keyframes cloudy-backdrop-in{from{background:rgba(0,0,0,0)}to{background:rgba(0,0,0,.72)}}@keyframes cloudy-basket-pulse{0%,100%{transform:scale(1)}45%{transform:scale(1.13);box-shadow:0 0 16px rgba(255,255,255,.22)}}@keyframes cloudy-game-sheen{from{left:-65%}to{left:130%}}@media(hover:hover){.product-card:hover{transform:translateY(-5px);border-color:rgba(255,255,255,.2);box-shadow:0 24px 50px rgba(0,0,0,.34),0 0 0 1px rgba(255,255,255,.035)}.product-card:hover .product-art img{transform:scale(1.045);filter:drop-shadow(0 0 15px rgba(255,255,255,.2))}.product-card:hover .product-art:after{animation:cloudy-game-sheen .72s cubic-bezier(.2,.7,.2,1) forwards}}
@media(max-width:900px){.reference-topbar{padding:0 20px!important}.cloudy-nav-brand{left:20px}.reference-topbar .top-actions{right:20px!important}.cloudy-benefits{grid-template-columns:1fr}.cloudy-benefit{justify-content:flex-start;padding-left:28%}.cloudy-benefit:not(:last-child)::after{left:12%;right:12%;top:auto;bottom:0;width:auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)}.store-navigation h2::before,.store-navigation h2::after{width:80px}}
@media(max-width:760px){.reference-topbar{justify-content:flex-start!important;overflow:visible!important;padding:0 94px 0 12px!important;min-height:66px!important}.cloudy-nav-brand{display:none}.reference-topbar .policy-top-links{justify-content:flex-start!important;margin:0!important;gap:2px!important}.reference-topbar .policy-top-links a{padding:10px 8px!important;font-size:9px!important}.reference-topbar .top-actions{display:flex!important;right:8px!important;overflow:visible!important}.reference-topbar .basket-label{display:none!important}.reference-topbar .basket-button{min-width:0!important;width:auto!important;padding:0 2px!important;gap:8px!important;display:flex!important;align-items:center!important;overflow:visible!important;background:transparent!important;border:0!important}.reference-topbar #basket-count{display:grid!important;place-items:center!important;box-sizing:border-box!important;width:30px!important;min-width:30px!important;height:30px!important;padding:1px 0 0!important;border-radius:999px!important;line-height:1!important}.cloudy-home-menu{right:8px!important}.cloudy-cinematic-hero{min-height:290px!important;padding:28px 12px 22px!important}.cloudy-hero-logo-shell{width:126px;height:126px}.cloudy-cinematic-hero .hero-logo{width:120px!important;height:120px!important}.cloudy-cinematic-hero h1{font-size:50px!important}.cloudy-one-community{font-size:16px!important;letter-spacing:.18em!important}.cloudy-intro-card{width:calc(100% - 20px);padding:20px 18px;margin-bottom:24px;border-radius:15px}.cloudy-intro-card p{font-size:14px;line-height:1.6}.cloudy-benefits{width:calc(100% - 20px);margin-bottom:42px}.cloudy-benefit{padding-left:20%;min-height:82px}.store-navigation{min-height:96px!important}.store-navigation h2{font-size:21px!important;gap:14px!important;letter-spacing:.12em!important}.store-navigation h2::before,.store-navigation h2::after{width:42px}.store-navigation::after{font-size:12px;text-align:center}.game-home .game-tab{width:calc(100% - 18px)!important}.game-cover{height:390px!important}.game-home .game-tab-content>strong{font-size:46px!important}.game-card-footer{right:20px!important;bottom:22px!important;min-width:142px!important;padding:12px 16px!important}.cloudy-footer-row{grid-template-columns:1fr;gap:28px;text-align:center}.cloudy-shared-footer-brand,.cloudy-footer-discord{justify-self:center}.cloudy-footer-nav{gap:20px;flex-wrap:wrap}.cloudy-shared-footer-inner{width:calc(100% - 30px);padding:36px 0 28px}}
@media(max-width:480px){.cloudy-cinematic-hero{min-height:250px!important}.cloudy-cinematic-hero h1{font-size:42px!important}.cloudy-one-community{font-size:14px!important}.cloudy-benefit{padding-left:14%}.store-navigation h2{font-size:18px!important;gap:10px!important}.store-navigation h2::before,.store-navigation h2::after{width:26px}.game-cover{height:340px!important}.game-home .game-tab-content{padding:24px 22px!important}.game-home .game-tab-content>strong{font-size:40px!important}.game-home .game-tab-content::after{font-size:11px}.game-card-footer{right:16px!important;bottom:18px!important;min-width:120px!important;padding:10px 13px!important;font-size:10px!important}}
@media(prefers-reduced-motion:reduce){.site-clouds::before,.cloud-layer-far,.cloud-layer-near,.cloudy-hero-logo-shell::before,.cloudy-intro-card,.cloudy-footer-glow,.product-card,.product-art img,.luxury-reveal{animation:none!important;transition:none!important;transform:none!important}.product-art:after{display:none!important}}
</style>`;
  return html.replace('</head>', `${styles}</head>`);
}

function injectHomeInteractions(html: string) {
  const script = `<script>
(function(){
  function decorateGameCards(){
    document.querySelectorAll('.game-card-footer').forEach(function(footer){
      if(footer.dataset.cloudyLabel==='1') return;
      footer.dataset.cloudyLabel='1';
      footer.innerHTML='<span>VIEW RUST</span><span aria-hidden="true">→</span>';
    });
  }
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
    const tabs=document.getElementById('game-tabs');
    decorateGameCards();
    if(tabs&&'MutationObserver' in window){
      new MutationObserver(decorateGameCards).observe(tabs,{childList:true,subtree:true});
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
    const targets=document.querySelectorAll('.cloudy-intro-card,.cloudy-benefits,.store-navigation,#game-panel,.kit-panel,.product-card,.cloudy-shared-footer');
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
    html = rebuildHomeHero(html);
    html = injectHomeFeatureSections(html);
    html = updateHomeLegalLinks(html);
    html = replaceHomeFooter(html);
    html = injectHomeStyles(html);
    html = injectHomeInteractions(html);
    html = injectLuxuryMotion(html);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
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
