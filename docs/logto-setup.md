# Logto Authentication Setup Guide

This guide will help you set up Logto authentication for the Agent Market application.

## Prerequisites

1. A Logto instance (you can use [Logto Cloud](https://logto.io) or self-host)
2. Access to your Netlify dashboard (for frontend environment variables)
3. Access to your Railway dashboard (for backend environment variables)

## Step 1: Set Up Logto Instance

1. Sign up at [Logto Cloud](https://logto.io) or deploy your own instance
2. Create a new application in your Logto dashboard
3. Note down:
   - Your Logto endpoint (e.g., `https://your-instance.logto.app`)
   - Application ID
   - Application Secret

## Step 2: Configure Logto Application

### Redirect URIs

Add these redirect URIs to your Logto application:

**Production:**

- `https://swarmsync.ai/auth/callback`
- `https://swarmsync.netlify.app/auth/callback`
- `https://swarmsync-api.up.railway.app/auth/callback`

**Development:**

- `http://localhost:3000/auth/callback`
- `http://localhost:4000/auth/callback`

### Post Sign-out Redirect URIs

- `https://swarmsync.ai`
- `https://swarmsync.netlify.app`
- `http://localhost:3000` (for development)

## Step 3: Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://your-logto-instance.com/callback/google`
     - (Check your Logto dashboard for the exact callback URL)
6. Copy the Client ID and Client Secret
7. In Logto dashboard, go to "Connectors" → "Social connectors" → "Google"
8. Enter your Client ID and Client Secret
9. Save the configuration

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure:
   - Application name: Swarm Sync
   - Homepage URL: `https://swarmsync.ai`
   - Authorization callback URL:
     - `https://your-logto-instance.com/callback/github`
     - (Check your Logto dashboard for the exact callback URL)
4. Copy the Client ID and Client Secret
5. In Logto dashboard, go to "Connectors" → "Social connectors" → "GitHub"
6. Enter your Client ID and Client Secret
7. Save the configuration

## Step 4: Set Frontend Environment Variables (Netlify)

1. Go to your Netlify dashboard
2. Navigate to: Site settings → Environment variables
3. Add the following variables:

```
NEXT_PUBLIC_LOGTO_ENDPOINT=https://your-logto-instance.com
NEXT_PUBLIC_LOGTO_APP_ID=your-app-id
NEXT_PUBLIC_LOGTO_RESOURCES=
NEXT_PUBLIC_LOGTO_SCOPES=openid,profile,email,offline_access
```

4. Click "Save"
5. Trigger a new deployment (Netlify will automatically redeploy)

## Step 5: Set Backend Environment Variables (Railway)

1. Go to your Railway dashboard
2. Navigate to your `swarmsync-api` service
3. Go to the "Variables" tab
4. Add the following variables:

```
LOGTO_ENDPOINT=https://your-logto-instance.com
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
LOGTO_REDIRECT_URI=https://swarmsync-api.up.railway.app/auth/callback
```

5. Save the variables
6. Railway will automatically redeploy

## Step 6: Verify Configuration

### Check Redirect URIs Match

**Critical:** Ensure the redirect URIs in Logto match exactly (including https://, no trailing slashes):

- Logto Application Settings → Redirect URIs
- Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
- GitHub OAuth App → Authorization callback URL

### Test the Flow

1. Navigate to `https://swarmsync.ai/auth/login`
2. Click "Sign In"
3. You should be redirected to Logto
4. Try signing in with Google or GitHub
5. You should be redirected back to your app

## Troubleshooting

### CORS Errors

If you see CORS errors, check:

1. Backend CORS configuration in `apps/api/src/main.ts`
2. Ensure your frontend URL is in the `CORS_ALLOWED_ORIGINS` environment variable
3. Check Railway logs for CORS-related errors

### Callback URL Mismatch

If you see "redirect_uri_mismatch" errors:

1. Verify the exact callback URL in Logto dashboard
2. Ensure it matches exactly in Google/GitHub OAuth settings
3. Check for trailing slashes or http vs https mismatches

### Token Issues

If authentication succeeds but tokens aren't working:

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_LOGTO_APP_ID` matches the backend `LOGTO_APP_ID`
3. Check Railway logs for token verification errors

### Environment Variables Not Loading

- **Netlify:** Environment variables require a new deployment to take effect
- **Railway:** Variables are available immediately after saving (service restarts automatically)

## Security Notes

- Never commit `LOGTO_APP_SECRET` to version control
- Use different Logto applications for development and production
- Regularly rotate OAuth client secrets
- Monitor Logto dashboard for suspicious activity

## Next Steps

After setup is complete:

1. Test the full authentication flow
2. Verify user data is correctly synced
3. Test logout functionality
4. Monitor logs for any errors
