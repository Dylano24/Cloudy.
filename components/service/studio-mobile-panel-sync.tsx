'use client';

import { useEffect } from 'react';
import { createMobileSheenClock } from '@/lib/mobile-sheen-clock';

export function StudioMobilePanelSync() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.cloudy-studio-page');
    if (!root) return;

    const media = window.matchMedia('(max-width: 820px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const panels = [...root.querySelectorAll<HTMLElement>('.cloudy-studio-sheen-panel')];
    const lights = new Map<HTMLElement, HTMLSpanElement>();
    const clock = createMobileSheenClock();
    const visibleTextures = new Set<HTMLSpanElement>();
    let travel = 1080;
    let phase = 0;
    let animationFrame = 0;

    const paint = (texture: HTMLSpanElement) => {
      texture.style.transform = `translate3d(${-travel * phase}px, 0, 0)`;
    };

    const animate = (now: number) => {
      phase = clock.step(now);
      for (const texture of visibleTextures) paint(texture);
      animationFrame = requestAnimationFrame(animate);
    };

    const updatePlayback = () => {
      cancelAnimationFrame(animationFrame);
      clock.pause();
      if (media.matches && !reduced.matches && !document.hidden) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const clip = entry.target as HTMLSpanElement;
        const texture = clip.firstElementChild as HTMLSpanElement;
        if (entry.isIntersecting) {
          paint(texture);
          clip.dataset.visible = 'true';
          visibleTextures.add(texture);
        } else {
          delete clip.dataset.visible;
          visibleTextures.delete(texture);
        }
      }
    }, { rootMargin: '160px' });

    let frame = 0;
    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const enabled = media.matches && !reduced.matches;

      if (enabled) {
        const cardWidth = panels[0]?.getBoundingClientRect().width || window.innerWidth;
        travel = 3 * cardWidth;
        root.style.setProperty('--cloudy-mobile-light-travel', -travel + 'px');
        root.style.setProperty('--cloudy-mobile-light-period', (travel * Math.sin(110 * Math.PI / 180)) + 'px');
      } else {
        root.style.removeProperty('--cloudy-mobile-light-travel');
        root.style.removeProperty('--cloudy-mobile-light-period');
      }

      for (const panel of panels) {
        if (enabled) {
          const rect = panel.getBoundingClientRect();
          const style = getComputedStyle(panel);
          const left = rect.left + parseFloat(style.borderLeftWidth || '0');
          const top = rect.top - rootRect.top + parseFloat(style.borderTopWidth || '0');
          const angle = 110 * Math.PI / 180;
          const period = -parseFloat(root.style.getPropertyValue('--cloudy-mobile-light-travel')) * Math.sin(angle);
          const panelPhase = (left * Math.sin(angle) - top * Math.cos(angle)) % period;
          panel.style.setProperty('--cloudy-mobile-light-phase', -panelPhase + 'px');

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
          if (clip) {
            visibleTextures.delete(clip.firstElementChild as HTMLSpanElement);
            visibility.unobserve(clip);
            clip.remove();
          }
          lights.delete(panel);
        }
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    for (const panel of panels) observer.observe(panel);

    root.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    media.addEventListener('change', updatePlayback);
    reduced.addEventListener('change', schedule);
    reduced.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);

    measure();
    updatePlayback();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      visibility.disconnect();
      root.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      media.removeEventListener('change', updatePlayback);
      reduced.removeEventListener('change', schedule);
      reduced.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
      root.style.removeProperty('--cloudy-mobile-light-travel');
      root.style.removeProperty('--cloudy-mobile-light-period');

      for (const panel of panels) {
        panel.style.removeProperty('--cloudy-mobile-light-phase');
        lights.get(panel)?.remove();
      }
    };
  }, []);

  return null;
}
