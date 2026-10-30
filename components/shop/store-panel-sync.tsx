'use client';
import { useEffect } from 'react';
import { mountMobilePanelSheen } from '@/lib/mobile-panel-sheen';

export function StorePanelSync() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.cloudy-store-page');
    if (!root) return;
    return mountMobilePanelSheen(root, [...root.querySelectorAll<HTMLElement>('[data-cloudy-store-sheen]')], { widestPanel: true });
  }, []);
  return null;
}
