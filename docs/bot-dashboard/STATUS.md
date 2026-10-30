# Bot dashboard — status

Website-branch: `bot-dashboard` (alleen preview, niets gemerged). Vaste preview: https://cloudy-store-git-bot-dashboard-cloudystore.vercel.app/bot
Bot: Dashboard API staat live op Railway (`main`, laatste commit `bf2f496`), Cloudy ONLINE.

## Wat het dashboard doet

- Inloggen met Discord (`identify guilds`), eigen servers met eigenaar/Administrator/Manage Server, of Cloudy er al in zit, en uitnodigen waar hij ontbreekt.
- 21 modules, allemaal live via Cloudy:
  - Instellingen opslaan (direct actief, zonder herstart): General, Commands, Logs, Welcome & goodbye, Auto role, Verification, Birthdays, Applications, Tickets, Leveling, Counting game, Join to Create.
  - Live overzichten: Moderation, AutoMod & security, Giveaways, Economy, Music, Server stats, Cloudy Feed, Reaction roles, Embeds.
- Alleen instellingen die Cloudy echt gebruikt. Rolkeuzes bieden alleen Staff, Moderator, Owner en Member.
- Op telefoons staat "Bot dashboard" onderaan het accountmenu; de bovenste rij blijft zoals hij was. Op desktop staat "Bot" naast VPN.

## Abonnement: Cloudy Bot Premium, €13,00 per maand per server

- Elke server krijgt 7 dagen gratis; de proef start bij de eerste opgeslagen wijziging.
- Na de proef blijven alle instellingen zichtbaar en kun je ze aanpassen om te proberen; opslaan vraagt Premium ("Get Premium to save").
- Cloudy zelf beslist en controleert dit (niet alleen de website): zonder Premium weigert Cloudy elke wijziging.
- De eigenaar van Cloudy (OWNER_IDS of de eigenaar van de Discord-app) heeft altijd volledige toegang en zet op de Plan-pagina Premium aan of uit voor een server (1, 3, 6 of 12 maanden; maanden worden opgeteld).
- "Buy Premium" toont de prijs en het server-ID en opent de Cloudy Discord om te bestellen. Automatisch afrekenen via Tip4Serv kan zodra daar een product "Cloudy Bot Premium" (€13/maand) bestaat.

## Koppeling met de bot

De website stuurt bij elk verzoek de Discord-login van de ingelogde beheerder mee; Cloudy vraagt Discord wie dat is en controleert daarna zelf de rechten in de server. Er is geen gedeeld geheim in Vercel nodig. (Een gedeeld geheim `CLOUDY_DASHBOARD_API_SECRET` blijft optioneel mogelijk.)

Eenmalig nodig in de Discord Developer Portal (OAuth2 → Redirects), in dezelfde app als de websitelogin:
`https://cloudy-store-git-bot-dashboard-cloudystore.vercel.app/api/bot/auth/callback`

## Tests

- Bot: 1626 tests, 0 mislukt (15 voor de Dashboard API, waaronder proef, Premium en eigenaar).
- Website: 14 dashboard-tests geslaagd; typecheck, lint en build schoon.
- End-to-end (browser → website → API → echte botmodules): 59/59 controles geslaagd, waaronder proef starten, na de proef niets opslaan, eigenaar zet Premium aan, daarna weer opslaan, landingspagina met prijs en nieuwe FAQ.
