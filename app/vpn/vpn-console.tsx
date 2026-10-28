"use client";

import { useState } from "react";
import { ChevronDown, Globe2, LockKeyhole, MapPin, Power, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./vpn.module.css";

const locations = [
  { name: "Netherlands", city: "Amsterdam", short: "NL", x: "49%", y: "29%" },
  { name: "United States", city: "New York", short: "US", x: "27%", y: "42%" },
  { name: "Japan", city: "Tokyo", short: "JP", x: "83%", y: "48%" },
] as const;

/** Interactive design demonstration only; no VPN request or connection is ever initiated. */
export function VpnConsole() {
  const [location, setLocation] = useState<(typeof locations)[number]>(locations[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.visual} aria-label="Cloudy VPN future interface preview">
      <div className={styles.consoleHalo} aria-hidden="true" />
      <div className={styles.consoleOrbit} aria-hidden="true" />
      <div className={styles.consoleOuter}>
        <div className={styles.consoleHeader}>
          <div className={styles.consoleBrand}>
            <span className={styles.consoleBrandMark}>C</span>
            <span><strong>Cloudy VPN</strong><small>Interface concept</small></span>
          </div>
          <div className={styles.consoleDots} aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className={styles.consoleMain}>
          <div className={styles.consoleMap} aria-hidden="true">
            <div className={styles.mapLines} />
            <div className={styles.mapGlow} />
            <svg viewBox="0 0 500 260" className={styles.worldShape} fill="currentColor" aria-hidden="true">
              <path d="M35 64l25-16 21 3 8-15 33-7 30 8 7 16-19 12-10 19 6 15-16 13-10 28-18 2-10-25-17-7-6-29-20-9zm93 96l16-4 27 17 17 36-10 26-16 15-12-24-16-14-7-30zm97-117l24-21 33 11 17-9 34 13 30-7 27 18 30-1 24 26-12 23-26-2-17 19-29-7-12 25-22 6-19-20-22-4-3-19-19 17-25-7-20-28-19 3-12-17zm32 87l35-9 23 19 4 37-22 43-12 29-23-11-9-35-16-19zm170 76l36-10 19 17-6 20-32 4-20-13z" />
            </svg>
            <div className={styles.mapRoute} />
            <span className={styles.mapPointOne} /><span className={styles.mapPointTwo} />
            <span className={styles.mapPointThree} />
            <div className={styles.mapFocus} style={{ left: location.x, top: location.y }}><span /></div>
            <span className={styles.mapWatermark}>CLOUDY NETWORK / CONCEPT</span>
          </div>
          <div className={styles.consoleCenter}>
            <div className={styles.connectionRing}>
              <div className={styles.ringOuter} />
              <div className={styles.ringMiddle} />
              <span className={styles.powerIcon}><Power size={31} strokeWidth={1.75} /></span>
            </div>
            <span className={styles.demoStatus}><i /> DESIGN PREVIEW</span>
            <strong>Connection concept</strong>
            <p>No active VPN connection</p>
          </div>
        </div>
        <div className={styles.consoleBottom}>
          <div className={styles.consoleLocation}>
            <span className={styles.locationIcon}><MapPin size={17} /></span>
            <div><small>Selected preview location</small><strong>{location.name} <span>· {location.city}</span></strong></div>
          </div>
          <div className={styles.consoleSelectWrap}>
            <button type="button" aria-expanded={menuOpen} aria-controls="cloudy-vpn-preview-regions"
              aria-label="Choose preview location" className={styles.consoleSelect}
              onClick={() => setMenuOpen(open => !open)}>
              {location.short} <ChevronDown size={14} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className={styles.consoleMenu} id="cloudy-vpn-preview-regions" role="group" aria-label="Example locations">
                {locations.map(item => (
                  <button type="button" key={item.short} className={item.short === location.short ? styles.regionSelected : ""}
                    aria-pressed={item.short === location.short}
                    onClick={() => { setLocation(item); setMenuOpen(false); }}>
                    <span>{item.name}</span><small>{item.short}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.floatPrivacy}><ShieldCheck size={18} /><span><strong>Privacy first</strong><small>Design principle</small></span></div>
      <div className={styles.floatVision}><Sparkles size={16} /><span>Cloudy experience</span></div>
      <div className={styles.consoleCaption}><Globe2 size={13} /> INTERACTIVE DESIGN PROTOTYPE</div>
      <span className={styles.consoleDisclaimer}>Illustrative interface · Not a working VPN</span>
    </div>
  );
}
