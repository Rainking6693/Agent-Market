# Alternative: Set Environment Variables via netlify.toml

If the Netlify UI is confusing or not working, you can set environment variables in code.

## Create netlify.toml in apps/web/

**File:** `apps/web/netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"

# Environment variables for functions
[context.production.environment]
  NEXTAUTH_URL = "https://swarmsync.ai"
  NEXT_PUBLIC_APP_URL = "https://swarmsync.ai"
  NEXT_PUBLIC_API_URL = "https://swarmsync-api.up.railway.app"
```

## Important Notes

1. **DO NOT put secrets in netlify.toml** (it's committed to git)
2. Secrets (NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, etc.) MUST stay in Netlify dashboard
3. Only put non-secret values in netlify.toml

## For Secrets: Use Netlify CLI

If the UI really isn't working, use the CLI:

```bash
# Login first
netlify login

# Link to your site
netlify link

# Set each variable
netlify env:set NEXTAUTH_SECRET "HNT0jWSyAGYkf3DAaUgpIUgfJdY7jwMW" --context production
netlify env:set NEXTAUTH_URL "https://swarmsync.ai" --context production
netlify env:set GOOGLE_CLIENT_ID "1056389438638-qjhk5vkfspi742rjg74661crsfeamkOr.apps.googleusercontent.com" --context production
netlify env:set GOOGLE_CLIENT_SECRET "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" --context production --secret
netlify env:set GITHUB_CLIENT_ID "Ov23lijhlbg5GGBJZyqp" --context production
netlify env:set GITHUB_CLIENT_SECRET "9970089f7d6588f60ed8c47b4251840137c6eb73" --context production --secret
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_v0RtJymP2rcw@ep-cold-butterfly-a3nonb7s.us-east-2.aws.neon.tech/neondb?sslmode=require" --context production --secret

# Deploy
netlify deploy --prod
```

The `--context production` ensures they're set for production.
The `--secret` flag marks them as sensitive.
