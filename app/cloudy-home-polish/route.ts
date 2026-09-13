const BASE_HOME = 'https://cloudy-store-owerhk8s0-cloudystore.vercel.app/';

export const dynamic = 'force-dynamic';

function applyPolish(html: string) {
  const styles = `<style id="cloudy-final-polish">
@media (max-width:760px){
  .game-home .game-tabs{display:flex!important;flex-wrap:nowrap!important;justify-content:flex-start!important;align-items:stretch!important;gap:14px!important;width:100%!important;max-width:100%!important;margin:0 auto 58px!important;padding:4px 18px 18px!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory!important;scroll-padding-inline:18px!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-x pan-y!important;scrollbar-width:none!important}
  .game-home .game-tabs::-webkit-scrollbar{display:none!important}
  .game-home .game-tab{flex:0 0 min(84vw,430px)!important;width:min(84vw,430px)!important;max-width:none!important;margin:0!important;scroll-snap-align:center!important;scroll-snap-stop:always!important;border-radius:14px!important}
  .game-home .game-cover{height:min(390px,94vw)!important;min-height:300px!important;border-radius:14px!important}
  .game-home .game-tab-content{padding:24px 22px!important}
  .game-home .game-tab-content>strong{font-size:clamp(38px,11vw,46px)!important;line-height:1!important}
  .game-home .game-tab-content::after{font-size:11px!important;letter-spacing:.22em!important}
  .game-home .game-card-footer{right:16px!important;bottom:18px!important;min-width:118px!important;padding:10px 13px!important;font-size:10px!important}
}
@media (max-width:480px){
  .game-home .game-tabs{padding-inline:14px!important;scroll-padding-inline:14px!important;gap:12px!important}
  .game-home .game-tab{flex-basis:86vw!important;width:86vw!important}
  .game-home .game-cover{height:min(350px,96vw)!important;min-height:286px!important}
}
@media (min-width:761px){
  .reference-topbar{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  .cloud-layer-far,.cloud-layer-near{animation:none!important;will-change:auto!important;transform:none!important}
  .site-clouds::before{animation-duration:64s!important;will-change:transform!important}
  .cloudy-intro-card{animation:none!important;filter:none!important}
  .product-card,.product-art img{will-change:auto!important}
  .cloudy-footer-glow{animation-duration:10s!important}
}
</style>`;

  const script = `<script id="cloudy-final-polish-script">
(function(){
  function dedupe(){
    ['.cloudy-intro-card','.cloudy-benefits','.store-navigation'].forEach(function(selector){
      var nodes=document.querySelectorAll(selector);
      for(var i=1;i<nodes.length;i++) nodes[i].remove();
    });
  }
  function initCarousel(){
    var tabs=document.getElementById('game-tabs');
    if(!tabs) return;
    tabs.setAttribute('aria-label','Games');
    var dragging=false,startX=0,startScroll=0,moved=false;
    tabs.addEventListener('pointerdown',function(event){
      if(event.pointerType==='touch'||tabs.scrollWidth<=tabs.clientWidth) return;
      dragging=true;moved=false;startX=event.clientX;startScroll=tabs.scrollLeft;
      if(tabs.setPointerCapture) tabs.setPointerCapture(event.pointerId);
      tabs.style.cursor='grabbing';
    });
    tabs.addEventListener('pointermove',function(event){
      if(!dragging) return;
      var delta=event.clientX-startX;
      if(Math.abs(delta)>5) moved=true;
      tabs.scrollLeft=startScroll-delta;
    });
    function stopDrag(event){
      if(!dragging) return;
      dragging=false;tabs.style.cursor='';
      try{if(tabs.releasePointerCapture) tabs.releasePointerCapture(event.pointerId);}catch(_e){}
    }
    tabs.addEventListener('pointerup',stopDrag);
    tabs.addEventListener('pointercancel',stopDrag);
    tabs.addEventListener('click',function(event){if(moved){event.preventDefault();event.stopPropagation();moved=false;}},true);
  }
  function init(){dedupe();initCarousel();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
</script>`;

  let output = html;
  if (!output.includes('id="cloudy-final-polish"')) output = output.replace('</head>', `${styles}</head>`);
  if (!output.includes('id="cloudy-final-polish-script"')) output = output.replace('</body>', `${script}</body>`);
  return output;
}

export async function GET() {
  try {
    const response = await fetch(BASE_HOME, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Base homepage returned ${response.status}`);
    return new Response(applyPolish(await response.text()), {
      status: 200,
      headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, max-age=0'},
    });
  } catch (error) {
    console.error('[CloudyHomePolish] Failed to load base homepage', error);
    return new Response('Cloudy is temporarily unavailable.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}
