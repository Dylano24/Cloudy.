'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAccount } from '@/hooks/use-account';

export function CreateAccount() {
  const { user, pending } = useAccount();
  const params = useSearchParams();
  return <div className="min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-xl">
    <section className="cloud-panel cloudy-traced-panel relative isolate mt-8 rounded-2xl border p-7 sm:p-10">
      {pending ? <p>Loading…</p> : user ? <><h2 className="text-xl font-bold">You’re already signed in</h2><Link href="/account" className="cloudy-classic-button mt-6" style={{ borderColor: '#e51b2e' }}>My account</Link></> : <>
        <h2 className="text-2xl font-bold text-white">Create your Cloudy account</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Continue with your Google account.</p>
        {params.has('login_error') && <p role="alert" className="mt-4 text-sm text-red-500">{params.get('login_error') === 'unavailable' ? 'Google sign-in is currently unavailable. Please contact Cloudy support.' : 'We could not sign you in with Google. Please try again.'}</p>}
        <a href="/api/account/google/login" className="cloudy-classic-button mt-7" style={{ borderColor: '#e51b2e' }}>Login with Google</a>
        <p className="mt-6 text-sm text-muted">Already have an account? <Link href="/account" className="text-white underline underline-offset-4">Login</Link></p>
      </>}
    </section>
  </div></div>;
}
