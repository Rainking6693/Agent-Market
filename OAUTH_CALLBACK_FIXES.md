# OAuth Callback Fixes - Implementation Summary

## Fixes Implemented

### 1. ✅ Cookie Domain Configuration

**File**: `apps/web/src/app/actions/oauth.ts`

- Added `getCookieDomain()` function to set cookie domain to `.swarmsync.ai` in production
- This ensures cookies work across `swarmsync.ai` and `www.swarmsync.ai`
- Cookies are set with proper domain in `setOAuthProvider()` function

### 2. ✅ Next.js Middleware for Cookie Handling

**File**: `apps/web/src/middleware.ts` (NEW)

- Created middleware to handle cookie domain configuration
- Detects hostname and sets appropriate cookie domain
- Covers both production (`swarmsync.ai`) and Netlify (`swarmsync.netlify.app`) domains

### 3. ✅ Enhanced Debugging in Callback Route

**File**: `apps/web/src/app/callback/route.ts`

- Added comprehensive logging:
  - URL, hostname, origin, referer
  - State, code, and error parameters
  - Cookie names (for debugging without exposing values)
  - Logto configuration (without secrets)
- This will help identify exactly what's happening during the OAuth callback

### 4. ✅ OAuth Initiation Logging

**File**: `apps/web/src/app/actions/oauth.ts`

- Added console logging when initiating Google/GitHub OAuth
- Logs redirect URI and base URL for debugging
- Helps verify the correct URLs are being used

### 5. ✅ Improved Error Handling

**File**: `apps/web/src/app/callback/route.ts`

- Better error messages
- Proper cookie cleanup on errors
- Enhanced error logging

## What Still Needs to Be Done

### In Logto Dashboard:

1. **Enable PKCE** (if not already enabled):
   - Go to Applications → Your App → Advanced Settings
   - Enable PKCE (Proof Key for Code Exchange)
   - This is required for SPAs and helps with state integrity

2. **Verify Cookie Domain Settings** (if available):
   - Check if Logto Console has a "Cookie Domain" setting
   - Set it to `.swarmsync.ai` if available

### In Google Cloud Console:

1. **Authorized JavaScript Origins**:

   ```
   https://swarmsync.ai
   https://swarmsync.netlify.app
   http://localhost:3000
   ```

2. **Authorized Redirect URIs**:
   ```
   https://4yl56u.logto.app/callback/sztldbmedkky3pcuau68z
   ```

### In GitHub OAuth App:

1. **Authorization callback URL**:
   ```
   https://4yl56u.logto.app/callback/xjkpzznfpaee9m3d3i93
   ```
   (Verify the exact connector ID from Logto)

### In Netlify (Optional):

If you want to force redirects to your custom domain, add to `netlify.toml`:

```toml
[[redirects]]
  from = "https://swarmsync.netlify.app/*"
  to = "https://swarmsync.ai/:splat"
  status = 301
  force = true
```

## Testing Steps

After deployment:

1. **Clear all cookies** for the site
2. **Open DevTools** (F12) → Network tab
3. **Click Google login button**
4. **Check console logs** for:
   - "Initiating Google OAuth" message with redirect URI
   - Any errors
5. **Check Network tab** for:
   - Request to Logto's `/oidc/auth` endpoint
   - Check the `redirect_uri` parameter
   - Check if `state` parameter is present
6. **After redirect back**, check:
   - Console logs for "Logto callback received"
   - Check if `state` and `code` are present in the callback URL
   - Check cookie names in the logs

## Expected Behavior

1. User clicks Google/GitHub button
2. Redirects to Logto with `redirect_uri=https://swarmsync.ai/callback` (or netlify domain)
3. Logto redirects to Google/GitHub
4. Google/GitHub redirects back to Logto's callback
5. Logto processes and redirects to `https://swarmsync.ai/callback?code=...&state=...`
6. Your callback route processes the code and redirects to `/dashboard`

## If Still Getting Errors

Check the enhanced logs in:

- **Server logs** (Netlify Functions/Next.js): Look for "Logto callback received" messages
- **Browser console**: Look for "Initiating Google OAuth" messages
- **Network tab**: Inspect the actual OAuth URLs being generated

The enhanced logging will show exactly what's happening at each step.
