# Vercel Build Error Fix

## Problem
Vercel is detecting the project as Next.js instead of Vite, causing build errors:
```
Module not found: Can't resolve 'next/dist/server/web/exports/cookies'
```

## Solution

### Option 1: Update Vercel Project Settings (Recommended)

1. Go to your Vercel project dashboard
2. Click **Settings** → **General**
3. Under **Framework Preset**, select **"Other"** or **"Vite"**
4. Under **Build & Development Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Save** and **Redeploy**

### Option 2: Delete and Recreate Project

If Option 1 doesn't work:

1. Delete the current Vercel project
2. Create a new project
3. Import: `aideveloperindia/Hackathon`
4. **Important**: When configuring:
   - **Framework Preset**: Select **"Other"** (NOT Next.js)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy

### Option 3: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy with explicit configuration
cd frontend
vercel --prod

# When prompted:
# - Framework? Select "Other" or "Vite"
# - Build command? npm run build
# - Output directory? dist
```

## Verify Configuration

After deployment, check:
1. Build logs should show: `vite build` not `next build`
2. No Next.js-related errors
3. Project builds successfully

## Current Configuration

The `frontend/vercel.json` is configured for Vite:
- Framework: null (forces manual selection)
- Build Command: `npm run build`
- Output Directory: `dist`
- Rewrites: SPA routing support

## If Still Having Issues

1. Check Vercel build logs for exact error
2. Verify `frontend/package.json` has correct scripts
3. Ensure no Next.js dependencies in `package.json`
4. Make sure Root Directory is set to `frontend` (not root)





