# Logto Redirect URIs Configuration

## Redirect URIs (for sign-in callback)

Add these **exact** URIs in your Logto application settings:

### Production

```
https://swarmsync.ai/callback
https://swarmsync.netlify.app/callback
```

### Development

```
http://localhost:3000/callback
```

## Post Sign-out Redirect URIs

Add these **exact** URIs in your Logto application settings:

### Production

```
https://swarmsync.ai/
https://swarmsync.netlify.app/
```

### Development

```
http://localhost:3000/
```

## Important Notes

1. **Exact match required**: The URIs must match exactly, including:
   - Protocol (https:// or http://)
   - Domain name
   - Path (including trailing slash for post sign-out)
   - No trailing slash for callback URIs

2. **Add all environments**: Make sure to add both production and development URIs so you can test locally.

3. **Where to configure**:
   - Log in to your Logto dashboard
   - Go to Applications → Your Application
   - Scroll to "Redirect URIs" section
   - Add each URI one by one
   - Scroll to "Post sign-out redirect URIs" section
   - Add each URI one by one

4. **After adding**: Save the changes. The new URIs will be available immediately.
