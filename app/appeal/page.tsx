'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';
import styles from './appeal.module.css';

type AppealScope = 'discord' | 'rust';

const DISCORD_APPEAL_EMOJI = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=64&quality=lossless';
const RUST_APPEAL_EMOJI = 'https://cdn.discordapp.com/emojis/1543286621594583111.gif?size=64&quality=lossless';

export default function AppealPage() {
  const [scope, setScope] = useState<AppealScope | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appealId, setAppealId] = useState('');
  const [error, setError] = useState('');

  async function submitAppeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scope || submitting) return;

    setSubmitting(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = {
      scope,
      action: String(form.get('action') || ''),
      discordIdentity: String(form.get('discordIdentity') || ''),
      gamertag: String(form.get('gamertag') || ''),
      email: String(form.get('email') || ''),
      punishmentReason: String(form.get('punishmentReason') || ''),
      punishmentJustified: String(form.get('punishmentJustified') || ''),
      acceptanceReason: String(form.get('acceptanceReason') || ''),
      futureChanges: String(form.get('futureChanges') || ''),
      evidence: String(form.get('evidence') || ''),
      additionalInfo: String(form.get('additionalInfo') || ''),
    };

    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || 'Your appeal could not be submitted. Please try again.');
      }

      setAppealId(String(result?.id || ''));
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your appeal could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.formTop}>
          <a href="/" className={styles.backButton}><ChevronLeft size={15} /> Home</a>
          <a href="/appeal" className={styles.contextPill}>Appeal</a>
        </div>

        <header className={styles.hero}>
          <span className={styles.eyebrow}><ShieldAlert size={15} /> Cloudy appeals</span>
          <h1>{scope === 'rust' ? 'Ban appeal' : 'Mute / Ban appeal'}</h1>
          <p>If you believe your punishment was unfair or deserves to be reconsidered, you may submit an appeal below.</p>
        </header>

        <section className={styles.panel}>
          {!scope && !submitted && (
            <div className={styles.panelInner}>
              <h2 className={styles.selectionTitle}>What is your appeal related to?</h2>
              <p className={styles.selectionText}>Select the platform your punishment applies to before continuing.</p>

              <div className={styles.scopeGrid}>
                <button type="button" className={styles.scopeButton} onClick={() => setScope('discord')}>
                  <span className={styles.scopeIcon}>
                    <img className={styles.scopeEmoji} src={DISCORD_APPEAL_EMOJI} alt="" aria-hidden="true" />
                  </span>
                  <strong>Discord</strong>
                  <span>Appeal a mute, ban or other punishment from the Cloudy Discord community.</span>
                </button>
                <button type="button" className={styles.scopeButton} onClick={() => setScope('rust')}>
                  <span className={styles.scopeIcon}>
                    <img className={styles.scopeEmoji} src={RUST_APPEAL_EMOJI} alt="" aria-hidden="true" />
                  </span>
                  <strong>Rust server</strong>
                  <span>Appeal a ban or other punishment from the Cloudy Rust server.</span>
                </button>
              </div>
            </div>
          )}

          {scope && !submitted && (
            <div className={styles.panelInner}>
              <div className={styles.formTop}>
                <button type="button" className={styles.backButton} onClick={() => setScope(null)}>
                  <ChevronLeft size={15} /> Change selection
                </button>
                <span className={styles.contextPill}>
                  <img
                    src={scope === 'discord' ? DISCORD_APPEAL_EMOJI : RUST_APPEAL_EMOJI}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 16, height: 16, display: 'block', objectFit: 'contain' }}
                  />
                  {scope === 'discord' ? 'Discord appeal' : 'Rust server appeal'}
                </span>
              </div>

              <div className={styles.intro}>
                <p>Please answer every question honestly and provide as much relevant information as possible. False information, manipulation, or abusive behavior towards the staff team may result in your appeal being denied.</p>
              </div>

              <form className={styles.form} onSubmit={submitAppeal}>
                <label className={styles.field}>
                  <span className={styles.label}>What action are you appealing?</span>
                  <select className={styles.select} name="action" required defaultValue="">
                    <option value="" disabled>Select an option</option>
                    {scope === 'discord' && <option value="Mute">Mute</option>}
                    <option value="Ban">Ban</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {scope === 'discord' && (
                  <label className={styles.field}>
                    <span className={styles.label}>What is your Discord username / ID?</span>
                    <span className={styles.help}>Please provide your current Discord username or User ID.</span>
                    <input className={styles.input} name="discordIdentity" required placeholder="Required" maxLength={100} autoComplete="off" />
                  </label>
                )}

                {scope === 'rust' && (
                  <label className={styles.field}>
                    <span className={styles.label}>What is your Gamertag?</span>
                    <span className={styles.help}>Please provide the username you use in-game.</span>
                    <input className={styles.input} name="gamertag" required placeholder="Required" maxLength={100} autoComplete="off" />
                  </label>
                )}

                <label className={styles.field}>
                  <span className={styles.label}>What is your email address?</span>
                  <span className={styles.help}>Please provide a valid email address where you can receive notifications regarding the result of your appeal.</span>
                  <input className={styles.input} type="email" name="email" required placeholder="Required" maxLength={254} autoComplete="email" />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>{scope === 'rust' ? 'Why were you banned?' : 'Why were you muted/banned?'}</span>
                  <span className={styles.help}>Please explain what happened from your perspective.</span>
                  <textarea className={styles.textarea} name="punishmentReason" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Do you believe the punishment was justified?</span>
                  <span className={styles.help}>Explain why you believe the punishment was or was not justified.</span>
                  <textarea className={styles.textarea} name="punishmentJustified" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Why should your appeal be accepted?</span>
                  <span className={styles.help}>Explain why you believe your punishment should be removed or reconsidered.</span>
                  <textarea className={styles.textarea} name="acceptanceReason" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>What will you do differently if your appeal is accepted?</span>
                  <span className={styles.help}>Please explain how you intend to avoid repeating the situation.</span>
                  <textarea className={styles.textarea} name="futureChanges" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Do you have any evidence supporting your appeal?</span>
                  <span className={styles.help}>You may provide links to screenshots, videos, messages, or other relevant evidence.</span>
                  <textarea className={styles.textarea} name="evidence" placeholder="Optional" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Is there anything else you would like the staff team to know?</span>
                  <span className={styles.help}>Provide any additional information or context that may help us review your appeal.</span>
                  <textarea className={styles.textarea} name="additionalInfo" placeholder="Optional" maxLength={1000} />
                </label>

                {error && <div className={styles.error} role="alert">{error}</div>}

                <div className={styles.submitRow}>
                  <span className={styles.submitHint}>Please do not submit multiple appeals for the same punishment.</span>
                  <button className={styles.submitButton} type="submit" disabled={submitting}>
                    {submitting && <LoaderCircle className={styles.spinner} size={17} />}
                    {submitting ? 'Submitting...' : 'Submit appeal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitted && (
            <div className={styles.success}>
              <span className={styles.successIcon}><CheckCircle2 size={34} /></span>
              <h2>Appeal submitted</h2>
              <p>Your appeal has been successfully submitted. Our staff team will review your appeal and make a decision based on the information provided.</p>
              <p>You will receive an email notification once a decision has been made. You can also keep an eye on your ban or timeout status, which will be automatically updated if your appeal is accepted.</p>
              <p>Please do not submit multiple appeals for the same punishment. Thank you for your patience.</p>
              {appealId && <span className={styles.appealId}>Appeal ID: {appealId}</span>}
              <p className={styles.successFooter}>Cloudy Inc. staff team</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
