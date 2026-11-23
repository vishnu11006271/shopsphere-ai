# ShopSphere AI

Personalized shopping, powered by transparent signals. This repository implements the approved ShopSphere AI PRD as a frontend-only e-commerce application.

## Stack
- Next.js App Router + React + TypeScript
- Tailwind CSS and shadcn/ui-compatible accessible primitives
- Zustand for client state; TanStack Query for server/cache state
- DummyJSON for product catalogue data; local JSON fixtures for orders, reviews, recommendations, preferences, and analytics
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

## Current implementation status
Phase 01 foundation and Phase 02 authentication are merged to `main`. Phase 03 product discovery is implemented on `feature/product-discovery`: DummyJSON catalogue/category/search integration, responsive product grid, combined filters, sorting, client pagination, debounced product/category suggestions, recent searches, URL-synchronized search/filter state, wishlist toggles, quick view, and 2–4 product comparison. Product detail, full cart/checkout, order lifecycle, reviews, recommendation strategies, assistant, and admin operations remain planned phases.

## Scope and safety
- Checkout is a simulation only; never enter real payment information.
- Assistant and recommendation engine are rule-based/local; no paid LLM API is used.
- Admin writes and analytics are local/simulated and will be labeled as such.
- Do not commit `.env.local`, credentials, or secrets.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the initial architecture decisions.
