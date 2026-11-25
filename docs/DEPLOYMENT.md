# Deployment Guide

ShopSphere AI is a frontend-only Next.js demo. It can be deployed as a web application, but deployment does not convert its local authentication, checkout, admin, review or analytics features into production services.

## Runtime requirements

- Node.js 22+
- npm
- No paid API keys or backend services are required for the current demo.
- Product catalogue requests use DummyJSON; commerce and analytics data are local fixtures/browser storage.

## Local production verification

\`\`\`bash
npm install
npm run lint
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
npm run start
\`\`\`

Open the local production server at http://localhost:3000.

## Hosting

Use a Node.js-compatible Next.js host. Configure the project root as the repository root, the install command as npm install, the build command as npm run build, and the start command as npm run start when the host requires an explicit start command.

Set the Node runtime to 22 or newer. No environment variables are currently required for the public demo. If a future integration introduces secrets, configure them in the hosting provider's secret manager; never commit them or expose them through client-prefixed variables.

## Before publishing

- Confirm all required GitHub Actions checks pass on the exact commit being deployed.
- Verify the production build and smoke-test the deployed URL.
- Test keyboard navigation, reduced motion, mobile layout and representative screen-reader journeys.
- Run Lighthouse on the deployed production build and record Core Web Vitals.
- Confirm the host serves HTTPS and review the configured response headers.
- Confirm no real customer, payment or authentication secrets are present in fixtures or browser storage.
- Configure a canonical public origin before adding canonical metadata or sitemap URLs; the repository does not assume a production domain.

## Demo limitations

- Authentication and role checks run in the browser and are for demonstration only.
- Cart, checkout drafts, orders, reviews, votes, admin catalogue changes and analytics persist locally in the browser and do not synchronize between devices.
- Payment and delivery outcomes are simulated. No payment credentials are collected and no carrier is contacted.
- Recommendations and the shopping assistant are deterministic/rule-based mock experiences.
- DummyJSON prices are not INR; the storefront's displayed conversion is illustrative, not a live exchange rate.

A real commerce launch requires backend identity and authorization, durable shared storage, server-side validation, payment-provider integration, fraud controls, observability, backups and an operational incident process. Those capabilities are not part of this frontend deployment.
