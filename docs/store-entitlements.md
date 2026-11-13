# Cloudy Store: payments that unlock things

Payments are taken by Tip4Serv. The signed webhook (`app/api/tip4serv/webhook`) logs every payment in the private ledger and then, only for configured products, tells the Cloudy bot what was bought over the signed connection (`signedBotCall`, `CLOUDY_DASHBOARD_API_SECRET`). Nothing is unlocked while the product lists are empty, which is the default.

## Flow

1. Verify Tip4Serv's HMAC signature and timestamp (5-minute window).
2. Unknown event names: `202`, so Tip4Serv does not retry them. Known events: `payment.success`, `payment.failed`, `payment.refund`, `subscription.created`, `subscription.renewed`, `subscription.expired` (subscription events used to be refused with 400, which made Tip4Serv retry them for four days).
3. Save the immutable ledger entry (subscription events are kind `subscription` and never counted as revenue).
4. `entitlementActions` maps basket items to actions (`lib/store-entitlements.ts`):
   - One-time Premium product: `payment.success` grants `months × quantity`; `payment.refund` takes exactly that back.
   - Subscription Premium product: only `subscription.created` (grant), `subscription.renewed` (renew), `subscription.expired` / `payment.refund` (end) and `payment.failed` (logged). `payment.success` is ignored for it, so one checkout counts once.
   - Rust kit products: one delivery order per player and server; refunds cancel what was not delivered.
   - The Discord server ID, gamertag and platform come from basket custom fields with markers `guild_id`, `gamertag`, `platform` (configurable).
5. `dispatchEntitlements` sends each action. Every action is idempotent on the bot. Cloudy offline, starting, rate limited, without its database or without the shared secret: `503` + `Retry-After: 60`, Tip4Serv delivers again. Invalid data or kit delivery off: stored under `entitlements/` for staff and acknowledged.

## Premium checkout

`CLOUDY_PREMIUM_CHECKOUT` turns on "Pay now" on `/bot/<server>/plan`: the Tip4Serv checkout opens with the server ID filled into the product's custom field. After payment the page asks `/api/bot/guilds/<server>/plan` until Cloudy shows Premium (up to 3 minutes). Without it the plan page keeps "Order on Discord" exactly as before.

## Before going live (owner)

- Production `TIP4SERV_API_KEY` currently gets 403 from Tip4Serv (`/api/tip4serv/store/whoami` fails on production): create a new key in the Tip4Serv dashboard and set it in Vercel.
- Create the "Cloudy Bot Premium" product in Tip4Serv (subscription, €13/month) with a required text custom field, marker `guild_id`.
- Set `CLOUDY_DASHBOARD_API_SECRET` (same value on Railway and Vercel), `CLOUDY_PREMIUM_PRODUCTS`, `CLOUDY_PREMIUM_CHECKOUT`, `TIP4SERV_WEBHOOK_SECRET`, `TIP4SERV_STORE_ID`.
- Run a Tip4Serv test-mode purchase on a preview and confirm Premium appears; check in the Tip4Serv sandbox whether a renewal also sends `payment.success` (revenue in the ledger depends on it).
- Rust kits: keep `CLOUDY_RUST_KIT_PRODUCTS` empty until the commercial rules are checked and a real server delivery test passed (see the bot's `docs/billing-and-rust-delivery.md`).

## Customers, staff and onboarding

- **My orders** (`/account/orders`) and receipts (`/account/receipt/<id>`): a payment shows for a signed-in customer only through a proven identity (the Cloudy account the webhook matched, their Discord login, or a Discord/Steam account linked through OAuth); never through an email address alone. Ledger entries are filed under hashed identity folders when saved (`customers/`) and ownership is checked again on read. Payments logged before this change are not filed and do not appear.
- **Kit deliveries** (`/admin/deliveries`): staff in `CLOUDY_STAFF_ADMINS` (else `CLOUDY_FINANCE_ADMINS`) with a Discord ID; Cloudy checks again that this Discord user is its owner.
- **Cloudy Bot setup**: "Invite Cloudy" watches for Cloudy to join and continues to the server's dashboard; the overview shows a setup checklist from Cloudy's real settings. The bot posts one setup message with the dashboard link when it joins a customer's server once `CLOUDY_DASHBOARD_URL` is set on Railway.
