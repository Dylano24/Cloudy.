import { GROUPS, MODULES } from '@/lib/bot-dashboard/modules';

export type FeatureStatus = 'settings' | 'discord' | 'integration';
export type PublicFeature = {
  id: string;
  name: string;
  group: string;
  summary: string;
  icon: string;
  status: FeatureStatus;
  explanation: string;
  details?: { title: string; description?: string; fields: { label: string; type: string; help?: string }[] }[];
  categories?: string[];
};

// Product truth is the Cloudy dashboard's current module registry.
// This list is for discovery only; it does not invent Discord commands or APIs.
export const publicFeatures: PublicFeature[] = MODULES.map(module => ({
  id: module.id,
  name: module.title,
  group: module.group,
  icon: module.icon,
  summary: module.summary,
  status: module.kind === 'settings' ? 'settings' as const : 'discord' as const,
  explanation: module.note || (module.kind === 'settings'
    ? 'Configure the following controls after signing in and selecting the server you manage. Changes are applied only after a successful Save.'
    : 'This module provides a read-only overview of actual Cloudy data. Manage its actions through Discord.'),
  details: module.sections.map(section => ({
    title: section.title,
    description: section.description,
    fields: section.fields.map(field => ({ label: field.label, type: field.type, help: field.help })),
  })),
}));

// Areas identified in the publicly documented ecosystem that do not yet have
// their own Cloudy website modules. They are deliberately NOT advertised as live.
export const websiteIntegrationCandidates: PublicFeature[] = [
  { id: 'case-history', name: 'Moderation case history', group: 'safety', icon: 'gavel', summary: 'Case timelines, member records, staff notes and appeals in one website view.', status: 'integration', explanation: 'Dedicated case-management pages and verified backend endpoints still need to be connected.' },
  { id: 'advanced-raid', name: 'Advanced raid response', group: 'safety', icon: 'shield', summary: 'Configure anti-raid response, risk signals and trusted roles from the web.', status: 'integration', explanation: 'Cloudy has moderation protection; a separate full anti-raid website editor is not established.' },
  { id: 'invite-tracking', name: 'Invite tracking', group: 'community', icon: 'user-plus', summary: 'Member invite attribution, leaderboard and invite rewards.', status: 'integration', explanation: 'A public analytics and rewards view requires a verified Cloudy data source.' },
  { id: 'suggestions', name: 'Suggestions', group: 'community', icon: 'hand', summary: 'Community idea boards, votes, reviews and decisions.', status: 'integration', explanation: 'The complete suggestion-board workflow has not been wired into this website.' },
  { id: 'polls', name: 'Polls', group: 'community', icon: 'bar-chart', summary: 'Create community polls with controlled choices, voting and results.', status: 'integration', explanation: 'Publishing and counting votes requires a bot-backed endpoint.' },
  { id: 'starboards', name: 'Starboards', group: 'community', icon: 'smile', summary: 'Highlight popular Discord messages in a curated channel.', status: 'integration', explanation: 'The dashboard needs a confirmed message/reaction data source.' },
  { id: 'achievements', name: 'Achievements', group: 'engagement', icon: 'trending-up', summary: 'Community milestones, badges and rewards.', status: 'integration', explanation: 'No separate achievements configuration has been verified for Cloudy.' },
  { id: 'forms', name: 'Forms & appeals', group: 'support', icon: 'clipboard', summary: 'Build applications, appeals and feedback forms with a staff review queue.', status: 'integration', explanation: 'Cloudy already has applications and reports; a unified public form-builder workflow requires new integration.' },
  { id: 'voice-linking', name: 'Voice access linking', group: 'automation', icon: 'mic', summary: 'Grant and remove temporary channel or role access on voice joins.', status: 'integration', explanation: 'Not yet available as a dedicated website configuration page.' },
  { id: 'custom-commands', name: 'Custom slash commands', group: 'server', icon: 'terminal', summary: 'Create server-specific slash commands with structured actions.', status: 'integration', explanation: 'Real Discord command registration and permissions require bot-side support before publication.' },
  { id: 'scheduled-automation', name: 'Automation builder', group: 'automation', icon: 'settings', summary: 'Triggers, conditions and actions with a safe preview before activation.', status: 'integration', explanation: 'Cloudy Feed exists; a general-purpose trigger/action builder is a separate integration.' },
  { id: 'sticky-messages', name: 'Sticky messages', group: 'automation', icon: 'scroll', summary: 'Keep important messages visible with safe repost rules.', status: 'integration', explanation: 'A dashboard scheduler and the actual bot repost worker must be verified.' },
  { id: 'reminders', name: 'Reminders', group: 'automation', icon: 'cake', summary: 'Scheduled or repeating reminders with destination and time zone.', status: 'integration', explanation: 'A persistent scheduler and Discord delivery endpoint are needed.' },
  { id: 'tags', name: 'Tags', group: 'automation', icon: 'terminal', summary: 'Save and reuse frequently requested Discord replies.', status: 'integration', explanation: 'The website needs a verified tags registry and bot execution endpoint.' },
  { id: 'backups', name: 'Backups & templates', group: 'server', icon: 'settings', summary: 'Review backups, restore safely and inspect changes before applying them.', status: 'integration', explanation: 'Restore requires sensitive bot permissions, review and rollback safeguards.' },
  { id: 'analytics', name: 'Server analytics', group: 'server', icon: 'bar-chart', summary: 'Charts for growth, retention and activity from stored server events.', status: 'integration', explanation: 'Only real collected metrics may be displayed; this website does not invent history.' },
  { id: 'social-alerts', name: 'Social alerts', group: 'automation', icon: 'rss', summary: 'Subscriptions for external platforms with deduplicated Discord announcements.', status: 'integration', explanation: 'Cloudy Feed exists, but a general social-alerts provider panel requires verified integrations.' },
  { id: 'emoji-manager', name: 'Emoji manager', group: 'server', icon: 'smile', summary: 'Review and manage server emoji assets and access.', status: 'integration', explanation: 'The bot and website permissions for emoji administration are not yet implemented here.' },
  { id: 'team-roles', name: 'Advanced team roles', group: 'server', icon: 'user-plus', summary: 'Grant staff scoped access to individual dashboard modules.', status: 'integration', explanation: 'The present dashboard authorizes Owner, Administrator and Manage Server; custom scopes need server-side enforcement.' },
];

export const featureGroups = GROUPS.map(group => ({ id: group.id, name: group.label }));
export const fullPublicFeatureCatalog = [...publicFeatures, ...websiteIntegrationCandidates];
