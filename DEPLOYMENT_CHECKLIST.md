# SwarmSync Deployment Checklist

**Date Prepared:** 2026-01-03
**Prepared By:** Cora (QA Auditor)
**Target Environment:** Production (https://swarmsync.ai)
**Deployment Window:** To be scheduled

---

## 1. Change Summary

This deployment includes critical bug fixes, accessibility improvements, and UI enhancements identified during the comprehensive QA audit.

### 1.1 Critical Changes (Must Deploy)

| Priority          | File                                                     | Change Description                                                                     | Impact                                    |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| **P0 - CRITICAL** | `apps/web/src/components/agents/new-agent-form.tsx`      | Fixed authentication state management - switched from `useAuthStore` to `useAuth` hook | **Unblocks agent creation for all users** |
| **P1 - HIGH**     | `apps/web/src/components/workflows/workflow-builder.tsx` | Pre-filled Creator ID with authenticated user UUID                                     | Improved UX for workflow creation         |

### 1.2 Accessibility Fixes (Already Committed)

| File                                                           | Change Description                                                                                 | WCAG Compliance |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| `apps/web/src/components/layout/navbar.tsx`                    | Added ARIA labels, keyboard navigation (Escape key), aria-expanded/controls, min-touch-target 44px | WCAG 2.2 AA     |
| `apps/web/src/components/swarm/GovernanceTrust.tsx`            | Added `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `tabpanel`                 | WCAG 2.2 AA     |
| `apps/web/src/components/swarm/TechnicalArchitecture.tsx`      | Added `role="group"`, `aria-label`, `aria-pressed` for component cards                             | WCAG 2.2 AA     |
| `apps/web/src/components/swarm/VelocityGapVisualization.tsx`   | Added `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `tabpanel`                 | WCAG 2.2 AA     |
| `apps/web/src/components/swarm/CompetitiveDifferentiation.tsx` | Added table `caption` with `sr-only`, proper `scope="col"` on headers                              | WCAG 2.2 AA     |

### 1.3 UI/UX Enhancements (Already Committed)

| File                                             | Change Description                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `apps/web/src/app/page.tsx`                      | Hero section improvements, A2A flow diagram, CTA button enhancements |
| `apps/web/src/components/swarm/TrustSignals.tsx` | New usage metrics counter bar, testimonials with quantified results  |
| `apps/web/src/components/swarm/HeroMetrics.tsx`  | New hero metrics display component                                   |

---

## 2. Files Modified (Complete List)

### 2.1 Uncommitted Changes (Must Commit)

```
M  apps/web/src/components/agents/new-agent-form.tsx
M  apps/web/src/components/workflows/workflow-builder.tsx
```

### 2.2 Recently Committed Changes (Since Audit Started)

```
apps/web/src/app/page.tsx
apps/web/src/components/layout/navbar.tsx
apps/web/src/components/swarm/CompetitiveDifferentiation.tsx
apps/web/src/components/swarm/GovernanceTrust.tsx
apps/web/src/components/swarm/TechnicalArchitecture.tsx
apps/web/src/components/swarm/TrustSignals.tsx
apps/web/src/components/swarm/VelocityGapVisualization.tsx
apps/web/src/components/swarm/HeroMetrics.tsx
apps/web/src/components/brand/brand-logo.tsx
apps/web/src/components/demo/a2a-runner.tsx
apps/web/src/app/demo/a2a/page.tsx
apps/web/src/app/api/health/route.ts
apps/web/src/app/(marketplace)/console/settings/page.tsx
```

---

## 3. Pre-Deployment Verification

### 3.1 Local Build Verification

```bash
# Run from project root
cd apps/web
npm run build
```

**Expected Output:**

- All TypeScript compilation passes
- No ESLint errors
- All pages compile successfully
- Build completes without warnings

**Last Known Good Build:** 1m 46s (successful)

### 3.2 Test Suite Verification

```bash
# Run unit tests
npm run test

# Run E2E tests (if available)
npm run test:e2e
```

**Required:** All tests must pass before deployment.

### 3.3 Console Error Check

1. Start development server: `npm run dev`
2. Open browser DevTools (F12)
3. Navigate to each modified page
4. Verify NO console errors

**Pages to Check:**

- [ ] `/` (Homepage)
- [ ] `/login`
- [ ] `/agents` (Agent listing)
- [ ] `/agents/new` (Agent creation)
- [ ] `/console/workflows` (Workflow builder)
- [ ] `/demo/a2a` (A2A Demo)

### 3.4 Accessibility Verification

```bash
# Run Lighthouse accessibility audit
npx lighthouse https://localhost:3000 --only-categories=accessibility --output=html

# Or use axe-core
npm run test:a11y
```

**Required Scores:**

- Accessibility: >= 90
- Best Practices: >= 85

### 3.5 Code Review Checklist

- [ ] No console.log statements in production code
- [ ] No hardcoded sensitive data (API keys, passwords)
- [ ] No TODO comments blocking functionality
- [ ] TypeScript strict mode passes
- [ ] All imports are valid and used

---

## 4. Database Changes Applied

### 4.1 Changes Already Applied to Production Database

| Change                     | Table                    | Details                                                                                                  | Applied By | Date       |
| -------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| User added to organization | `OrganizationMembership` | User `e9b91865-be00-4b76-a293-446e1be9151c` added as OWNER to org `93209c61-e6ea-4d9b-b2fa-126f8bcb2d6e` | Hudson     | 2026-01-03 |

### 4.2 SQL Verification Queries

Run these queries to verify database state:

```sql
-- Verify user membership
SELECT om.*, u.email, u."displayName", o.name as org_name
FROM "OrganizationMembership" om
JOIN "User" u ON u.id = om."userId"
JOIN "Organization" o ON o.id = om."organizationId"
WHERE om."userId" = 'e9b91865-be00-4b76-a293-446e1be9151c';

-- Expected: role = 'OWNER', org_name = 'SwarmSync'
```

### 4.3 No Pending Database Migrations

All schema changes have been applied. No new migrations required for this deployment.

---

## 5. Deployment Steps

### 5.1 Commit Pending Changes

```bash
# Stage the uncommitted changes
git add apps/web/src/components/agents/new-agent-form.tsx
git add apps/web/src/components/workflows/workflow-builder.tsx

# Commit with descriptive message
git commit -m "fix(agents): fix authentication state management in new-agent-form

- Switch from useAuthStore to useAuth hook for proper session hydration
- Add loading state while authentication is being verified
- Pre-fill Creator ID in workflow builder for authenticated users

Fixes: Agent creation blocked for all users due to auth state race condition
Tested: Local build passes, manual testing confirmed"
```

### 5.2 Push to Remote

```bash
git push origin main
```

### 5.3 Monitor CI/CD Pipeline

1. Navigate to GitHub Actions or your CI/CD dashboard
2. Monitor build status
3. Verify all checks pass:
   - [ ] TypeScript compilation
   - [ ] ESLint
   - [ ] Unit tests
   - [ ] Build artifacts generated

### 5.4 Deploy to Production

**For Netlify/Vercel (Auto-deploy from main):**

- Push triggers automatic deployment
- Monitor deployment logs
- Wait for "Production" badge

**For Manual Deployment:**

```bash
npm run build
npm run deploy:production
```

---

## 6. Post-Deployment Verification

### 6.1 Smoke Tests (Immediate - First 5 Minutes)

| Test                  | URL                          | Expected Result                         | Status |
| --------------------- | ---------------------------- | --------------------------------------- | ------ |
| Homepage loads        | `https://swarmsync.ai/`      | Hero section visible, no console errors | [ ]    |
| Login page accessible | `https://swarmsync.ai/login` | Form renders, no errors                 | [ ]    |
| Navigation works      | All nav links                | Links navigate correctly                | [ ]    |
| Mobile responsive     | All pages at 375px           | Layout adapts correctly                 | [ ]    |

### 6.2 Authentication Flow Tests

**Test Account:**

- Email: `rainking6693@gmail.com`
- Password: `Hudson1234%`

| Step | Action                       | Expected Result                                   | Status |
| ---- | ---------------------------- | ------------------------------------------------- | ------ |
| 1    | Navigate to `/login`         | Login form displays                               | [ ]    |
| 2    | Enter credentials and submit | Redirect to `/console/overview`                   | [ ]    |
| 3    | Verify session               | User shown as "Ben Stone"                         | [ ]    |
| 4    | Navigate to `/agents/new`    | **Agent creation form displays (not auth error)** | [ ]    |
| 5    | Fill basic details           | Form accepts input                                | [ ]    |
| 6    | Complete agent creation      | Success message, agent created                    | [ ]    |

### 6.3 Workflow Creation Tests

| Step | Action                           | Expected Result           | Status |
| ---- | -------------------------------- | ------------------------- | ------ |
| 1    | Navigate to `/console/workflows` | Workflow form displays    | [ ]    |
| 2    | Check Creator ID field           | **Pre-filled with UUID**  | [ ]    |
| 3    | Add workflow steps               | Steps added correctly     | [ ]    |
| 4    | Submit workflow                  | Success message displayed | [ ]    |

### 6.4 Accessibility Verification

| Test                | Tool             | Expected Result                      | Status |
| ------------------- | ---------------- | ------------------------------------ | ------ |
| Keyboard navigation | Manual (Tab key) | All interactive elements focusable   | [ ]    |
| Screen reader       | NVDA/VoiceOver   | ARIA labels announced correctly      | [ ]    |
| Mobile menu         | Touch device     | Opens/closes correctly, Escape works | [ ]    |
| Touch targets       | Manual           | All buttons >= 44x44px               | [ ]    |

### 6.5 Mobile Responsiveness

| Viewport          | Page             | Expected Result              | Status |
| ----------------- | ---------------- | ---------------------------- | ------ |
| 375px (iPhone SE) | Homepage         | Proper layout, readable text | [ ]    |
| 414px (iPhone 12) | Agent creation   | Form usable                  | [ ]    |
| 768px (iPad)      | Workflow builder | Two-column layout            | [ ]    |
| 1024px (Desktop)  | All pages        | Full desktop layout          | [ ]    |

---

## 7. Rollback Procedure

### 7.1 Immediate Rollback (< 5 minutes)

If critical issues are discovered:

```bash
# Revert to previous deployment
# For Netlify:
netlify rollback

# For Vercel:
vercel rollback

# For manual:
git revert HEAD
git push origin main
```

### 7.2 Selective Rollback

If only specific files need reverting:

```bash
# Revert specific files
git checkout HEAD~1 -- apps/web/src/components/agents/new-agent-form.tsx
git checkout HEAD~1 -- apps/web/src/components/workflows/workflow-builder.tsx
git commit -m "revert: rollback agent form and workflow builder changes"
git push origin main
```

### 7.3 Database Rollback (If Needed)

```sql
-- Remove organization membership (if needed to rollback)
DELETE FROM "OrganizationMembership"
WHERE "userId" = 'e9b91865-be00-4b76-a293-446e1be9151c'
  AND "organizationId" = '93209c61-e6ea-4d9b-b2fa-126f8bcb2d6e';

-- Note: This will revoke the user's access
```

### 7.4 Rollback Decision Criteria

**Roll back immediately if:**

- [ ] Login flow broken
- [ ] Homepage not loading
- [ ] Critical console errors in production
- [ ] Agent creation worse than before (complete failure)
- [ ] 500 errors on any main page

**Continue monitoring if:**

- [ ] Minor styling issues
- [ ] Non-critical features affected
- [ ] Performance slightly degraded

---

## 8. Test Credentials and Data

### 8.1 Test User

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| Email           | `rainking6693@gmail.com`               |
| Password        | `Hudson1234%`                          |
| User ID         | `e9b91865-be00-4b76-a293-446e1be9151c` |
| Organization    | SwarmSync                              |
| Organization ID | `93209c61-e6ea-4d9b-b2fa-126f8bcb2d6e` |
| Role            | OWNER                                  |

### 8.2 Test Agents (Production)

Use these approved agents for workflow testing:

| Agent Name      | Agent ID                               |
| --------------- | -------------------------------------- |
| Content Agent   | `92c99e08-d86e-4ef7-9f04-ad5763e3c330` |
| SEO Agent       | `1e48bfef-c760-4feb-84e4-7029ef117689` |
| Marketing Agent | `7f8b2409-f2aa-42aa-a87c-cb0f00642d07` |
| Support Agent   | `ca1d7137-e2fb-47ae-86ad-5dd7d98b39db` |
| Analyst Agent   | `17da61d5-47f5-4808-be53-4e172bb94b3a` |
| Security Agent  | `c99bb5d4-350b-433f-9338-a93ab791897f` |
| Finance Agent   | `8c1684e8-a752-48a8-91d7-60f9c910599b` |
| Email Agent     | `63468a6e-1b26-4556-baf4-faac542b2548` |

### 8.3 Sample Workflow JSON

```json
{
  "name": "Post-Deployment Test Workflow",
  "description": "Two-stage content and SEO workflow for deployment verification",
  "budget": 50,
  "steps": [
    {
      "agentId": "92c99e08-d86e-4ef7-9f04-ad5763e3c330",
      "jobReference": "content_generation",
      "budget": 25
    },
    {
      "agentId": "1e48bfef-c760-4feb-84e4-7029ef117689",
      "jobReference": "seo_optimization",
      "budget": 25
    }
  ]
}
```

---

## 9. Change Dependencies

### 9.1 Deployment Order

Changes should be deployed in this order (all can be deployed together):

1. **new-agent-form.tsx** (Critical - enables agent creation)
2. **workflow-builder.tsx** (High - UX improvement)
3. All other committed changes (already in main branch)

### 9.2 External Dependencies

| Dependency       | Required Version | Status              |
| ---------------- | ---------------- | ------------------- |
| NextAuth         | Current          | No changes required |
| React Query      | Current          | No changes required |
| Zustand          | Current          | No changes required |
| Supabase/Neon DB | Current          | Already configured  |

### 9.3 Environment Variables

No new environment variables required for this deployment.

Existing required variables (verify in production):

- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`

---

## 10. Monitoring and Alerts

### 10.1 Key Metrics to Watch

| Metric                    | Normal Range | Alert Threshold |
| ------------------------- | ------------ | --------------- |
| Page Load Time (Homepage) | < 3s         | > 5s            |
| API Response Time         | < 500ms      | > 1s            |
| Error Rate                | < 0.1%       | > 1%            |
| Auth Success Rate         | > 99%        | < 95%           |

### 10.2 Error Monitoring

Check these dashboards post-deployment:

- [ ] Sentry (Error tracking)
- [ ] Datadog (Performance)
- [ ] Netlify/Vercel (Build logs)
- [ ] Browser console (Manual check)

### 10.3 User Feedback Channels

Monitor for user reports:

- [ ] Support tickets
- [ ] Discord/Slack channels
- [ ] GitHub issues
- [ ] Social media mentions

---

## 11. Deployment Sign-Off

### Pre-Deployment Approval

| Role          | Name   | Approval | Date |
| ------------- | ------ | -------- | ---- |
| QA Lead       | Cora   | [ ]      |      |
| Dev Lead      | Hudson | [ ]      |      |
| Product Owner |        | [ ]      |      |

### Post-Deployment Verification

| Check                   | Verified By | Date | Status |
| ----------------------- | ----------- | ---- | ------ |
| Smoke tests pass        |             |      | [ ]    |
| Auth flow works         |             |      | [ ]    |
| Agent creation works    |             |      | [ ]    |
| Workflow creation works |             |      | [ ]    |
| No new errors in logs   |             |      | [ ]    |
| Performance acceptable  |             |      | [ ]    |

---

## 12. Summary

### Critical Fix Deployed

**Issue:** Agent creation was completely blocked for all users on production due to authentication state race condition.

**Root Cause:** The `new-agent-form.tsx` component used `useAuthStore` directly instead of the `useAuth` hook, causing the client-side auth state to not be hydrated on initial page load.

**Fix:** Changed to use `useAuth()` hook which properly hydrates the auth state from the NextAuth session, with an added loading state.

### Expected Outcome After Deployment

1. Users can successfully create agents without seeing "Authentication Required" error
2. Workflow builder has Creator ID pre-filled for logged-in users
3. All accessibility improvements are live
4. No regression in existing functionality

---

> **Launch Readiness Score**: 8/10
>
> **Recommended Fix Order**:
>
> 1. Commit and push new-agent-form.tsx fix (CRITICAL)
> 2. Commit and push workflow-builder.tsx enhancement (HIGH)
> 3. Verify CI/CD pipeline passes
> 4. Deploy to production
> 5. Execute post-deployment verification checklist
> 6. Monitor for 30 minutes for any issues

---

**Document Status:** Ready for deployment team review
**Last Updated:** 2026-01-03
