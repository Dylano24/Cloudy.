'use client';

import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styles from './account-auth.module.css';

export function AccountNameForm({ currentName, provider }: { currentName: string; provider?: 'discord' | 'google' | 'email' }) {
  const providerName = provider === 'email' ? null : provider === 'google' ? 'Google' : 'Discord';
  const client = useQueryClient();
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) {
      setError('Enter a name with 1 to 50 characters.');
      setSaved(false);
      return;
    }
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }), cache: 'no-store',
      });
      const result = await response.json() as { error?: string; user?: { name: string } };
      if (!response.ok || !result.user) throw new Error(result.error || 'Could not save your name.');
      client.setQueryData(['cloudy-account'], { user: result.user });
      setName(result.user.name);
      setSaved(true);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Could not save your name.');
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.nameForm} onSubmit={submit} noValidate>
    <label htmlFor="cloudy-account-name">Display name</label>
    {providerName && <p id="cloudy-account-name-help" className={styles.nameHelp}>Your {providerName} name is used by default, but you can customize it here.</p>}
    <div className={styles.nameFormRow}>
      <input id="cloudy-account-name" name="name" value={name} onChange={event => { setName(event.target.value); setError(''); setSaved(false); }} maxLength={50} required aria-invalid={!!error} aria-describedby={[providerName && 'cloudy-account-name-help', error && 'cloudy-account-name-error'].filter(Boolean).join(' ') || undefined} disabled={busy} />
      <button type="submit" disabled={busy || name.trim() === currentName}>{busy ? 'Saving…' : 'Save display name'}</button>
    </div>
    {error && <p id="cloudy-account-name-error" className={styles.error} role="alert">{error}</p>}
    {saved && <p className={styles.saved} role="status">Your account name has been updated.</p>}
  </form>;
}
