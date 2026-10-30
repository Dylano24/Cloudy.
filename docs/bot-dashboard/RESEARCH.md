# Cloudy Bot — technisch onderzoeksrapport (read-only)

Repository: `Dylano24/Cloudy` op commit `cde9cbb` (main, 30-10-2026). Er is niets aan de bot gewijzigd, gecommit of gedeployed.

## 1. Opbouw en runtime

| Onderdeel | Bevinding |
|---|---|
| Runtime | Node 24, discord.js 14, Express 5, ES modules. Start: `scripts/register-cloudy-guild-commands.js` en daarna `src/bootstrap.js`. |
| Omvang | 515 bronbestanden: 109 commandobestanden in 19 categorieën, 121 services, 81 event handlers, interactiehandlers (buttons, modals, selects). |
| Hosting | Railway project `sweet-kindness`: services **Cloudy** (1 replica, volume `/cloudy-media` 2 GB), **Postgres**, **Redis**, **Cloudy Monitor**. Laatste deployment `SUCCESS`. |
| Publiek domein | `https://cloudy-production-b24f.up.railway.app` (poort 8080). |
| Slash-commands | Alleen geregistreerd voor één server (`GUILD_ID`). In andere servers heeft Cloudy geen slash-commands. Niet-spelercommando's krijgen standaard `default_member_permissions = 8` (Administrator). |

**Conclusie:** Cloudy is nu feitelijk een bot voor één server (Cloudy Inc.). Het dashboard is wel multi-server gebouwd, maar Cloudy uitnodigen in een andere server levert daar pas volledige functionaliteit op na een (aparte) wijziging van de command-registratie.

## 2. Opslag

- **PostgreSQL** via een key-value-laag (`client.db.get/set`, `src/utils/database/wrapper.js`) met tabellen voor guilds, users, tickets, giveaways, economy, leveling, birthdays, invites, verification audit enz. (`src/utils/database/schema.js`).
- **Sleutels** (`src/utils/database/keys.js`), o.a. `guild:{id}:config`, `guild:{id}:welcome`, `guild:{id}:leveling:config`, `guild:{id}:jointocreate`, `guild:{id}:applications:settings`, `guild:{id}:cloudy:feeds`, `countingGame:{id}`.
- **Redis** wordt alleen gebruikt als cache voor een paar hete sleutels (Reappear, Builder button actions) en voor message snapshots.
- **In-process caches:** `guildConfig.js` houdt servers-config 5 minuten in geheugen en serialiseert schrijfacties per server; Welcome gebruikt een in-process mutex; counting een eigen cache.

**Gevolg (kritiek):** een extern systeem mag nooit rechtstreeks in Postgres of Redis schrijven. De bot zou tot 5 minuten oude waarden blijven gebruiken en bij de volgende eigen schrijfactie de externe wijziging overschrijven. Elke dashboardwijziging moet via de bot zelf lopen.

## 3. Bestaande HTTP-endpoints van de bot

| Endpoint | Beveiliging | Gebruik |
|---|---|---|
| `GET /health`, `GET /ready`, `GET /` | Publiek | Status, uptime, build-commit, databasestatus. Wordt door het dashboard gebruikt (alleen lezen). |
| `POST /api/appeals` | Vaste header `x-cloudy-source` (geen geheim) | Appealformulier van de website. |
| Website-assistent API | Bearer shared secret (≥ 32 tekens, timing-safe) | Website-AI. |
| `/embed-color`, `/api/embed-color/:token` | Sessietoken | Embed Builder-editor. |
| Media-routes | Onraadbare tokens | Embed-media en verwijderde video's. |

Er is **geen** API om serverinstellingen te lezen of te schrijven. CORS staat standaard op `*`; rate limiting is per IP in-memory (100/min).

## 4. Modules en wat een dashboard kan beheren

Legenda: ✅ de bot heeft al een service die dit per server opslaat (alleen een API-endpoint ontbreekt) · ⚠️ eerst botwijziging nodig · 👁 eerst alleen-lezen.

| Module | Opslag | Beheerbare instellingen | Status |
|---|---|---|---|
| Algemeen | `guild:{id}:config` | prefix, modRole, adminRole, premiumRoleId | ✅ |
| Commands | `config.disabledCategories/disabledCommands` | categorieën aan/uit (`/commands` en `/configwizard` altijd beschermd) | ✅ |
| Logs | `config.logging` | aan/uit, kanalen audit/applications/reports, 36 eventtypes, genegeerde kanalen | ✅ (vaste Staff/Member/AutoMod/Embed-logs blijven beschermd) |
| Welcome & goodbye | `guild:{id}:welcome` | welkom aan/uit, kanaal, ping, tekst-fallback; goodbye aan/uit, kanaal, ping, titel, tekst, kleur, footer, afbeelding | ✅ |
| Auto roles | `welcome.roleIds` | **alleen de eerste rol wordt toegekend** | ✅ (meerdere rollen = botwijziging) |
| Verificatie | `config.verification` | aan/uit, kanaal, rol, paneeltekst, knoptekst, auto-verify (regel, accountleeftijd) | ✅ + actie "paneel opnieuw posten" |
| Leveling | `guild:{id}:leveling:config` | aan/uit, XP min/max (1–500), cooldown (0–3600 s), aankondigingen, kanaal, bericht, rolbeloningen (level 1–500), uitgesloten kanalen/rollen | ✅ |
| Verjaardagen | `config.birthdayChannelId` | kanaal | ✅ |
| Applications | `guild:{id}:applications:settings` | open/dicht, reviewkanaal, reviewerrollen, 1–5 vragen (≤100 tekens), bewaartermijnen | ✅ |
| Tickets | `config.ticket*` | gepauzeerd, staffrol, max open tickets (1–10), paneelkanaal/-titel/-tekst/-knop, FAQ-kanaal, categorieën, log- en transcriptkanaal | ✅ + expliciete actie "paneel in Discord bijwerken" |
| Counting | `countingGame:{id}` | aan/uit, kanaal, 8 talstelsels | ✅ |
| Join to Create | `guild:{id}:jointocreate` | aan/uit, hub-kanalen, categorie, naamsjabloon, limiet (0–99), bitrate (8–384 kbps) | ✅ |
| Cloudy Feed | `guild:{id}:cloudy:feeds` | max. 5 feeds: naam, URL, kanaal, interval (1–10080 min), mediatype, 18+, actief | ✅ (alleen Owner-rol) |
| Moderatie | warnings/cases | geschiedenis bekijken | 👁 acties blijven Discord-commando's |
| AutoMod & security | constanten in code | drempels, time-outduur | ⚠️ hardcoded |
| Giveaways | `giveaways`-tabel | lijst, deelnemers; End/Reroll als expliciete actie | 👁 aanmaken blijft via Giveaway Builder |
| Economy & games | economy-sleutels + `src/config/bot.js` | valutanaam/-symbool | ⚠️ wordt nu in een codebestand geschreven (globaal, verdwijnt bij redeploy) |
| Music | in-memory player | 24/7, volume | ⚠️ niets per server opgeslagen |
| Reaction roles | `guild:{id}:reaction_roles:{msg}` | panelen bekijken | 👁 bewerken via bot zodat bericht en knoppen synchroon blijven |
| Embeds | embed registry | posts/templates/Reappear bekijken | 👁 wijzigen uitsluitend via het bestaande Builder-Save-pad (AGENTS.md) |
| Overig (geen dashboard nodig) | — | search, fun, utility, tools, server stats, birthdays-lijst, todo, polls | — |

## 5. Bevindingen tijdens het onderzoek (niets aangepast)

1. **Welkomstbericht:** de bot verstuurt altijd het vaste "Welcome to Cloudy Inc."-kaartje (of een Embed Builder-template voor dat kanaal). De opgeslagen velden `welcomeEmbed.*`, `welcomeImage` en `dmMessage` worden bij verzenden niet gebruikt; `welcomeMessage` alleen als de bot geen embeds mag posten. Het dashboard toont daarom alleen velden die echt effect hebben.
2. **Auto roles:** alleen `roleIds[0]` wordt toegekend.
3. **Economy-valuta:** wordt via `updateConfigFile` in `src/config/bot.js` geschreven: geldt voor alle servers en gaat verloren bij een redeploy.
4. **Command-registratie:** alleen voor `GUILD_ID`.
5. **AutoMod/linkbeveiliging:** alle drempels staan als constanten in de code.

## 6. Toegangsmodel van de bot

- Staff: servereigenaar, Administrator, rol "Owner", ingestelde mod/admin/ticketrollen of rollen met de naam Staff/Owner/Admin/Administrator/Moderator.
- Cloudy Feed en `/auto`: alleen leden met de rol **Owner**.
- Het dashboard gebruikt de strengere Discord-regel: eigenaar, Administrator of **Manage Server**. De Dashboard API controleert dit opnieuw met de live gateway-gegevens van de bot (en de Owner-rol voor Cloudy Feed).
