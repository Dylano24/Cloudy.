'use client';
import { useEffect } from 'react';
import { mountMobilePanelSheen } from '@/lib/mobile-panel-sheen';

export function MobilePanelSync() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>('.cloudy-classic-home');
    if (!home) return;
    const panels = [...home.querySelectorAll<HTMLElement>('.cloudy-classic-intro, .cloudy-classic-coming, .cloudy-classic-feature, .cloudy-classic-future, .cloudy-restored-pay-grid article, .cloudy-classic-why-grid article')].filter(panel => !panel.classList.contains('cloudy-no-sheen'));
    return mountMobilePanelSheen(home, panels);
  }, []);
  return null;
}
