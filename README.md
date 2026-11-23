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
Install the Playwright browser once with `npx playwright install chromium`.

## Implementation status
- Phase 01: foundation and architecture.
- Phase 02: local/JWT-compatible development authentication.
- Phase 03: product discovery, filters, sorting, URL-synced search, wishlist toggles, quick view, and comparison.
- Phase 04: product detail route, gallery/lightbox, optional variants, stock-aware quantity, cart/Buy Now, description/specification tabs, simulated delivery estimator, review display, and clearly labeled recommendation rail previews.
- Remaining: full cart/checkout/order lifecycle, nine recommendation strategies, conversational assistant, admin operations, and review submission workflows.

## Scope and safety
- Checkout is a simulation only; never enter real payment information.
- Assistant and recommendation engine are rule-based/local; no paid LLM API is used.
- Admin writes and analytics are local/simulated and will be labeled as such.
- DummyJSON prices are not INR. The displayed conversion is illustrative only, not a live exchange rate.
- Do not commit `.env.local`, credentials, or secrets.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for architecture and documented trade-offs.
