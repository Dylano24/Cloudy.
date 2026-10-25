'use client';
import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAccount } from '@/hooks/use-account';
import { EmailAccountForm } from './email-account-form';
import { AccountNameForm } from './account-name-form';
import { AccountPasswordForm } from './account-password-form';
import { AccountFavorites } from './account-favorites';
import styles from './account-auth.module.css';

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
    <section className={`cloud-panel cloudy-traced-panel relative isolate mt-8 rounded-2xl border p-7 sm:p-10 ${styles.card}`}>
      {pending ? <p>Loading your account…</p> : !user ? <>
        <h2 className="text-2xl font-bold">Sign in to Cloudy</h2>
        <p className={styles.intro}>Use your Cloudy email and password, or continue with Google or Discord.</p>
        {(params.has('login_error') || error) && <p role="alert" className="mt-3 text-sm text-red-500">{params.get('login_error') === 'unavailable' ? 'Google or Discord sign-in is temporarily unavailable.' : 'We could not sign you in. Please try again.'}</p>}
        <EmailAccountForm mode="login" />
        <div className={styles.providerActions}>
          <a href="/api/account/login">Continue with Discord</a>
          <a href="/api/account/google/login">Continue with Google</a>
        </div>
        <Link className={styles.forgotLink} href="/account/forgot-password">Forgot password?</Link>
      </> : <>
        {(section === 'account' || section === 'information' || section === 'create') ? <>
          <div className={styles.accountIdentity}>
            <h2 className="text-xl font-bold">{user.name}</h2>
            {section === 'account' && <p className={styles.connected}><CircleCheck size={18} aria-hidden="true" />Successfully connected!</p>}
          </div>
          {section === 'account' && <AccountNameForm currentName={user.name} provider={user.provider} />}
          {section === 'account' && (user.provider === 'email' ? <AccountPasswordForm /> : <p className="mt-6 text-sm">Your password is managed by {user.provider === 'google' ? 'Google' : 'Discord'}. Change it in your provider’s account settings.</p>)}
          {section === 'information' && <dl className={styles.accountInformation}>
            {user.provider === 'email'
              ? <div><dt className="text-muted">Email</dt><dd>{user.email}</dd></div>
              : <div><dt className="text-muted">{user.provider === 'google' ? 'Google ID' : 'Discord ID'}</dt><dd>{user.id}</dd></div>}
          </dl>}
        </> : section === 'favorites' ? <AccountFavorites /> : <>
          <p className="text-sm leading-7 text-muted">{section === 'orders' ? 'Your order history is not available here yet. Contact Cloudy support for help with a purchase.' : section === 'fidelity' ? 'Fidelity details are not available yet.' : 'Your saved favorites are not available here yet.'}</p>
          <Link href="/support" className="cloudy-classic-button mt-6" style={{ borderColor: '#e51b2e' }}>Contact support</Link>
        </>}
      </>}
    </section>
  </div></div>;
}
