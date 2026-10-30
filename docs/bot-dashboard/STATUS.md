# Bot dashboard — status

Website-branch: `preview/cloudy-bot-dashboard-20261030` (alleen preview, niets gemerged).
Bot: Dashboard API staat live op Railway (`main`, commits `39ab039`, `64f48a9`, `5251637`, `14b9039`), Cloudy ONLINE.

## Wat het dashboard doet

- Inloggen met Discord (`identify guilds`), eigen servers met eigenaar/Administrator/Manage Server, of Cloudy er al in zit, en uitnodigen waar hij ontbreekt.
- 21 modules, allemaal live via Cloudy:
  - Instellingen opslaan (direct actief, zonder herstart): General, Commands, Logs, Welcome & goodbye, Auto role, Verification, Birthdays, Applications, Tickets, Leveling, Counting game, Join to Create.
  - Live overzichten: Moderation, AutoMod & security, Giveaways, Economy, Music, Server stats, Cloudy Feed, Reaction roles, Embeds.
- Alleen instellingen die Cloudy echt gebruikt. Rolkeuzes bieden alleen Staff, Moderator, Owner en Member.
- Op telefoons staat "Bot dashboard" onderaan het accountmenu; de bovenste rij blijft zoals hij was. Op desktop staat "Bot" naast VPN.

## Nog nodig voor de preview (Vercel)

| Variabele (Preview) | Waarde |
|---|---|
| `CLOUDY_BOT_API_URL` | `https://cloudy-production-b24f.up.railway.app` |
| `CLOUDY_DASHBOARD_API_SECRET` | hetzelfde geheim als in Railway (service Cloudy) |

Plus in de Discord Developer Portal (OAuth2 → Redirects): `https://<preview-domein>/api/bot/auth/callback`.

## Tests

- Bot: 1625 tests, 0 mislukt (11 voor de Dashboard API, inclusief schrijven via de echte services).
- Website: 13 dashboard-tests geslaagd; typecheck en build schoon.
- End-to-end (browser → website → ondertekende API → echte botmodules): 32/32 controles geslaagd, waaronder opslaan en herladen, rolbeperking, foutmeldingen van Cloudy, alle overzichten, mobiel menu.
