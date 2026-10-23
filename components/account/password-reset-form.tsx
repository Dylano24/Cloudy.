'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './account-auth.module.css';

export function PasswordResetForm({ token }: { token?: string }) {
  const resetting = !!token;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (resetting && (password.length < 10 || password !== confirmPassword)) {
      setError(password.length < 10 ? 'Password must be at least 10 characters.' : 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(resetting ? '/api/account/email/reset-password' : '/api/account/email/request-reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify(resetting ? { token, password, confirmPassword } : { email }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setMessage(result.message || 'Done.');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  return <div className="cloudy-black-page min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-4xl">
    <section className={`cloud-panel cloudy-traced-panel relative isolate mt-8 rounded-2xl border p-7 sm:p-10 ${styles.card}`}>
      <h1 className="text-2xl font-bold">{resetting ? 'Reset password' : 'Forgot password?'}</h1>
      <p className={styles.intro}>{resetting ? 'Choose a new password for your Cloudy email account.' : 'Enter your Cloudy account email and we will send you a reset link.'}</p>
      <form className={styles.form} onSubmit={submit} noValidate>
        {resetting ? <>
          <label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
          <label htmlFor="confirm-new-password">Confirm new password</label><input id="confirm-new-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} disabled={busy} />
        </> : <>
          <label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
        </>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.saved} role="status">{message}</p>}
        <button type="submit" disabled={busy || !!message}>{busy ? 'Please wait…' : resetting ? 'Reset password' : 'Send reset link'}</button>
      </form>
      <Link className={styles.resetBack} href="/account"><ArrowLeft size={16} aria-hidden="true" />Back</Link>
    </section>
  </div></div>;
}
