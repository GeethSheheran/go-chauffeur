# GoChauffeur concierge frontend

Next.js App Router, TypeScript and Tailwind CSS. This is the frontend review version; it is not deployed and does not take payments or confirm bookings.

## Run locally

Node.js 22.18+ is required for the TypeScript unit-test runner. Node.js 24 is recommended.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. If that port is occupied, run `npm run dev -- --port 3001`.

```sh
npm run build
npm run start
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

Browser checks currently use locally installed Google Chrome; see `playwright.config.ts`. Tests cover desktop/mobile layouts, the illustrated hero, all service estimates, partial enquiry previews, campaign persistence, filters, exclusive FAQ answers, menu and service navigation, legal pages, the illustrated HTTP 404 page, overflow and automated WCAG AA checks.

Mobile uses the top header and menu, without a bottom navigation bar. At phone widths (760px and below), prices stack by vehicle with all four service rates visible. Larger screens keep the comparison table; tablets can scroll through services while the vehicle column stays visible.

Lenis adds gentle wheel smoothing across all routes, with native touch scrolling and reduced-motion support. Same-page links use Lenis before Next.js handles scrolling, retain their URL fragments and respect the sticky-header offset; keyboard anchors scroll immediately. Open dialogs pause page scrolling while their contents remain scrollable. Existing section reveals also cover catalog cards and closing CTAs, including cards added by filters.

Each full page load opens with a three-second GoChauffeur logo intro. The Go mark draws in before the wordmark appears and the screen fades away; client-side navigation does not replay it. Escape or Tab skips it, reduced-motion preferences and direct section links bypass it, and the page stays usable if JavaScript or the animation fails.

## Source of truth

1. `docs/GoChauffeur_Page_by_Page_Website_Brief.docx`: primary content, page structure and interaction requirements.
2. The Build & Launch Brief PDF: supporting product, operating and technical context.
3. The quotation PDF: commercial delivery scope.
4. The Go Tech corporate codebase and branding: colours, fonts, layout and UI direction. The client's final direction removes all 3D and the corporate GO reveal in favour of a photographic hero and a clear trip planner.

Five content routes are implemented: `/`, `/destinations`, `/things-to-do`, `/privacy`, `/terms`, plus the branded not-found response. Home follows the simplified brief's section order. Chauffeur profiles and navigation links are intentionally absent until real profiles and permissions are supplied, as allowed in the brief.

## Editing content and prices

- `src/lib/prices.ts`: all six vehicle categories, rates, seat descriptions and distance/hour allowances. The widget, price table and itinerary prices derive from this file.
- `src/lib/content.ts`: destinations, experiences, itineraries, FAQ and process copy.
- `src/lib/quote.ts`: estimate calculation, validated numeric ranges, message generation and click-to-chat URL validation.
- `src/app/globals.css`: shared brand tokens, responsive layout and visual treatments.

## Enquiry preview and contact configuration

Copy `.env.example` to `.env.local` and populate only confirmed public values. Never put payment credentials, bank records, or other secrets in `NEXT_PUBLIC_` variables.

Planner and itinerary buttons open a review dialog. Header and page CTA WhatsApp buttons hand off directly to WhatsApp. The planner shows each trip detail and its indicative price, with inline editing, Save and Discard actions. Saved edits also update the planner and WhatsApp message. “Send to WhatsApp” opens the URL-encoded message in a separate tab; the visitor sends it from WhatsApp. The confirmed public number is `94762196201`; set `NEXT_PUBLIC_WHATSAPP_NUMBER` in the hosting environment before building for deployment. Missing or invalid numbers disable the handoff. No WhatsApp API or chatbot is used.

Location suggestions are curated in `src/lib/locations.ts` and require no API key or location-service fees. Visitors can select Sri Lankan towns, airports and attractions, or type any custom location. Multi-day stops are separated by semicolons; unfinished typed entries are included in the review. Attractions near the pickup town or a selected town appear first. The vehicle picker uses a styled, keyboard-accessible menu in both the planner and review editor.

Destination and experience cards toggle items in a shared trip shortlist. The navbar trip button opens its review, where visitors can remove stops, optionally supply service, pickup, date, duration, traveller and vehicle details, and send the selected list to WhatsApp. The shortlist remains in memory across client-side navigation; a full reload clears it.

The landing source, medium and campaign are kept in session storage while browsing. No dates, names, itineraries, or other enquiry form inputs are persisted. Widget state remains in memory only. Invalid or missing numbers do not generate invalid WhatsApp destinations.

## Preview boundaries

- Final legal and cookie wording is pending client approval. Privacy and booking terms contain summary copy. No unapproved refund cutoff, overtime, extra-distance or airport waiting charge is published.
- The airport itinerary uses “Ask for a transfer quote” until the inconsistent US$20 sample fare is resolved. The airport widget clearly labels the central Colombo reference fare.
- `src/lib/analytics.ts` emits local custom events for integration testing. No GA4, Google Ads or Meta script is loaded. Connect approved measurement only after the notice, consent requirements and account access are settled; actual incoming WhatsApp messages remain the lead count.
- Indexing is disabled with metadata and `robots.txt`. Enable it, add the final business structured data, verify Search Console, and configure canonical domain/HTTPS/www redirection during the launch phase.
- Public contact details, real chauffeur profiles, external account integrations, payments, backend and deployment are not part of this frontend review.

Assets and their license/provenance notes are in `docs/asset-provenance.md`. All 3D code, dependencies and vehicle models have been removed.
