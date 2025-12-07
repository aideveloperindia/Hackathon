# Vercel CLI Deployment Guide

## Quick Start

### 1. Login to Vercel
```bash
npx vercel login
```
This will open a browser window for authentication.

### 2. Link Your Project (First Time)
```bash
npx vercel link
```
- Select your existing project OR create a new one
- If creating new: Project name: `jits-coding-platform`

### 3. Deploy to Preview
```bash
npx vercel
```

### 4. Deploy to Production
```bash
npx vercel --prod
```

## Current Configuration

Your `vercel.json` is already configured correctly:
- ✅ Build command: `npm run vercel-build`
- ✅ Output directory: `dist/client`
- ✅ Install command: `npm install --include=dev`
- ✅ API routes: `/api/*` → `api/index.ts`
- ✅ Frontend routes: `/*` → `index.html`

## Environment Variables

Before deploying, make sure to set environment variables:

```bash
# Set environment variables via CLI
npx vercel env add DATABASE_URL production
npx vercel env add NODE_ENV production
npx vercel env add JWT_SECRET production
npx vercel env add GMAIL_USER production
npx vercel env add GMAIL_APP_PASSWORD production
npx vercel env add SMTP_FROM production
npx vercel env add FRONTEND_URL production
```

Or set them all at once via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables

## Troubleshooting

### If build fails:
```bash
# Check build logs
npx vercel logs

# Check project info
npx vercel inspect
```

### If you need to update project settings:
```bash
# Pull current configuration
npx vercel pull

# This creates/updates .vercel/project.json
```

## Deployment Commands

```bash
# Preview deployment (for testing)
npx vercel

# Production deployment
npx vercel --prod

# Deploy with specific environment
npx vercel --prod --env DATABASE_URL=your-url

# View deployments
npx vercel ls

# View logs
npx vercel logs [deployment-url]
```

## After First Deployment

1. Get your deployment URL (e.g., `https://jits-coding-platform.vercel.app`)
2. Update `FRONTEND_URL` environment variable in Vercel:
   ```bash
   npx vercel env add FRONTEND_URL production
   # Enter: https://jits-coding-platform.vercel.app
   ```
3. Redeploy:
   ```bash
   npx vercel --prod
   ```

## Verify Deployment

After deployment, test:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ API Health: `https://your-app.vercel.app/api/health`
- ✅ API Auth: `https://your-app.vercel.app/api/auth/student/login`




