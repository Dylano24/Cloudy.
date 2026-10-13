# Cloudy Helpbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox syntax for tracking.

**Goal:** Add a homepage support widget that answers only from approved Cloudy information and routes visitors to the appropriate official page.

**Architecture:** A standalone client component consumes a local knowledge module. Deterministic matching returns approved answers or clarification choices, never generated policy. No chat API, order lookup, persistent chat storage or changes to checkout.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, lucide-react and CSS Modules; no new production dependencies.

**Spec:** `docs/superpowers/specs/2026-10-13-cloudy-helpbot-design.md`

## Global Constraints
- Only the homepage gets the widget; existing page content and effects remain intact.
- Only official owner-designated website, FAQ, Rules, Terms of Service, Store terms and ZORP information is permitted.
- Discord message contents are not yet available; do not invent them or claim complete Discord knowledge.
- Missing or ambiguous facts result in clarification or an appropriate support link.
- No private order status, purchases, refunds, appeal decisions, passwords or payment data collection.
- No external AI requests or permanent chat storage.
- Black window, white text, red accents; responsive and keyboard accessible.

## Review Focus
- A missing-product question must route to delivery help, not claim successful delivery.
- Negated and ambiguous questions must not silently become unrelated confident answers.
- Unavailable Discord rules and ZORP details must stay unknown, with official source referrals.
- Refund answers must preserve the published mandatory-consumer-rights exception.
- A mobile keyboard and repeated open/close operations must preserve usable layout and focus.

## Files and Responsibilities
- Create `components/help/cloudy-knowledge.ts`: approved entries, source links and deterministic matching.
- Create `components/help/cloudy-help.tsx`: launcher, dialogue, topic buttons, form and focus handling.
- Create `components/help/cloudy-help.module.css`: widget-only visual styling.
- Modify `app/page.tsx`: import and render the widget as a sibling outside the animated homepage container.
- Create `tests/cloudy-help.test.mjs`: source-backed matcher and knowledge regression tests.

## Task 1: Approved Knowledge and Matching

**Interfaces:** `HelpEntry { id: string; title: string; answer: string; keywords: string[]; links: {label: string; href: string}[]; source: string }`; `HelpResult { kind: 'answer' | 'clarify' | 'unknown'; entries: HelpEntry[] }`; exported `helpEntries` and `findHelp(question: string): HelpResult`.

- [ ] Write tests for delivery queries in Dutch and English, purchase navigation, refund exceptions, subscriptions, appeals, terms, Discord, unknown questions and ambiguous queries. Assert results refer only to approved entry IDs and source links.
- [ ] Run tests before implementation and verify failure from the missing knowledge module.
- [ ] Add sourced entries from the existing homepage, Store terms, Terms of Service, Support, cart/checkout and Appeal routes. Use current English site copy; include Dutch and English search terms. Keep missing Discord content as source referrals, without invented commands or rules.
- [ ] Match explicit phrases and meaningful whole-word keywords, prioritize specific missing-delivery phrases over generic purchase words, return choices for tied or insufficiently clear matches and an unknown result for unrelated questions. Reject empty input; bound question length to 1,000 characters. Never interpolate user input into policy answers or HTML.
- [ ] Compile the isolated TypeScript module with the installed compiler into a temporary directory, run `node --test tests/cloudy-help.test.mjs`, and confirm all tests pass.
- [ ] Review each factual answer against its cited repository page and commit the knowledge module with its tests.

## Task 2: Homepage Widget

**Consumes:** `helpEntries` and `findHelp(question)` from Task 1. **Produces:** exported `CloudyHelp()` client component, with no required props.

- [ ] Build a fixed bottom-right launcher labelled “Cloudy Help”, opening only on click. Inside show “Cloudy Support” and a short greeting offering website and purchase help.
- [ ] Render a nonmodal labelled dialogue with close and reset buttons, an accessible conversation log, topic buttons, a labelled text input and submit button. Answers show their source and official destination links. Unknown questions explicitly say that the information is unavailable and offer support. No fake typing delay, AI claim, live-status claim or human-online indicator.
- [ ] Focus the input on open, close on Escape, restore focus to the launcher on close and scroll the conversation log after a new answer. Keep conversation in component memory only; reset clears it.
- [ ] Style the launcher and panel in a dedicated CSS module. Desktop width 380px capped by viewport; mobile width viewport minus 24px. Limit panel height to available dynamic viewport height, respect safe-area insets and reduced-motion preferences, provide visible keyboard focus and keep long messages and links wrapped.
- [ ] Import and render the widget as a sibling outside the `.cloudy-classic-home` element in `app/page.tsx`, preventing existing transforms and overflow from trapping the fixed widget. Make no unrelated page edits.
- [ ] Run TypeScript and production build. Inspect the scoped diff, ensuring homepage text and existing effects are unchanged.
- [ ] Run local browser checks: launcher/open/close/reset, topic shortcuts, typed missing-product query, unsupported rule query, unknown query, source links, Escape and focus restoration. Repeat at desktop and mobile widths, including long questions and a growing conversation.
- [ ] Commit only the planned feature files, preserving all pre-existing changes and the existing backup branch.

## Task 3: Publish and Verify

- [ ] Push the approved feature to the existing `Dylano24/Cloudy.` master branch and wait for Vercel production readiness.
- [ ] Verify the live homepage launcher and support answers, official destination links and responsive layout. Confirm no chat requests are sent to an external AI service.
- [ ] Report what is live and the remaining knowledge limitation: private Discord FAQ/Rules/ZORP contents still require an approved import. Do not report those sources as loaded merely because their channel IDs are known.
