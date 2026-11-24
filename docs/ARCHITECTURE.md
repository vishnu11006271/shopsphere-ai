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
- Phase 07 replaces the PDP rail previews with provider-backed Similar Products, Category-Based, Frequently Bought Together, and Personalized strategies; scoring remains outside the PDP component.
- Review summary and available catalogue reviews are rendered from the product payload. Review creation, voting, moderation, and full review workflows remain in Phase 09.
- Delivery estimates are explicitly simulated locally; they do not call a carrier or validate serviceability.

## Cart and wishlist (Phase 05)
- `/cart` and `/wishlist` are client-facing routes backed by persistent Zustand stores. Cart lines and saved-for-later lines retain last-known product snapshots; wishlist keeps product IDs plus last-known product snapshots for graceful offline rendering.
- Cart operations are keyed by product and optional variant ID, increment duplicate additions, clamp quantity to available stock, and keep saved-for-later items separate from active checkout totals.
- The cart refreshes the DummyJSON catalogue through TanStack Query. A successful response detects removed products, stock changes, and changed prices. Unavailable lines block checkout; changed prices show old/new values and require explicit acceptance before proceeding. If refresh fails, last-known line data stays visible with a retry banner.
- Coupon codes are local fixtures: `SPHERE10` and `WELCOME15` have minimum-subtotal and maximum-discount rules; `EXPIRED20` represents an expired code. Shipping is free at ₹2,499 or above, otherwise ₹99; simulated tax is 5% of subtotal after coupon discount. These are demonstration calculations, not tax or carrier quotes.
- Wishlist retains out-of-stock and removed products with explicit status, shows the current catalogue price when available, and disables Move to Cart when the item is unavailable. Move to Cart adds an available product to the cart and removes it from the wishlist.
- Phase 07 replaces the initial category-overlap suggestions with the provider-backed Cart-Based and Wishlist-Based strategies.
- Zustand persistence rehydrates on browser storage events so multiple tabs converge on the latest saved cart/wishlist snapshot; localStorage remains a demo persistence layer, not transactional server storage.

## Quality and accessibility
- Commerce pages provide loading, empty, retry, unavailable, and validation states; controls have accessible names and semantic regions.
- Unit tests cover cart calculations/coupon validation; Playwright covers add-to-cart, wishlist, and move-to-cart flows.


## Checkout and orders (Phase 06)
- `features/checkout/store/checkout-store.ts` owns the locally persisted checkout draft and order history. The draft records the active step, customer details, shipping address, delivery selection, mock payment method, and deterministic test outcome.
- `/checkout` is protected for signed-in customers and implements the PRD's six stages: Customer Information → Address → Delivery Method → Order Summary → Mock Payment → Confirmation. Customer and address fields are validated inline; the address and active step survive browser refresh.
- When a development session expires, the existing protected-route behavior redirects the shopper to sign-in with `next=/checkout`. The draft remains in local storage and is restored after re-authentication.
- Mock Card and Mock UPI are test-mode choices only. The UI never requests card numbers, CVV, bank credentials, or UPI PINs. A local success/decline switch exercises payment outcomes; no value is sent to a gateway. Cash on Delivery is also simulated.
- Successful checkout creates an order snapshot from cart line items and the selected delivery option, clears the active cart, and stores the order in local storage. Order History is available at `/orders`; each `/orders/[id]` detail view displays the PRD's six-state timeline: Order Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered.
- The tracking page exposes a clearly labeled local simulation control to advance the status and append a timestamp. This is not a real logistics integration. Order persistence is browser-local and is not shared across devices or users.
- Delivery choices use local simulated prices and ETAs. The cart's existing coupon discount and 5% illustrative tax are carried into the order summary; the selected delivery price replaces the cart's standard shipping value.


## Recommendation engine (Phase 07)
The recommendation implementation follows the PRD's enforced boundary: UI rail → `useRecommendations` hook → `recommendationService` → `RecommendationProvider` contract → `MockRecommendationProvider` → pure mock engine. React components never implement scoring or candidate filtering. The provider can be replaced later without changing the UI or hook contract. Other strategies (category, price, wishlist, cart and recently viewed) use the same typed generic service function.

### Signal assembly and persistence
- `features/recommendations/store/recently-viewed-store.ts` records every distinct PDP visit, newest first, with product snapshots in local storage; the homepage and header show previews while the dashboard exposes the full history.
- The hook assembles recently viewed products, recent search queries, category context, wishlist products, cart lines, and product snapshots resolved from the customer's local order history. Live catalogue data is read through the existing TanStack Query product cache.
- The engine derives the observed price band from recently viewed and carted products; brand affinity is derived from browsing frequency. Previous simulated purchases remain eligible for repeat/replenishment suggestions. Search text is matched against product title, brand, category and tags. Product category, tags and rating come from the catalogue.
- `recommendation-preferences-store.ts` lets a customer enable or disable each of the ten signal families shown in the dashboard. Resetting personalization clears recently viewed and search history and restores the default signal toggles; it intentionally does not delete cart, wishlist, or order data.
- `recommendation-analytics-store.ts` records local rail impressions, product clicks, and add-to-cart actions keyed by strategy and product ID. This is browser-local demo analytics, not an external analytics service.

### Nine strategies and placements
1. Recently Viewed — stored PDP history in most-recent-first order; homepage and header dropdown.
2. Similar Products — current PDP anchor, category, Jaccard tag overlap and price similarity; PDP.
3. Category-Based — current or dominant category interest; homepage, category discovery and PDP.
4. Price-Based — candidates ranked against the min/max price band inferred from recently viewed and carted products; homepage and search results.
5. Wishlist-Based — candidate similarity to saved products; wishlist page and homepage.
6. Cart-Based — candidate similarity to active cart products; cart page and checkout order summary.
7. Frequently Bought Together — deterministic category co-purchase fixture plus observed category co-occurrence in local order history; PDP. It does not invent a generic bundle when no association exists.
8. Trending Products — explicit mock product popularity, category popularity and rating-velocity values from `public/mock-data/recommendation-signals.json`; homepage.
9. Personalized For You — weighted blend of the available category, price, tags, rating, recently-viewed, wishlist, cart, previous-purchase and brand signals; homepage, customer dashboard and PDP. With no meaningful history, it falls back to the trending ranking.

### Auditable weighted scoring
Each of the seven PRD scoring components is normalized to 0–1. The chosen implementation weights, including an additional repeat-purchase term, sum to 1.00:
| Component | Weight |
|---|---:|
| Category match | 0.18 |
| Price similarity | 0.13 |
| Tag overlap (Jaccard) | 0.16 |
| Normalized product rating | 0.09 |
| Recently viewed relation | 0.13 |
| Wishlist relation | 0.11 |
| Cart relation | 0.11 |
| Previous-purchase relation | 0.09 |

The composite is the sum of the seven PRD-required component × weight terms plus a previous-purchase relation term (0.09), then a small brand-affinity bonus (up to 0.05) is added and the result is clamped to 0–1. Related-product, wishlist and cart rails require a minimum 0.25 relation score; price-band suggestions require at least 0.50 price similarity. These gates prevent weak, arbitrary matches from being labeled as recommendations. Similarity between a candidate and a signal product is 40% category match, 40% tag Jaccard overlap and 20% price similarity. Price similarity is 1.0 inside the observed min/max band and decays linearly outside it; for a PDP anchor it decays with relative price distance. Rating is product rating divided by five. Ties are resolved deterministically by rating and product ID. These weights are implementation choices permitted by PRD Section 6.2 and are intentionally documented for review.

### Failure behavior and transparency
- A recommendation query failure attempts the Trending strategy as a graceful fallback; if both the service and cached catalogue are unavailable, the rail hides instead of rendering an empty/broken container.
- On the homepage, a first-time visitor sees Featured and Trending products. Recently Viewed and Personalized rails are hidden until meaningful signals exist.
- Recommendation cards show a reason label, are clickable to the PDP, and record local impression/click/add-to-cart events.
- The dashboard's Recommendation Preferences panel lists the signals, observed history/price range and toggles. A customer can reset browsing/search personalization without losing commerce data.
- Mock popularity, rating-velocity and category co-purchase data are deterministic local fixtures. They are not claimed as real sales or popularity analytics, and no paid API or LLM is used.
