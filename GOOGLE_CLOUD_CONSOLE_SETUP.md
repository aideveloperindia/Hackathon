# Google Cloud Console - Redirect URI Setup

## ⚠️ CRITICAL: redirect_uri_mismatch Error

This error means the redirect URI in your code doesn't match what's in Google Cloud Console.

## ✅ Required Redirect URIs

You MUST add these EXACT redirect URIs in Google Cloud Console:

### 1. Local Development:
```
http://localhost:5001/api/auth/google/callback
```

### 2. Production (Vercel):
```
https://jits-coding-platform.vercel.app/api/auth/google/callback
```

## 🔧 How to Add in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `413029778276-pddntsesfrhkf5gq9tir2i4bq1dol8m3`
3. Click **Edit** (pencil icon)
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add EXACTLY: `http://localhost:5001/api/auth/google/callback`
6. Click **+ ADD URI** again
7. Add EXACTLY: `https://jits-coding-platform.vercel.app/api/auth/google/callback`
8. Click **SAVE**
9. Wait 2-3 minutes for changes to propagate

## ⚠️ Important Notes

- The redirect URI must match EXACTLY (character by character)
- No trailing slashes
- Case-sensitive
- Must include `/api/auth/google/callback` at the end
- For local dev, use port **5001** (frontend port), NOT 5002 (backend port)

## ✅ After Adding

1. Wait 2-3 minutes
2. Try logging in again
3. The redirect_uri_mismatch error should be resolved

