# ⚡ Quick Fix: Node.js Version Error

## The Error
```
Error: Found invalid Node.js Version: "24.x". Please set Node.js Version to 18.x in your Project Settings to use Node.js 18.
```

## ✅ Solution (2 Steps)

### Step 1: Update in Vercel Dashboard

**Direct Link:** https://vercel.com/aidevelopers-projects/jits-coding-platform/settings/general

**Or manually:**
1. Go to: https://vercel.com/dashboard
2. Click on project: **jits-coding-platform**
3. Click **Settings** tab
4. Click **General** (left sidebar)
5. Scroll to **Node.js Version** section
6. Change dropdown from **24.x** → **18.x**
7. Click **Save** button

### Step 2: Deploy

After saving, run:
```bash
npx vercel --prod
```

## ✅ What I've Already Fixed

- ✅ Added `"engines": { "node": "18.x" }` to `package.json`
- ✅ Created `.nvmrc` file with `18`
- ✅ All environment variables are set
- ✅ Build configuration is correct

## 🚀 Quick Command

Or use the helper script:
```bash
./update-node-version.sh
```

This will open the Vercel dashboard for you.

## After Update

Once you've changed the Node.js version to 18.x in the dashboard:

```bash
# Deploy to production
npx vercel --prod
```

Your deployment should now succeed! 🎉

