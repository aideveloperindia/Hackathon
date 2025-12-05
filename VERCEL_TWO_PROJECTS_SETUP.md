# ✅ Vercel Deployment: Two Separate Projects Required

## ⚠️ Important: You Need TWO Vercel Projects

This is a **monorepo** with separate frontend and backend. You must deploy them as **TWO SEPARATE PROJECTS** on Vercel.

## Project Structure

```
JITS/
├── backend/     ← Deploy as Project #1
└── frontend/    ← Deploy as Project #2
```

## 🚀 Deployment Steps

### Project 1: Backend API

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import: `aideveloperindia/Hackathon`
4. **Configure Settings**:
   - **Project Name**: `jits-backend` (or any name)
   - **Root Directory**: `backend` ⚠️ **CRITICAL: Must be exactly "backend"**
   - **Framework Preset**: **Other**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Add Environment Variables** (Settings → Environment Variables):
   ```env
   DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random
   GMAIL_USER=aideveloperindia@gmail.com
   GMAIL_APP_PASSWORD=ljzwemumicdcpsku
   SMTP_FROM=aideveloperindia@gmail.com
   FRONTEND_URL=https://YOUR-FRONTEND-URL.vercel.app
   ```
   ⚠️ **Note**: Update `FRONTEND_URL` after deploying frontend
6. Click **Deploy**
7. **Save the backend URL** (e.g., `https://jits-backend.vercel.app`)

### Project 2: Frontend

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"** (create a NEW project, not redeploy)
3. Import: `aideveloperindia/Hackathon` (same repo)
4. **Configure Settings**:
   - **Project Name**: `jits-frontend` (or any name)
   - **Root Directory**: `frontend` ⚠️ **CRITICAL: Must be exactly "frontend"**
   - **Framework Preset**: **Other** (or **Vite** if available)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Add Environment Variable**:
   ```env
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.vercel.app
   ```
   ⚠️ **Use the backend URL from Step 7 above**
6. Click **Deploy**
7. **Save the frontend URL** (e.g., `https://jits-frontend.vercel.app`)

### Step 3: Update URLs

After both are deployed:

1. **Update Backend**:
   - Go to backend project → Settings → Environment Variables
   - Update `FRONTEND_URL` with your frontend URL
   - Redeploy backend

2. **Verify**:
   - Frontend URL should load the app
   - Backend URL/api/health should return `{"status":"ok"}`

## 🔍 Troubleshooting 404 Error

### If you get 404 NOT_FOUND:

1. **Check Root Directory**:
   - Backend project: Must be `backend`
   - Frontend project: Must be `frontend`
   - NOT empty, NOT `.`, NOT root

2. **Check if you deployed both projects**:
   - You need TWO separate projects
   - One for backend, one for frontend

3. **Check the URL you're accessing**:
   - Frontend: `https://your-frontend-project.vercel.app`
   - Backend API: `https://your-backend-project.vercel.app/api/health`

4. **Check Build Logs**:
   - Backend: Should show `npm run build` and TypeScript compilation
   - Frontend: Should show `vite build`

## 📋 Quick Checklist

- [ ] Created **TWO separate projects** on Vercel
- [ ] Backend project: Root Directory = `backend`
- [ ] Frontend project: Root Directory = `frontend`
- [ ] Both projects have correct environment variables
- [ ] Backend `FRONTEND_URL` points to frontend URL
- [ ] Frontend `REACT_APP_API_URL` points to backend URL
- [ ] Both projects deployed successfully
- [ ] Frontend URL loads the app (not 404)

## 🎯 Expected URLs

After deployment, you should have:
- **Frontend**: `https://jits-frontend.vercel.app` (or your project name)
- **Backend**: `https://jits-backend.vercel.app` (or your project name)

## ⚠️ Common Mistakes

1. ❌ Deploying only one project
2. ❌ Setting Root Directory to `.` or empty
3. ❌ Using the same project for both frontend and backend
4. ❌ Not setting environment variables
5. ❌ Accessing backend URL instead of frontend URL

## ✅ Correct Setup

- ✅ Two separate Vercel projects
- ✅ Backend: Root = `backend`, Framework = Other
- ✅ Frontend: Root = `frontend`, Framework = Other/Vite
- ✅ Environment variables set correctly
- ✅ URLs updated after deployment



