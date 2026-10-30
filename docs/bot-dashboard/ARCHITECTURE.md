# Bot dashboard — architectuur

```
Browser ──HTTPS──▶ Vercel (Next.js, Cloudy Store)
                     │  /bot pagina's (server components)
                     │  /api/bot/* (route handlers)
                     │     • Discord OAuth2 (identify guilds)
                     │     • versleutelde sessiecookie (AES-256-GCM)
                     │     • permissiecheck via Discord, CSRF, rate limit, validatie, audit
                     │
                     ├──HTTPS (user-token)──▶ Discord API  (profiel + serverlijst)
                     │
                     └──HTTPS + HMAC──▶ Railway: Cloudy bot  /api/dashboard/v1/* (voorstel)
                                           │ gebruikt bestaande services
                                           ├─▶ PostgreSQL (bron van waarheid)
                                           └─▶ Redis (nonces, rate limit, caches)
```

## Onafhankelijkheid

- Website en bot delen geen database, Redis of bot-token. De website kent alleen een HMAC-geheim dat uitsluitend het eigen dashboardcontract kan aanroepen.
- Valt de bot weg, dan blijft de website werken: het dashboard toont "Cloudy did not answer" en wijzigt niets. Valt Vercel weg, dan draait de bot gewoon door.
- Geen herstarts: de bot past wijzigingen toe via dezelfde code als zijn Discord-commando's (write-through caches).

## Inloggen en sessies

- Zelfde Discord-applicatie en `DISCORD_CLIENT_ID/SECRET` als de bestaande websitelogin; dezelfde geheime sleutel (`ACCOUNT_SESSION_SECRET`), met via HKDF afgeleide, aparte sleutels voor sessie, CSRF en OAuth-state. De bestaande accountlogin (`/api/account/login`, scope `identify`) is ongewijzigd.
- Dashboardlogin vraagt `identify guilds`, `prompt=none` voor terugkerende gebruikers.
- Sessiecookie `cloudy-bot-session`: AES-256-GCM, httpOnly, Secure, SameSite=Lax, max. 7 dagen of korter (token-vervaltijd). Het Discord-token komt nooit in JavaScript van de browser.
- OAuth-state: HMAC-ondertekend, 10 minuten geldig, gekoppeld aan een httpOnly-cookie op `/api/bot/auth`; terugkeerpad alleen `/bot/...` (geen open redirect).
- Uitloggen: POST met CSRF-token, token wordt bij Discord ingetrokken.

## Beveiliging per verzoek

1. Sessie ontsleutelen en valideren.
2. Rate limit per gebruiker (lezen 120/min, schrijven 20/min; inloggen 12/min per IP).
3. Schrijven: Origin/Host-controle + CSRF-token (HMAC van sessie-id) + SameSite=Lax.
4. Server-ID moet voorkomen in de serverlijst die Discord zelf voor deze gebruiker teruggeeft, met eigenaar/Administrator/Manage Server (lijst max. 60 s gecachet per token).
5. Validatie per veld vanuit één catalogus (`lib/bot-dashboard/modules.ts`): onbekende velden geweigerd, snowflakes, lengtes, https-URL's, numerieke grenzen, controletekens.
6. Bot controleert alles opnieuw (zie `BOT_API_SPEC.md`).
7. Audit: JSON-regel per wijziging in Vercel-logs (alleen veldnamen), duurzaam in de bot.
8. Antwoorden: `Cache-Control: no-store`, `X-Frame-Options: DENY`, `nosniff`. React escapet alle tekst; de Discord-preview rendert markdown als React-elementen, nooit als HTML.

## Prestaties

- Server components; alleen de interactieve delen (zijbalk, editor) zijn client components. Het dashboard voegt 2–14 kB JavaScript toe bovenop de gedeelde site-bundle.
- Discord-serverlijst: in-flight deduplicatie en 60 s cache per token (Discord rate-limit), "Refresh" haalt vers op.
- Botstatus (`/health`) 15 s gecachet en via Suspense gestreamd, zodat een trage bot de pagina niet ophoudt.
- Navigatie tussen modules zonder volledige herlaad; geen prefetch van alle 20 modules.
- Geen extra animatiebibliotheek; alleen transform/opacity-transities, uit bij `prefers-reduced-motion`.

## Waar Redis nuttig wordt

- Bot: nonce-replaybescherming en globale rate limit van de Dashboard API (bestaande Redis).
- Website: bij veel gebruikers kan de in-memory rate limiter worden vervangen door Upstash Redis via de Vercel Marketplace. Nu niet nodig; gedocumenteerd als optie.

## Configuratie (Vercel)

| Variabele | Doel | Nodig voor |
|---|---|---|
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Bestaand | Inloggen |
| `ACCOUNT_SESSION_SECRET` (of `BOT_DASHBOARD_SESSION_SECRET`) | Bestaand / optioneel apart | Sessies |
| `CLOUDY_BOT_CLIENT_ID` | Application-ID van de bot | Knop "Invite Cloudy" |
| `CLOUDY_BOT_API_URL` | `https://cloudy-production-b24f.up.railway.app` | Live instellingen |
| `CLOUDY_DASHBOARD_API_SECRET` | Gedeeld HMAC-geheim (≥ 32 tekens) | Live instellingen |
| `CLOUDY_BOT_DASHBOARD_ORIGIN` | Optioneel vast inlogdomein | Eigen domein |

In de Discord Developer Portal (OAuth2 → Redirects) moet per omgeving de callback staan: `https://<domein>/api/bot/auth/callback`.
