// The Bot dashboard's module catalog. Every field below maps 1:1 to a value
// Cloudy already stores (see docs/bot-dashboard/RESEARCH.md for the storage
// key and the bot service that owns it). The website never writes these
// values itself: saves go to Cloudy's Dashboard API, which applies them through
// the bot's own services so its caches, locks and validation stay in charge.

export type ChannelKind = 'text' | 'voice' | 'category' | 'announcement' | 'forum';

type Base = { path: string; label: string; help?: string };
export type Field =
  | Base & { type: 'toggle' }
  | Base & { type: 'text'; max: number; placeholder?: string }
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
  | Base & { type: 'list'; max: number; min?: number; itemMax: number; itemLabel: string }
  | Base & { type: 'collection'; max: number; itemLabel: string; fields: Field[] };

export type Section = { title: string; description?: string; fields: Field[] };

export type BotReadiness =
  // The bot already has a service that stores this per server; only the
  // Dashboard API endpoint is missing.
  | 'service-ready'
  // Values exist but are fixed in code or global; a bot change is needed first.
  | 'needs-bot-change'
  // Shown for transparency only.
  | 'read-only';

export type ModuleGroup = 'server' | 'community' | 'safety' | 'support' | 'engagement' | 'automation';

export type ModuleDef = {
  id: string;
  title: string;
  group: ModuleGroup;
  icon: string;
  summary: string;
  storage: string;
  service: string;
  readiness: BotReadiness;
  access: 'manage-server' | 'owner-role';
  note?: string;
  preview?: 'welcome' | 'goodbye' | 'ticket-panel' | 'verification' | 'level-up';
  sections: Section[];
  actions?: { id: string; label: string; description: string; danger?: boolean }[];
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
    id: 'general', title: 'General', group: 'server', icon: 'settings',
    summary: 'Prefix and the staff roles Cloudy trusts for moderation.',
    storage: 'guild:{id}:config', service: 'services/config/guildConfig.js · patchGuildConfig()',
    readiness: 'service-ready', access: 'manage-server',
    sections: [{
      title: 'Bot basics',
      fields: [
        { path: 'prefix', type: 'text', label: 'Text command prefix', max: 10, placeholder: '!', help: 'Used for prefix commands. Slash commands are unaffected.' },
        { path: 'modRole', type: 'role', label: 'Moderator role', help: 'Members with this role may use moderation commands.' },
        { path: 'adminRole', type: 'role', label: 'Administrator role' },
        { path: 'premiumRoleId', type: 'role', label: 'Premium role' },
      ],
    }],
  },
  {
    id: 'commands', title: 'Commands', group: 'server', icon: 'terminal',
    summary: 'Turn whole command categories on or off for this server.',
    storage: 'guild:{id}:config → disabledCategories / disabledCommands', service: 'services/commandAccessService.js',
    readiness: 'service-ready', access: 'manage-server',
    note: '/commands and /configwizard always stay available so an administrator can never lock themselves out.',
    sections: [{
      title: 'Command categories',
      description: 'A disabled category hides every command in it for members of this server.',
      fields: [{ path: 'disabledCategories', type: 'flags', label: 'Enabled categories', options: COMMAND_CATEGORIES, inverted: true }],
    }],
  },
  {
    id: 'logging', title: 'Logs', group: 'server', icon: 'scroll',
    summary: 'Audit, application and report log channels and which events are logged.',
    storage: 'guild:{id}:config → logging', service: 'services/loggingService.js',
    readiness: 'service-ready', access: 'manage-server',
    note: 'The Staff, Member, AutoMod and Embed logs of the Cloudy Inc. server use fixed channels and fixed styling. They are protected and not editable here.',
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
      {
        title: 'Ignored',
        fields: [
          { path: 'logging.ignore.channels', type: 'channels', kinds: TEXT_CHANNEL, max: 25, label: 'Ignored channels' },
        ],
      },
    ],
  },
  {
    id: 'welcome', title: 'Welcome & goodbye', group: 'community', icon: 'hand',
    summary: 'Where Cloudy welcomes new members, and the goodbye message it posts when someone leaves.',
    storage: 'guild:{id}:welcome', service: 'utils/database.js · updateWelcomeConfig()',
    readiness: 'service-ready', access: 'manage-server', preview: 'welcome',
    note: 'Cloudy posts its own Cloudy Inc. welcome card (rules, account link, store and support). Its layout changes only through an Embed Builder template saved for the welcome channel, never from here.',
    sections: [
      {
        title: 'Welcome message',
        fields: [
          { path: 'enabled', type: 'toggle', label: 'Send welcome messages' },
          { path: 'channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Welcome channel' },
          { path: 'welcomePing', type: 'toggle', label: 'Mention the new member', help: 'Adds a mention above the welcome card.' },
          { path: 'welcomeMessage', type: 'textarea', max: 2000, rows: 2, label: 'Plain-text fallback', help: 'Only used when Cloudy is not allowed to post embeds in the welcome channel.', variables: ['{user}', '{user.tag}', '{server}', '{memberCount}'] },
        ],
      },
      {
        title: 'Goodbye message',
        fields: [
          { path: 'goodbyeEnabled', type: 'toggle', label: 'Send goodbye messages' },
          { path: 'goodbyeChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Goodbye channel' },
          { path: 'goodbyePing', type: 'toggle', label: 'Mention the member' },
          { path: 'leaveEmbed.title', type: 'text', max: 256, label: 'Title', placeholder: '👋 Goodbye' },
          { path: 'leaveMessage', type: 'textarea', max: 2000, rows: 2, label: 'Message', variables: ['{user}', '{user.tag}', '{server}'] },
          { path: 'leaveEmbed.color', type: 'color', label: 'Side colour' },
          { path: 'leaveEmbed.footer', type: 'text', max: 2048, label: 'Footer', placeholder: 'Goodbye from {server}!' },
          { path: 'leaveEmbed.image', type: 'url', max: 500, label: 'Image URL', placeholder: 'https://' },
        ],
      },
    ],
  },
  {
    id: 'autoroles', title: 'Auto roles', group: 'community', icon: 'user-plus',
    summary: 'Roles every new member receives automatically.',
    storage: 'guild:{id}:welcome → roleIds', service: 'commands/Welcome/autorole.js',
    readiness: 'service-ready', access: 'manage-server',
    note: 'Cloudy currently gives new members the first auto role only. Giving several roles needs a small bot update.',
    sections: [{ title: 'Role on join', fields: [{ path: 'roleIds', type: 'roles', max: 1, label: 'Auto role', help: 'Cloudy\'s own role must be above this role in Discord.' }] }],
  },
  {
    id: 'verification', title: 'Verification', group: 'community', icon: 'badge-check',
    summary: 'A verify button that unlocks the server, with optional automatic verification.',
    storage: 'guild:{id}:config → verification', service: 'services/verificationService.js',
    readiness: 'service-ready', access: 'manage-server', preview: 'verification',
    actions: [{ id: 'repost-panel', label: 'Post panel again', description: 'Cloudy posts the verification panel again in the selected channel.' }],
    sections: [
      {
        title: 'Verification panel',
        fields: [
          { path: 'verification.enabled', type: 'toggle', label: 'Verification enabled' },
          { path: 'verification.channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Panel channel' },
          { path: 'verification.roleId', type: 'role', label: 'Verified role' },
          { path: 'verification.message', type: 'textarea', max: 2000, rows: 3, label: 'Panel message' },
          { path: 'verification.buttonText', type: 'text', max: 80, label: 'Button label', placeholder: 'Verify' },
        ],
      },
      {
        title: 'Automatic verification',
        fields: [
          { path: 'verification.autoVerify.enabled', type: 'toggle', label: 'Verify automatically' },
          {
            path: 'verification.autoVerify.criteria', type: 'select', label: 'Rule',
            options: [
              { value: 'none', label: 'Everyone' },
              { value: 'account_age', label: 'Account older than…' },
              { value: 'server_size', label: 'Only while the server is small' },
            ],
          },
          { path: 'verification.autoVerify.accountAgeDays', type: 'number', min: 1, max: 365, unit: 'days', label: 'Minimum account age' },
        ],
      },
    ],
  },
  {
    id: 'leveling', title: 'Leveling', group: 'engagement', icon: 'trending-up',
    summary: 'XP for chatting, level-up announcements and role rewards.',
    storage: 'guild:{id}:leveling:config', service: 'utils/database.js · saveLevelingConfig()',
    readiness: 'service-ready', access: 'manage-server', preview: 'level-up',
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
          { path: 'levelUpChannel', type: 'channel', kinds: TEXT_CHANNEL, label: 'Announcement channel', help: 'Empty: announce in the channel where the member chatted.' },
          { path: 'levelUpMessage', type: 'textarea', max: 500, rows: 2, label: 'Level-up message', variables: ['{user}', '{level}'] },
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
    id: 'birthdays', title: 'Birthdays', group: 'community', icon: 'cake',
    summary: 'Where Cloudy celebrates member birthdays.',
    storage: 'guild:{id}:config → birthdayChannelId', service: 'services/birthdayService.js',
    readiness: 'service-ready', access: 'manage-server',
    sections: [{ title: 'Announcements', fields: [{ path: 'birthdayChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Birthday channel' }] }],
  },
  {
    id: 'applications', title: 'Applications', group: 'community', icon: 'clipboard',
    summary: 'Staff applications: questions, reviewers and how long they are kept.',
    storage: 'guild:{id}:applications:settings', service: 'utils/database.js · saveApplicationSettings()',
    readiness: 'service-ready', access: 'manage-server',
    sections: [
      {
        title: 'Applications',
        fields: [
          { path: 'enabled', type: 'toggle', label: 'Applications open' },
          { path: 'logChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Review channel' },
          { path: 'managerRoles', type: 'roles', max: 10, label: 'Reviewer roles' },
        ],
      },
      {
        title: 'Questions',
        fields: [{ path: 'questions', type: 'list', min: 1, max: 5, itemMax: 100, itemLabel: 'Question', label: 'Questions' }],
      },
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
    id: 'moderation', title: 'Moderation', group: 'safety', icon: 'gavel',
    summary: 'Warnings, cases and the moderation commands Cloudy offers.',
    storage: 'guild:{id}:warnings:* · moderation cases', service: 'services/moderation/*',
    readiness: 'read-only', access: 'manage-server',
    note: 'Moderation actions (ban, kick, timeout, purge) stay Discord commands so they are always tied to a staff member in Discord. A read-only case history is planned for the Dashboard API.',
    sections: [],
  },
  {
    id: 'automod', title: 'AutoMod & security', group: 'safety', icon: 'shield',
    summary: 'Spam, link, raid and NSFW protection.',
    storage: 'constants in services/automodProtectionService.js and linkProtectionService.js', service: 'services/automodProtectionService.js',
    readiness: 'needs-bot-change', access: 'manage-server',
    note: 'Cloudy\'s protection thresholds are fixed in the bot code (for example 3 links in 15 seconds, timeouts of 1 to 6 hours). They need to be stored per server before the dashboard can change them.',
    sections: [],
  },
  {
    id: 'tickets', title: 'Tickets', group: 'support', icon: 'ticket',
    summary: 'The ticket panel, categories, staff role and transcripts.',
    storage: 'guild:{id}:config → ticket*', service: 'services/ticketDashboardService.js',
    readiness: 'service-ready', access: 'manage-server', preview: 'ticket-panel',
    actions: [{ id: 'republish-panel', label: 'Update panel in Discord', description: 'Cloudy edits the ticket panel message with the saved text. Nothing changes in Discord until you press this.' }],
    sections: [
      {
        title: 'Ticket system',
        fields: [
          { path: 'ticketSystemDisabled', type: 'toggle', label: 'Ticket system paused' },
          { path: 'ticketStaffRoleId', type: 'role', label: 'Support staff role' },
          { path: 'maxTicketsPerUser', type: 'number', min: 1, max: 10, label: 'Open tickets per member' },
        ],
      },
      {
        title: 'Panel',
        fields: [
          { path: 'ticketPanelChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Panel channel' },
          { path: 'ticketPanelTitle', type: 'text', max: 256, label: 'Panel title', placeholder: 'Contact the support' },
          { path: 'ticketPanelMessage', type: 'textarea', max: 4000, rows: 4, label: 'Panel text', help: 'Empty: Cloudy\'s standard support text.' },
          { path: 'ticketButtonLabel', type: 'text', max: 80, label: 'Button label', placeholder: 'Start Chat' },
          { path: 'ticketFaqChannelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'FAQ channel' },
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
    id: 'giveaways', title: 'Giveaways', group: 'engagement', icon: 'gift',
    summary: 'Running and ended giveaways with their entries and winners.',
    storage: 'giveaways table (data JSONB)', service: 'services/giveawayService.js',
    readiness: 'read-only', access: 'manage-server',
    note: 'Giveaways are created with the Giveaway Builder (/gcreate) so the post, timer and winner announcement keep their exact layout. The Dashboard API will list them; End and Reroll can be offered as explicit actions.',
    sections: [],
  },
  {
    id: 'counting', title: 'Counting game', group: 'engagement', icon: 'hash',
    summary: 'A counting channel with your choice of number system.',
    storage: 'countingGame:{guildId}', service: 'services/countingGameService.js',
    readiness: 'service-ready', access: 'manage-server',
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
    id: 'economy', title: 'Economy & games', group: 'engagement', icon: 'coins',
    summary: 'Balances, the shop and casino games.',
    storage: 'guild:{id}:economy:* · src/config/bot.js', service: 'utils/economy.js',
    readiness: 'needs-bot-change', access: 'manage-server',
    note: 'The currency name and symbol are currently written into the bot\'s configuration file, which is shared by every server and lost on redeploy. They must move to per-server storage first.',
    sections: [],
  },
  {
    id: 'music', title: 'Music', group: 'engagement', icon: 'music',
    summary: 'Playback through Lavalink, queue and 24/7 mode.',
    storage: 'in-memory player state', service: 'services/music/*',
    readiness: 'needs-bot-change', access: 'manage-server',
    note: 'Music has no stored per-server settings yet; 24/7 mode and volume live in the running player.',
    sections: [],
  },
  {
    id: 'jointocreate', title: 'Join to Create', group: 'automation', icon: 'mic',
    summary: 'Temporary voice channels created when members join a hub channel.',
    storage: 'guild:{id}:jointocreate', service: 'utils/database.js · updateJoinToCreateConfig()',
    readiness: 'service-ready', access: 'manage-server',
    sections: [{
      title: 'Voice hubs',
      fields: [
        { path: 'enabled', type: 'toggle', label: 'Join to Create enabled' },
        { path: 'triggerChannels', type: 'channels', kinds: ['voice'], max: 10, label: 'Hub voice channels' },
        { path: 'categoryId', type: 'channel', kinds: ['category'], label: 'Category for new channels' },
        { path: 'channelNameTemplate', type: 'text', max: 100, label: 'Channel name', placeholder: '{username}\'s Room', help: 'Use {username} for the member\'s name.' },
        { path: 'userLimit', type: 'number', min: 0, max: 99, label: 'User limit', help: '0 means no limit.' },
        { path: 'bitrate', type: 'number', min: 8, max: 384, unit: 'kbps', scale: 1000, label: 'Audio bitrate' },
      ],
    }],
  },
  {
    id: 'feeds', title: 'Cloudy Feed', group: 'automation', icon: 'rss',
    summary: 'Automatic picture and video posts from websites.',
    storage: 'guild:{id}:cloudy:feeds', service: 'services/cloudyFeedService.js',
    readiness: 'service-ready', access: 'owner-role',
    note: 'Like /auto, Cloudy Feed is limited to members with the Owner role. Videos are trimmed to a 10-second clip from the middle.',
    sections: [{
      title: 'Feeds',
      fields: [{
        path: 'feeds', type: 'collection', max: 5, itemLabel: 'Feed', label: 'Feeds',
        fields: [
          { path: 'name', type: 'text', max: 100, label: 'Feed name' },
          { path: 'source', type: 'url', max: 500, label: 'Website URL', placeholder: 'https://' },
          { path: 'channelId', type: 'channel', kinds: TEXT_CHANNEL, label: 'Channel' },
          { path: 'minutes', type: 'number', min: 1, max: 10080, unit: 'minutes', label: 'Post every' },
          {
            path: 'mediaType', type: 'select', label: 'Media type',
            options: [{ value: 'all', label: 'Pictures and videos' }, { value: 'picture', label: 'Pictures only' }, { value: 'video', label: 'Videos only' }],
          },
          { path: 'adult', type: 'toggle', label: '18+ content' },
          { path: 'active', type: 'toggle', label: 'Active' },
        ],
      }],
    }],
  },
  {
    id: 'reactionroles', title: 'Reaction roles', group: 'automation', icon: 'smile',
    summary: 'Self-assignable role panels.',
    storage: 'guild:{id}:reaction_roles:{messageId}', service: 'services/reactionRoleService.js',
    readiness: 'read-only', access: 'manage-server',
    note: 'Each panel is a posted Discord message. The Dashboard API will list panels; edits go through the bot so the posted message and its buttons stay in sync.',
    sections: [],
  },
  {
    id: 'embeds', title: 'Embeds', group: 'automation', icon: 'layout',
    summary: 'Embed Builder posts, saved templates and Reappear rules.',
    storage: 'embed registry (guild:{id}:embed-*)', service: 'services/embedRegistryService.js',
    readiness: 'read-only', access: 'manage-server',
    note: 'Existing embeds may only change through an explicit Embed Builder Save. The dashboard will show posted embeds read-only first; editing will reuse the Builder\'s own Save path, never a separate one.',
    sections: [],
  },
];

export const MODULE_IDS = MODULES.map(module => module.id);

export function getModule(id: string) {
  return MODULES.find(module => module.id === id) || null;
}

export function editableModules() {
  return MODULES.filter(module => module.sections.length > 0);
}

export function allFields(module: ModuleDef) {
  return module.sections.flatMap(section => section.fields);
}
