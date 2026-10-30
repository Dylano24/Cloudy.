'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { ModuleDef } from '@/lib/bot-dashboard/modules';
import { useDashboard } from './dashboard-context';
import { FieldControl, FieldShell } from './fields';
import styles from './bot.module.css';

type Values = Record<string, unknown>;
type Toast = { kind: 'ok' | 'error'; text: string } | null;

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export function ModuleEditor({ module, initial }: { module: ModuleDef; initial: { values: Values; revision: string } }) {
  const { guild, csrf } = useDashboard();
  const [saved, setSaved] = useState<Values>(initial.values);
  const [draft, setDraft] = useState<Values>(initial.values);
  const [revision, setRevision] = useState(initial.revision);
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
    if (!dirty || saving) return;
    const changes = Object.fromEntries(dirtyPaths.map(path => [path, draft[path]]));
    setSaving(true);
    try {
      const response = await fetch(`/api/bot/guilds/${guild.id}/modules/${module.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-cloudy-csrf': csrf },
        body: JSON.stringify({ revision, changes }),
      });
      const data = await response.json().catch(() => ({})) as { values?: Values; revision?: string; error?: string; path?: string };
      if (response.ok && data.values && data.revision) {
        setSaved(data.values);
        setDraft(data.values);
        setRevision(data.revision);
        setToast({ kind: 'ok', text: 'Saved. Cloudy uses the new settings right away.' });
      } else if (response.status === 409) {
        setToast({ kind: 'error', text: 'These settings were changed in Discord in the meantime. Reload the page to see the latest values.' });
      } else {
        if (data.path) setErrorPath({ path: data.path, message: data.error || 'Invalid value' });
        setToast({ kind: 'error', text: data.error || 'Saving failed. Please try again.' });
      }
    } catch {
      setToast({ kind: 'error', text: 'No connection. Your changes are still here; try again.' });
    } finally {
      setSaving(false);
    }
  }, [dirty, saving, dirtyPaths, draft, guild.id, module.id, csrf, revision]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  async function runAction() {
    if (!confirm) return;
    setActing(true);
    try {
      const response = await fetch(`/api/bot/guilds/${guild.id}/modules/${module.id}/actions/${confirm.id}`, { method: 'POST', headers: { 'x-cloudy-csrf': csrf } });
      const data = await response.json().catch(() => ({})) as { message?: string; error?: string };
      setToast(response.ok ? { kind: 'ok', text: data.message || 'Done.' } : { kind: 'error', text: data.error || 'Cloudy could not complete this action.' });
    } catch {
      setToast({ kind: 'error', text: 'No connection. Please try again.' });
    } finally {
      setActing(false);
      setConfirm(null);
    }
  }

  return (
    <div className={dirty ? styles.withSaveBar : undefined}>
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
                  <FieldControl id={id} field={field} value={draft[field.path]} disabled={saving} onChange={value => setValue(field.path, value)} />
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
            <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} disabled={dirty} title={dirty ? 'Save your changes first' : undefined}
              onClick={() => setConfirm(action)}>
              {action.label}
            </button>
          </div>
        ))}
      </div>

      {dirty ? (
        <div className={styles.saveBar} role="region" aria-label="Unsaved changes">
          <p>{dirtyPaths.length === 1 ? '1 unsaved change' : `${dirtyPaths.length} unsaved changes`}<small>Ctrl/⌘ + S to save</small></p>
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
