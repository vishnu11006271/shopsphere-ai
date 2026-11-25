# Phase 10 — Quality, Accessibility, Performance and Release Readiness

## Purpose

Harden the completed ShopSphere AI experience without expanding the product scope or changing the explicitly local/demo nature of its commerce workflows.

## Implemented in this phase branch

- A global skip-to-main-content link, keyboard-visible focus styling and reduced-motion support.
- A consistent document title template, application name and referrer metadata.
- Baseline response headers: MIME sniffing protection, frame denial, referrer policy and restrictive browser permissions.
- An accessible application error boundary and a dedicated not-found page.
- Playwright smoke coverage for skip navigation and not-found recovery.
- CI now runs ESLint before type-check, unit tests, browser E2E and the production build.

## Accessibility acceptance checklist

- [x] A keyboard user can skip repeated navigation and reach the main application content.
- [x] Focus indicators remain visible for keyboard navigation.
- [x] Reduced-motion preferences disable smooth scrolling and substantially reduce animation/transition durations.
- [x] Error and not-found states provide meaningful headings and recovery actions.
- [ ] Audit all dialogs, drawers, menus and popovers for focus entry, focus containment, Escape behavior and focus restoration.
- [ ] Audit every form for persistent labels, instructions, inline errors and programmatic error associations.
- [ ] Verify representative customer and administrator journeys with keyboard only and a screen reader.
- [ ] Complete automated axe/WCAG checks and manual WCAG 2.2 AA review.

The completed items are implementation changes. Unchecked items require a full browser/manual audit and must not be reported as passed merely because the smoke tests pass.

## Performance acceptance checklist

- [ ] Run Lighthouse against production mode for home, discovery, PDP, cart and admin routes.
- [ ] Record LCP, INP, CLS, TTFB and transfer sizes on mobile and desktop.
- [ ] Inspect production bundle composition and identify oversized client components/dependencies.
- [ ] Verify product images use the Next.js image pipeline with explicit sizing and sensible loading priority.
- [ ] Confirm route-level loading boundaries and avoid blocking the initial render on non-critical recommendation rails.

Targets for field Core Web Vitals are LCP ≤ 2.5s, INP ≤ 200ms and CLS ≤ 0.1 at the 75th percentile. Lighthouse lab scores are diagnostic and are not a substitute for field data.

## Security and privacy boundaries

- The application is a frontend-only demonstration. Local role checks, browser storage and simulated orders are not trusted authorization or transactional controls.
- Do not store real passwords, payment credentials, access tokens or personal customer data in demo browser storage.
- Do not add real payment fields or claim payment-provider integration.
- Do not expose secrets through NEXT_PUBLIC_ variables or commit .env.local.
- Response headers are defense-in-depth; they do not turn the frontend-only authentication model into production security.
- Review dependency audit output and update dependencies deliberately; do not apply blind major-version upgrades.

## CI release gates

The pull request workflow must pass, in order:

1. npm run lint
2. npm run typecheck
3. npm run test
4. npm run test:e2e (Chromium)
5. npm run build

The workflow uses the repository's existing npm install behavior pending a verified lockfile regeneration. The package manifest and lockfile must be reconciled before switching CI to npm ci.

## Release decision

Do not describe the application as a production commerce platform. A release may be described as a deployable frontend demo after CI passes and the remaining manual accessibility, performance and hosting checks are recorded. Real multi-user commerce requires a trusted backend, server-side authorization, durable storage, payment integration and operational monitoring; these are outside this phase.
