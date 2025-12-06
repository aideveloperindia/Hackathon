# Fixing OAuth 400 Error

## 🔍 What is the 400 Error?

The 400 error from Google OAuth means: **"The server cannot process the request because it is malformed."**

This typically happens when:
1. **Redirect URI doesn't match exactly** what's in Google Cloud Console
2. **Client ID or Client Secret is incorrect**
3. **Request parameters are malformed**

## ✅ Step-by-Step Fix

### Step 1: Check Your Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `FRONTEND_URL` value:
   - Should be: `https://jits-coding-platform.vercel.app` (NO trailing slash)
   - Should NOT be: `https://jits-coding-platform.vercel.app/` (with trailing slash)

### Step 2: Verify Google Cloud Console Redirect URIs

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Under **Authorized redirect URIs**, you should have EXACTLY:
   ```
   https://jits-coding-platform.vercel.app/api/auth/google/callback
   http://localhost:3001/api/auth/google/callback
   ```
5. **Important**: 
   - NO trailing slashes
   - Exact match (case-sensitive)
   - Must include `/api/auth/google/callback`

### Step 3: Check Vercel Logs

After trying to login, check Vercel logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for logs with:
   - `🔗 OAuth redirect URI:`
   - `❌ Google OAuth token exchange failed:`

The redirect URI in the logs must EXACTLY match what's in Google Cloud Console.

### Step 4: Common Issues

#### Issue 1: Trailing Slash
- ❌ Wrong: `https://jits-coding-platform.vercel.app/`
- ✅ Correct: `https://jits-coding-platform.vercel.app`

#### Issue 2: Missing `/api/auth/google/callback`
- ❌ Wrong: `https://jits-coding-platform.vercel.app`
- ✅ Correct: `https://jits-coding-platform.vercel.app/api/auth/google/callback`

#### Issue 3: Wrong Domain
- ❌ Wrong: `https://jits-coding-platform-xyz123.vercel.app/api/auth/google/callback`
- ✅ Correct: `https://jits-coding-platform.vercel.app/api/auth/google/callback`

### Step 5: Update FRONTEND_URL in Vercel

If `FRONTEND_URL` is wrong:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find `FRONTEND_URL`
3. Click **Edit**
4. Set value to: `https://jits-coding-platform.vercel.app` (no trailing slash)
5. Click **Save**
6. **Redeploy** your project

### Step 6: Test Again

1. Wait 2-3 minutes after updating
2. Try logging in with Gmail again
3. Check Vercel logs if it still fails

## 🔧 Quick Diagnostic

Run this to check your current setup:

```bash
# Check Vercel environment variables
npx vercel env ls | grep FRONTEND_URL

# Check what redirect URI is being used (from logs)
# Look for: "🔗 OAuth redirect URI:"
```

## 📝 Expected Redirect URI Format

**Production:**
```
https://jits-coding-platform.vercel.app/api/auth/google/callback
```

**Local:**
```
http://localhost:3001/api/auth/google/callback
```

## ✅ After Fixing

Once the redirect URI matches exactly:
1. Wait 2-3 minutes for Google to update
2. Try logging in again
3. The 400 error should be resolved

## 🆘 Still Getting 400?

If you're still getting 400 after following all steps:

1. **Check Vercel logs** for the exact redirect URI being used
2. **Copy that exact URI** and add it to Google Cloud Console
3. **Wait 2-3 minutes** and try again

The redirect URI in your code must match EXACTLY what's in Google Cloud Console (character by character).

