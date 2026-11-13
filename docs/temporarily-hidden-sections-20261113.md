# Temporarily hidden: Web Solutions and VPN

Hidden at the owner's request on 2026-11-13. This change must not affect the Rust store, checkout, accounts, Discord bot or any other Cloudy service.

- Web Solutions: `/service`, including the 'Cloudy Studio / Web development' homepage promotion and navigation link.
- VPN: `/vpn`, including its navigation link.
- Both routes return Next.js not-found responses while the flags are false.
- All original page contents, pricing layouts, styling, imports and interactive code are retained in `app/service/archived-page.tsx` and `app/vpn/archived-page.tsx`. Their existing CSS and related components were not deleted.
- The complete unchanged original GitHub snapshot is branch `backup/web-solutions-vpn-original-20261113`, commit `9784075889f1123b6f5d799de1bc5971adb0fc0d`.
- The corresponding switch is in `lib/site-sections.ts`.

## To restore later

1. Change `webSolutions` and/or `vpn` to `true` in `lib/site-sections.ts`.
2. Verify the restored page, navbar and homepage in a preview, and run lint/build/tests.
3. Merge/deploy to production only after explicit approval.

No purchase products or existing order information have been deleted.
