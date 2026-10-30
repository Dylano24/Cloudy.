'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import type { ModuleDef } from '@/lib/bot-dashboard/modules';
import { useDashboard } from './dashboard-context';
import { FieldControl, FieldShell } from './fields';
import { CLOUDY_BANNER, CLOUDY_LOGO_URL, DiscordMessage, type PreviewContext } from './discord-preview';

const DEFAULT_TICKET_MESSAGE = 'If you need assistance or have something to report, simply hit the **Start Chat** button below and our team will get back to you as soon as possible.\n\nBefore submitting a request, please make sure the answer to your question cannot already be found in our **FAQ** section using the button at the bottom right.';

function ordinal(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
}
import styles from './bot.module.css';

type Values = Record<string, unknown>;
type Toast = { kind: 'ok' | 'error'; text: string } | null;

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const str = (value: unknown) => (typeof value === 'string' ? value : '');

export function ModuleEditor({ module, initial }: { module: ModuleDef; initial: { values: Values; revision: string } | null }) {
  const { mode, guild, channels, csrf } = useDashboard();
  const editable = mode !== 'unlinked' && initial !== null;
  const [saved, setSaved] = useState<Values>(initial?.values ?? {});
  const [draft, setDraft] = useState<Values>(initial?.values ?? {});
  const [revision, setRevision] = useState(initial?.revision ?? '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [errorPath, setErrorPath] = useState<{ path: string; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; label: string; description: string } | null>(null);
  const [acting, setActing] = useState(false);

  const fields = useMemo(() => module.sections.flatMap(section => section.fields), [module]);
  const dirtyPaths = useMemo(() => fields.filter(field => !same(draft[field.path], saved[field.path])).map(field => field.path), [fields, draft, saved]);
  const dirty = dirtyPaths.length > 0;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.kind === 'ok' ? 3500 : 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setValue = useCallback((path: string, value: unknown) => {
    setDraft(current => ({ ...current, [path]: value }));
    setErrorPath(current => (current?.path === path ? null : current));
  }, []);

  const save = useCallback(async () => {
    if (!dirty || saving || !editable) return;
    const changes = Object.fromEntries(dirtyPaths.map(path => [path, draft[path]]));
    if (mode === 'demo') {
      setSaved(draft);
      setToast({ kind: 'ok', text: 'Saved in the demo only. Nothing was sent to Discord.' });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/bot/guilds/${guild.id}/modules/${module.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-cloudy-csrf': csrf || '' },
        body: JSON.stringify({ revision, changes }),
      });
      const data = await response.json().catch(() => ({})) as { values?: Values; revision?: string; error?: string; path?: string; code?: string };
      if (response.ok && data.values && data.revision) {
        setSaved(data.values);
        setDraft(data.values);
        setRevision(data.revision);
        setToast({ kind: 'ok', text: 'Saved. Cloudy uses the new settings right away.' });
      } else if (response.status === 409) {
        setToast({ kind: 'error', text: 'These settings were changed elsewhere (for example in Discord). Reload the page to see the latest values.' });
      } else {
        if (data.path) setErrorPath({ path: data.path, message: data.error || 'Invalid value' });
        setToast({ kind: 'error', text: data.error || 'Saving failed. Please try again.' });
      }
    } catch {
      setToast({ kind: 'error', text: 'No connection. Your changes are still here; try again.' });
    } finally {
      setSaving(false);
    }
  }, [dirty, saving, editable, dirtyPaths, draft, mode, guild.id, module.id, csrf, revision]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  async function runAction() {
    if (!confirm) return;
    if (mode === 'demo') {
      setConfirm(null);
      setToast({ kind: 'ok', text: `${confirm.label}: shown in the demo only. Nothing was sent to Discord.` });
      return;
    }
    setActing(true);
    try {
      const response = await fetch(`/api/bot/guilds/${guild.id}/modules/${module.id}/actions/${confirm.id}`, { method: 'POST', headers: { 'x-cloudy-csrf': csrf || '' } });
      const data = await response.json().catch(() => ({})) as { message?: string; error?: string };
      setToast(response.ok ? { kind: 'ok', text: data.message || 'Done.' } : { kind: 'error', text: data.error || 'Cloudy could not complete this action.' });
    } catch {
      setToast({ kind: 'error', text: 'No connection. Please try again.' });
    } finally {
      setActing(false);
      setConfirm(null);
    }
  }

  const previewCtx: PreviewContext = useMemo(() => ({
    user: 'Cloudy Fan', userTag: 'cloudyfan', server: guild.name, memberCount: guild.memberCount ?? 1284, level: 10,
    channelName: id => channels.find(channel => channel.id === id)?.name || null,
  }), [guild.name, guild.memberCount, channels]);

  const preview = module.preview ? renderPreview(module.preview, draft, previewCtx) : null;

  const content = (
    <div className={styles.stack}>
      {module.sections.map(section => (
        <section key={section.title} className={`${styles.panel} ${styles.card}`} aria-labelledby={`section-${module.id}-${section.title}`}>
          <header className={styles.cardHead}>
            <h2 id={`section-${module.id}-${section.title}`}>{section.title}</h2>
            {section.description ? <p>{section.description}</p> : null}
          </header>
          {section.fields.map(field => {
            const id = `f-${module.id}-${field.path.replace(/[^A-Za-z0-9]/g, '-')}`;
            return (
              <FieldShell key={field.path} id={id} field={field} dirty={dirtyPaths.includes(field.path)} error={errorPath?.path === field.path ? errorPath.message : null}>
                <FieldControl id={id} field={field} value={draft[field.path]} disabled={!editable || saving} onChange={value => setValue(field.path, value)} />
              </FieldShell>
            );
          })}
        </section>
      ))}

      {module.actions?.map(action => (
        <div key={action.id} className={`${styles.panel} ${styles.actionsCard}`}>
          <div>
            <strong style={{ fontSize: 14, fontWeight: 600 }}>{action.label}</strong>
            <p>{action.description}</p>
          </div>
          <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} disabled={!editable || dirty} title={dirty ? 'Save your changes first' : undefined}
            onClick={() => setConfirm(action)}>
            {action.label}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className={dirty ? styles.withSaveBar : undefined}>
      <div className={[styles.editorGrid, preview ? styles.withPreview : ''].join(' ')}>
        {editable ? content : (
          <div className={styles.locked} aria-describedby="locked-reason">
            <p id="locked-reason" className={styles.srOnly}>These settings are shown read-only until Cloudy&apos;s Dashboard API is connected.</p>
            <div className={styles.lockedContent} inert>{content}</div>
          </div>
        )}
        {preview ? (
          <aside className={styles.previewColumn} aria-label="Live preview">
            <div className={styles.previewLabel}><span>Live preview</span><span>Updates as you type</span></div>
            {preview}
          </aside>
        ) : null}
      </div>

      {dirty && editable ? (
        <div className={styles.saveBar} role="region" aria-label="Unsaved changes">
          <p>{dirtyPaths.length === 1 ? '1 unsaved change' : `${dirtyPaths.length} unsaved changes`}<small>{mode === 'demo' ? 'Demo: stays in this browser tab' : 'Ctrl/⌘ + S to save'}</small></p>
          <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => { setDraft(saved); setErrorPath(null); }} disabled={saving}>Reset</button>
          <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : null}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      ) : null}

      {toast ? (
        <div className={[styles.toast, toast.kind === 'ok' ? styles.toastOk : styles.toastError].join(' ')} role={toast.kind === 'ok' ? 'status' : 'alert'}>
          {toast.kind === 'ok' ? <CheckCircle2 size={17} aria-hidden="true" /> : <AlertTriangle size={17} aria-hidden="true" />}
          <span>{toast.text}</span>
        </div>
      ) : null}

      {confirm ? (
        <div className={styles.dialogBackdrop} onClick={event => { if (event.target === event.currentTarget && !acting) setConfirm(null); }}>
          <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text"
            onKeyDown={event => { if (event.key === 'Escape' && !acting) setConfirm(null); }}>
            <h2 id="confirm-title">{confirm.label}?</h2>
            <p id="confirm-text">{confirm.description}</p>
            <div className={styles.dialogActions}>
              <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setConfirm(null)} disabled={acting} autoFocus>Cancel</button>
              <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => void runAction()} disabled={acting}>
                {acting ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : null} {confirm.label}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderPreview(kind: NonNullable<ModuleDef['preview']>, values: Values, ctx: PreviewContext) {
  switch (kind) {
    case 'welcome': {
      // Mirrors guildMemberAdd/guildMemberRemove in the bot: a fixed Cloudy Inc.
      // welcome card, and a goodbye embed built from the saved goodbye settings.
      const count = ctx.memberCount;
      return (
        <>
          <div className={styles.previewLabel}><span>Welcome</span><span>{values.enabled === true ? 'On' : 'Off'}</span></div>
          <DiscordMessage ctx={ctx}
            content={values.welcomePing === true ? '{user}' : undefined}
            embed={{
              title: 'Welcome to Cloudy Inc.',
              description: `You are the **${count}**${ordinal(count)} member of the server {user}`,
              color: '#FFFFFF',
              fields: [
                { name: '📜 Rules', value: '[Check our rules](https://discord.com)' },
                { name: '🔗 Link your account', value: '[Claim free kits, purchases & alerts](https://discord.com)' },
                { name: '🛒 Subscriptions & Purchases', value: '[Cloudy Inc. website](https://discord.com)' },
                { name: '📩 Support & Help', value: '[Contact us](https://discord.com)' },
              ],
              thumbnail: CLOUDY_LOGO_URL,
              image: CLOUDY_BANNER,
              footer: '© Cloudy Inc. • Quality. Innovation. Performance.',
            }} />
          <div className={styles.previewLabel}><span>Goodbye</span><span>{values.goodbyeEnabled === true ? 'On' : 'Off'}</span></div>
          <DiscordMessage ctx={ctx}
            content={values.goodbyePing === true ? '{user}' : undefined}
            embed={{
              title: str(values['leaveEmbed.title']) || '👋 Goodbye',
              description: str(values.leaveMessage) || '{user} has left the server.',
              color: str(values['leaveEmbed.color']) || '#7A1712',
              thumbnail: 'https://cdn.discordapp.com/embed/avatars/0.png',
              fields: [{ name: 'User', value: `${ctx.userTag} (123456789012345678)` }, { name: 'Member Count', value: String(count) }],
              image: str(values['leaveEmbed.image']),
              footer: str(values['leaveEmbed.footer']) || 'Goodbye from {server}!',
              timestamp: true,
            }} />
        </>
      );
    }
    case 'verification':
      return (
        <DiscordMessage ctx={ctx}
          embed={{ title: 'Server Verification', description: str(values['verification.message']) || 'Click the button below to verify yourself and gain access to the server!', color: '#00C49D' }}
          buttons={[{ label: str(values['verification.buttonText']) || 'Verify', primary: true }]} />
      );
    case 'ticket-panel':
      return (
        <DiscordMessage ctx={ctx}
          embed={{
            title: str(values.ticketPanelTitle).trim() || 'Contact the support',
            description: str(values.ticketPanelMessage).trim() ? str(values.ticketPanelMessage) : DEFAULT_TICKET_MESSAGE,
            color: '#FFFFFF',
            footer: '© Cloudy Inc. • Quality. Innovation. Performance.',
          }}
          buttons={[{ label: `💬 ${str(values.ticketButtonLabel) || 'Start Chat'}` }, { label: '❔FAQ ↗' }]} />
      );
    case 'level-up':
      return <DiscordMessage ctx={ctx} content={str(values.levelUpMessage) || 'GG {user}, you reached level {level}!'} />;
    default:
      return null;
  }
}

export function LockedNotice({ reason }: { reason: 'unlinked' | 'unavailable' }) {
  return (
    <div className={styles.notice} role="note">
      <Lock size={18} aria-hidden="true" />
      <div>
        <strong>{reason === 'unlinked' ? 'Read-only until Cloudy is connected' : 'Cloudy could not load these settings'}</strong>
        {reason === 'unlinked'
          ? 'This page shows exactly what you will manage here. Live values and saving switch on once Cloudy\'s Dashboard API is enabled on Railway (a separate, approved bot update).'
          : 'Cloudy did not answer just now. Nothing was changed; reload the page in a moment.'}
      </div>
    </div>
  );
}
