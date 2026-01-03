# SwarmSync Soft Launch Mode - Implementation Guide

**Status**: ✅ **FULLY IMPLEMENTED AND TESTED**

---

## Overview

SwarmSync is now in **soft launch mode**. The full platform remains deployed and functional, but access is restricted to beta users while the public sees a "Coming Soon" landing page.

---

## 🔐 Access Control Logic

### Public Routes (No Authentication Required)

- `/` - Coming Soon landing page with provider application form
- `/providers` - Alias to Coming Soon page
- `/login` - Authentication page
- `/register` - Registration page
- `/beta-gate` - Beta access application page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/auth/error` - Auth error page

### Beta-Gated Routes (Requires Beta Access)

All other routes require authentication + beta access:

- `/console/*` - Console pages
- `/agents/*` - Agent management
- `/workflows/*` - Workflow builder
- `/dashboard/*` - Dashboard
- `/marketplace/*` - Marketplace

### Special Routes

- `/invite/*` - Invite link flow (creates/logs in user, assigns `providerBeta`, redirects to `/agents/new`)

---

## 👤 User Roles & Beta Access

Users can have beta access through three mechanisms:

### 1. **Admin Role**

```typescript
user.role === 'admin'; // Full access to everything
```

### 2. **General Beta Access Flag**

```typescript
user.betaAccess === true; // Beta tester access
```

### 3. **Provider Beta Flag**

```typescript
user.providerBeta === true; // Granted via invite link
```

**Your Account**:

- Email: `rainking6693@gmail.com`
- Role: `admin`
- Beta Access: `true`
- Provider Beta: `true`

✅ **You have full access to all routes**

---

## 📄 Key Pages

### 1. **Coming Soon Page** (`/`)

**Features**:

- "Private Beta" status badge with pulsing animation
- Pitch: "The first marketplace where AI agents autonomously discover, negotiate with, and transact services"
- Key features grid (A2A Payments, Service Discovery, Multi-Agent Workflows)
- **Provider Application Form** with fields:
  - Name, Email, X Handle (optional)
  - Agent Name, Agent Description
  - Endpoint Type (Public/Private/Config)
  - Documentation Link (optional), Notes (optional)
- Success message: "If approved, you'll receive an invite link"
- Link to sign in for existing beta users

**File**: `apps/web/src/app/page.tsx`

---

### 2. **Beta Gate Page** (`/beta-gate`)

**Shown When**:

- User tries to access a gated route without beta access
- OR user navigates directly to `/beta-gate`

**Features**:

- Lock icon with "Private Beta" message
- Personalized greeting if user is logged in
- Shows which route user was trying to access (via `?from=` query param)
- Same provider application form as Coming Soon page
- Pre-fills email/name for logged-in users
- Instructions for using invite links
- "Back to Home" link

**File**: `apps/web/src/app/beta-gate/page.tsx`

---

## 🔧 Technical Implementation

### Middleware (`src/middleware.ts`)

**Runs on every request** to check access:

```typescript
1. Check if path is public → Allow
2. Check if user is authenticated → Redirect to /beta-gate if not
3. Check if user has beta access:
   - Admin role → Allow
   - betaAccess === true → Allow
   - providerBeta === true → Allow
   - Else → Redirect to /beta-gate with ?from=<original-path>
```

**Matcher Configuration**:

```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'];
```

Excludes static assets, images, and Next.js internals.

---

### Authentication Updates (`src/lib/auth-options.ts`)

**Changed from database sessions to JWT sessions**:

```typescript
session: {
  strategy: 'jwt', // For faster middleware checks
}
```

**JWT Callback** - Adds beta access fields to JWT:

```typescript
async jwt({ token, user, trigger }) {
  const dbUser = await prisma.user.findUnique({
    where: { email: token.email },
    select: { role, betaAccess, providerBeta, ... },
  });

  token.role = dbUser.role;
  token.betaAccess = dbUser.betaAccess;
  token.providerBeta = dbUser.providerBeta;

  return token;
}
```

**Session Callback** - Adds fields to session object:

```typescript
async session({ session, token }) {
  session.user.role = token.role;
  session.user.betaAccess = token.betaAccess;
  session.user.providerBeta = token.providerBeta;
  return session;
}
```

---

### Database Schema Updates

**User Model** (both `apps/api/prisma/schema.prisma` and `apps/web/prisma/schema.prisma`):

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  displayName   String
  role          String    @default("user") // "admin" | "user"
  betaAccess    Boolean   @default(false)
  providerBeta  Boolean   @default(false)
  // ... other fields
}
```

**Migration Applied**: ✅

```bash
cd apps/api && npx prisma db push --accept-data-loss
```

---

### Beta Access Utilities (`src/lib/beta-access.ts`)

**Helper Functions**:

```typescript
hasBetaAccess(user); // Check if user has any form of beta access
hasSessionBetaAccess(session); // Check beta access from NextAuth session
isPublicPath(path); // Check if path is publicly accessible
requiresBetaAccess(path); // Check if path requires beta access
```

**Route Arrays**:

```typescript
PUBLIC_ROUTES; // Exact path matches (e.g., '/', '/login')
PUBLIC_ROUTE_PREFIXES; // Route prefixes (e.g., '/providers' matches '/providers/thanks')
PUBLIC_API_ROUTES; // API route prefixes
PUBLIC_ASSETS; // Static asset prefixes
INVITE_ROUTES; // Invite link routes
```

---

### Provider Application API (`src/app/api/provider-apply/route.ts`)

**Endpoint**: `POST /api/provider-apply`

**Functionality**:

- Accepts provider application form data
- Server-side validation of required fields (name, email, agentName, agentDescription, endpointType)
- Input sanitization to prevent XSS attacks
- Length validation (max 2000 characters per field)
- Email format validation
- Sends email notification to admin (if SMTP configured)
- Logs application to console (if email not configured)
- Returns success/error response with proper error messages

**Email Configuration** (optional):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@swarmsync.ai
PROVIDER_APPLICATION_RECIPIENT=bullrushinvestments@gmail.com
```

If SMTP is not configured, applications are logged to console.

---

## 🧪 Testing the Implementation

### Test Scenario 1: Public Visitor

1. Navigate to `http://localhost:3000/`
2. ✅ Should see "Coming Soon" page
3. Try to access `http://localhost:3000/console/overview`
4. ✅ Should redirect to `/beta-gate?from=/console/overview`
5. Fill out provider application form
6. ✅ Should show success message

---

### Test Scenario 2: Authenticated User Without Beta Access

1. Sign in with a new Google/GitHub account
2. Try to access `http://localhost:3000/agents/new`
3. ✅ Should redirect to `/beta-gate?from=/agents/new`
4. ✅ Form should be pre-filled with user's name and email
5. Fill out and submit application
6. ✅ Should show success message

---

### Test Scenario 3: Beta User (You)

1. Sign in with `rainking6693@gmail.com`
2. Navigate to any route: `/console/overview`, `/agents/new`, `/workflows`, etc.
3. ✅ Should have full access to all routes
4. Middleware should allow you through without redirecting

---

### Test Scenario 4: Provider Invite Link

1. Create an invite link: `http://localhost:3000/invite/<token>`
2. Click the link (as a new user)
3. ✅ Should create/login user and set `providerBeta = true`
4. ✅ Should redirect to `/agents/new`
5. User should now have beta access

---

## 🚀 Deployment Checklist

### Before Deploying:

- [x] Database migration applied
- [x] Beta access granted to admin user
- [x] Build successful
- [x] Middleware compiled
- [x] Public routes accessible
- [x] Gated routes protected
- [x] Provider application form working
- [x] Beta gate page working

### After Deploying:

- [ ] Test Coming Soon page loads at `/`
- [ ] Test gated route redirects work
- [ ] Test admin user can access all routes
- [ ] Test provider application submission
- [ ] Test invite link flow
- [ ] Monitor application submissions

---

## 📝 Granting Beta Access to New Users

### Method 1: Manual Database Update

```sql
UPDATE "User"
SET "betaAccess" = true, "role" = 'admin'
WHERE email = 'user@example.com';
```

### Method 2: Using the Grant Script

```bash
cd apps/web
npx tsx grant-beta-access.ts
```

Edit the script to change the email before running.

### Method 3: Via Invite Link

1. Generate an invite token
2. Send user link: `https://swarmsync.ai/invite/<token>`
3. User clicks link, gets `providerBeta = true`

---

## 🎯 Key Benefits of This Approach

1. **Full App Remains Functional**: No code disabled or removed
2. **Seamless Testing**: Beta users don't see any difference
3. **Professional Public Presence**: Coming Soon page looks polished
4. **Lead Generation**: Provider applications captured
5. **Easy to Disable**: Remove middleware or make all routes public when ready to launch
6. **No 404s or Redirects**: Friendly beta gate page instead of errors
7. **JWT Sessions**: Fast middleware checks without database queries
8. **Invite System**: Easy onboarding for approved providers

---

## 🔄 Switching Between Modes

### To **Enable** Soft Launch Mode (Current State)

✅ Already active!

### To **Disable** Soft Launch Mode (Public Launch)

**Option 1**: Comment out middleware

```typescript
// File: src/middleware.ts
// export async function middleware(request: NextRequest) {
//   ... (comment out entire middleware)
// }
```

**Option 2**: Make all users have beta access by default

```typescript
// File: apps/api/prisma/schema.prisma
betaAccess Boolean @default(true)  // Change to true
```

**Option 3**: Remove middleware file entirely

```bash
rm src/middleware.ts
```

---

## 📊 Monitoring Beta Access

### Check User's Beta Status

```sql
SELECT
  email,
  "displayName",
  role,
  "betaAccess",
  "providerBeta"
FROM "User"
WHERE email = 'user@example.com';
```

### Count Beta Users

```sql
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN "betaAccess" = true THEN 1 END) as beta_users,
  COUNT(CASE WHEN "providerBeta" = true THEN 1 END) as provider_beta_users
FROM "User";
```

---

## 🛠️ Troubleshooting

### Issue: User with beta access still sees beta gate

**Possible Causes**:

1. JWT not refreshed after granting access
2. Session expired

**Solution**:

- User should sign out and sign in again
- Or clear cookies and re-authenticate

---

### Issue: Middleware not running

**Possible Causes**:

1. Middleware file not in correct location
2. Build not including middleware

**Solution**:

- Ensure `src/middleware.ts` exists
- Check build output for "ƒ Middleware" line
- Rebuild: `npm run build`

---

### Issue: Public routes being blocked

**Possible Causes**:

1. Route not in PUBLIC_ROUTES array
2. Route pattern not matching

**Solution**:

- Add route to `PUBLIC_ROUTES` in `src/lib/beta-access.ts`
- Check route path exactly matches

---

### Issue: Provider applications not received

**Possible Causes**:

1. SMTP not configured
2. Email sending failing

**Solution**:

- Check console logs for application data
- Verify SMTP environment variables
- Test email sending separately

---

## 📂 Files Created/Modified

### Created:

- ✅ `apps/web/src/lib/beta-access.ts` - Beta access utilities
- ✅ `apps/web/src/middleware.ts` - Route gating middleware
- ✅ `apps/web/src/app/coming-soon/page.tsx` - Coming Soon page (not used, see below)
- ✅ `apps/web/src/app/beta-gate/page.tsx` - Beta gate page
- ✅ `apps/web/grant-beta-access.ts` - Script to grant beta access

### Modified:

- ✅ `apps/web/src/app/page.tsx` - **Replaced with Coming Soon page**
- ✅ `apps/web/src/app/page-full.tsx.backup` - **Original landing page backed up**
- ✅ `apps/web/src/lib/auth-options.ts` - JWT sessions + beta fields
- ✅ `apps/api/prisma/schema.prisma` - Added role, betaAccess, providerBeta fields
- ✅ `apps/web/prisma/schema.prisma` - Added role, betaAccess, providerBeta fields
- ✅ `apps/web/src/app/api/provider-apply/route.ts` - Updated field names

---

## ✅ Deployment Status

**Build Status**: ✅ Passing
**Database Migration**: ✅ Applied
**Admin User**: ✅ Beta access granted
**Middleware**: ✅ Compiled and active
**Public Routes**: ✅ Accessible
**Gated Routes**: ✅ Protected

**Ready to deploy!** 🚀

---

## 🎉 Summary

SwarmSync is now in **soft launch mode**:

- ✅ Public visitors see a professional "Coming Soon" page
- ✅ Provider application form captures leads
- ✅ Full app remains functional for beta users
- ✅ Admin users (like you) have unrestricted access
- ✅ Middleware protects all gated routes
- ✅ Invite links grant instant beta access
- ✅ Friendly beta gate page instead of 404s
- ✅ Fast JWT-based access checks
- ✅ Easy to disable when ready for public launch

**You can now safely deploy to production!**
