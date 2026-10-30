# Cloudy Dashboard — isolated integration plan

## Non-negotiable constraints
- Do not modify the existing Discord bot repository or bot deployment.
- Do not alter existing Cloudy Store routes, copy, navigation, or production.
- Preview branch only until explicit approval.
- No fake authentication, fake connected server state, or mock settings portrayed as live.
- All server mutations require an authenticated user with verified Manage Guild permission and server-side authorization.

## Phases
1. Read-only dashboard shell and responsive module navigation.
2. Discord OAuth2 authorization-code flow, state/PKCE where applicable, secure HttpOnly sessions, strict redirect URI validation.
3. Server selector from Discord guild list, verified permission checks, bot presence checks.
4. Read-only bot integration audit: discover existing supported backend APIs, DB contracts and event schemas. Never expose bot tokens or DB credentials to browsers.
5. Build separate authenticated API adapter with strict validation, rate limits, audit logs, idempotency, and per-guild isolation.
6. Only activate settings that the existing bot already supports reading without code changes. If any bot-side support is missing, pause and request approval before proposing an additive compatibility change.
7. Tests: permission denial, cross-guild isolation, CSRF, token leakage, concurrency, rollback, load, mobile and desktop.
8. Deploy preview, verify, and request approval before production.

## Current status
The initial route is a visual scaffold only. It deliberately contains no login, settings mutations, or Discord API calls.
