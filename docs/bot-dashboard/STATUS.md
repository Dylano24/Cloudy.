# Bot dashboard — status

Website-branch: `bot-dashboard` (alleen preview, niets gemerged). Vaste preview: https://cloudy-store-git-bot-dashboard-cloudystore.vercel.app/bot
Bot: Dashboard API staat live op Railway (`main`, commits `39ab039`, `64f48a9`, `5251637`, `14b9039`), Cloudy ONLINE.

## Wat het dashboard doet

- Inloggen met Discord (`identify guilds`), eigen servers met eigenaar/Administrator/Manage Server, of Cloudy er al in zit, en uitnodigen waar hij ontbreekt.
- 21 modules, allemaal live via Cloudy:
  - Instellingen opslaan (direct actief, zonder herstart): General, Commands, Logs, Welcome & goodbye, Auto role, Verification, Birthdays, Applications, Tickets, Leveling, Counting game, Join to Create.
  - Live overzichten: Moderation, AutoMod & security, Giveaways, Economy, Music, Server stats, Cloudy Feed, Reaction roles, Embeds.
- Alleen instellingen die Cloudy echt gebruikt. Rolkeuzes bieden alleen Staff, Moderator, Owner en Member.
- Op telefoons staat "Bot dashboard" onderaan het accountmenu; de bovenste rij blijft zoals hij was. Op desktop staat "Bot" naast VPN.

## Koppeling met de bot

De website stuurt bij elk verzoek de Discord-login van de ingelogde beheerder mee; Cloudy vraagt Discord wie dat is en controleert daarna zelf de rechten in de server. Er is geen gedeeld geheim in Vercel nodig. (Een gedeeld geheim `CLOUDY_DASHBOARD_API_SECRET` blijft optioneel mogelijk.)

Eenmalig nodig in de Discord Developer Portal (OAuth2 → Redirects), in dezelfde app als de websitelogin:
`https://cloudy-store-git-bot-dashboard-cloudystore.vercel.app/api/bot/auth/callback`

## Tests

- Bot: 1625 tests, 0 mislukt (11 voor de Dashboard API, inclusief schrijven via de echte services).
- Website: 13 dashboard-tests geslaagd; typecheck en build schoon.
- End-to-end (browser → website → ondertekende API → echte botmodules): 32/32 controles geslaagd, waaronder opslaan en herladen, rolbeperking, foutmeldingen van Cloudy, alle overzichten, mobiel menu.
