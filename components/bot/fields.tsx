'use client';

import { useMemo, useRef } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { ChannelKind, Field } from '@/lib/bot-dashboard/modules';
import type { BotChannel, BotRole } from '@/lib/bot-dashboard/bot-api';
import { useDashboard } from './dashboard-context';
import styles from './bot.module.css';

type ControlProps = { field: Field; value: unknown; onChange: (value: unknown) => void; disabled: boolean; id?: string };

const asString = (value: unknown) => (typeof value === 'string' ? value : '');
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asRecord = (value: unknown) => (value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {});
const roleColor = (color: number) => (color ? `#${color.toString(16).padStart(6, '0')}` : '#b5bac1');

function channelsOfKind(channels: BotChannel[], kinds: ChannelKind[]) {
  const categories = new Map(channels.filter(channel => channel.type === 'category').map(channel => [channel.id, channel]));
  const matches = channels.filter(channel => kinds.includes(channel.type)).sort((a, b) => a.position - b.position);
  if (kinds.length === 1 && kinds[0] === 'category') return [{ label: 'Categories', items: matches }];
  const groups = new Map<string, BotChannel[]>();
  for (const channel of matches) {
    const label = channel.parentId ? categories.get(channel.parentId)?.name || 'Other' : 'No category';
    groups.set(label, [...(groups.get(label) || []), channel]);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

function channelLabel(channel: BotChannel) {
  return channel.type === 'category' ? channel.name : channel.type === 'voice' ? `🔊 ${channel.name}` : `# ${channel.name}`;
}

// Owner's choice: role pickers only offer the Staff, Moderator, Owner and Member roles.
const ALLOWED_ROLE_KEYS = new Set(['staff', 'moderator', 'moderators', 'mod', 'mods', 'owner', 'member', 'members']);
export const isAllowedRole = (role: Pick<BotRole, 'name' | 'managed'>) => !role.managed && ALLOWED_ROLE_KEYS.has(role.name.toLowerCase().replace(/[^a-z]/g, ''));

function usableRoles(roles: BotRole[]) {
  return roles.filter(isAllowedRole).sort((a, b) => b.position - a.position);
}

function ChannelOptions({ kinds, exclude = [] }: { kinds: ChannelKind[]; exclude?: string[] }) {
  const { channels } = useDashboard();
  return (
    <>
      {channelsOfKind(channels, kinds).map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.items.filter(channel => !exclude.includes(channel.id)).map(channel => <option key={channel.id} value={channel.id}>{channelLabel(channel)}</option>)}
        </optgroup>
      ))}
    </>
  );
}

function RoleOptions({ exclude = [], current }: { exclude?: string[]; current?: string }) {
  const { roles } = useDashboard();
  const offered = usableRoles(roles);
  // Keep an already saved role visible so it can be changed.
  const saved = current && !offered.some(role => role.id === current) ? roles.find(role => role.id === current) : null;
  return (
    <>
      {saved ? <option value={saved.id}>@{saved.name}</option> : null}
      {offered.filter(role => !exclude.includes(role.id)).map(role => <option key={role.id} value={role.id}>@{role.name}</option>)}
    </>
  );
}

function ChipList({ ids, kind, onRemove, disabled }: { ids: string[]; kind: 'channel' | 'role'; onRemove: (id: string) => void; disabled: boolean }) {
  const { channels, roles } = useDashboard();
  if (!ids.length) return <span className={styles.fieldHelp}>None selected</span>;
  return (
    <div className={styles.chips}>
      {ids.map(id => {
        const channel = kind === 'channel' ? channels.find(entry => entry.id === id) : null;
        const role = kind === 'role' ? roles.find(entry => entry.id === id) : null;
        const label = channel ? channelLabel(channel) : role ? `@${role.name}` : 'Unknown';
        return (
          <span key={id} className={styles.chip}>
            {role ? <span className={styles.roleDot} style={{ background: roleColor(role.color) }} /> : null}
            {label}
            <button type="button" onClick={() => onRemove(id)} disabled={disabled} aria-label={`Remove ${label}`}><X size={13} aria-hidden="true" /></button>
          </span>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, disabled, label, id }: { checked: boolean; onChange: (value: boolean) => void; disabled: boolean; label: string; id?: string }) {
  return <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} className={styles.switch} disabled={disabled} onClick={() => onChange(!checked)} />;
}

export function FieldControl({ field, value, onChange, disabled, id }: ControlProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  switch (field.type) {
    case 'toggle':
      return <Switch id={id} checked={value === true} onChange={onChange} disabled={disabled} label={field.label} />;

    case 'text':
    case 'url':
      return (
        <input id={id} className={styles.input} type={field.type === 'url' ? 'url' : 'text'} inputMode={field.type === 'url' ? 'url' : undefined}
          value={asString(value)} maxLength={field.max} placeholder={field.placeholder} disabled={disabled}
          onChange={event => onChange(event.target.value)} autoComplete="off" spellCheck={field.type === 'text'} />
      );

    case 'textarea': {
      const text = asString(value);
      const insert = (token: string) => {
        const element = textRef.current;
        const start = element?.selectionStart ?? text.length;
        const end = element?.selectionEnd ?? text.length;
        const next = (text.slice(0, start) + token + text.slice(end)).slice(0, field.max);
        onChange(next);
        requestAnimationFrame(() => { element?.focus(); element?.setSelectionRange(start + token.length, start + token.length); });
      };
      return (
        <>
          <textarea id={id} ref={textRef} className={styles.textarea} rows={field.rows || 3} value={text} maxLength={field.max}
            placeholder={field.placeholder} disabled={disabled} onChange={event => onChange(event.target.value)} />
          <div className={styles.fieldMeta}>
            {field.variables?.length ? (
              <div className={styles.variables} aria-label="Insert a placeholder">
                {field.variables.map(token => <button key={token} type="button" className={styles.variable} disabled={disabled} onClick={() => insert(token)}>{token}</button>)}
              </div>
            ) : <span />}
            <span aria-live="polite">{text.length}/{field.max}</span>
          </div>
        </>
      );
    }

    case 'number': {
      const scale = field.scale ?? 1;
      const shown = typeof value === 'number' ? Math.round(value / scale) : '';
      return (
        <div className={styles.inputGroup}>
          <input id={id} className={styles.input} type="number" inputMode="numeric" min={field.min} max={field.max} step={field.step ?? 1}
            value={shown} disabled={disabled}
            onChange={event => {
              const raw = event.target.value;
              if (raw === '') return onChange(field.min * scale);
              const number = Math.round(Number(raw));
              if (Number.isFinite(number)) onChange(Math.min(field.max, Math.max(field.min, number)) * scale);
            }} />
          {field.unit ? <span className={styles.inputUnit}>{field.unit}</span> : null}
        </div>
      );
    }

    case 'select':
      return (
        <select id={id} className={styles.select} value={asString(value) || field.options[0]?.value} disabled={disabled} onChange={event => onChange(event.target.value)}>
          {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );

    case 'channel':
      return (
        <select id={id} className={styles.select} value={asString(value)} disabled={disabled} onChange={event => onChange(event.target.value || null)}>
          <option value="">Not set</option>
          <ChannelOptions kinds={field.kinds} />
        </select>
      );

    case 'role':
      return (
        <select id={id} className={styles.select} value={asString(value)} disabled={disabled} onChange={event => onChange(event.target.value || null)}>
          <option value="">Not set</option>
          <RoleOptions current={asString(value)} />
        </select>
      );

    case 'channels':
    case 'roles': {
      const ids = asArray(value).filter((entry): entry is string => typeof entry === 'string');
      const kind = field.type === 'channels' ? 'channel' : 'role';
      const full = ids.length >= field.max;
      return (
        <>
          <ChipList ids={ids} kind={kind} disabled={disabled} onRemove={remove => onChange(ids.filter(entry => entry !== remove))} />
          <select id={id} className={styles.select} value="" disabled={disabled || full} aria-label={`Add to ${field.label}`}
            onChange={event => { if (event.target.value) onChange([...ids, event.target.value]); }}>
            <option value="">{full ? `Maximum of ${field.max} reached` : field.type === 'channels' ? 'Add a channel…' : 'Add a role…'}</option>
            {field.type === 'channels' ? <ChannelOptions kinds={field.kinds} exclude={ids} /> : <RoleOptions exclude={ids} />}
          </select>
        </>
      );
    }

    case 'color': {
      const color = /^#[0-9a-f]{6}$/i.test(asString(value)) ? asString(value) : '#ffffff';
      return (
        <div className={styles.colorRow}>
          <span className={styles.colorSwatch} style={{ background: color }}>
            <input type="color" value={color} disabled={disabled} aria-label={`${field.label} picker`} onChange={event => onChange(event.target.value.toUpperCase())} />
          </span>
          <input id={id} className={styles.input} value={asString(value)} maxLength={7} placeholder="#FFFFFF" disabled={disabled} spellCheck={false}
            onChange={event => onChange(event.target.value.trim().toUpperCase())} />
        </div>
      );
    }

    case 'flags':
      return <FlagsControl field={field} value={value} onChange={onChange} disabled={disabled} />;

    case 'levelRoles':
      return <LevelRolesControl field={field} value={value} onChange={onChange} disabled={disabled} />;

    case 'list': {
      const items = asArray(value).map(entry => (typeof entry === 'string' ? entry : ''));
      return (
        <div className={styles.stack} style={{ gap: 8 }}>
          {items.map((item, index) => (
            <div key={index} className={styles.listRow}>
              <input className={styles.input} value={item} maxLength={field.itemMax} disabled={disabled} aria-label={`${field.itemLabel} ${index + 1}`}
                onChange={event => onChange(items.map((entry, position) => (position === index ? event.target.value : entry)))} />
              <button type="button" className={styles.iconButton} disabled={disabled || items.length <= (field.min ?? 0)} aria-label={`Remove ${field.itemLabel.toLowerCase()} ${index + 1}`}
                onClick={() => onChange(items.filter((_, position) => position !== index))}><Trash2 size={15} aria-hidden="true" /></button>
            </div>
          ))}
          {items.length < field.max ? (
            <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} disabled={disabled} onClick={() => onChange([...items, ''])} style={{ justifySelf: 'start' }}>
              <Plus size={15} aria-hidden="true" /> Add {field.itemLabel.toLowerCase()}
            </button>
          ) : null}
        </div>
      );
    }
  }
}

function FlagsControl({ field, value, onChange, disabled }: ControlProps & { field: Extract<Field, { type: 'flags' }> }) {
  const record = asRecord(value);
  const isOn = (key: string) => (field.inverted ? record[key] !== true : record[key] === true);
  const set = (key: string, on: boolean) => {
    const next = { ...record };
    if (field.inverted) { if (on) delete next[key]; else next[key] = true; } else next[key] = on;
    onChange(next);
  };
  const setAll = (on: boolean) => {
    const next: Record<string, boolean> = {};
    if (!field.inverted) for (const option of field.options) next[option.value] = on;
    else if (!on) for (const option of field.options) next[option.value] = true;
    onChange(next);
  };
  return (
    <>
      <div className={styles.flagTools}>
        <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} disabled={disabled} onClick={() => setAll(true)}>Enable all</button>
        <button type="button" className={`${styles.buttonGhost} ${styles.buttonSmall}`} disabled={disabled} onClick={() => setAll(false)}>Disable all</button>
      </div>
      <div className={styles.flagGrid}>
        {field.options.map(option => (
          <label key={option.value} className={styles.flag}>
            <span>{option.label}</span>
            <Switch checked={isOn(option.value)} onChange={on => set(option.value, on)} disabled={disabled} label={option.label} />
          </label>
        ))}
      </div>
    </>
  );
}

function LevelRolesControl({ field, value, onChange, disabled }: ControlProps & { field: Extract<Field, { type: 'levelRoles' }> }) {
  const record = asRecord(value);
  const rows = useMemo(() => Object.entries(record).map(([level, role]) => ({ level: Number(level), role: asString(role) })).sort((a, b) => a.level - b.level), [record]);
  const write = (next: { level: number; role: string }[]) => {
    const out: Record<string, string> = {};
    for (const row of next) if (row.level >= 1 && row.role) out[String(row.level)] = row.role;
    onChange(out);
  };
  const nextLevel = () => { let level = 5; while (record[String(level)] && level < field.maxLevel) level += 5; return Math.min(level, field.maxLevel); };
  return (
    <div className={styles.stack} style={{ gap: 8 }}>
      {rows.length === 0 ? <span className={styles.fieldHelp}>No role rewards yet.</span> : null}
      {rows.map((row, index) => (
        <div key={`${row.level}-${index}`} className={styles.rewardRow}>
          <div className={styles.inputGroup}>
            <span className={styles.inputUnit} style={{ borderLeft: '1px solid var(--b-line-2)', borderRadius: '10px 0 0 10px', borderRight: 0 }}>Lvl</span>
            <input className={styles.input} style={{ borderRadius: '0 10px 10px 0' }} type="number" inputMode="numeric" min={1} max={field.maxLevel} value={row.level} disabled={disabled}
              aria-label="Level" onChange={event => write(rows.map((entry, position) => (position === index ? { ...entry, level: Math.min(field.maxLevel, Math.max(1, Math.round(Number(event.target.value) || 1))) } : entry)))} />
          </div>
          <select className={styles.select} value={row.role} disabled={disabled} aria-label="Reward role"
            onChange={event => write(rows.map((entry, position) => (position === index ? { ...entry, role: event.target.value } : entry)))}>
            <option value="">Choose a role</option>
            <RoleOptions current={row.role} />
          </select>
          <button type="button" className={styles.iconButton} disabled={disabled} aria-label={`Remove level ${row.level} reward`} onClick={() => write(rows.filter((_, position) => position !== index))}>
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
      {rows.length < field.max ? <AddRewardButton disabled={disabled} onAdd={role => write([...rows, { level: nextLevel(), role }])} /> : null}
    </div>
  );
}

function AddRewardButton({ disabled, onAdd }: { disabled: boolean; onAdd: (role: string) => void }) {
  return (
    <select className={styles.select} value="" disabled={disabled} aria-label="Add a role reward" onChange={event => { if (event.target.value) onAdd(event.target.value); }}>
      <option value="">Add a reward role…</option>
      <RoleOptions />
    </select>
  );
}

/** Label, help text and the control, laid out per field type. */
export function FieldShell({ field, dirty, error, id, children }: { field: Field; dirty: boolean; error?: string | null; id: string; children: React.ReactNode }) {
  const inline = field.type === 'toggle';
  const Label = field.type === 'flags' || field.type === 'levelRoles' || field.type === 'list' ? 'div' : 'label';
  return (
    <div className={[styles.field, dirty ? styles.fieldDirty : ''].join(' ')}>
      {inline ? (
        <div className={styles.fieldRow}>
          <div>
            <label htmlFor={id} className={styles.fieldLabel}>{field.label}</label>
            {field.help ? <div className={styles.fieldHelp}>{field.help}</div> : null}
          </div>
          {children}
        </div>
      ) : (
        <>
          <div>
            <Label {...(Label === 'label' ? { htmlFor: id } : {})} className={styles.fieldLabel}>{field.label}</Label>
            {field.help ? <div className={styles.fieldHelp}>{field.help}</div> : null}
          </div>
          {children}
        </>
      )}
      {error ? <div className={styles.fieldError} role="alert">{error}</div> : null}
    </div>
  );
}
