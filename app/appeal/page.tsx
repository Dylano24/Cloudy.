'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { CheckCircle2, ChevronLeft, LoaderCircle, ShieldAlert } from 'lucide-react';
import styles from './appeal.module.css';

type AppealScope = 'discord' | 'rust';

const DISCORD_APPEAL_EMOJI = 'https://cdn.discordapp.com/emojis/1543287452410716160.gif?size=64&quality=lossless';
const RUST_APPEAL_EMOJI = 'https://cdn.discordapp.com/emojis/1543286621594583111.gif?size=64&quality=lossless';

export default function AppealPage() {
  const [scope, setScope] = useState<AppealScope | null>(null);
  const [action, setAction] = useState('');
  const [otherAction, setOtherAction] = useState('');
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
    const rawReason = String(form.get('punishmentReason') || '');
    const payload = {
      scope,
      action: String(form.get('action') || ''),
      otherAction: String(form.get('otherAction') || ''),
      discordIdentity: String(form.get('discordIdentity') || ''),
      gamertag: String(form.get('gamertag') || ''),
      email: String(form.get('email') || ''),
      punishmentReason: action === 'Other' && otherAction.trim()
        ? `Moderation action: ${otherAction.trim()}\n\n${rawReason}`
        : rawReason,
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

  function chooseScope(nextScope: AppealScope | null) {
    setScope(nextScope);
    setAction('');
    setOtherAction('');
    setError('');
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.formTop}>
          <a href="/" className={styles.backButton}><ChevronLeft size={15} /> Home</a>
          <a href="/appeal" className={styles.contextPill}>Appeal</a>
        </div>

        <header className={styles.hero}>
          <span className={styles.eyebrow}><ShieldAlert size={15} /> Cloudy support</span>
          <h1>Request a review</h1>
          <p>If you believe the moderation action taken against you was unfair or should be reconsidered, you may request a review below.</p>
        </header>

        <section className={styles.panel}>
          {!scope && !submitted && (
            <div className={styles.panelInner}>
              <h2 className={styles.selectionTitle}>What is your review related to?</h2>
              <p className={styles.selectionText}>Select the platform where the moderation action was issued before continuing.</p>

              <div className={styles.scopeGrid}>
                <button type="button" className={styles.scopeButton} onClick={() => chooseScope('discord')}>
                  <span className={styles.scopeIcon}>
                    <img className={styles.scopeEmoji} src={DISCORD_APPEAL_EMOJI} alt="" aria-hidden="true" />
                  </span>
                  <strong>Discord</strong>
                  <span>Request a review of a mute, ban, or other moderation action taken within the Cloudy Discord community.</span>
                </button>

                <button type="button" className={styles.scopeButton} onClick={() => chooseScope('rust')}>
                  <span className={styles.scopeIcon}>
                    <img className={styles.scopeEmoji} src={RUST_APPEAL_EMOJI} alt="" aria-hidden="true" />
                  </span>
                  <strong>Rust server</strong>
                  <span>Request a review of a ban or other moderation action taken on the Cloudy Rust server.</span>
                </button>
              </div>
            </div>
          )}

          {scope && !submitted && (
            <div className={styles.panelInner}>
              <div className={styles.formTop}>
                <button type="button" className={styles.backButton} onClick={() => chooseScope(null)}>
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
                <p>Please answer every question honestly and provide as much relevant information as possible. False information, manipulation, or abusive behavior towards the staff team may result in your review request being denied.</p>
              </div>

              <form className={styles.form} onSubmit={submitAppeal}>
                <label className={styles.field}>
                  <span className={styles.label}>What action are you appealing?</span>
                  <select
                    className={styles.select}
                    name="action"
                    required
                    value={action}
                    onChange={(event) => {
                      setAction(event.target.value);
                      if (event.target.value !== 'Other') setOtherAction('');
                    }}
                  >
                    <option value="" disabled>Select an option</option>
                    {scope === 'discord' && <option value="Mute">Mute</option>}
                    <option value="Ban">Ban</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {action === 'Other' && (
                  <label className={styles.field}>
                    <span className={styles.label}>What moderation action was taken against you?</span>
                    <span className={styles.help}>Please specify the moderation action you received.</span>
                    <input
                      className={styles.input}
                      name="otherAction"
                      required
                      value={otherAction}
                      onChange={(event) => setOtherAction(event.target.value)}
                      placeholder="Required"
                      maxLength={100}
                      autoComplete="off"
                    />
                  </label>
                )}

                <label className={styles.field}>
                  <span className={styles.label}>What is your Discord username / ID?</span>
                  <span className={styles.help}>Please provide your current Discord username or User ID.</span>
                  <input className={styles.input} name="discordIdentity" required placeholder="Required" maxLength={100} autoComplete="off" />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>What is your Gamertag?</span>
                  <span className={styles.help}>Please provide the username you use in game.</span>
                  <input className={styles.input} name="gamertag" required placeholder="Required" maxLength={100} autoComplete="off" />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>What is your email address?</span>
                  <span className={styles.help}>Please provide a valid email address where you can receive notifications regarding the result of your review.</span>
                  <input className={styles.input} type="email" name="email" required placeholder="Required" maxLength={254} autoComplete="email" />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Why did you receive this moderation action?</span>
                  <span className={styles.help}>Please explain what happened from your perspective.</span>
                  <textarea className={styles.textarea} name="punishmentReason" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Do you believe the moderation action was justified?</span>
                  <span className={styles.help}>Explain why you believe the moderation action was or was not justified.</span>
                  <textarea className={styles.textarea} name="punishmentJustified" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Why should your appeal be accepted?</span>
                  <span className={styles.help}>Explain why you believe the moderation action taken against you should be removed or reconsidered.</span>
                  <textarea className={styles.textarea} name="acceptanceReason" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>What will you do differently if your review is accepted?</span>
                  <span className={styles.help}>Please explain how you intend to avoid repeating the situation.</span>
                  <textarea className={styles.textarea} name="futureChanges" required placeholder="Required" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Do you have any evidence supporting your appeal?</span>
                  <span className={styles.help}>You may provide screenshots, videos, messages, or any other relevant evidence.</span>
                  <textarea className={styles.textarea} name="evidence" placeholder="Optional" maxLength={1000} />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Is there anything else you would like the staff team to know?</span>
                  <span className={styles.help}>Provide any additional information or context that may help us review the moderation action.</span>
                  <textarea className={styles.textarea} name="additionalInfo" placeholder="Optional" maxLength={1000} />
                </label>

                {error && <div className={styles.error} role="alert">{error}</div>}

                <div className={styles.submitRow}>
                  <span className={styles.submitHint}>Please do not submit multiple appeals for the same moderation action.</span>
                  <button className={styles.submitButton} type="submit" disabled={submitting}>
                    {submitting && <LoaderCircle className={styles.spinner} size={17} />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitted && (
            <div className={styles.success}>
              <span className={styles.successIcon}><CheckCircle2 size={34} /></span>
              <h2>Appeal submitted</h2>
              <p>Your review request has been successfully submitted. Our staff team will review the information provided and make a decision.</p>
              <p>You will receive an email notification once a decision has been made. You can also keep an eye on your sanction status, which will be automatically updated if your appeal is accepted.</p>
              <p>Please do not submit multiple appeals for the same moderation action. Thank you for your patience.</p>
              {appealId && <span className={styles.appealId}>Appeal ID: {appealId}</span>}
              <p className={styles.successFooter}>Cloudy Inc. staff team</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
