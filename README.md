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

Planner and itinerary buttons open a review dialog. Header and page CTA WhatsApp buttons hand off directly to WhatsApp. The planner shows each trip detail and its indicative price, with inline editing, Save and Discard actions. Saved edits also update the planner and WhatsApp message. “Send to WhatsApp” opens the URL-encoded message in a separate tab; the visitor sends it from WhatsApp. The confirmed public number `94762196201` is the shared default for all WhatsApp handoffs. Optionally set `NEXT_PUBLIC_WHATSAPP_NUMBER` in the hosting environment to override it; missing or blank values use the default, and invalid overrides disable the handoff. On Vercel, set overrides for the appropriate Production/Preview environment and redeploy: public variables are embedded during the build, and `.env.local` is not committed or uploaded through Git. No WhatsApp API or chatbot is used.

Location suggestions use Google Maps and require the server-side configuration described below. Multi-day stops are separated by semicolons. The vehicle picker uses a styled, keyboard-accessible menu in both the planner and review editor.

Destination and experience cards toggle items in a shared trip shortlist. The navbar trip button opens its review, where visitors can remove stops, optionally supply service, pickup, date, duration, traveller and vehicle details, and send the selected list to WhatsApp. The shortlist remains in memory across client-side navigation; a full reload clears it.

The landing source, medium and campaign are kept in session storage while browsing. No dates, names, itineraries, or other enquiry form inputs are persisted. Widget state remains in memory only. Invalid overrides do not generate invalid WhatsApp destinations.

## Preview boundaries

- Final legal and cookie wording is pending client approval. Privacy and booking terms contain summary copy. No unapproved refund cutoff, overtime, extra-distance or airport waiting charge is published.
- The airport itinerary uses “Ask for a transfer quote” until the inconsistent US$20 sample fare is resolved. The airport widget clearly labels the central Colombo reference fare.
- `src/lib/analytics.ts` emits local custom events for integration testing. No GA4, Google Ads or Meta script is loaded. Connect approved measurement only after the notice, consent requirements and account access are settled; actual incoming WhatsApp messages remain the lead count.
- Indexing is disabled with metadata and `robots.txt`. Enable it, add the final business structured data, verify Search Console, and configure canonical domain/HTTPS/www redirection during the launch phase.
- Public contact details, real chauffeur profiles, external account integrations, payments, backend and deployment are not part of this frontend review.

Assets and their license/provenance notes are in `docs/asset-provenance.md`. All 3D code, dependencies and vehicle models have been removed.

### Google Maps location search and transfer pricing

Set `GOOGLE_MAPS_API_KEY` in `.env.local` and in the hosting environment, then redeploy. This is a server-only key; do not use a `NEXT_PUBLIC_` variable. Enable **Places API (New)** and **Routes API** in the same Google Cloud project with billing. Restrict the key to these APIs and, where hosting supports stable outbound addresses, server IPs (HTTP-referrer restrictions are for browser keys). Configure Google Cloud quotas for the public search and routing features.

Pickup and destination search is restricted to Sri Lanka. Select a Google suggestion in both fields for a point-to-point driving estimate. Suggestions come only from Google Maps; there are no predefined or custom suggestion options. Unselected text cannot produce an automatic route fare. Routes use driving distance, not straight-line distance; changing either location clears its previous route. A failed route shows the minimum as “From”, never as a calculated route fare. Airports retain their clearly labelled CMB–Central Colombo reference fares; day and multi-day allowances remain unchanged.

`src/lib/prices.ts` owns the versioned vehicle/rate configuration. Point-to-point fare is `max(minimum, transferBase + distanceKm * perKm)`, rounded to cents after calculation. The widget, editable review and WhatsApp payload use this same calculation. Google route distance is shown to one decimal place, but pricing uses the returned metre precision. Search requests are debounced; API responses are not cached. Autocomplete uses per-request billing, without session tokens.


Vercel troubleshooting: open the project’s **Settings → Environment Variables** and add `GOOGLE_MAPS_API_KEY` for Production and Preview. Use the key value without surrounding quotes, then redeploy the affected environment. Existing deployments do not pick up environment-variable changes. `.env.local` is ignored by Git and is not a deployment configuration.

If search still fails, inspect Vercel function logs for `[Google Maps]`: `MAPS_NOT_CONFIGURED` means the deployed environment lacks a non-empty key; `MAPS_ACCESS_DENIED` means Google returned 403 (check API enablement, billing and key restrictions); `MAPS_QUOTA_EXCEEDED` means Google returned 429; `MAPS_INVALID_REQUEST_OR_KEY` means Google returned 400; `MAPS_TIMEOUT` indicates a request timeout. Logs omit API keys and search locations.


## Deploy to Cloudflare Workers

This app has POST route handlers for Google Maps. Use a **Worker**, not Cloudflare Pages or the **Next.js (Static HTML Export)** preset. `next build` does not generate `out`, and pointing Pages at `.next` will not run the API endpoints.

The repository uses the OpenNext Cloudflare adapter to retain the existing Next.js application. Setup reference: https://opennext.js.org/cloudflare/get-started

1. Commit and push the Cloudflare setup (including `package-lock.json`, `wrangler.jsonc`, `open-next.config.ts`, and the updated scripts) to GitHub. Redeploying the old commit does not include these changes.
2. In Cloudflare **Workers & Pages**, create a **Worker** connected to `GeethSheheran/go-chauffeur`. Leave the failed Pages project separate; do not select the Static HTML Export preset.
3. Set the Worker name to `go-chauffeur`, production branch to `main`, and root directory to the repository root. Use these commands:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build:cloudflare` |
   | Deploy command | `npm run deploy:cloudflare` |
   | Output directory | Not applicable to Workers; Wrangler selects the worker and assets |

4. Add `GOOGLE_MAPS_API_KEY` as a **runtime Secret** under the Worker’s **Settings → Variables and Secrets**. A build-only variable or a variable in the old Pages project does not configure the Worker. Enable Places API (New), Routes API and billing in the Google project. No public/browser key is required.
5. Set `NEXT_PUBLIC_SITE_URL` to the final site URL in **Build variables and secrets**. Optional `NEXT_PUBLIC_WHATSAPP_NUMBER` and `NEXT_PUBLIC_CONTACT_EMAIL` overrides also belong there. Rebuild after changing public variables. Keep the Maps key out of `NEXT_PUBLIC_*` variables and source control.
6. Deploy. On the `workers.dev` URL, test the home page, images, Google location suggestions, point-to-point distance/fare and WhatsApp handoff. A missing Maps runtime secret produces `MAPS_NOT_CONFIGURED` in the Worker logs.
7. After testing, add your domain in the Worker’s **Settings → Domains & Routes**, then retire the old host when the new domain works.

Local validation:

```sh
npm ci
npm run build:cloudflare
npm run check:cloudflare
npm run preview:cloudflare
```

`check:cloudflare` packages the Worker without uploading it. `preview:cloudflare` serves the already-built Worker locally. Runtime secrets for local preview can be placed in ignored `.dev.vars`; never commit that file. The build removes private `.env` values from OpenNext’s generated environment module; configure them as runtime secrets instead. The `GOOGLE_MAPS_API_KEY` is read at request time. `npm run deploy:cloudflare` uploads the already-built output, so build first when deploying manually.

Cloudflare builds serve the original local image assets directly, without a paid image-transformation binding. The normal Next.js/Vercel build retains image optimization. There is no ISR or persistent data cache in this application, so this initial configuration does not provision R2. Keep the Worker name and `WORKER_SELF_REFERENCE` service name in `wrangler.jsonc` identical if renaming the project. Dashboard runtime variables are retained across deployments.
