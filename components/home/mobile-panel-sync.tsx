'use client';
import { useEffect } from 'react';

export function MobilePanelSync() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>('.cloudy-classic-home');
    if (!home) return;
    const media = window.matchMedia('(max-width: 820px)');
    const panels = [...home.querySelectorAll<HTMLElement>('.cloudy-classic-intro, .cloudy-classic-coming, .cloudy-classic-feature, .cloudy-classic-future, .cloudy-restored-pay-grid article, .cloudy-classic-why-grid article')];
    let frame = 0;
    const measure = () => {
      const root = home.getBoundingClientRect();
      if (media.matches) {
        home.style.setProperty('--cloudy-mobile-plane-height', root.height + 'px');
        // The former 400%-wide background travelled three card widths in five seconds.
        const cardWidth = panels[0]?.getBoundingClientRect().width || window.innerWidth;
        const travel = 3 * cardWidth;
        home.style.setProperty('--cloudy-mobile-light-travel', -travel + 'px');
        home.style.setProperty('--cloudy-mobile-light-period', (travel * Math.sin(110 * Math.PI / 180)) + 'px');
      } else {
        home.style.removeProperty('--cloudy-mobile-plane-height');
        home.style.removeProperty('--cloudy-mobile-light-travel');
        home.style.removeProperty('--cloudy-mobile-light-period');
      }
      for (const panel of panels) {
        if (media.matches) {
          const rect = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          panel.style.setProperty('--cloudy-panel-left', (rect.left + parseFloat(style.borderLeftWidth || '0')) + 'px');
          panel.style.setProperty('--cloudy-panel-top', (rect.top - root.top + parseFloat(style.borderTopWidth || '0')) + 'px');
        } else {
          panel.style.removeProperty('--cloudy-panel-left');
          panel.style.removeProperty('--cloudy-panel-top');
        }
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(home);
    for (const panel of panels) observer.observe(panel);
    home.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      home.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      home.style.removeProperty('--cloudy-mobile-plane-height');
      home.style.removeProperty('--cloudy-mobile-light-travel');
      home.style.removeProperty('--cloudy-mobile-light-period');
      for (const panel of panels) { panel.style.removeProperty('--cloudy-panel-left'); panel.style.removeProperty('--cloudy-panel-top'); }
    };
  }, []);
  return null;
}
