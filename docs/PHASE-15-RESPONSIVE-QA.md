# Phase 15 — Responsive QA

## Scope

This phase verifies the existing frontend against the ShopSphere AI PRD. It does not add backend services or change the documented local/demo commerce behavior.

## Automated viewport smoke coverage

The Playwright suite checks the storefront home page and a representative product detail page at these viewport sizes:

| Profile | Viewport |
|---|---:|
| Mobile | 375 × 812 |
| Tablet | 768 × 1024 |
| Laptop | 1024 × 768 |
| Desktop | 1440 × 900 |
| Large desktop | 1920 × 1080 |

For each route and viewport, the test verifies that the main content is visible and that neither the document nor body width exceeds the viewport.

Run with:

```bash
npm run test:e2e
```

## Manual visual verification still required

The automated overflow smoke test is a regression guard, not a complete responsive-design sign-off. Manually inspect the following at all five viewport profiles:

- Header, navigation, search, account, cart and wishlist controls.
- Category navigation and product grid density (the PRD requires two columns on mobile and up to four or five on desktop).
- Filter controls, sorting, pagination and quick-view dialog.
- Product detail gallery, quantity controls and recommendation rails.
- Cart, coupon and checkout steps, including validation messages.
- Order history and tracking timeline.
- Login, registration, account preferences and review forms.
- Admin dashboard navigation, data tables, forms and dialogs.
- Shopping assistant entry point, conversation panel and inline product cards.
- Keyboard focus, text wrapping, touch target usability and absence of clipped content.

Record screenshots at a minimum of three representative widths for the final submission. Do not mark a manual item complete until it has actually been inspected.

## Acceptance status

- [ ] Automated viewport smoke test passes in GitHub Actions.
- [ ] Manual visual inspection completed at all five viewport profiles.
- [ ] Required mobile and desktop product-grid column counts verified.
- [ ] No clipped controls, overlapping content or unusable horizontal scrolling.
- [ ] Screenshots captured at three or more breakpoints.

The automated test only establishes the first item when CI passes. The remaining items require visual inspection and recorded evidence.
