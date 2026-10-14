'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAccount } from '@/hooks/use-account';

export const accountSections = [
  ['My account', '/account'], ['My orders', '/account/orders'], ['Favorites', '/account/favorites'],
  ['Fidelity', '/account/fidelity'], ['My information', '/account/information'],
] as const;

export function AccountPanel({ section = 'account' }: { section?: string }) {
  const { user, pending, error } = useAccount();
  const params = useSearchParams();
  const current = accountSections.find(([, href]) => href === (section === 'account' ? '/account' : `/account/${section}`)) || accountSections[0];
  return <div className="cloudy-black-page min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-4xl">
    {section !== 'account' && <h1 className="text-4xl font-bold text-white sm:text-5xl">{section === 'create' ? 'Create account' : current[0]}</h1>}
    <section className="cloud-panel cloudy-traced-panel relative isolate mt-8 rounded-2xl border p-7 sm:p-10">
      {pending ? <p>Loading your account…</p> : !user ? <>
        <h2 className="text-xl font-bold">Sign in with your account</h2>
        {section === 'create' && <p className="mt-3 text-sm leading-7 text-muted">Continue with Discord to create or access your Cloudy account.</p>}
        {(params.has('login_error') || error) && <p role="alert" className="mt-3 text-sm text-red-500">{params.get('login_error') === 'not_registered' ? 'Account does not exist. Create an account first.' : params.get('login_error') === 'unavailable' ? 'Sign-in is currently unavailable. Please contact Cloudy support.' : 'We could not sign you in. Please try again or contact Cloudy support.'}</p>}
        <p className="mt-3 text-sm text-muted">New to Cloudy? <Link href="/account/create" className="text-white underline underline-offset-4">Create account</Link></p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/api/account/login" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }} onClick={(event) => {
            const isiOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            if (!isiOS) return;
            event.preventDefault();
            const target = 'https://cloudy-store-vert.vercel.app/api/account/login';
            window.location.href = `x-safari-${target}`;
            window.setTimeout(() => {
              if (document.visibilityState === 'visible') window.location.href = target;
            }, 1200);
          }}>{section === 'create' ? 'Create account with Discord' : 'Login with Discord'}</a>
          <a href="/api/account/google/login" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>Login with Google</a>
        </div>
      </> : <>
        {(section === 'account' || section === 'information' || section === 'create') ? <><h2 className="text-xl font-bold">{user.name}</h2><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-muted">{user.provider === 'google' ? 'Google ID' : 'Discord ID'}</dt><dd>{user.id}</dd></div><div><dt className="text-muted">Display name</dt><dd>{user.name}</dd></div></dl></> : <>
          <p className="text-sm leading-7 text-muted">{section === 'orders' ? 'Your order history is not available here yet. Contact Cloudy support for help with a purchase.' : section === 'fidelity' ? 'Fidelity details are not available yet.' : 'Your saved favorites are not available here yet.'}</p>
          <Link href="/support" className="cloudy-classic-button mt-6" style={{ borderColor: '#e51b2e' }}>Contact support</Link>
        </>}
      </>}
    </section>
  </div></div>;
}
