"use client";

import { useEffect } from "react";
import { StudioMobilePanelSync } from "@/components/service/studio-mobile-panel-sync";

/** Keep the shared Cloudy effects, but suspend work outside the viewport. */
export function VpnPanelMotion() {
  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>(".cloudy-vpn-page .cloudy-traced-panel");
    const visible = new Set<HTMLElement>();
    const sync = () => panels.forEach(panel => {
      panel.dataset.motionPaused = String(document.hidden || !visible.has(panel));
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      });
      sync();
    });
    panels.forEach(panel => observer.observe(panel));
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      panels.forEach(panel => delete panel.dataset.motionPaused);
    };
  }, []);
  return <StudioMobilePanelSync rootSelector=".cloudy-vpn-page" suspendWhenIdle />;
}
