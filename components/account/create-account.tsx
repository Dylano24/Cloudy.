'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useAccount } from '@/hooks/use-account';

export function CreateAccount() {
  const { user, pending } = useAccount();
  const params = useSearchParams();
  const router = useRouter();
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const profileStep = params.get('step') === 'profile';
  const registration = useQuery({ queryKey: ['cloudy-registration'], enabled: profileStep && !user, staleTime: 0, retry: false, queryFn: async () => {
    const response = await fetch('/api/account/register', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load registration');
    return response.json() as Promise<{ identity: { name: string; provider: string } | null }>;
  } });
  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/account/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create your account.');
      client.setQueryData(['cloudy-account'], { user: result.user });
      client.removeQueries({ queryKey: ['cloudy-registration'] });
      router.replace('/account');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Please try again.'); }
    finally { setSaving(false); }
  }
  return <div className="cloudy-black-page min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-xl">
    <section className="cloud-panel cloudy-traced-panel relative isolate mt-8 rounded-2xl border p-7 sm:p-10">
      {pending || (profileStep && !user && registration.isPending) ? <p>Loading…</p> : user ? <><h2 className="text-xl font-bold">You’re already signed in</h2><Link href="/account" className="cloudy-classic-button mt-6" style={{ borderColor: '#e51b2e' }}>My account</Link></> : <>
        <h2 className="text-2xl font-bold text-white">Create your Cloudy account</h2>
        {profileStep && registration.data?.identity ? <form onSubmit={register} className="mt-6">
          <p className="text-sm leading-7 text-muted">Choose the name you want to use on Cloudy.</p>
          <label htmlFor="cloudy-display-name" className="mt-5 block text-sm font-bold text-white">Display name</label>
          <input id="cloudy-display-name" name="name" autoComplete="nickname" value={name} onChange={(event) => setName(event.target.value)} required minLength={1} maxLength={50} disabled={saving} className="mt-2 w-full rounded-lg border border-white/30 bg-black px-4 py-3 text-white transition-colors focus:border-red-500 focus:outline-none" />
          {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
          <p className="mt-4 text-xs leading-6 text-muted">Your provider account and display name will be saved. Read our <Link href="/privacy" className="text-white underline">Privacy notice</Link>.</p>
          <button type="submit" disabled={saving} className="cloudy-classic-button mt-6 disabled:opacity-60" style={{ borderColor: '#e51b2e' }}>{saving ? 'Creating account…' : 'Create account'}</button>
        </form> : <>
          <p className="mt-3 text-sm leading-7 text-muted">Choose Google or Discord, then set your Cloudy display name.</p>
          {profileStep && <p role="alert" className="mt-4 text-sm text-red-500">Your registration has expired. Continue with Google or Discord again.</p>}
          {params.has('login_error') && <p role="alert" className="mt-4 text-sm text-red-500">{params.get('login_error') === 'unavailable' ? 'Sign-in is currently unavailable. Please contact Cloudy support.' : 'We could not sign you in. Please try again.'}</p>}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap"><a href="/api/account/login?intent=create" className="cloudy-classic-button w-full min-h-[48px] sm:w-auto" style={{ borderColor: '#e51b2e', touchAction: 'manipulation' }}>Continue with Discord</a><a href="/api/account/google/login?intent=create" className="cloudy-classic-button w-full min-h-[48px] sm:w-auto" style={{ borderColor: '#e51b2e', touchAction: 'manipulation' }}>Continue with Google</a></div>
        </>}
        <p className="mt-6 text-sm text-muted">Already have an account? <Link href="/account" className="text-white underline underline-offset-4">Login</Link></p>
      </>}
    </section>
  </div></div>;
}
