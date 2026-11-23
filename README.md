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
Phase 01 foundation is merged to `main`. Phase 02 authentication is implemented on `feature/authentication`: local customer registration, login, PBKDF2 password derivation, seven-day mock sessions persisted in browser storage, logout, and role-aware protected routes for account, customer dashboard, checkout, orders, and admin. The remaining PRD modules (full discovery/search, PDP, cart/checkout behavior, wishlist, order lifecycle, reviews, recommendation strategies, assistant, and admin operations) are planned as subsequent feature branches.

## Scope and safety
- Checkout is a simulation only; never enter real payment information.
- Assistant and recommendation engine are rule-based/local; no paid LLM API is used.
- Admin writes and analytics are local/simulated and will be labeled as such.
- Do not commit `.env.local`, credentials, or secrets.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the initial architecture decisions.
