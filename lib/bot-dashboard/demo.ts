import type { BotChannel, BotRole } from './bot-api';

// Sample data for the clearly labelled demo at /bot/demo. It never leaves the
// browser and is never sent to Discord or Cloudy.
export const DEMO_GUILD = { id: 'demo', name: 'Cloudy Demo Server', memberCount: 1284, iconUrl: null };

const id = (n: number) => String(BigInt('100000000000000000') + BigInt(n));

export const DEMO_CHANNELS: BotChannel[] = [
  { id: id(1), name: 'Information', type: 'category', parentId: null, position: 0 },
  { id: id(2), name: 'welcome', type: 'text', parentId: id(1), position: 1 },
  { id: id(3), name: 'rules', type: 'text', parentId: id(1), position: 2 },
  { id: id(4), name: 'announcements', type: 'announcement', parentId: id(1), position: 3 },
  { id: id(5), name: 'verify', type: 'text', parentId: id(1), position: 4 },
  { id: id(10), name: 'Community', type: 'category', parentId: null, position: 5 },
  { id: id(11), name: 'general', type: 'text', parentId: id(10), position: 6 },
  { id: id(12), name: 'level-ups', type: 'text', parentId: id(10), position: 7 },
  { id: id(13), name: 'counting', type: 'text', parentId: id(10), position: 8 },
  { id: id(14), name: 'birthdays', type: 'text', parentId: id(10), position: 9 },
  { id: id(15), name: 'media', type: 'text', parentId: id(10), position: 10 },
  { id: id(20), name: 'Support', type: 'category', parentId: null, position: 11 },
  { id: id(21), name: 'create-ticket', type: 'text', parentId: id(20), position: 12 },
  { id: id(22), name: 'faq', type: 'text', parentId: id(20), position: 13 },
  { id: id(23), name: 'Tickets', type: 'category', parentId: null, position: 14 },
  { id: id(24), name: 'Closed tickets', type: 'category', parentId: null, position: 15 },
  { id: id(30), name: 'Staff', type: 'category', parentId: null, position: 16 },
  { id: id(31), name: 'audit-log', type: 'text', parentId: id(30), position: 17 },
  { id: id(32), name: 'ticket-logs', type: 'text', parentId: id(30), position: 18 },
  { id: id(33), name: 'transcripts', type: 'text', parentId: id(30), position: 19 },
  { id: id(34), name: 'reports', type: 'text', parentId: id(30), position: 20 },
  { id: id(35), name: 'applications', type: 'text', parentId: id(30), position: 21 },
  { id: id(40), name: 'Voice', type: 'category', parentId: null, position: 22 },
  { id: id(41), name: '➕ Join to Create', type: 'voice', parentId: id(40), position: 23 },
  { id: id(42), name: 'Lounge', type: 'voice', parentId: id(40), position: 24 },
  { id: id(43), name: 'Rooms', type: 'category', parentId: null, position: 25 },
];

export const DEMO_ROLES: BotRole[] = [
  { id: id(100), name: 'Owner', color: 0xe51b2e, position: 9, managed: false, assignable: false },
  { id: id(101), name: 'Administrator', color: 0xff5c6f, position: 8, managed: false, assignable: false },
  { id: id(102), name: 'Moderator', color: 0x00c49d, position: 7, managed: false, assignable: true },
  { id: id(103), name: 'Support', color: 0x5aa9ff, position: 6, managed: false, assignable: true },
  { id: id(109), name: 'Cloudy', color: 0xffffff, position: 5, managed: true, assignable: false },
  { id: id(104), name: 'VIP', color: 0xfcffa1, position: 4, managed: false, assignable: true },
  { id: id(105), name: 'Level 10', color: 0xc9a7ff, position: 3, managed: false, assignable: true },
  { id: id(106), name: 'Level 25', color: 0xff9ad5, position: 3, managed: false, assignable: true },
  { id: id(107), name: 'Verified', color: 0xb5bac1, position: 2, managed: false, assignable: true },
  { id: id(108), name: 'Member', color: 0x99aab5, position: 1, managed: false, assignable: true },
];

export const DEMO_VALUES: Record<string, Record<string, unknown>> = {
  general: { prefix: '!', modRole: id(102), adminRole: id(101), premiumRoleId: id(104) },
  commands: { disabledCategories: { search: true } },
  logging: {
    'logging.enabled': true,
    'logging.channels.audit': id(31),
    'logging.channels.applications': id(35),
    'logging.channels.reports': id(34),
    'logging.enabledEvents': { 'moderation.ban': true, 'moderation.kick': true, 'moderation.timeout': true, 'message.delete': true, 'message.edit': true, 'member.join': true, 'member.leave': true },
    'logging.ignore.channels': [id(13)],
  },
  welcome: {
    enabled: true, channelId: id(2), welcomePing: true,
    welcomeMessage: 'Welcome {user} to **{server}**! 🎉',
    goodbyeEnabled: true, goodbyeChannelId: id(2), goodbyePing: false,
    'leaveEmbed.title': '👋 Goodbye',
    leaveMessage: '{user.tag} has left the server.',
    'leaveEmbed.color': '#E51B2E',
    'leaveEmbed.footer': 'Goodbye from {server}!',
    'leaveEmbed.image': '',
  },
  autoroles: { roleIds: [id(108)] },
  verification: {
    'verification.enabled': true, 'verification.channelId': id(5), 'verification.roleId': id(107),
    'verification.message': 'Press **Verify** below to unlock the server.', 'verification.buttonText': 'Verify',
    'verification.autoVerify.enabled': false, 'verification.autoVerify.criteria': 'account_age', 'verification.autoVerify.accountAgeDays': 7,
  },
  leveling: {
    enabled: true, 'xpRange.min': 15, 'xpRange.max': 25, xpCooldown: 60,
    announceLevelUp: true, levelUpChannel: id(12), levelUpMessage: 'GG {user}, you reached **level {level}**!',
    roleRewards: { 10: id(105), 25: id(106) }, ignoredChannels: [id(13)], ignoredRoles: [],
  },
  birthdays: { birthdayChannelId: id(14) },
  applications: {
    enabled: true, logChannelId: id(35), managerRoles: [id(101)],
    questions: ['Why do you want to join the staff team?', 'How much time can you spend each week?', 'Tell us about a difficult situation you handled.'],
    pendingApplicationRetentionDays: 30, reviewedApplicationRetentionDays: 14,
  },
  tickets: {
    ticketSystemDisabled: false, ticketStaffRoleId: id(103), maxTicketsPerUser: 3,
    ticketPanelChannelId: id(21), ticketPanelTitle: 'Contact the support',
    ticketPanelMessage: '',
    ticketButtonLabel: 'Start Chat', ticketFaqChannelId: id(22),
    ticketCategoryId: id(23), ticketClosedCategoryId: id(24), ticketLogsChannelId: id(32), ticketTranscriptChannelId: id(33),
  },
  counting: { enabled: true, channelId: id(13), system: 'decimal' },
  jointocreate: { enabled: true, triggerChannels: [id(41)], categoryId: id(43), channelNameTemplate: "{username}'s Room", userLimit: 0, bitrate: 64000 },
  feeds: {
    feeds: [
      { id: 'demo-feed-1', name: 'Gaming clips', source: 'https://example.com/clips', channelId: id(15), minutes: 60, mediaType: 'video', adult: false, active: true },
    ],
  },
};
