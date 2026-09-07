import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Gamepad2, MessageCircle, ShoppingBag } from 'lucide-react';
import styles from './success.module.css';

const DISCORD_URL = 'https://discord.gg/QnWNz2dKCE';

export default function CheckoutSuccessPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.top}>
          <span className={styles.icon}><CheckCircle2 size={36} /></span>
          <span className={styles.kicker}>Cloudy store</span>
          <h1>Purchase complete</h1>
          <p>
            Your purchase has been received. Follow the steps below so you know exactly what to do when you join the Cloudy Rust server.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.claimHead}>
            <span className={styles.claimIcon}><Gamepad2 size={22} /></span>
            <div>
              <h2>How to claim your purchase in game</h2>
              <p>Keep the account used during checkout connected to your Cloudy purchase.</p>
            </div>
          </div>

          <ol className={styles.steps}>
            <li>Join the Cloudy Rust server using the same account that you linked or used during checkout.</li>
            <li>Once you are online, allow a few moments for the Cloudy purchase system to recognize and deliver your purchase.</li>
            <li>If your purchase does not appear, contact Cloudy staff in Discord and provide your purchase details so the team can help you claim it.</li>
          </ol>

          <div className={styles.notice}>
            <AlertTriangle size={18} />
            <span>Do not purchase the same package again if it has not appeared yet. Contact staff first so your original purchase can be checked.</span>
          </div>

          <div className={styles.actions}>
            <Link href="/shop" className={styles.primary}>
              <ShoppingBag size={16} /> Back to store
            </Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={styles.secondary}>
              <MessageCircle size={16} /> Contact staff on Discord
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
