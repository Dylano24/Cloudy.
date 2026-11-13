'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The focusable elements inside a dialog, in tab order, skipping hidden ones. */
export function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);
}

/**
 * Standard modal dialog behaviour: Escape closes it, focus moves into it and
 * stays inside while it is open (Tab and Shift+Tab wrap), the page behind it
 * does not scroll, and focus returns to the control that opened it.
 */
export function useDialogBehavior(open: boolean, onClose: () => void, container: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previousPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const focusFirst = window.requestAnimationFrame(() => {
      const root = container.current;
      if (!root || root.contains(document.activeElement)) return;
      const preferred = root.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
      (preferred || focusableWithin(root)[0] || root).focus({ preventScroll: true });
    });

    function onKeyDown(event: KeyboardEvent) {
      const root = container.current;
      if (!root) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableWithin(root);
      if (!items.length) { event.preventDefault(); root.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !root.contains(active))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', onKeyDown, true);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, container]);
}
