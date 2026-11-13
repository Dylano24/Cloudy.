import type { BotChannel, BotRole, Insight, Plan } from './bot-api';
import type { Field, ModuleDef } from './modules';

// Sample data for the preview-only dashboard demo (/preview/bot). Nothing
// here is a real server, member or setting, and the demo never calls Cloudy.

export const DEMO_BASE = '/preview/bot';
export const DEMO_GUILD = { id: '100000000000000001', name: 'Demo server', iconUrl: null, memberCount: 1284 };

export const DEMO_CHANNELS: BotChannel[] = [
  { id: '200000000000000001', name: 'Information', type: 'category', parentId: null, position: 0 },
  { id: '200000000000000002', name: 'welcome', type: 'text', parentId: '200000000000000001', position: 1 },
  { id: '200000000000000003', name: 'rules', type: 'text', parentId: '200000000000000001', position: 2 },
  { id: '200000000000000004', name: 'announcements', type: 'announcement', parentId: '200000000000000001', position: 3 },
  { id: '200000000000000005', name: 'Community', type: 'category', parentId: null, position: 4 },
  { id: '200000000000000006', name: 'general', type: 'text', parentId: '200000000000000005', position: 5 },
  { id: '200000000000000007', name: 'counting', type: 'text', parentId: '200000000000000005', position: 6 },
  { id: '200000000000000008', name: 'Join to create', type: 'voice', parentId: '200000000000000005', position: 7 },
  { id: '200000000000000009', name: 'Staff', type: 'category', parentId: null, position: 8 },
  { id: '200000000000000010', name: 'logs', type: 'text', parentId: '200000000000000009', position: 9 },
  { id: '200000000000000011', name: 'reports', type: 'text', parentId: '200000000000000009', position: 10 },
  { id: '200000000000000012', name: 'applications', type: 'text', parentId: '200000000000000009', position: 11 },
  { id: '200000000000000013', name: 'Tickets', type: 'category', parentId: null, position: 12 },
];

export const DEMO_ROLES: BotRole[] = [
  { id: '300000000000000001', name: 'Owner', color: 0xe51b2e, position: 4, managed: false, assignable: true },
  { id: '300000000000000002', name: 'Staff', color: 0xffffff, position: 3, managed: false, assignable: true },
  { id: '300000000000000003', name: 'Moderator', color: 0x00c49d, position: 2, managed: false, assignable: true },
  { id: '300000000000000004', name: 'Member', color: 0x8d8d92, position: 1, managed: false, assignable: true },
];

/** Premium, so every control can be tried; saving stays in the browser. */
export function demoPlan(now = Date.now()): Plan {
  return { status: 'premium', canSave: true, until: new Date(now + 30 * 86_400_000).toISOString(), priceEur: 13 };
}

export const DEMO_USER = { name: 'Demo admin', username: 'demo', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' };

function channelFor(field: Extract<Field, { type: 'channel' }>) {
  const label = `${field.label} ${field.path}`.toLowerCase();
  const fits = DEMO_CHANNELS.filter(channel => field.kinds.includes(channel.type));
  const named = ['welcome', 'report', 'application', 'log', 'counting', 'announcement', 'rules', 'ticket'].find(word => label.includes(word));
  return (named && fits.find(channel => channel.name.toLowerCase().includes(named.replace(/s$/, '')))) || fits[0] || null;
}

/** A plausible value for each field, from the field's own definition. */
export function demoValue(field: Field): unknown {
  switch (field.type) {
    case 'toggle': return /enabled|on$/i.test(field.path);
    case 'text': return field.placeholder || (field.min ? 'Cloudy'.slice(0, field.max) : '');
    case 'textarea': return field.placeholder || (field.variables?.length ? `Welcome ${field.variables[0]}!` : '');
    case 'number': return field.min * (field.scale || 1);
    case 'select': return field.options[0]?.value ?? '';
    case 'channel': return channelFor(field)?.id ?? null;
    case 'role': return /staff|mod|admin/i.test(field.label) ? DEMO_ROLES[1].id : DEMO_ROLES[3].id;
    case 'channels':
    case 'roles':
    case 'list': return [];
    case 'color': return '#E51B2E';
    case 'url': return '';
    default: return undefined;
  }
}

export function demoValues(module: ModuleDef) {
  const values: Record<string, unknown> = {};
  for (const section of module.sections) for (const field of section.fields) values[field.path] = demoValue(field);
  return values;
}

export function demoInsight(module: ModuleDef): Insight {
  return {
    stats: [
      { label: 'This week', value: '24' },
      { label: 'This month', value: '97' },
      { label: 'All time', value: '1,402' },
    ],
    tables: [{
      title: `Recent ${module.title.toLowerCase()} activity`,
      columns: ['When', 'What', 'Who'],
      rows: [['Today, 14:02', 'Sample entry', 'Demo admin'], ['Yesterday, 21:40', 'Sample entry', 'Member'], ['12 Nov, 09:15', 'Sample entry', 'Moderator']],
      empty: 'Nothing yet.',
    }],
  };
}

/** The demo only exists on preview deployments and on a developer's machine. */
export function demoAllowed(env: Record<string, string | undefined> = process.env) {
  return env.VERCEL_ENV === 'preview' || (env.NODE_ENV === 'development' && env.VERCEL_ENV !== 'production') || env.CLOUDY_DASHBOARD_DEMO === '1' && env.VERCEL_ENV !== 'production';
}
