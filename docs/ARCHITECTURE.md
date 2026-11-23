# Architecture

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
Product discovery uses the complete bounded mock catalogue and client-side pagination after filters/sort. Search and filters are reflected in URL query parameters. Move to server-side faceted pagination when the data source grows beyond a small mock catalogue.

## Recommendation boundary
The planned contract is UI hook → recommendation service → provider interface → rule-based mock engine. Scoring and strategy selection stay outside React components so a future provider can replace the mock engine without changing the UI.

## Authentication and checkout scope
Authentication is a development-only, JWT-compatible local session. Checkout is simulated and must never request real card numbers, CVV, bank credentials, or UPI PINs. Admin writes are labeled as local/simulated.

## Currency note
DummyJSON product prices are source values, not INR-denominated prices. The current UI applies a clearly temporary display conversion for visual scaffolding only; it is not a live exchange rate or authoritative price model.

## Authentication (Phase 02)
- `features/auth/types.ts` defines customer/admin roles, local user record, public user projection, and expiring session shape.
- `features/auth/services/password.ts` uses browser Web Crypto PBKDF2-SHA-256 for local demo password hashes. This is a development convenience, not a replacement for server-side password hashing and identity controls.
- `features/auth/store/auth-store.ts` owns local registration, login, logout, and the seven-day mock session. The session and local user records are persisted under `shopsphere-auth` in local storage; no password is placed in the session object.
- `ProtectedRoute` waits for Zustand persistence hydration before checking the session and redirects guests to `/login`.
- This frontend-only role check is for demonstration and UX gating only. Production identity and authorization must be enforced by a trusted server.

## Product discovery (Phase 03)
- `features/products/services/product-service.ts` is the only layer calling DummyJSON product and category endpoints.
- `filter-products.ts` is a pure filter/sort pipeline; filter values use displayed INR units and are converted consistently for comparison.
- `DiscoveryPage` is reused by `/products`, `/search`, and `/category/[slug]`. It owns URL-synchronized filter state, client pagination, and comparison selection.
- Search suggestions are debounced by 350ms and include products and categories. Recent searches use a capped local browser history.
- Discovery cards expose wishlist, quick view, add-to-cart, and compare actions.

## Product detail (Phase 04)
- `/products/[id]` is the shareable PDP route; product detail and category data are fetched through `productService` and cached by TanStack Query.
- The PDP renders the catalogue image set with thumbnail navigation and a lightbox, core price/rating/stock metadata, optional variant controls, stock-clamped quantity, cart and Buy Now actions, description/specification tabs, and a local pincode delivery estimate.
- DummyJSON's current product shape does not guarantee variants. Variant controls therefore render only when a provider supplies the optional typed `variants` field; no unsupported size/color options are fabricated.
- The cart line now retains an optional selected variant and treats each variant as a separate line. This is a minimal PDP integration; Phase 05 owns the complete cart experience and failure handling.
- Related, Similar, and Frequently Bought Together rails are visibly marked previews. Their final strategy-backed orchestration belongs to Phase 07; current data uses category/tag/cross-category catalogue heuristics only.
- Review summary and available catalogue reviews are rendered from the product payload. Review creation, voting, moderation, and full review workflows remain in Phase 09.
- Delivery estimates are explicitly simulated locally; they do not call a carrier or validate serviceability.

## Quality and accessibility
- Detail views include loading skeletons, retryable error state, semantic headings, labelled controls, disabled stock actions, and keyboard-operable buttons/links.
- Product detail utility functions have unit tests; the PDP happy path and pincode estimate have Playwright coverage.
