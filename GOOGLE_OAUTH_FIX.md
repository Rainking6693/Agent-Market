# CRITICAL: Google OAuth Configuration Issue

## Problem Identified

NextAuth is returning `error=google` when trying to initiate OAuth.

**Test Result:**

```bash
curl https://swarmsync.ai/api/auth/signin/google
Location: /login?error=google
```

This means Google OAuth is misconfigured in Google Cloud Console.

## Required Google Cloud Console Configuration

### Step 1: Verify OAuth 2.0 Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `1056389438638-qjhk5vkfspi742rjg74661crsfeamkOr.apps.googleusercontent.com`
3. Click on it to edit

### Step 2: Check Authorized Redirect URIs

**CRITICAL**: You MUST have this exact URI configured:

```
https://swarmsync.ai/api/auth/callback/google
```

**Common mistakes:**

- ❌ `https://www.swarmsync.ai/api/auth/callback/google` (with www)
- ❌ `http://swarmsync.ai/api/auth/callback/google` (http instead of https)
- ❌ `https://swarmsync.ai/api/auth/callback` (missing /google)
- ✅ `https://swarmsync.ai/api/auth/callback/google` (CORRECT)

### Step 3: Check OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Verify:
   - App name is set
   - Support email is set
   - Authorized domains includes: `swarmsync.ai`
   - Publishing status: Either "Testing" (with test users added) or "Published"

### Step 4: Test Users (if in Testing mode)

If your OAuth app is in "Testing" mode, you need to add authorized test users:

1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Add the email addresses that should be able to log in

## Alternative: Check for Multiple OAuth Clients

If you have multiple OAuth client IDs, make sure you're using the RIGHT one.

1. Go to: https://console.cloud.google.com/apis/credentials
2. List all OAuth 2.0 Client IDs
3. Verify the Client ID in Netlify matches ONE of them exactly
4. Use that client's Client Secret

## Verification Steps

After fixing Google Cloud Console:

1. Test the signin endpoint:

   ```bash
   curl -I "https://swarmsync.ai/api/auth/signin/google"
   ```

   Should redirect to `accounts.google.com` (NOT `error=google`)

2. Test on live site:
   - Go to: https://swarmsync.ai/login
   - Click "Continue with Google"
   - Should redirect to Google OAuth consent screen

## If Still Failing

Check Netlify function logs:

1. Go to: https://app.netlify.com/sites/swarmsync/logs
2. Look for NextAuth errors
3. Check for any OAuth-related error messages
