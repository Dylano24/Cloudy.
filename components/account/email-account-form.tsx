'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import styles from './account-auth.module.css';

export function EmailAccountForm({ mode }: { mode: 'create' | 'login' }) {
  const router = useRouter();
  const client = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/account/email/${mode === 'create' ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), cache: 'no-store',
      });
      const result = await response.json() as { error?: string; user?: unknown };
      if (!response.ok || !result.user) throw new Error(result.error || 'Please try again.');
      client.setQueryData(['cloudy-account'], { user: result.user });
      router.replace('/account');
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.form} onSubmit={submit}>
    <label htmlFor={`cloudy-email-${mode}`}>Email address</label>
    <input id={`cloudy-email-${mode}`} name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} disabled={busy} />
    <label htmlFor={`cloudy-password-${mode}`}>Password</label>
    <input id={`cloudy-password-${mode}`} name="password" type="password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={10} disabled={busy} />
    {error && <p className={styles.error} role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'create' ? 'Create' : 'Sign in'}</button>
  </form>;
}
