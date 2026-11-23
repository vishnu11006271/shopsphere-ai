# Architecture (Phase 01)

## Runtime and boundaries
- Next.js App Router owns routing, layouts, metadata, and page composition.
- `features/` owns domain-specific UI, hooks, and feature logic.
- `services/` owns API access and business orchestration; it must not import React.
- Zustand owns durable client interaction state (cart, wishlist, checkout progress).
- TanStack Query owns remote data, caching, retries, and request deduplication.
- `components/` contains reusable presentational primitives only.

## Data source
DummyJSON is the primary product catalogue. Orders, reviews, recommendations, preferences, and analytics are local fixtures and browser-persisted state. DummyJSON write endpoints are not treated as durable storage.

## Pagination decision
Product discovery will use server pagination (`limit`/`skip`) with TanStack Query; search and filters will be reflected in URL query parameters. This avoids rendering an unbounded catalogue.

## Recommendation boundary
The planned contract is UI hook → recommendation service → provider interface → rule-based mock engine. Scoring and strategy selection stay outside React components so a future provider can replace the mock engine without changing the UI.

## Authentication and checkout scope
Authentication is a development-only, JWT-compatible local session. Checkout is simulated and must never request real card numbers, CVV, bank credentials, or UPI PINs. Admin writes are labeled as local/simulated.

## Currency note
DummyJSON product prices are source values, not INR-denominated prices. The current UI applies a clearly temporary display conversion for visual scaffolding only; before commerce flows are implemented, replace this with an explicit fixture-based INR price model and never imply the source API values are rupees.
