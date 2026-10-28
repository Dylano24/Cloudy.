# Cloudy VPN preview review

Scope: `preview/cloudy-vpn-20261028`, Vercel project `cloudy-store`. No production merge, promotion, alias change, payment or subscription creation.

## Changes

- Consolidated the layered VPN stylesheet into one responsive design system using the shared page spacing tokens, Anton, Manrope, neutral surfaces and Cloudy red.
- Retained the large hero globe, shared animated card outlines, Web solutions Buy controls and native order popovers.
- Doubled the available land point detail; cached rotation trigonometry; made signal positions continuous along geographic great circle routes. Canvas clipping contains all routes and signals within the sphere.
- Globe animation stops offscreen, in hidden documents, for reduced motion and on user pause. Resolution is capped. No WebGL or external texture requests.
- Added opt-in suspension of the existing mobile sheen when no panels are visible. Other pages retain the original component defaults.
- Rewrote feature explanations, pricing copy and FAQ; replaced the decorative spotlight with an explanatory connection diagram. Removed repeated closing sales copy, unused globe renderers and their unused texture proxy.
- Added order dialog names and initial focus, plan-specific Buy labels, price change announcements, comparison row/column headers, keyboard-scrollable comparison and visible focus styles.

## Validation

- Production `next build`: passed, including TypeScript and static generation. This container requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` for Google Fonts certificate validation. No project TLS setting was weakened.
- `npx tsc --noEmit`: passed.
- ESLint on all VPN files and the changed shared component: passed.
- Existing `tests/mobile-sheen.test.mjs`: 3 passed.
- `git diff --check`: passed. All referenced VPN CSS module classes exist.
- Vercel browser check: desktop hero, globe, pricing, order dialog and typography inspected. All nine plan/term combinations displayed correct rates and totals. Comparison and FAQ disclosures, globe pause and order close controls operated correctly.
- DOM verification: offscreen card border animations report `paused`; visible comparison reports `running`. No horizontal desktop overflow; Anton is the rendered heading font.

## Limits and release requirements

- The owner states the service is ready for use. Product positioning follows that instruction. This website repository has no VPN provisioning client or VPN delivery webhook, and no actual VPN account was connected or tested. Feature, supported device, server location and fulfillment behavior have not been independently verified. No no-logs, audit, performance benchmark or server-count claim was added.
- Order dialogs remain preview reviews only. They do not create payments or subscriptions; the existing server-side preview payment guard remains unchanged.
- Mobile styles were reviewed for 320px and wider layouts, large readable body copy, 44px controls, stacked cards and horizontally scrollable comparison. An actual iPhone/WebKit session, battery measurement, Lighthouse score and automated mobile screenshot were not available: local browser execution is restricted and the cloud browser exposes no viewport emulation control. These are not claimed as passed tests.
- The rest of the site compiles; no full regression run against account, store or payment backends was performed.
