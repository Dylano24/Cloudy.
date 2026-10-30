// The Bot dashboard's module catalog. Every field maps 1:1 to a value Cloudy
// stores today, and the bot's Dashboard API (src/web/dashboardApi.js in the
// bot) applies it through the same services as Cloudy's Discord dashboards.
// "insight" modules show live data from Cloudy instead of settings.

export type ChannelKind = 'text' | 'voice' | 'category' | 'announcement' | 'forum';

type Base = { path: string; label: string; help?: string };
export type Field =
  | Base & { type: 'toggle' }
  | Base & { type: 'text'; max: number; min?: number; placeholder?: string }
  | Base & { type: 'textarea'; max: number; rows?: number; placeholder?: string; variables?: string[] }
  | Base & { type: 'number'; min: number; max: number; step?: number; unit?: string; scale?: number }
  | Base & { type: 'select'; options: { value: string; label: string; hint?: string }[] }
  | Base & { type: 'channel'; kinds: ChannelKind[] }
  | Base & { type: 'channels'; kinds: ChannelKind[]; max: number }
  | Base & { type: 'role' }
  | Base & { type: 'roles'; max: number }
  | Base & { type: 'color' }
  | Base & { type: 'url'; max: number; placeholder?: string }
  | Base & { type: 'flags'; options: { value: string; label: string }[]; inverted?: boolean }
  | Base & { type: 'levelRoles'; maxLevel: number; max: number }
  | Base & { type: 'list'; max: number; min?: number; itemMax: number; itemLabel: string };

export type Section = { title: string; description?: string; fields: Field[] };

export type ModuleGroup = 'server' | 'community' | 'safety' | 'support' | 'engagement' | 'automation';

export type ModuleDef = {
  id: string;
  title: string;
  group: ModuleGroup;
  icon: string;
  summary: string;
  kind: 'settings' | 'insight';
  storage: string;
  access: 'manage-server' | 'owner-role';
  note?: string;
  sections: Section[];
  actions?: { id: string; label: string; description: string }[];
};

export const GROUPS: { id: ModuleGroup; label: string }[] = [
  { id: 'server', label: 'Server' },
  { id: 'community', label: 'Community' },
  { id: 'safety', label: 'Moderation & safety' },
  { id: 'support', label: 'Support' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'automation', label: 'Automation' },
];

const TEXT_CHANNEL: ChannelKind[] = ['text', 'announcement'];

const LOG_EVENTS = [
  ['moderation.ban', 'Bans'], ['moderation.unban', 'Unbans'], ['moderation.kick', 'Kicks'],
  ['moderation.timeout', 'Timeouts'], ['moderation.untimeout', 'Timeout removals'], ['moderation.warn', 'Warnings'],
  ['moderation.purge', 'Purges'], ['moderation.lock', 'Channel locks'], ['moderation.unlock', 'Channel unlocks'],
  ['moderation.dm', 'Staff DMs'], ['moderation.config', 'Configuration changes'],
  ['message.delete', 'Deleted messages'], ['message.edit', 'Edited messages'], ['message.bulkdelete', 'Bulk deletes'],
  ['member.join', 'Members joining'], ['member.leave', 'Members leaving'], ['member.namechange', 'Name changes'],
  ['role.create', 'Roles created'], ['role.delete', 'Roles deleted'], ['role.update', 'Roles updated'],
  ['reactionrole.create', 'Reaction role panels created'], ['reactionrole.update', 'Reaction role panels updated'],
  ['reactionrole.delete', 'Reaction role panels deleted'], ['reactionrole.add', 'Reaction roles given'],
  ['reactionrole.remove', 'Reaction roles removed'],
  ['giveaway.create', 'Giveaways created'], ['giveaway.winner', 'Giveaway winners'], ['giveaway.reroll', 'Giveaway rerolls'],
  ['giveaway.delete', 'Giveaways deleted'], ['leveling.levelup', 'Level-ups'], ['leveling.milestone', 'Level milestones'],
  ['counter.update', 'Counter updates'], ['counter.config', 'Counter configuration'],
  ['application.submit', 'Applications submitted'], ['application.review', 'Applications reviewed'], ['report.file', 'Reports filed'],
].map(([value, label]) => ({ value, label }));

const COMMAND_CATEGORIES = [
  ['birthday', 'Birthday'], ['community', 'Community'], ['core', 'Core'], ['economy', 'Economy'], ['fun', 'Fun'],
  ['giveaway', 'Giveaway'], ['jointocreate', 'Join to Create'], ['leveling', 'Leveling'], ['logging', 'Logging'],
  ['moderation', 'Moderation'], ['music', 'Music'], ['reaction_roles', 'Reaction roles'], ['search', 'Search'],
  ['serverstats', 'Server stats'], ['ticket', 'Tickets'], ['tools', 'Tools'], ['utility', 'Utility'],
  ['verification', 'Verification'], ['welcome', 'Welcome'],
].map(([value, label]) => ({ value, label }));

export const MODULES: ModuleDef[] = [
  {
    id: 'general', title: 'General', group: 'server', icon: 'settings', kind: 'settings', access: 'manage-server',
    summary: 'Prefix and the moderator role, like /configwizard.', storage: 'guild:{id}:config',
    sections: [{
      title: 'Bot basics',
      fields: [
        { path: 'prefix', type: 'text', label: 'Server prefix', max: 10, min: 1, placeholder: '!', help: 'Used for prefix commands. Slash commands are unaffected.' },
        { path: 'modRole', type: 'role', label: 'Moderator role', help: 'Members with this role may use moderation commands.' },
      ],
    }],
  },
  {
    id: 'commands', title: 'Commands', group: 'server', icon: 'terminal', kind: 'settings', access: 'manage-server',
    summary: 'Turn whole command categories on or off for this server.', storage: 'guild:{id}:config → disabledCategories',
    note: '/commands and /configwizard always stay available so an administrator can never lock themselves out.',
    sections: [{
      title: 'Command categories',
      description: 'A disabled category hides every command in it for members of this server.',
      fields: [{ path: 'disabledCategories', type: 'flags', label: 'Enabled categories', options: COMMAND_CATEGORIES, inverted: true }],
    }],
  },
  {
    id: 'logging', title: 'Logs', group: 'server', icon: 'scroll', kind: 'settings', access: 'manage-server',
    summary: 'Audit, application and report log channels and which events are logged.', storage: 'guild:{id}:config → logging',
    note: 'The Staff, Member, AutoMod and Embed logs of the Cloudy Inc. server use fixed channels and styling and are not changed here.',
    sections: [
      {
        title: 'Log channels',
        fields: [
          { path: 'logging.enabled', type: 'toggle', label: 'Logging enabled' },
          { path: 'logging.channels.audit', type: 'channel', kinds: TEXT_CHANNEL, label: 'Audit log channel' },
          { path: 'logging.channels.applications', type: 'channel', kinds: TEXT_CHANNEL, label: 'Applications log channel' },
          { path: 'logging.channels.reports', type: 'channel', kinds: TEXT_CHANNEL, label: 'Reports channel', help: 'Where /report sends member reports.' },
        ],
      },
      { title: 'Logged events', fields: [{ path: 'logging.enabledEvents', type: 'flags', label: 'Events', options: LOG_EVENTS }] },
      { title: 'Ignored', fields: [{ path: 'logging.ignore.channels', type: 'channels', kinds: TEXT_CHANNEL, max: 25, label: 'Ignored channels' }] },
    ],
  },
  {
    id: 'welcome', title: 'Welcome & goodbye', group: 'community', icon: 'hand', kind: 'settings', access: 'manage-server',
    summary: 'Where Cloudy welcomes new members, and the goodbye message when someone leaves.', storage: 'guild:{id}:welcome',
    sections: [
      {
        title: 'Welcome message',
        description: 'Cloudy posts its Cloudy Inc. welcome card (rules, account link, store and support).',
        fields: [
          { path: 'enabled', type: 'toggle', label: 'Send welcome messages' },
          { path: 'channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Welcome channel' },
          { path: 'welcomePing', type: 'toggle', label: 'Mention the new member', help: 'Adds a mention above the welcome card.' },
        ],
      },
      {
        title: 'Goodbye message',
        fields: [
          { path: 'goodbyeEnabled', type: 'toggle', label: 'Send goodbye messages' },
          { path: 'goodbyeChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Goodbye channel' },
          { path: 'goodbyePing', type: 'toggle', label: 'Mention the member' },
          { path: 'leaveMessage', type: 'textarea', max: 2000, rows: 2, label: 'Goodbye message', variables: ['{user}', '{user.tag}', '{server}'] },
          { path: 'leaveEmbed.image', type: 'url', max: 500, label: 'Goodbye image URL', placeholder: 'https://' },
        ],
      },
    ],
  },
  {
    id: 'autoroles', title: 'Auto role', group: 'community', icon: 'user-plus', kind: 'settings', access: 'manage-server',
    summary: 'The role every new member receives automatically.', storage: 'guild:{id}:welcome → roleIds',
    sections: [{ title: 'Role on join', fields: [{ path: 'roleIds', type: 'roles', max: 1, label: 'Auto role', help: 'Cloudy\'s own role must be above this role in Discord.' }] }],
  },
  {
    id: 'verification', title: 'Verification', group: 'community', icon: 'badge-check', kind: 'settings', access: 'manage-server',
    summary: 'A verify button that unlocks the server, with optional automatic verification.', storage: 'guild:{id}:config → verification',
    note: 'Saving a new panel text or button label updates the posted panel. A new channel moves the panel there.',
    actions: [{ id: 'repost-panel', label: 'Post panel again', description: 'Cloudy posts the verification panel again in the panel channel.' }],
    sections: [
      {
        title: 'Verification panel',
        fields: [
          { path: 'verification.enabled', type: 'toggle', label: 'Verification enabled' },
          { path: 'verification.channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Panel channel' },
          { path: 'verification.roleId', type: 'role', label: 'Verified role' },
          { path: 'verification.message', type: 'textarea', max: 2000, rows: 3, label: 'Panel message' },
          { path: 'verification.buttonText', type: 'text', max: 80, min: 1, label: 'Button label', placeholder: 'Verify' },
        ],
      },
      {
        title: 'Automatic verification',
        fields: [
          { path: 'verification.autoVerify.enabled', type: 'toggle', label: 'Verify automatically' },
          {
            path: 'verification.autoVerify.criteria', type: 'select', label: 'Rule',
            options: [{ value: 'none', label: 'Everyone' }, { value: 'account_age', label: 'Account older than…' }, { value: 'server_size', label: 'Only while the server is small' }],
          },
          { path: 'verification.autoVerify.accountAgeDays', type: 'number', min: 1, max: 365, unit: 'days', label: 'Minimum account age' },
        ],
      },
    ],
  },
  {
    id: 'birthdays', title: 'Birthdays', group: 'community', icon: 'cake', kind: 'settings', access: 'manage-server',
    summary: 'Where Cloudy celebrates member birthdays.', storage: 'guild:{id}:config → birthdayChannelId',
    sections: [{ title: 'Announcements', fields: [{ path: 'birthdayChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Birthday channel' }] }],
  },
  {
    id: 'applications', title: 'Applications', group: 'community', icon: 'clipboard', kind: 'settings', access: 'manage-server',
    summary: 'Staff applications: questions, reviewers and how long they are kept.', storage: 'guild:{id}:applications:settings',
    sections: [
      {
        title: 'Applications',
        fields: [
          { path: 'enabled', type: 'toggle', label: 'Applications open' },
          { path: 'logChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Review channel' },
          { path: 'managerRoles', type: 'roles', max: 10, label: 'Reviewer roles' },
        ],
      },
      { title: 'Questions', fields: [{ path: 'questions', type: 'list', min: 1, max: 5, itemMax: 100, itemLabel: 'Question', label: 'Questions' }] },
      {
        title: 'Retention',
        fields: [
          { path: 'pendingApplicationRetentionDays', type: 'number', min: 1, max: 3650, unit: 'days', label: 'Keep pending applications' },
          { path: 'reviewedApplicationRetentionDays', type: 'number', min: 1, max: 3650, unit: 'days', label: 'Keep reviewed applications' },
        ],
      },
    ],
  },
  {
    id: 'moderation', title: 'Moderation', group: 'safety', icon: 'gavel', kind: 'insight', access: 'manage-server',
    summary: 'Recent warnings and who gave them.', storage: 'guild:{id}:warnings:*', sections: [],
  },
  {
    id: 'automod', title: 'AutoMod & security', group: 'safety', icon: 'shield', kind: 'insight', access: 'manage-server',
    summary: 'The spam, link, raid and NSFW protection Cloudy runs.', storage: 'automodProtectionService · linkProtectionService', sections: [],
  },
  {
    id: 'tickets', title: 'Tickets', group: 'support', icon: 'ticket', kind: 'settings', access: 'manage-server',
    summary: 'The ticket panel, categories, staff role and transcripts.', storage: 'guild:{id}:config → ticket*',
    note: 'Saving the panel text or button label updates the posted panel. A new panel channel moves the panel there, like in the Discord ticket dashboard.',
    actions: [{ id: 'repost-panel', label: 'Post panel again', description: 'Cloudy posts the ticket panel again in the panel channel.' }],
    sections: [
      {
        title: 'Ticket system',
        fields: [
          { path: 'ticketStaffRoleId', type: 'role', label: 'Support staff role' },
          { path: 'maxTicketsPerUser', type: 'number', min: 1, max: 10, label: 'Open tickets per member' },
        ],
      },
      {
        title: 'Panel',
        fields: [
          { path: 'ticketPanelChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Panel channel' },
          { path: 'ticketPanelMessage', type: 'textarea', max: 4000, rows: 4, label: 'Panel text', help: 'Empty: Cloudy\'s standard support text.' },
          { path: 'ticketButtonLabel', type: 'text', max: 80, label: 'Button label', placeholder: 'Start Chat' },
        ],
      },
      {
        title: 'Channels & logs',
        fields: [
          { path: 'ticketCategoryId', type: 'channel', kinds: ['category'], label: 'Open tickets category' },
          { path: 'ticketClosedCategoryId', type: 'channel', kinds: ['category'], label: 'Closed tickets category' },
          { path: 'ticketLogsChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Ticket log channel' },
          { path: 'ticketTranscriptChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Transcript channel' },
        ],
      },
    ],
  },
  {
    id: 'leveling', title: 'Leveling', group: 'engagement', icon: 'trending-up', kind: 'settings', access: 'manage-server',
    summary: 'XP for chatting, level-up announcements and role rewards.', storage: 'guild:{id}:config → leveling',
    sections: [
      {
        title: 'Experience',
        fields: [
          { path: 'enabled', type: 'toggle', label: 'Leveling enabled' },
          { path: 'xpRange.min', type: 'number', min: 1, max: 500, unit: 'XP', label: 'Minimum XP per message' },
          { path: 'xpRange.max', type: 'number', min: 1, max: 500, unit: 'XP', label: 'Maximum XP per message' },
          { path: 'xpCooldown', type: 'number', min: 0, max: 3600, unit: 'seconds', label: 'Cooldown between rewarded messages' },
        ],
      },
      {
        title: 'Announcements',
        fields: [
          { path: 'announceLevelUp', type: 'toggle', label: 'Announce level-ups' },
          { path: 'levelUpChannel', type: 'channel', kinds: TEXT_CHANNEL, label: 'Announcement channel', help: 'Empty: the server\'s system channel.' },
          { path: 'levelUpMessage', type: 'textarea', max: 500, rows: 2, label: 'Level-up message', variables: ['{user}', '{level}', '{xp}'] },
        ],
      },
      { title: 'Role rewards', fields: [{ path: 'roleRewards', type: 'levelRoles', maxLevel: 500, max: 25, label: 'Rewards' }] },
      {
        title: 'Exclusions',
        fields: [
          { path: 'ignoredChannels', type: 'channels', kinds: TEXT_CHANNEL, max: 25, label: 'Channels without XP' },
          { path: 'ignoredRoles', type: 'roles', max: 25, label: 'Roles without XP' },
        ],
      },
    ],
  },
  {
    id: 'giveaways', title: 'Giveaways', group: 'engagement', icon: 'gift', kind: 'insight', access: 'manage-server',
    summary: 'Running and ended giveaways with their entries and winners.', storage: 'guild:{id}:giveaways', sections: [],
  },
  {
    id: 'counting', title: 'Counting game', group: 'engagement', icon: 'hash', kind: 'settings', access: 'manage-server',
    summary: 'A counting channel with your choice of number system.', storage: 'countingGame:{guildId}',
    sections: [{
      title: 'Counting',
      fields: [
        { path: 'enabled', type: 'toggle', label: 'Counting game enabled' },
        { path: 'channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Counting channel' },
        {
          path: 'system', type: 'select', label: 'Number system',
          options: [
            { value: 'decimal', label: 'Decimal' }, { value: 'hexadecimal', label: 'Hexadecimal' },
            { value: 'binary', label: 'Binary' }, { value: 'base36', label: 'Base36' }, { value: 'base64', label: 'Base64' },
            { value: 'roman', label: 'Roman numerals' }, { value: 'math', label: 'Math expressions' }, { value: 'alphabet', label: 'Alphabet' },
          ],
        },
      ],
    }],
  },
  {
    id: 'economy', title: 'Economy', group: 'engagement', icon: 'coins', kind: 'insight', access: 'manage-server',
    summary: 'Currency, accounts and the richest members.', storage: 'guild:{id}:economy:*', sections: [],
  },
  {
    id: 'music', title: 'Music', group: 'engagement', icon: 'music', kind: 'insight', access: 'manage-server',
    summary: 'What Cloudy is playing right now and what is next.', storage: 'live player', sections: [],
  },
  {
    id: 'serverstats', title: 'Server stats', group: 'automation', icon: 'bar-chart', kind: 'insight', access: 'manage-server',
    summary: 'Counter channels that show your member and server numbers.', storage: 'guild:{id}:counters', sections: [],
  },
  {
    id: 'jointocreate', title: 'Join to Create', group: 'automation', icon: 'mic', kind: 'settings', access: 'manage-server',
    summary: 'Temporary voice channels created when members join a hub channel.', storage: 'guild:{id}:jointocreate',
    sections: [{
      title: 'Voice hubs',
      fields: [
        { path: 'enabled', type: 'toggle', label: 'Join to Create enabled' },
        { path: 'triggerChannels', type: 'channels', kinds: ['voice'], max: 10, label: 'Hub voice channels' },
        { path: 'categoryId', type: 'channel', kinds: ['category'], label: 'Category for new channels' },
        { path: 'channelNameTemplate', type: 'text', max: 100, min: 1, label: 'Channel name', placeholder: '{username}\'s Room', help: 'Use {username} for the member\'s name.' },
        { path: 'userLimit', type: 'number', min: 0, max: 99, label: 'User limit', help: '0 means no limit.' },
        { path: 'bitrate', type: 'number', min: 8, max: 384, unit: 'kbps', scale: 1000, label: 'Audio bitrate' },
      ],
    }],
  },
  {
    id: 'feeds', title: 'Cloudy Feed', group: 'automation', icon: 'rss', kind: 'insight', access: 'owner-role',
    summary: 'Automatic picture and video posts from websites.', storage: 'guild:{id}:cloudy:feeds', sections: [],
  },
  {
    id: 'reactionroles', title: 'Reaction roles', group: 'automation', icon: 'smile', kind: 'insight', access: 'manage-server',
    summary: 'Self-assignable role panels and their roles.', storage: 'guild:{id}:reaction_roles:*', sections: [],
  },
  {
    id: 'embeds', title: 'Embeds', group: 'automation', icon: 'layout', kind: 'insight', access: 'manage-server',
    summary: 'Embeds Cloudy and the Embed Builder have posted.', storage: 'embed registry', sections: [],
  },
];

export const MODULE_IDS = MODULES.map(module => module.id);

export function getModule(id: string) {
  return MODULES.find(module => module.id === id) || null;
}

export function allFields(module: ModuleDef) {
  return module.sections.flatMap(section => section.fields);
}
