# Google OAuth Redirect URI Setup

## ✅ Required Redirect URIs (Only 2!)

You only need **TWO** redirect URIs in Google Cloud Console:

1. **Local Development:**
   ```
   http://localhost:3001/api/auth/google/callback
   ```

2. **Production (Vercel):**
   ```
   https://jits-coding-platform.vercel.app/api/auth/google/callback
   ```

## 🔧 How to Add in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit** (pencil icon)
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add the two URIs listed above (one at a time)
6. Click **SAVE**
7. Wait 2-3 minutes for changes to propagate

## ⚙️ Vercel Environment Variable

Make sure you have `FRONTEND_URL` set in Vercel:

```env
FRONTEND_URL=https://jits-coding-platform.vercel.app
```

This ensures the code uses a fixed production URL instead of the dynamic Vercel deployment URLs.

## ✅ After Setup

Once you've:
1. Added the 2 redirect URIs in Google Cloud Console
2. Set `FRONTEND_URL` in Vercel environment variables
3. Waited 2-3 minutes

Try logging in again - the OAuth should work!
