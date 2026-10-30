import { Suspense } from 'react';
import { AlertTriangle, ArrowRight, Check, KeyRound, ShieldCheck, Zap } from 'lucide-react';
import studioStyles from '@/app/service/service.module.css';
import { euro, PLAN_FEATURES, PLAN_NAME, PLAN_ORDER_URL, PLAN_PRICE_EUR } from '@/lib/bot-dashboard/plan';
import { BotStatusPill, StatusPlaceholder } from './bot-status';
import { BotShowcase } from './landing-showcase';
import styles from './bot.module.css';

const LOGIN_ERRORS: Record<string, string> = {
  expired: 'The login took too long or was opened in another browser. Please try again.',
  denied: 'Discord login was cancelled. Nothing was shared.',
  failed: 'Discord could not complete the login. Please try again.',
  unavailable: 'Discord login is not configured on this deployment yet.',
  busy: 'Too many login attempts. Wait a minute and try again.',
};

const questions = [
  {
    question: 'Who can manage a server here?',
    answer: 'Only the server owner, Administrators and members with Manage Server. Discord tells us your permissions when you log in, and every save is checked again on our server and by Cloudy itself.',
  },
  {
    question: 'What does Cloudy see when I log in?',
    answer: 'Your Discord name, avatar and the list of servers you are in, with your permissions there. Cloudy cannot read your messages or act as you. Your Discord login stays on our server.',
  },
  {
    question: 'What does Cloudy Bot Premium cost?',
    answer: PLAN_NAME + ' costs ' + euro.format(PLAN_PRICE_EUR) + ' per month per server. Premium is ordered through the Cloudy Discord support server. There is no free trial advertised on this page.',
  },
  {
    question: 'Can I preview Cloudy before buying?',
    answer: 'Yes. Try the interactive previews on this page. These are simulated examples and do not change any Discord server. Real settings are available through the authenticated server dashboard.',
  },
  {
    question: 'Do changes need a restart?',
    answer: 'No. Saved settings go straight to Cloudy, which applies them immediately through the same code its Discord commands use.',
  },
];

export function BotLanding({ loginError, next }: { loginError: string | null; next: string }) {
  const loginHref = '/api/bot/auth/login' + (next !== '/bot' ? '?next=' + encodeURIComponent(next) : '');
  const consentHref = '/api/bot/auth/login?consent=1' + (next !== '/bot' ? '&next=' + encodeURIComponent(next) : '');
  const error = loginError === 'consent' ? null : loginError ? LOGIN_ERRORS[loginError] || LOGIN_ERRORS.failed : null;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>Cloudy Bot</span>
            <h1 className={styles.display + ' ' + styles.heroTitle}>Your server.<br /><span>Fully in control.</span></h1>
            <p className={styles.lead + ' ' + styles.heroLead}>
              Moderation, tickets, giveaways and more.<br />All in one powerful Discord bot and one connected dashboard.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.button} href="#cloudy-demos">Explore Cloudy <ArrowRight size={17} aria-hidden="true" /></a>
              <a className={styles.buttonGhost} href="#bot-pricing">See pricing</a>
            </div>
            <div className={styles.heroStatus}>
              <Suspense fallback={<StatusPlaceholder />}><BotStatusPill /></Suspense>
            </div>
            {loginError === 'consent' ? (
              <div className={styles.notice + ' ' + styles.noticeNeutral + ' ' + styles.loginError} role="status">
                <KeyRound size={18} aria-hidden="true" />
                <div><strong>One more step</strong>Discord needs your permission once to show which servers you can manage.
                  <p><a href={consentHref} className={styles.buttonGhost}>Allow server access <ArrowRight size={15} /></a></p>
                </div>
              </div>
            ) : null}
            {error ? (
              <div className={styles.notice + ' ' + styles.loginError} role="alert">
                <AlertTriangle size={18} aria-hidden="true" />
                <div><strong>Login did not finish</strong>{error}
                  <p><a href={loginHref} className={styles.buttonGhost}>Try again <ArrowRight size={15} /></a></p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="bot-pricing">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Cloudy Bot Premium</span>
            <h2 id="bot-pricing" className={styles.display + ' ' + styles.sectionTitle}>One plan.<br />Everything included.</h2>
          </div>
          <div className={styles.panel + ' ' + styles.priceCard + ' ' + styles.priceCardLanding}>
            <div className={styles.priceHead}>
              <span className={styles.eyebrow}>{PLAN_NAME}</span>
              <p className={styles.price}>{euro.format(PLAN_PRICE_EUR)}<small>/ month per server</small></p>
              <p>Powerful controls for your Discord server, all in one Cloudy dashboard.</p>
            </div>
            <ul className={styles.featureList}>
              {PLAN_FEATURES.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>)}
            </ul>
            <a href={PLAN_ORDER_URL} className={styles.button} target="_blank" rel="noopener noreferrer">
              Get Premium <ArrowRight size={17} aria-hidden="true" />
            </a>
            <p className={styles.small + ' ' + styles.muted} style={{ margin: 0 }}>
              Order via Cloudy&apos;s Discord support server. No automatic payment or subscription is started here.
            </p>
          </div>
        </div>
      </section>

      <BotShowcase />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.pillars}>
            <article className={styles.pillar}>
              <h2><Zap size={24} strokeWidth={1.8} aria-hidden="true" /> Instant changes</h2>
              <p>Settings are saved straight to Cloudy and apply right away. No restarts, no copying IDs between Discord and a form.</p>
            </article>
            <article className={styles.pillar}>
              <h2><ShieldCheck size={24} strokeWidth={1.8} aria-hidden="true" /> Discord permissions</h2>
              <p>You only see servers where you are the owner, an Administrator or have Manage Server. Each save is checked again on the server.</p>
            </article>
            <article className={styles.pillar}>
              <h2><KeyRound size={24} strokeWidth={1.8} aria-hidden="true" /> Private by design</h2>
              <p>Your Discord login is encrypted on our server. Cloudy&apos;s credentials never reach the website, and every change is logged.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ paddingBottom: 'var(--cloudy-page-pad)' }}>
        <div className={styles.container}>
          <div className={[studioStyles.faqHeading, studioStyles.faqHeadingInline].join(' ')} style={{ marginBottom: 28 }}>
            <span className={studioStyles.faqSingleDot} aria-hidden="true" />
            <h2 className={studioStyles.faqHeadingTitle}>Frequently asked questions.</h2>
          </div>
          <div className={studioStyles.faqList} style={{ maxWidth: 900 }}>
            {questions.map(({ question, answer }) => (
              <details key={question} className={studioStyles.faqItem}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
