import { z } from 'zod';
import { allFields, type Field, type ModuleDef } from './modules';

const snowflake = z.string().regex(/^\d{17,20}$/);
// Control characters other than newline and tab are never valid in Discord text.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const cleanText = (max: number, singleLine: boolean) => z.string().max(max).refine(
  value => !CONTROL.test(value) && (!singleLine || !/[\r\n]/.test(value)),
  { message: 'Contains characters Discord does not allow' },
);
const httpsUrl = (max: number) => z.union([
  z.literal(''),
  z.string().max(max).refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    } catch { return false; }
  }, { message: 'Use a full https:// link' }),
]);

export function schemaForField(field: Field): z.ZodType {
  switch (field.type) {
    case 'toggle': return z.boolean();
    case 'text': return cleanText(field.max, true).refine(value => value.length >= (field.min ?? 0), { message: `Use at least ${field.min ?? 0} characters` });
    case 'textarea': return cleanText(field.max, false);
    case 'url': return httpsUrl(field.max);
    case 'number': {
      const scale = field.scale ?? 1;
      return z.number().int().min(field.min * scale).max(field.max * scale);
    }
    case 'select': return z.enum(field.options.map(option => option.value) as [string, ...string[]]);
    case 'channel':
    case 'role': return snowflake.nullable();
    case 'channels':
    case 'roles': return z.array(snowflake).max(field.max).refine(list => new Set(list).size === list.length, { message: 'Duplicate entries' });
    case 'color': return z.string().regex(/^#[0-9a-fA-F]{6}$/);
    case 'flags': {
      const allowed = new Set(field.options.map(option => option.value));
      return z.record(z.string(), z.boolean()).refine(value => Object.keys(value).every(key => allowed.has(key)), { message: 'Unknown option' });
    }
    case 'levelRoles':
      return z.record(z.string().regex(/^\d{1,3}$/), snowflake).refine(value => {
        const levels = Object.keys(value);
        return levels.length <= field.max && levels.every(level => Number(level) >= 1 && Number(level) <= field.maxLevel);
      }, { message: `Use up to ${field.max} rewards for levels 1 to ${field.maxLevel}` });
    case 'list':
      return z.array(cleanText(field.itemMax, true).refine(value => value.trim().length > 0, { message: 'Empty entry' }))
        .min(field.min ?? 0).max(field.max);
  }
}

export type ValidationResult =
  | { ok: true; changes: Record<string, unknown> }
  | { ok: false; error: string; path?: string };

const MAX_CHANGES = 80;

/** Validates a partial update: only known paths of this module, each with a valid value. */
export function validateModuleChanges(module: ModuleDef, input: unknown): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Invalid request' };
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0) return { ok: false, error: 'Nothing to save' };
  if (entries.length > MAX_CHANGES) return { ok: false, error: 'Too many changes at once' };
  const fields = new Map(allFields(module).map(field => [field.path, field]));
  const changes: Record<string, unknown> = {};
  for (const [path, value] of entries) {
    const field = fields.get(path);
    if (!field) return { ok: false, error: 'Unknown setting', path };
    const parsed = schemaForField(field).safeParse(value);
    if (!parsed.success) return { ok: false, error: `${field.label}: ${parsed.error.issues[0]?.message || 'invalid value'}`, path };
    changes[path] = parsed.data;
  }
  // Cross-field rule mirrored from the bot's own dashboard.
  if (module.id === 'leveling') {
    const min = changes['xpRange.min'];
    const max = changes['xpRange.max'];
    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      return { ok: false, error: 'Minimum XP cannot be greater than maximum XP', path: 'xpRange.min' };
    }
  }
  return { ok: true, changes };
}
