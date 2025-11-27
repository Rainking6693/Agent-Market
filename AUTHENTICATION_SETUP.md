# Authentication Setup Guide - Fixing NEXT_REDIRECT Error

## Current Issue

The application is experiencing "NEXT_REDIRECT" errors when trying to login with Google or GitHub. This is because the Logto authentication service is not properly configured.

## Root Cause

1. **Missing Environment Variables**: The `.env.local` file was missing
2. **Invalid Logto Endpoint**: The hardcoded Logto endpoint `https://wbeku3.logto.app/` is not accessible
3. **No Logto Instance**: No actual Logto instance has been set up for this application

## Quick Fix (Development)

### Step 1: Environment Variables
The `.env.local` file has been created with placeholder values. You now have two options:

#### Option A: Set up a real Logto instance (Recommended)
1. Go to [Logto Cloud](https://logto.io) and create a free account
2. Create a new application
3. Configure OAuth providers (Google, GitHub)
4. Update `.env.local` with your real values:

```bash
# Replace these with your actual Logto instance values
LOGTO_ENDPOINT=https://your-instance.logto.app/
LOGTO_APP_ID=your_actual_app_id
LOGTO_APP_SECRET=your_actual_app_secret
LOGTO_COOKIE_SECRET=your_32_character_secret
```

#### Option B: Disable OAuth temporarily (Quick fix)
If you want to test the app without OAuth, you can:

1. Comment out the social login buttons in the UI
2. Use email/password authentication instead
3. Or create a mock authentication flow

### Step 2: Configure OAuth Providers

If you choose Option A, you'll need to:

1. **Google OAuth Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-logto-instance.com/callback/google`

2. **GitHub OAuth Setup**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Set callback URL: `https://your-logto-instance.com/callback/github`

3. **Configure in Logto**:
   - Add the OAuth credentials to your Logto dashboard
   - Set up the redirect URIs for your application

### Step 3: Test the Setup

```bash
# Start the development server
cd apps/web
npm run dev

# The app should now show proper error messages instead of NEXT_REDIRECT
# If Logto is not configured, users will see a helpful error message
```

## Current Status

✅ **Fixed**: NEXT_REDIRECT error - now shows proper error messages  
✅ **Added**: Environment variable validation  
✅ **Added**: Better error handling in OAuth flow  
⚠️ **Pending**: Actual Logto instance setup (requires your action)

## Error Messages You'll See Now

Instead of the cryptic "NEXT_REDIRECT" error, you'll now see:
- "Authentication service is not configured. Please contact support."
- Clear console logs showing what's missing
- Proper error page with helpful information

## Next Steps

1. **For Development**: Set up a Logto Cloud instance (free tier available)
2. **For Production**: Configure production Logto instance with proper domain
3. **Alternative**: Implement a different authentication provider (Auth0, Supabase, etc.)

## Files Modified

- `apps/web/.env.local` - Created with placeholder values
- `apps/web/src/app/logto.ts` - Added configuration validation
- `apps/web/src/app/actions/oauth.ts` - Added error handling
- `apps/web/src/app/callback/route.ts` - Added configuration checks

## Testing Without OAuth

If you want to test the application without setting up OAuth:

1. Navigate to the login page
2. You should see proper error messages instead of crashes
3. The application won't crash with NEXT_REDIRECT anymore
4. Console logs will show exactly what needs to be configured

This gives you a working foundation to either set up proper authentication or implement an alternative solution.