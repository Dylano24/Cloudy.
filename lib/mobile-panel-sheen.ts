import { createMobileSheenClock } from './mobile-sheen-clock';

/** Keep mobile card lights synchronized without measuring or painting hidden cards. */
export function mountMobilePanelSheen(
  root: HTMLElement,
  panels: HTMLElement[],
  { widestPanel = false, rootMargin = '80px' } = {},
) {
  const media = window.matchMedia('(max-width: 820px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clock = createMobileSheenClock();
  const lights = new Map<HTMLElement, HTMLSpanElement>();
  const visibleTextures = new Set<HTMLSpanElement>();
  const angle = 110 * Math.PI / 180;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  let travel = 1080;
  let phase = 0;
  let lastPaint = -Infinity;
  let animationFrame = 0;
  let layoutFrame = 0;

  const paint = (texture: HTMLSpanElement) => {
    texture.style.transform = `translate3d(${-travel * phase}px, 0, 0)`;
  };
  const canPlay = () => media.matches && !reduced.matches && !document.hidden && visibleTextures.size > 0;
  const animate = (now: number) => {
    animationFrame = 0;
    if (!canPlay()) { clock.pause(); return; }
    phase = clock.step(now);
    // Card highlights do not need 60/120 style updates per second. Keep the
    // same six-second sweep while leaving more time for touch and scrolling.
    if (now - lastPaint >= 1000 / 30 - 1) {
      for (const texture of visibleTextures) paint(texture);
      lastPaint = now;
    }
    animationFrame = requestAnimationFrame(animate);
  };
  const updatePlayback = () => {
    if (canPlay()) {
      if (!animationFrame) {
        clock.pause();
        lastPaint = -Infinity;
        animationFrame = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      clock.pause();
    }
  };
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const clip = entry.target as HTMLSpanElement;
      const texture = clip.firstElementChild as HTMLSpanElement;
      if (!texture) continue;
      if (entry.isIntersecting) {
        paint(texture);
        clip.dataset.visible = 'true';
        visibleTextures.add(texture);
      } else {
        delete clip.dataset.visible;
        visibleTextures.delete(texture);
      }
    }
    updatePlayback();
  }, { rootMargin });

  const measure = () => {
    layoutFrame = 0;
    const enabled = media.matches && !reduced.matches;
    // Complete all geometry/style reads before writing CSS or inserting
    // decoration nodes; interleaving them forces a layout for every panel.
    const rootRect = enabled ? root.getBoundingClientRect() : null;
    const geometry = enabled ? panels.map(panel => {
      const rect = panel.getBoundingClientRect();
      const style = getComputedStyle(panel);
      return { panel, width: rect.width, left: rect.left + parseFloat(style.borderLeftWidth || '0'), top: rect.top - rootRect!.top + parseFloat(style.borderTopWidth || '0') };
    }) : [];
    if (enabled) {
      const width = (widestPanel ? Math.max(...geometry.map(item => item.width), 0) : geometry[0]?.width) || window.innerWidth;
      travel = 3 * width;
      const period = travel * sin;
      root.style.setProperty('--cloudy-mobile-light-travel', -travel + 'px');
      root.style.setProperty('--cloudy-mobile-light-period', period + 'px');
      for (const { panel, left, top } of geometry) {
        const offset = (left * sin - top * cos) % period;
        panel.style.setProperty('--cloudy-mobile-light-phase', -offset + 'px');
        if (lights.has(panel)) continue;
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
      root.style.removeProperty('--cloudy-mobile-light-travel');
      root.style.removeProperty('--cloudy-mobile-light-period');
      for (const [panel, clip] of lights) {
        panel.style.removeProperty('--cloudy-mobile-light-phase');
        visibility.unobserve(clip);
        clip.remove();
      }
      lights.clear();
      visibleTextures.clear();
    }
    updatePlayback();
  };
  const schedule = () => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(measure);
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  for (const panel of panels) observer.observe(panel);
  root.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  media.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', updatePlayback);
  measure();

  return () => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(layoutFrame);
    observer.disconnect();
    visibility.disconnect();
    root.removeEventListener('scroll', schedule, true);
    window.removeEventListener('resize', schedule);
    media.removeEventListener('change', schedule);
    reduced.removeEventListener('change', schedule);
    document.removeEventListener('visibilitychange', updatePlayback);
    root.style.removeProperty('--cloudy-mobile-light-travel');
    root.style.removeProperty('--cloudy-mobile-light-period');
    for (const [panel, clip] of lights) {
      panel.style.removeProperty('--cloudy-mobile-light-phase');
      clip.remove();
    }
  };
}
