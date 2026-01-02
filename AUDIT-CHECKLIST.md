# SwarmSync Full Site Audit Checklist

Cover every screen, flow, and UI/UX state. Mark ✅ when verified and document issues in `AUDIT-ISSUES.md`.

## General / Global

- [ ] Layouts: `MarketingLayout`, `AppPageShell`, console layout render without overflow/scroll keys
- [ ] Fonts / colors use tokens (`--surface`, `--accent`, `.surface-card`, etc.)
- [ ] Navbar links (Agents, Dashboard, Console, Sign out) all route correctly
- [ ] Footer links, copyright & external links valid
- [ ] Logo assets load and are the latest brand file
- [ ] Meta tags & structured data contain updated logo/description
- [ ] Responsive breakpoints verified (desktop, tablet, mobile)

## Public Marketing Pages

For each page (homepage, about, platform, resources, pricing, use cases, methodology, security, providers)

- [ ] Wrapped in `MarketingLayout`
- [ ] Hero content matches copy/specs
- [ ] CTA buttons/link text correct + lead to right URLs
- [ ] Grid/cards use `.surface-card` token styling
- [ ] FAQ or info sections function (accordion/work as intended)
- [ ] Live agents link navigates to `/demo/a2a`
- [ ] Logo/header uses new purple-black asset
- [ ] SEO structured data points to updated logo
- [ ] All internal links (anchor, `See live A2A demo`, `View Pricing`, etc.) work
- [ ] Videos/media (if any) load and play/pause correctly
- [ ] Forms (pricing contact, provider application) submit and show confirmation

## Demo Flows

- [ ] `/demo/a2a`: Default agents load, fallback message if fetch fails, "Run Live Demo" button visible
- [ ] Run demo: timeline steps update, logging area populates with server-run narrative
- [ ] Share link generated & copy button works
- [ ] SSE/polling logs updated with storyboard data
- [ ] `/demo/workflows`: Workflow builder UI loads templates, JSON editor accessible
- [ ] "Run workflow" button disabled for logged-out users (shows "Sign up" prompt)
- [ ] Workflow templates (Research→Summary, Support→Draft, SEO→Plan) appear
- [ ] Copy/Download JSON controls function

## Console / Logged-in Experience

- [ ] `/console/overview`: layout wrapped by `AppPageShell`, sidebar visible, nav links route
- [ ] Console header links (billing, agents, workflows, etc.) navigate correctly
- [ ] `Next Steps` card content renders, CTA color updated
- [ ] Outcomes/test results pages load without 404 (show “coming soon” if placeholder)
- [ ] Logs underline clickable components and data lines exist/scrollable
- [ ] `Test Library`: modal overlays render, search works, "Run on agent..." buttons trigger flow
- [ ] Creating new agent (`/agents/new`):
  - [ ] Guided onboarding banner shows for `provider_beta` role
  - [ ] Form inputs (name, desc, schema, budgets) validate & submit
  - [ ] Input schema boxes have readable text color
  - [ ] AP2 endpoint/IO schema saved and editable
- [ ] Create agent: uploads config works, form persists values
- [ ] Billing page: pricing cards link to correct Stripe checkout plans
- [ ] Wallet page shows balances & history
- [ ] Settings > API keys/limits load user data
- [ ] Sidebar link “Home” works

## Authentication / Invite Flow

- [ ] `/auth/invite/[token]`: token validation, Accept & Continue flow redirects to `/agents/new`
- [ ] Invalid/expired token -> `/invite/invalid` message
- [ ] Invite user receives `provider_beta` role and console access upon acceptance
- [ ] `/agents/new` rejects non-invite users with access message
- [ ] Admin invite endpoint (`/api/admin/invites`) generates hashed token
- [ ] Invite consumption logs `used_at` + prevents reuse
- [ ] Magic-link/session creation works (Supabase/NextAuth)

## Payment & Market Transactions

- [ ] Marketplace listings show badges, test pass rate, latency, certification statuses (Quality info)
- [ ] Agent detail page shows Quality Testing section with pass rate, latency, verified outcomes, recent results
- [ ] Agent negotiation run (A2A) ensures escrow, service agreement, verification statuses displayed
- [ ] Billing takes platform fee split info, ensures payers (buyer/seller) see correct info
- [ ] Stripe checkout plans point to correct IDs (per new pricing tiers)
- [ ] Wallet transactions record credits usage & fraudulent behavior blocked

## API & Integrations

- [ ] `/api/provider-apply` posts to email/Supabase/logs with correct payload
- [ ] Provider application confirmation page shows next steps
- [ ] `/api/demo`, `/api/marketplace` endpoints respond without errors
- [ ] SDK docs/examples (resources) reference correct API URLs & brand tokens
- [ ] `StructuredData` logo references updated asset

## Testing & Accessibility

- [ ] Run Lighthouse/performance audit (score > 90)
- [ ] Keyboard navigation through nav, modals, cards
- [ ] Color contrast meets WCAG 2.1 AA (primary text vs background)
- [ ] Form field placeholders readable (dark inputs use silver text)
- [ ] `aria` labels present on interactive elements (buttons, modals)
- [ ] Console/log cards accessible (focus states, labels)

## Deployment & CI

- [ ] Netlify/railway builds succeed with new assets (no Git LFS issues)
- [ ] `package-lock.json` matches `package.json` dependencies
- [ ] `next.config` uses valid module format (e.g., `.cjs` or ESM)
- [ ] `tailwind.config` includes fonts/tokens described
- [ ] Updated logos are inside `apps/web/public/logos/` and referenced by code w/o extra files
- [ ] New `MarketingLayout`/`AppPageShell` imported wherever needed

## Reporting

- [ ] Save final pass results in `AUDIT-ISSUES.md`
- [ ] Highlight any blockers (e.g., API errors, missing assets, broken flows)

Repeat all relevant sections after any design/system change to ensure nothing regresses. Document step-by-step reproduction instructions for any failing checklist item.
