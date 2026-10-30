'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import styles from './bot.module.css';

export function LogoutButton({ csrf }: { csrf: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className={styles.buttonGhost} disabled={busy} onClick={async () => {
      setBusy(true);
      try {
        await fetch('/api/bot/auth/logout', { method: 'POST', headers: { 'x-cloudy-csrf': csrf } });
      } finally {
        router.refresh();
        setBusy(false);
      }
    }}>
      <LogOut size={16} aria-hidden="true" /> {busy ? 'Logging out…' : 'Log out'}
    </button>
  );
}
