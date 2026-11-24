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
- The cart line retains an optional selected variant and treats each variant as a separate line.
- Related, Similar, and Frequently Bought Together rails are visibly marked previews. Their final strategy-backed orchestration belongs to Phase 07; current data uses category/tag/cross-category catalogue heuristics only.
- Review summary and available catalogue reviews are rendered from the product payload. Review creation, voting, moderation, and full review workflows remain in Phase 09.
- Delivery estimates are explicitly simulated locally; they do not call a carrier or validate serviceability.

## Cart and wishlist (Phase 05)
- `/cart` and `/wishlist` are client-facing routes backed by persistent Zustand stores. Cart lines and saved-for-later lines retain last-known product snapshots; wishlist keeps product IDs plus last-known product snapshots for graceful offline rendering.
- Cart operations are keyed by product and optional variant ID, increment duplicate additions, clamp quantity to available stock, and keep saved-for-later items separate from active checkout totals.
- The cart refreshes the DummyJSON catalogue through TanStack Query. A successful response detects removed products, stock changes, and changed prices. Unavailable lines block checkout; changed prices show old/new values and require explicit acceptance before proceeding. If refresh fails, last-known line data stays visible with a retry banner.
- Coupon codes are local fixtures: `SPHERE10` and `WELCOME15` have minimum-subtotal and maximum-discount rules; `EXPIRED20` represents an expired code. Shipping is free at ₹2,499 or above, otherwise ₹99; simulated tax is 5% of subtotal after coupon discount. These are demonstration calculations, not tax or carrier quotes.
- Wishlist retains out-of-stock and removed products with explicit status, shows the current catalogue price when available, and disables Move to Cart when the item is unavailable. Move to Cart adds an available product to the cart and removes it from the wishlist.
- Cart and wishlist suggestion rails are simple category-overlap previews with signal-transparent headings. Full strategy scoring/orchestration remains Phase 07 scope.
- Zustand persistence rehydrates on browser storage events so multiple tabs converge on the latest saved cart/wishlist snapshot; localStorage remains a demo persistence layer, not transactional server storage.

## Quality and accessibility
- Commerce pages provide loading, empty, retry, unavailable, and validation states; controls have accessible names and semantic regions.
- Unit tests cover cart calculations/coupon validation; Playwright covers add-to-cart, wishlist, and move-to-cart flows.
