'use client';

import Link from 'next/link';
import { useAccount } from '@/hooks/use-account';
import { EmailAccountForm } from './email-account-form';
import styles from './account-auth.module.css';

export function CreateAccount() {
  const { user, pending } = useAccount();
  return <div className="cloudy-black-page min-h-[70vh] px-4 py-16 sm:py-24"><div className="mx-auto max-w-xl">
    <section className="mt-8 p-7 sm:p-10">
      <span className={styles.eyebrow}>Cloudy account</span>
      {pending ? <p>Loading…</p> : user ? <><h2 className="cloudy-card-title">You’re already signed in</h2><Link href="/account" className="cloudy-classic-button mt-6">My account</Link></> : <>
        <h2 className="cloudy-card-title">Join Cloudy Inc.</h2>
        <p className={styles.intro}>Set up your personal account using your email address and a secure password.</p>
        <EmailAccountForm mode="create" />
      </>}
    </section>
  </div></div>;
}
