# Google OAuth Redirect URI Setup - FIX REQUIRED

## ⚠️ Error: "invalid_client" (Error 401)

This error means the redirect URI in your code doesn't match what's configured in Google Cloud Console.

## Current OAuth Credentials

**Note:** Your OAuth credentials are stored in Vercel environment variables and `google_oauth_credentials.txt` (local only, not in git).

To find your Client ID, check:
- Vercel Dashboard > Project Settings > Environment Variables
- Or the `google_oauth_credentials.txt` file locally

## 🔧 How to Fix

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (check Vercel environment variables or google_oauth_credentials.txt)
5. Click **Edit** (pencil icon)

### Step 2: Add Authorized Redirect URIs

Under **Authorized redirect URIs**, click **+ ADD URI** and add these **exact** URLs:

**Production URLs (add all of these):**
```
https://jits-coding-platform-687can7i3-aidevelopers-projects.vercel.app/api/auth/google/callback
https://jits-coding-platform-97wqvmdjr-aidevelopers-projects.vercel.app/api/auth/google/callback
https://jits-coding-platform-15wj7w7m6-aidevelopers-projects.vercel.app/api/auth/google/callback
https://jits-coding-platform-ncxba9gh5-aidevelopers-projects.vercel.app/api/auth/google/callback
https://jits-coding-platform.vercel.app/api/auth/google/callback
```

**Development (Local):**
```
http://localhost:3001/api/auth/google/callback
```

### Step 3: Save and Wait
1. Click **SAVE**
2. Wait 2-3 minutes for Google to propagate changes
3. Try logging in again

## 📝 Important Notes

- The redirect URI must **EXACTLY match** (including `/api/auth/google/callback`)
- Vercel creates new URLs for each deployment
- You may need to add new URLs when Vercel creates new deployments
- Check your Vercel dashboard for the current production URL

## 🔍 How to Find Your Current Vercel URL

Run this command:
```bash
npx vercel ls
```

Look for the Production deployment URL and add it to Google Cloud Console.

## ✅ After Fixing

Once you've added the redirect URIs:
1. Wait 2-3 minutes
2. Try the "Continue with Email" button again
3. The error should be resolved
