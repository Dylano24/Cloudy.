'use client';

import { useEffect, useMemo, useState } from 'react';

function getNextThursdayAtSix() {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  let daysUntilThursday = (4 - day + 7) % 7;

  target.setHours(18, 0, 0, 0);

  if (daysUntilThursday === 0 && now >= target) {
    daysUntilThursday = 7;
  }

  target.setDate(now.getDate() + daysUntilThursday);
  return target;
}

function getParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function WipeCountdown() {
  const target = useMemo(() => getNextThursdayAtSix(), []);
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(target.getTime() - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const parts = getParts(remaining);
  const values = [
    ['Days', parts.days],
    ['Hours', parts.hours],
    ['Minutes', parts.minutes],
    ['Seconds', parts.seconds],
  ] as const;

  return (
    <div className="cloudy-wipe-timer" aria-label="Time until next server wipe">
      {values.map(([label, value]) => (
        <div className="cloudy-wipe-unit" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
