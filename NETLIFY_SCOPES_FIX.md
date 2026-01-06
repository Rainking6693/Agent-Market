# How to Set Environment Variable Scopes in Netlify

## Step-by-Step Instructions

1. Go to: **https://app.netlify.com/sites/swarmsync/configuration/env**

2. You should see your list of environment variables

3. For EACH variable (NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.):

   **Option A: If you see a "•••" or "..." menu icon next to the variable:**
   - Click the menu icon (three dots)
   - Click "Edit" or "Options"
   - A panel should open on the right side
   - Look for "Scopes" section
   - Make sure ALL boxes are checked:
     - ✅ Builds
     - ✅ Functions
     - ✅ Deploy Previews
     - ✅ Branch deploys
   - Click "Save"

   **Option B: If you can click directly on the variable name:**
   - Click on the variable name
   - A panel opens on the right
   - Scroll down to "Scopes" section
   - Check ALL boxes
   - Click "Save"

   **Option C: If there's an "Options" button:**
   - Click "Options" next to the variable
   - Select "Edit"
   - Follow steps above

4. **Alternative: Delete and recreate the variables with correct scopes**

   If you can't find the scopes options, do this:

   a. Click the variable
   b. Click "Delete" or "Remove"
   c. Click "Add a variable"
   d. Set:
   - Key: (e.g., NEXTAUTH_SECRET)
   - Value: (paste the value)
   - Scopes: **SELECT ALL** (check every box you see)
   - Deploy contexts: **Production** (at minimum)
     e. Click "Create variable" or "Add"

## Critical Variables That Need ALL Scopes

Do this for ALL of these:

```
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
DATABASE_URL
```

## After Setting Scopes

1. Go to: **https://app.netlify.com/sites/swarmsync/deploys**
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**
4. Wait 3-5 minutes
5. Test: Go to https://swarmsync.ai/api/debug-auth
   - Should show `"*_exists": true` for all variables
   - If still false, scopes aren't set correctly

## What Scopes Mean

- **Builds**: Available during build time (npm run build)
- **Functions**: Available in serverless functions (API routes) ← **THIS IS CRITICAL**
- **Runtime**: Available at runtime
- **Deploy Previews**: Available in preview deployments

**NextAuth runs in Functions**, so if "Functions" scope isn't checked, the variables won't be available and OAuth will fail with `error=google`.
