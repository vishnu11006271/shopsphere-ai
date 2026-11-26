# ShopSphere AI

Personalized shopping, powered by transparent signals. This repository implements the approved ShopSphere AI PRD as a frontend-only e-commerce application.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS and shadcn/ui-compatible accessible primitives
- Zustand for client state; TanStack Query for server/cache state
- DummyJSON for product catalogue data; local JSON fixtures for commerce and analytics
- Vitest, React Testing Library, and Playwright

## Requirements

Node.js 22+ and npm. No paid API keys or backend services are required.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Install the Playwright browser once with npx playwright install chromium.

## Implementation status

- Phase 01: foundation and architecture.
- Phase 02: local/JWT-compatible development authentication.
- Phase 03: product discovery, filters, sorting, URL-synced search, wishlist toggles, quick view, and comparison.
- Phase 04: product detail route, gallery/lightbox, optional variants, stock-aware quantity, cart/Buy Now, description/specification tabs, and simulated delivery estimator.
- Phase 05: persistent cart and wishlist, stock and catalogue validation, price-change confirmation, coupons, simulated totals, save-for-later, move-to-wishlist/cart, and initial cart/wishlist recommendation previews (replaced by the full Phase 07 engine).
- Phase 06: six-step simulated checkout, local order creation/history, and an interactive delivery tracking timeline.
- Phase 07: layered rule-based recommendation engine with all nine strategies, weighted scoring, transparent signal reasons, local preference controls, full recently viewed history, and local engagement analytics.
- Phase 08: persistent rule-based shopping assistant with structured category/price/rating intent extraction, contextual refinements (including budget expansion), similarity requests, inline product cards, and clarifying fallbacks.
- Phase 09: local admin operations dashboard (overview, catalogue/category management, order status simulation, review moderation, recommendation analytics) and customer review workflows (submission, sorting, rating distribution, voting, verified-purchase indicator, edit/remove in dashboard). Admin catalogue overrides are reflected in storefront catalogue and product detail reads. Search and category discovery continue to use their dedicated DummyJSON endpoints while merging local admin changes. Verified-purchase labels are computed from matching local order records. The review form waits for local order-history hydration before accepting submissions.

## Scope and safety

- Checkout is a simulation only; never enter real payment information. Mock Card and Mock UPI never request card numbers, CVV, bank credentials, or UPI PINs. Test success/decline outcomes are local UI state only.
- Checkout progress and orders are persisted in browser local storage. Session expiry redirects to sign-in and returns to the saved checkout step after re-authentication; this is not server-side transactional storage.
- Shipping, tax, and coupon behavior in the cart are deterministic local simulations.
- Assistant and recommendation engine are rule-based/local; no paid LLM or recommendation API is used. The assistant is explicitly described as rule-based in its UI and technical documentation. Chat history and refinement context remain in browser memory for the current session and are not synced to an account.
- Admin writes and analytics are local/simulated and will be labeled as such.
- DummyJSON prices are not INR. The displayed conversion is illustrative only, not a live exchange rate.
- Do not commit .env.local, credentials, or secrets.

See docs/ARCHITECTURE.md for architecture and documented trade-offs.
