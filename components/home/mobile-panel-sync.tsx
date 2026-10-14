'use client';
import { useEffect } from 'react';

export function MobilePanelSync() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>('.cloudy-classic-home');
    if (!home) return;
    const media = window.matchMedia('(max-width: 820px)');
    const panels = [...home.querySelectorAll<HTMLElement>('.cloudy-classic-intro, .cloudy-classic-coming, .cloudy-classic-feature, .cloudy-classic-future, .cloudy-restored-pay-grid article, .cloudy-classic-why-grid article')];
    const lights = new Map<HTMLElement, HTMLSpanElement>();
    const startedAt = Number(document.timeline.currentTime ?? performance.now());
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const clip = entry.target as HTMLSpanElement;
        const texture = clip.firstElementChild as HTMLSpanElement;
        if (entry.isIntersecting) {
          // Newly visible cards join the existing timeline; hidden cards do
          // not retain large animated compositor textures on mobile GPUs.
          clip.dataset.visible = 'true';
          const animation = texture.getAnimations()[0];
          if (animation) animation.startTime = startedAt;
        } else {
          delete clip.dataset.visible;
        }
      }
    }, { rootMargin: '160px' });
    let frame = 0;
    const measure = () => {
      const root = home.getBoundingClientRect();
      if (media.matches) {
        // The former 400%-wide background travelled three card widths in five seconds.
        const cardWidth = panels[0]?.getBoundingClientRect().width || window.innerWidth;
        const travel = 3 * cardWidth;
        home.style.setProperty('--cloudy-mobile-light-travel', -travel + 'px');
        home.style.setProperty('--cloudy-mobile-light-period', (travel * Math.sin(110 * Math.PI / 180)) + 'px');
      } else {
        home.style.removeProperty('--cloudy-mobile-light-travel');
        home.style.removeProperty('--cloudy-mobile-light-period');
      }
      for (const panel of panels) {
        if (media.matches) {
          const rect = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          const left = rect.left + parseFloat(style.borderLeftWidth || '0');
          const top = rect.top - root.top + parseFloat(style.borderTopWidth || '0');
          const angle = 110 * Math.PI / 180;
          const period = -parseFloat(home.style.getPropertyValue('--cloudy-mobile-light-travel')) * Math.sin(angle);
          // Project the page coordinates onto the gradient's normal so the
          // diagonal remains aligned across cards, including their gaps.
          const phase = (left * Math.sin(angle) - top * Math.cos(angle)) % period;
          panel.style.setProperty('--cloudy-mobile-light-phase', -phase + 'px');
          if (!lights.has(panel)) {
            const clip = document.createElement('span');
            clip.className = 'cloudy-mobile-sheen';
            clip.setAttribute('aria-hidden', 'true');
            const texture = document.createElement('span');
            texture.className = 'cloudy-mobile-sheen-texture';
            clip.append(texture);
            panel.append(clip);
            lights.set(panel, clip);
            visibility.observe(clip);
          }
        } else {
          panel.style.removeProperty('--cloudy-mobile-light-phase');
          const clip = lights.get(panel);
          if (clip) { visibility.unobserve(clip); clip.remove(); }
          lights.delete(panel);
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
      visibility.disconnect();
      home.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      home.style.removeProperty('--cloudy-mobile-light-travel');
      home.style.removeProperty('--cloudy-mobile-light-period');
      for (const panel of panels) {
        panel.style.removeProperty('--cloudy-mobile-light-phase');
        lights.get(panel)?.remove();
      }
    };
  }, []);
  return null;
}
