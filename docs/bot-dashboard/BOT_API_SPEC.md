# Cloudy Dashboard API — voorstel voor de bot (NIET uitgevoerd)

Deze botwijziging is nodig om het dashboard live te laten lezen en schrijven. Ze is **niet** gebouwd en vereist expliciete toestemming van de eigenaar. De websitekant (`lib/bot-dashboard/bot-api.ts`) volgt dit contract al exact.

## Uitgangspunten

- Additief: één nieuw bestand `src/web/dashboardApi.js` plus één regel `registerDashboardApi(app, this)` in `startWebServer()`. Geen bestaande commando's, events, embeds of timings wijzigen.
- Schrijven gaat uitsluitend via de bestaande services (`patchGuildConfig`, `updateWelcomeConfig`, `saveLevelingConfig`, `updateJoinToCreateConfig`, `saveApplicationSettings`, `saveCountingGameConfig`, commandAccessService, cloudyFeedService). Zo blijven caches, per-server-wachtrijen, mutexen en validatie van de bot leidend en is er geen herstart nodig.
- **Nooit** automatisch een bestaand Discord-bericht wijzigen bij opslaan (AGENTS.md: embed preservation). Paneel bijwerken is altijd een aparte, expliciete actie.
- Geen migratie bij startup.

## Authenticatie

Railway-variabele `CLOUDY_DASHBOARD_API_SECRET` (≥ 32 willekeurige bytes) = dezelfde waarde in Vercel.

Elke aanvraag bevat:

| Header | Inhoud |
|---|---|
| `x-cloudy-dashboard-timestamp` | Unix-seconden |
| `x-cloudy-dashboard-nonce` | 16 random bytes, base64url |
| `x-cloudy-dashboard-actor` | Discord user-id van de ingelogde beheerder |
| `x-cloudy-dashboard-signature` | `base64url(HMAC-SHA256(secret, canonical))` |

`canonical = ["cloudy-dashboard-v1", METHOD, path, timestamp, nonce, actorId, sha256hex(rawBody)].join("\n")`

De bot weigert (`401`) bij: afwijking > 60 s, hergebruikte nonce (Redis `SET NX` 120 s), verkeerde handtekening (timing-safe vergelijking). Body max. 64 kB.

## Autorisatie (defense in depth)

Ook met een geldige handtekening controleert de bot zelf, via de gateway-cache:
1. Cloudy zit in de server (anders `404 not_in_guild`).
2. `actor` is lid met eigenaar/Administrator/Manage Server (anders `403 forbidden`).
3. Module `feeds`: actor heeft de Owner-rol (`hasCloudyOwnerMember`).
4. Rate limit per actor: 30 schrijfacties per minuut (Redis-teller), `429`.

## Endpoints (prefix `/api/dashboard/v1`)

| Methode en pad | Antwoord |
|---|---|
| `POST /guilds/presence` body `{ guildIds: string[≤200] }` | `{ present: string[] }`: alleen ID's waar Cloudy in zit |
| `GET /guilds/:guildId/overview` | `{ guild: {id,name,memberCount,icon}, channels: [{id,name,type,parentId,position}], roles: [{id,name,color,position,managed,assignable}], modules: {}, missingPermissions: string[] }` |
| `GET /guilds/:guildId/modules/:module` | `{ revision, values }`: `values` plat op veldpad zoals in `lib/bot-dashboard/modules.ts` (bijv. `"leaveEmbed.title"`, `"xpRange.min"`) |
| `PATCH /guilds/:guildId/modules/:module` body `{ revision, changes }` | nieuwe `{ revision, values }`; `409 revision_conflict` als `revision` niet meer klopt; `422 invalid` met `{ error, path }` |
| `POST /guilds/:guildId/modules/:module/actions/:action` | `{ ok: true, message }`; acties: `tickets/republish-panel`, `verification/repost-panel` |

`revision` = sha256 (eerste 16 tekens, base64url) van de opgeslagen JSON van die module. Fouten bevatten alleen een korte gebruikerstekst en een `code`, nooit stacktraces.

## Vertaling module → bestaande service

| Module | Lezen | Schrijven |
|---|---|---|
| general, logging, verification, tickets, birthdays, commands | `getGuildConfig` | `patchGuildConfig` (diepe merge, per-server wachtrij, schema-validatie) |
| welcome, autoroles | `getWelcomeConfig` | `updateWelcomeConfig` |
| leveling | `getLevelingConfig` | `saveLevelingConfig` (merge met huidige config) |
| applications | `getApplicationSettings` | `saveApplicationSettings` |
| counting | counting service | `saveCountingGameConfig` / `activateCountingGame` |
| jointocreate | `getJoinToCreateConfig` | `updateJoinToCreateConfig` |
| feeds | `readFeeds` | bestaande feed-acties (add/edit/pause/delete) met `withGuildLock`; `mediaType: "all"` ↔ `null` |

Paden met punten worden vóór het opslaan teruggezet naar geneste objecten. De bot valideert opnieuw (zelfde grenzen als de website) en past niets toe als één veld ongeldig is.

## Audit

Per geslaagde wijziging: `guild:{id}:dashboard:audit` (laatste 200), met `{ at, actor, module, keys, revisionBefore, revisionAfter }`, plus een `moderation.config`-logEvent als logging aan staat. Waarden zelf worden niet gelogd.

## Testplan bij uitvoering

- Unit: handtekening (geldig, verlopen, replay, verkeerde body), autorisatie (geen lid, geen rechten, Owner-rol voor feeds), padvalidatie, revision-conflict.
- Integratie: wijziging via API → direct zichtbaar in het bestaande Discord-dashboard van die module zonder herstart.
- Regressie: `npm run check` in de botrepo; Railway `SUCCESS` en bot `ONLINE` (AGENTS.md).

## Overige voorgestelde botwijzigingen (los, elk apart goed te keuren)

1. Auto roles: alle `roleIds` toekennen in plaats van alleen de eerste.
2. Economy-valuta per server in de database opslaan in plaats van in `src/config/bot.js`.
3. AutoMod/linkbeveiliging: drempels per server opslaan (standaard = huidige constanten).
4. Music: 24/7 en standaardvolume per server opslaan.
5. Slash-commands ook registreren in andere servers waar Cloudy wordt uitgenodigd (nu alleen `GUILD_ID`).
6. `CORS` voor de nieuwe API op de websitedomeinen zetten in plaats van `*` (de API heeft geen cookies nodig, maar dit is netter).
