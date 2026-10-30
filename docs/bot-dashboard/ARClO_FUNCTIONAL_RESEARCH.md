# Cloudy Bot — public competitor feature audit and implementation map

Research scope: public pages on https://arclo.gg/ and its documented feature, dashboard and command pages. Captured 31 October 2026. This document is a **functional reference**, not a request to reuse their code, text, logos, artwork, private data or infrastructure.

## Principle

Implement comparable *user capabilities* independently using Cloudy's own design system (black / charcoal / white / Cloudy red; existing typography and header), its real Discord application, its existing Railway bot and the current signed API. No fake settings, invented counts, public access to private guild information, or unverified checkout buttons.

## Public site inventory

* Landing: invitation, Discord OAuth/dashboard entry, live status, animated visual, interactive bot demonstrations, feature-to-detail links, testimonials, help and footer.
* Features index: organized categories and system detail pages with example interactions, settings previews, Discord behavior and command descriptions.
* Docs: multi-level navigation, feature documentation, command reference, search, installation and setup instructions, command permissions.
* Dashboard: per-server selection, one sidebar with collapsible grouped modules, status per module, access-dependent navigation, settings cards, master switches, tabs, live message previews, command controls, unsaved change bar, manual Save/Discard, item-level draft/publish/delete and change logs.
* Commands: documented slash commands, subcommands and context commands; per-server registration according to enabled systems; per-command role/channel/cooldown/output/ephemeral settings.
* Feature demos: moderation case flow; rules tester; support ticket open/claim/close; verification; role picker; leveling cards; giveaway enrollment/draw/reroll; security raid simulation; temporary voice workflows. Those are interactive demonstrations, not proof that Cloudy implements identical functions.

Sources:
- https://arclo.gg/
- https://arclo.gg/features
- https://arclo.gg/docs/getting-started/dashboard
- https://arclo.gg/docs/concepts/commands
- https://arclo.gg/docs/reference/commands
- https://arclo.gg/features/command-info

### Category map (public competitor information)

| Area | Publicly described systems | Cloudy website mapping |
| --- | --- | --- |
| Protection | Moderation, Auto Moderation, Security, Verify System | moderation, automod (insights); verification (settings); advanced cases/raid UI needs integration |
| Roles & onboarding | Welcome & Goodbye, Reaction Roles, Auto Roles, Information Channel, Invite Tracking | welcome, autoroles (settings); reactionroles (insight); info channel/invite tracking need audited integration |
| Community | Levels, Achievements, Giveaways, Starboards, Polls, Suggestions, Birthdays, Boost Messages | leveling, birthdays (settings); giveaways (insight); Cloudy bot has a /poll command; other web workflows need verification/integration |
| Support & voice | Ticketing, Forms, Temporary Voice, Voice Linking | tickets, applications, jointocreate (settings); remaining browser builders need integration |
| Automation & utilities | Automations, Custom Commands, Embed Messages, Sticky Messages, Tags, Reminders, Statistics Channels, Emojis, Backups & Templates | feeds, embeds, serverstats (insights); custom command and automation APIs need engineering; real bot Embed Builder is separate and must remain stable |
| Insight & alerts | Server Analytics, Logging, Command Info, Social Alerts | logging and commands (settings); custom analytics, per-command rule builder and social connectors require verified APIs |

This is an inventory of *visible public descriptions*, not access to Arclo's private dashboard or runtime source. Its advertised numbers can change and are not Cloudy promises.

## Cloudy baseline confirmed by source

* Cloudy's website `lib/bot-dashboard/modules.ts` has **21 module definitions**, a mixture of `settings` and `insight`. `settings` modules already call the bot API and require authorization; `insight` modules are read-only views.
* Cloudy's bot has `src/web/dashboardApi.js`, providing module read/write and insight routes. It checks server permissions and validates saves. That is the supported source of truth; never implement a duplicate browser-only settings store.
* Cloudy's bot has the `/commands` access dashboard, commands to enable/disable categories and individual commands. The current website catalog exposes disabled category flags. **A per-command website editor does not yet exist**.
* The bot source contains `src/commands/Tools/poll.js` and a real `/poll` slash command, but Cloudy does not currently have a full poll-builder website module. Distinguish 'bot has command' from 'website supports configuration'.
* The current website dashboard guards access using Discord Owner, Administrator or Manage Server; new team roles must be checked server-side before any controls become interactive.
* The recently built OAuth preview restores a visible dedicated Discord dashboard login and no longer forces a silent `prompt=none` for first-time users. It remains to be tested through the full Discord account callback.
* The public landing removed advertising of a trial, but `plan-panel.tsx`, the plan fallback and bot-side state still reference an older 7-day trial. **Do not treat removing marketing text as disabling the backend trial.** The owner has requested no free trial; reconcile in a separately approved backend change before commercial launch.

## Build order

1. **Website navigation and feature discovery** (current preview): feature catalog sourced from real module definitions; search; category and status filters; honest statuses; links to authenticated server selection; original Cloudy design.
2. **Dashboard polish and access clarity** (current / prior preview): Team & Access and Command center entry points, with accurate permissions. Keep read-only overviews clearly distinct from editable settings.
3. **Website native settings for supported bot API modules**: better grouping, responsive tabs, draft/save/discard behavior and validation; reuse existing module editor. Verify identical values on reload and in Discord. Avoid extra writes or automatic saves.
4. **Website documentation and source-backed command reference**: enumerate actual commands from Cloudy's command loader; show real arguments, permissions and supported workflows. Do not extrapolate command names from Arclo.
5. **Bridge missing website APIs**: decide each feature by command/source availability and required API schemas. Add bot endpoints in a separate reviewed bot change only after website preview approval.
6. **Advanced integrations**: automations, custom commands, form builders, moderation cases and appeals, analytics, social alerts, backups, fine-grained team scopes. Design security checks, persistence, permissions, audit logs and rollback before enabling.
7. **Visual QA**: 320px mobile through desktop, swipe must not shift page, keyboard/touch accessibility, errors, loading skeletons, no global redesign. Avoid duplicate saves and ensure preview and physical Discord messages agree.

## Guardrails / acceptance tests

* Do not copy competitor implementation or assets; only follow publicly observed product concepts.
* Do not add new bot slash commands or change bot behavior in this website-only phase.
* No production deployment until the owner approves a specific preview.
* All authentication actions go to Discord OAuth; purchases/support are separate. No Discord support invite should masquerade as a login.
* No unverified switches or enable/disable buttons. Features requiring new API routes show an explicit 'Website integration needed' label.
* Only show live server-specific statistics after authentication and successful bot API read.
* Every write checks CSRF, server access, module access and permissions on the server.
* Save/Discard must be real; destructive actions must be deliberate; all success/error messaging must match actual backend results.
* Compare against existing Cloudy website, bot and Railway compatibility before merging; keep other pages intact.
