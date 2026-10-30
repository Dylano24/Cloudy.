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
  const animations = new Map<HTMLSpanElement, Animation>();
  const compositor = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
  const duration = 6000;
  const angle = 110 * Math.PI / 180;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  let travel = 1080;
  let phase = 0;
  let animationFrame = 0;
  let layoutFrame = 0;
  let elapsed = 0;
  let startedAt: number | null = null;

  const timelineNow = () => {
    const now = document.timeline?.currentTime;
    return typeof now === 'number' ? now : performance.now();
  };
  const currentTime = (now = timelineNow()) => elapsed + (startedAt === null ? 0 : Math.max(0, now - startedAt));
  const keyframes = () => [
    { transform: 'translate3d(0px, 0, 0)' },
    { transform: `translate3d(${-travel}px, 0, 0)` },
  ];

  const createAnimation = (texture: HTMLSpanElement) => {
    const animation = texture.animate(keyframes(), { duration, iterations: Infinity, easing: 'linear', fill: 'both' });
    animation.pause();
    animation.currentTime = currentTime();
    animations.set(texture, animation);
  };

  const paint = (texture: HTMLSpanElement) => {
    texture.style.transform = `translate3d(${-travel * phase}px, 0, 0)`;
  };
  const canPlay = () => media.matches && !reduced.matches && !document.hidden && visibleTextures.size > 0;
  const animate = (now: number) => {
    animationFrame = 0;
    if (!canPlay()) { clock.pause(); return; }
    phase = clock.step(now);
    for (const texture of visibleTextures) paint(texture);
    animationFrame = requestAnimationFrame(animate);
  };
  const updatePlayback = () => {
    const play = canPlay();
    if (compositor) {
      const now = timelineNow();
      const time = currentTime(now);
      if (play && startedAt === null) startedAt = now;
      else if (!play && startedAt !== null) { elapsed = time; startedAt = null; }
      // All lights share one document timeline and one hold time. Offscreen
      // cards catch the visible cards' phase when they re-enter. The browser
      // composites these transform-only animations at the display refresh
      // rate; no JavaScript callback or style write is needed per frame.
      for (const [texture, animation] of animations) {
        if (play && visibleTextures.has(texture)) {
          animation.currentTime = time;
          animation.play();
          animation.startTime = now - time;
        } else {
          animation.pause();
          animation.currentTime = time;
        }
      }
    } else if (play) {
      if (!animationFrame) {
        clock.pause();
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
        if (!compositor) paint(texture);
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
      const nextTravel = 3 * width;
      if (nextTravel !== travel && compositor) {
        travel = nextTravel;
        for (const [texture, animation] of animations) {
          animation.cancel();
          createAnimation(texture);
        }
      } else travel = nextTravel;
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
        if (compositor) createAnimation(texture);
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
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
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
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
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
