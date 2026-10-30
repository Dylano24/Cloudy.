'use client';
import { useEffect } from 'react';
import { mountMobilePanelSheen } from '@/lib/mobile-panel-sheen';

export function StudioMobilePanelSync({ rootSelector = '.cloudy-studio-page', suspendWhenIdle = false }: { rootSelector?: string; suspendWhenIdle?: boolean } = {}) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;
    return mountMobilePanelSheen(root, [...root.querySelectorAll<HTMLElement>('.cloudy-studio-sheen-panel')], { rootMargin: suspendWhenIdle ? '0px' : '80px' });
  }, [rootSelector, suspendWhenIdle]);
  return null;
}
