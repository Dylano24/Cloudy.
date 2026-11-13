'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import styles from './bot.module.css';

const POLL_MS = 4_000;
const WAIT_MS = 5 * 60_000;

/**
 * "Invite Cloudy" opens Discord in a new tab. This page then watches for
 * Cloudy to join that server and continues to its setup by itself.
 */
export function InviteButton({ guildId, guildName, inviteUrl, ghost = false }: { guildId: string; guildName: string; inviteUrl: string | null; ghost?: boolean }) {
  const [state, setState] = useState<'idle' | 'waiting' | 'joined' | 'late'>('idle');

  useEffect(() => {
    if (state !== 'waiting') return;
    const startedAt = Date.now();
    let stopped = false;
    let timer = 0;
    const check = async () => {
      try {
        const response = await fetch(`/api/bot/guilds/${guildId}/presence`, { cache: 'no-store' });
        const data = await response.json().catch(() => null) as { installed?: boolean } | null;
        if (!stopped && data?.installed) {
          setState('joined');
          window.location.assign(`/bot/${guildId}`);
          return;
        }
      } catch { /* keep waiting */ }
      if (stopped) return;
      if (Date.now() - startedAt > WAIT_MS) { setState('late'); return; }
      timer = window.setTimeout(() => { void check(); }, POLL_MS);
    };
    timer = window.setTimeout(() => { void check(); }, POLL_MS);
    // Coming back to this tab checks at once.
    const onFocus = () => { window.clearTimeout(timer); void check(); };
    window.addEventListener('focus', onFocus);
    return () => { stopped = true; window.clearTimeout(timer); window.removeEventListener('focus', onFocus); };
  }, [state, guildId]);

  const className = `${ghost ? styles.buttonGhost : styles.button} ${styles.buttonSmall}`;
  if (!inviteUrl) return <span className={className} aria-disabled="true" title="The invite link is not configured on this deployment yet.">Invite Cloudy</span>;
  return (
    <span className={styles.inviteWrap}>
      <a href={inviteUrl} className={className} target="_blank" rel="noopener noreferrer" onClick={() => setState('waiting')}>
        {state === 'waiting' || state === 'joined' ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />} Invite Cloudy
      </a>
      {state !== 'idle' ? (
        <span className={styles.inviteStatus} role="status" aria-live="polite">
          {state === 'waiting' ? `Waiting for Cloudy to join ${guildName}. This page continues by itself.` : state === 'joined' ? 'Cloudy joined. Opening setup…' : 'Cloudy has not joined yet. Finish adding it in Discord, then reload this page.'}
        </span>
      ) : null}
    </span>
  );
}
