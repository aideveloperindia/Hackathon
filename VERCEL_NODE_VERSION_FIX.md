# Fix Node.js Version in Vercel

## Issue
Vercel is using Node.js 24.x, but the build requires Node.js 18.x.

## Solution

### Option 1: Update via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select project: **jits-coding-platform**
3. Go to **Settings** → **General**
4. Scroll to **Node.js Version**
5. Change from **24.x** to **18.x**
6. Click **Save**
7. Redeploy the project

### Option 2: Update via Vercel CLI (if available)

The Node.js version needs to be updated in project settings. The CLI doesn't have a direct command for this, but you can:

1. Use the Vercel API
2. Or update via dashboard (Option 1)

### After Updating

Once the Node.js version is set to 18.x:

```bash
npx vercel --prod
```

## Current Status

- ✅ Project linked: `jits-coding-platform`
- ✅ Environment variables: All set
- ✅ Build configuration: Correct
- ⚠️  Node.js version: Needs to be changed from 24.x to 18.x

## Quick Fix Steps

1. Open: https://vercel.com/dashboard
2. Click: **jits-coding-platform** project
3. Settings → General → Node.js Version → **18.x**
4. Save
5. Run: `npx vercel --prod`


