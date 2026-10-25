'use client';
import { useState, type FormEvent } from 'react';
import { PasswordInput } from './password-input';
import styles from './account-auth.module.css';
import buyButton from '@/components/ui/cloudy-buy-button.module.css';

export function AccountPasswordForm() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get('password') || '');
    if (password.length < 10 || password !== values.get('confirmPassword')) {
      setError(password.length < 10 ? 'Password must be at least 10 characters.' : 'Passwords do not match.');
      return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/account/email/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ currentPassword: values.get('currentPassword'), password, confirmPassword: values.get('confirmPassword') }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      form.reset(); setOpen(false); setMessage('Your password has been updated.');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="mt-6">
    <button type="button" className={buyButton.button} aria-expanded={open} aria-controls="cloudy-change-password" onClick={() => { setOpen(value => !value); setError(''); }} disabled={busy}>Change password</button>
    {open && <form id="cloudy-change-password" className={styles.form} onSubmit={submit}>
      <label htmlFor="cloudy-current-password">Current password</label>
      <PasswordInput id="cloudy-current-password" name="currentPassword" autoComplete="current-password" required maxLength={256} disabled={busy} />
      <label htmlFor="cloudy-new-password">New password</label>
      <PasswordInput id="cloudy-new-password" name="password" autoComplete="new-password" required minLength={10} maxLength={256} disabled={busy} />
      <label htmlFor="cloudy-confirm-new-password">Confirm new password</label>
      <PasswordInput id="cloudy-confirm-new-password" name="confirmPassword" autoComplete="new-password" required minLength={10} maxLength={256} disabled={busy} />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Save password'}</button>
    </form>}
    {message && <p className={styles.saved} role="status">{message}</p>}
  </div>;
}
