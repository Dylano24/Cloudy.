'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAccount } from '@/hooks/use-account';

export const accountSections = [
  ['My account', '/account'], ['My orders', '/account/orders'], ['Favorites', '/account/favorites'],
  ['Fidelity', '/account/fidelity'], ['My information', '/account/information'],
] as const;

export function AccountPanel({ section = 'account' }: { section?: string }) {
  const { user, pending, error, logout, loggingOut } = useAccount();
  const params = useSearchParams();
  const current = accountSections.find(([, href]) => href === (section === 'account' ? '/account' : `/account/${section}`)) || accountSections[0];
  return <div className="min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-4xl">
    <h1 className="text-4xl font-bold text-white sm:text-5xl">{section === 'create' ? 'Create account' : current[0]}</h1>
    <nav aria-label="Account pages" className="mt-7 flex flex-wrap gap-3">{accountSections.map(([label, href]) => <Link key={href} href={href} aria-current={href === current[1] ? 'page' : undefined} className="rounded-lg border border-red-600/50 px-4 py-2 text-sm">{label}</Link>)}</nav>
    <section className="cloud-panel mt-8 rounded-2xl border p-7 sm:p-10">
      {pending ? <p>Loading your account…</p> : !user ? <>
        <h2 className="text-xl font-bold">{section === 'create' ? 'Create your account with Discord' : 'Sign in with Discord'}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{section === 'create' ? 'Continue with Discord to create or access your Cloudy account.' : 'Sign in to access your Cloudy account.'}</p>
        {(params.has('login_error') || error) && <p role="alert" className="mt-3 text-sm text-red-500">{params.get('login_error') === 'unavailable' ? 'Discord login is currently unavailable. Please contact Cloudy support.' : 'We could not sign you in. Please try again or contact Cloudy support.'}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/api/account/login" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>{section === 'create' ? 'Create account with Discord' : 'Login with Discord'}</a>
          {section !== 'create' && <Link href="/account/create" className="cloudy-classic-button" style={{ borderColor: '#e51b2e' }}>Create account</Link>}
        </div>
      </> : <>
        {(section === 'account' || section === 'information' || section === 'create') ? <><h2 className="text-xl font-bold">{user.name}</h2><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-muted">Discord ID</dt><dd>{user.id}</dd></div><div><dt className="text-muted">Display name</dt><dd>{user.name}</dd></div></dl></> : <>
          <p className="text-sm leading-7 text-muted">{section === 'orders' ? 'Your order history is not available here yet. Contact Cloudy support for help with a purchase.' : section === 'fidelity' ? 'Fidelity details are not available yet.' : 'Your saved favorites are not available here yet.'}</p>
          <Link href="/support" className="cloudy-classic-button mt-6" style={{ borderColor: '#e51b2e' }}>Contact support</Link>
        </>}
        <button type="button" disabled={loggingOut} onClick={() => { void logout().catch(() => window.alert('Unable to sign out. Please try again.')); }} className="mt-7 block text-sm text-red-500">{loggingOut ? 'Signing out…' : 'Log off'}</button>
      </>}
    </section>
  </div></div>;
}
