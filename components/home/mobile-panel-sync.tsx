'use client';
import { useEffect } from 'react';

export function MobilePanelSync() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>('.cloudy-classic-home');
    if (!home) return;
    const media = window.matchMedia('(max-width: 820px)');
    const panels = [...home.querySelectorAll<HTMLElement>('.cloudy-classic-intro, .cloudy-classic-coming, .cloudy-classic-feature, .cloudy-classic-future, .cloudy-restored-pay-grid article, .cloudy-classic-why-grid article, .cloudy-classic-why-grid, .cloudy-classic-game-card, .cloudy-classic-benefits')];
    let frame = 0;
    const measure = () => {
      for (const panel of panels) {
        if (media.matches) panel.style.setProperty('--cloudy-panel-left', `${panel.getBoundingClientRect().left + parseFloat(getComputedStyle(panel).borderLeftWidth || '0')}px`);
        else panel.style.removeProperty('--cloudy-panel-left');
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
      for (const panel of panels) panel.style.removeProperty('--cloudy-panel-left');
    };
  }, []);
  return null;
}
