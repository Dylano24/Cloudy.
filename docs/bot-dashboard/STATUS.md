# Bot dashboard — status van deze preview

Branch: `preview/cloudy-bot-dashboard-20261030`, gebaseerd op `11cf505` (nieuwste commit met VPN). Alleen preview; niets is naar productie gemerged.

## Wat nu echt werkt

| Onderdeel | Status |
|---|---|
| "Bot" in de navigatie direct na VPN (desktop, tablet, telefoon 320–430 px) | Werkt |
| `/bot` landingspagina | Werkt |
| Live Cloudy-status (uptime, build) via de bestaande publieke `/health` van de bot | Werkt zodra Vercel Railway bereikt |
| Discord-login (`identify guilds`), profiel, uitloggen met token-intrekking | Werkt zodra de callback-URL in Discord is toegevoegd |
| Eigen servers zien, gefilterd op eigenaar/Administrator/Manage Server; aantal verborgen servers | Werkt (live via Discord) |
| Permissiecheck aan de serverkant op elke pagina en API-call | Werkt |
| Cloudy uitnodigen per server (Discord "Add app", server voorgeselecteerd, geen Administrator) | Werkt zodra `CLOUDY_BOT_CLIENT_ID` is gezet |
| Volledig dashboard (overzicht, 20 modules, zijbalk, serverwisselaar, mobiele lade) | Werkt |
| Bewerken, live Discord-preview, opslagbalk, Ctrl/⌘+S, reset, bevestigingsdialoog | Werkt in de demo (`/bot/demo`) |
| Validatie, CSRF, rate limiting, audit-logregels | Werkt (getest) |

## Wat nog een backendkoppeling nodig heeft

| Onderdeel | Nodig |
|---|---|
| Of Cloudy in een server zit | Dashboard API `presence` (botwijziging, zie `BOT_API_SPEC.md`) |
| Kanalen en rollen in de keuzelijsten | Dashboard API `overview` |
| Huidige instellingen laden en opslaan voor echte servers | Dashboard API `modules` + `CLOUDY_BOT_API_URL` en `CLOUDY_DASHBOARD_API_SECRET` |
| Ticket-/verificatiepaneel in Discord bijwerken | Dashboard API `actions` |
| AutoMod, Economy-valuta, Music, meerdere auto roles | Eerst opslag per server in de bot |
| Moderatiegeschiedenis, giveaways, reaction roles, embeds | Alleen-lezenoverzicht via Dashboard API |

Tot die koppeling er is, tonen echte servers de instellingen vergrendeld met een duidelijke melding; er wordt niets gesimuleerd. De demo is overal als demo gemarkeerd en verstuurt niets.

## Tests (lokaal, productie-build)

- `npx tsc --noEmit`: geslaagd. `next build`: geslaagd. ESLint op nieuwe code: 0 fouten (alleen `<img>`-waarschuwingen, zoals de bestaande header).
- `tests/bot-dashboard.test.mjs`: 12/12 geslaagd (sessie-encryptie, manipulatie, verloop, CSRF, OAuth-state, open-redirect, permissies incl. > 2^53, validatie, HMAC-ondertekening, rate limiter, origin).
- Volledige testsuite: 129/137; de 8 falende tests falen identiek op de originele commit zonder deze wijziging (bestaand probleem in de test-harness).
- API-poorten tegen de draaiende build: zonder sessie 401, vervalste cookie 401, zonder CSRF 403, vreemde Origin 403, onbekende module/actie 404, 25 snelle schrijfacties → 429, vervalste OAuth-state → geweigerd, `next=//evil.example` → `/bot`.
- Interactietest (18 controles): schakelaars, opslagbalk, live preview, reset, Ctrl+S, placeholders, categorieën, bevestigingsdialoog, Escape, serverwisselaar, mobiele lade.
- Regressie: 15 bestaande pagina's × 4 breedtes (1440, 390, 360, 320): allemaal HTTP 200, geen JS-fouten, inhoud onder de header pixel-identiek (max. 0,02 % verschil door animatie).
- Header: tussen 320 en 1440 px overlapt de navigatie nergens. Onder 375 px gebruikt elke pagina de compacte linkmaat die de VPN-pagina al had (headerhoogte ongewijzigd).

## Gemeten prestaties (Lighthouse 12, lokaal, `next start`)

| Pagina | Mobiel perf | Desktop perf | Toegankelijkheid | LCP mobiel | TBT mobiel |
|---|---|---|---|---|---|
| `/bot` | 92 | 100 | 100 | 3,2 s | 80 ms |
| `/bot/demo` | 90 | 99 | 100 | 3,5 s | 140 ms |
| `/bot/demo/welcome` | 92 | 99 | 100 | 3,4 s | 60 ms |
| `/vpn` (ter vergelijking) | 90 | 100 | 100 | 3,5 s | 70 ms |

Lokaal gemeten met Lighthouse' gesimuleerde trage 4G en CPU-vertraging; externe afbeeldingen (jsDelivr, Discord CDN) waren in de testomgeving geblokkeerd. Echte Vercel-cijfers kunnen afwijken en worden na de preview-deploy opnieuw gemeten.
