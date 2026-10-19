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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    const nextErrors = {
      email: !email.trim() ? 'Email address is required.' : !emailInput?.checkValidity() ? 'Enter a valid email address.' : undefined,
      password: !password ? 'Password is required.' : mode === 'create' && password.length < 10 ? 'Password must be at least 10 characters.' : undefined,
    };
    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
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

  return <form className={styles.form} onSubmit={submit} noValidate>
    <label htmlFor={`cloudy-email-${mode}`}>Email address</label>
    <input id={`cloudy-email-${mode}`} name="email" type="email" autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setFieldErrors(previous => ({ ...previous, email: undefined })); }} required aria-invalid={!!fieldErrors.email} maxLength={254} disabled={busy} />
    {fieldErrors.email && <p className={styles.error} role="alert">{fieldErrors.email}</p>}
    <label htmlFor={`cloudy-password-${mode}`}>Password</label>
    <input id={`cloudy-password-${mode}`} name="password" type="password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} value={password} onChange={event => { setPassword(event.target.value); setFieldErrors(previous => ({ ...previous, password: undefined })); }} required minLength={mode === 'create' ? 10 : undefined} aria-invalid={!!fieldErrors.password} disabled={busy} />
    {fieldErrors.password && <p className={styles.error} role="alert">{fieldErrors.password}</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'create' ? 'Create' : 'Sign in'}</button>
  </form>;
}
