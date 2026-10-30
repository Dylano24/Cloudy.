'use client';

import { useEffect } from 'react';

const PANEL_SELECTOR = [
  '.cloudy-traced-panel', '.cloudy-studio-sheen-panel', '[data-cloudy-store-sheen]',
  '.cloudy-classic-intro', '.cloudy-classic-coming', '.cloudy-classic-feature',
  '.cloudy-classic-future', '.cloudy-restored-pay-grid article', '.cloudy-classic-why-grid article',
].join(',');

/** Suspend decorative CSS loops outside the viewport without changing their
 * appearance, phase, finite entrance animations, or interactive transitions. */
export function DecorativeVisibility() {
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main || typeof Element.prototype.getAnimations !== 'function'
      || typeof IntersectionObserver === 'undefined' || typeof CSSAnimation === 'undefined') return;
    const panels = new Map<Element, boolean>();
    const held = new Map<Animation, number>();
    let scanFrame = 0;

    function resume(animation: Animation, start: number) {
      // Media changes can cancel CSS animations while they are paused.
      if (animation.playState !== 'paused') return;
      animation.play();
      // Rejoin the original document timeline so multiple panels retain the
      // same phase when they return into view. No JS runs between events.
      animation.startTime = start;
    }

    function reconcile(panel: Element, visible: boolean) {
      for (const animation of panel.getAnimations()) {
        if (!(animation instanceof CSSAnimation)
          || animation.effect?.getTiming().iterations !== Infinity) continue;
        const start = held.get(animation);
        if (visible && !document.hidden) {
          if (start !== undefined) { resume(animation, start); held.delete(animation); }
        } else if (start === undefined && animation.playState === 'running'
          && typeof animation.startTime === 'number') {
          held.set(animation, animation.startTime);
          animation.pause();
        }
      }
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        panels.set(entry.target, entry.isIntersecting);
        reconcile(entry.target, entry.isIntersecting);
      }
    }, { rootMargin: '100px' });

    function scan() {
      scanFrame = 0;
      for (const [panel] of panels) {
        if (!main!.contains(panel)) { observer.unobserve(panel); panels.delete(panel); }
      }
      for (const animation of held.keys()) {
        if (animation.playState === 'idle') held.delete(animation);
      }
      for (const panel of main!.querySelectorAll(PANEL_SELECTOR)) {
        if (!panels.has(panel)) {
          panels.set(panel, false);
          observer.observe(panel);
        } else reconcile(panel, panels.get(panel)!);
      }
    }
    function schedule() { if (!scanFrame) scanFrame = requestAnimationFrame(scan); }
    function onVisibility() { for (const [panel, visible] of panels) reconcile(panel, visible); }
    const mutations = new MutationObserver(schedule);
    mutations.observe(main, { childList: true, subtree: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', schedule, { passive: true });
    scan();
    return () => {
      cancelAnimationFrame(scanFrame);
      observer.disconnect(); mutations.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', schedule);
      for (const [animation, start] of held) resume(animation, start);
      held.clear(); panels.clear();
    };
  }, []);
  return null;
}
