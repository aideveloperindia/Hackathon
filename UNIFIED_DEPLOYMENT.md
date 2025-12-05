# ✅ Unified Vercel Deployment Guide

## Project Structure

The project is now structured as a **single Vercel project** with:
- **Frontend**: React + Vite app in `frontend/`
- **Backend API**: Express serverless function in `api/index.ts`
- **All routes**: Accessible from single domain

## 🚀 Deployment Steps

### 1. Create Single Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import: `aideveloperindia/Hackathon`
4. **Configure Settings**:
   - **Project Name**: `jits-coding-platform` (or any name)
   - **Root Directory**: Leave **EMPTY** (root of repo)
   - **Framework Preset**: **Other**
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

### 2. Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```env
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random
GMAIL_USER=aideveloperindia@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=aideveloperindia@gmail.com
```

**Note**: No `FRONTEND_URL` or `REACT_APP_API_URL` needed - they're handled automatically!

### 3. Deploy

Click **Deploy** and wait for build to complete.

## 📍 How It Works

### API Routes
- All API calls go to: `https://your-app.vercel.app/api/*`
- Example: `https://your-app.vercel.app/api/health`
- Example: `https://your-app.vercel.app/api/auth/student/login`

### Frontend Routes
- All frontend routes go to: `https://your-app.vercel.app/*`
- Example: `https://your-app.vercel.app/` (home)
- Example: `https://your-app.vercel.app/student/login`

### Automatic Routing
- `/api/*` → Serverless function (`api/index.ts`)
- `/*` → Frontend React app (`frontend/dist/index.html`)

## ✅ Benefits

1. **Single Domain**: Everything on one URL
2. **No CORS Issues**: Frontend and backend on same origin
3. **Simpler Deployment**: One project instead of two
4. **Easier Management**: One set of environment variables

## 🔍 Verify Deployment

1. **Frontend**: Visit `https://your-app.vercel.app`
   - Should load the React app

2. **API Health**: Visit `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"JITS Coding Platform API is running"}`

3. **Test Registration**: 
   - Go to frontend
   - Register a student
   - Check email for verification

## 🛠️ Local Development

Still works the same:
```bash
npm run dev
# Runs both backend (port 5001) and frontend (port 3001)
```

## 📝 Important Notes

- **Root Directory**: Must be empty (root of repo)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `frontend/dist`
- **Framework**: Other (not Next.js, not Vite auto-detect)

## 🐛 Troubleshooting

### 404 Error
- Check Root Directory is empty (not `frontend` or `backend`)
- Verify Build Command is `npm run vercel-build`
- Check Output Directory is `frontend/dist`

### API Not Working
- Check environment variables are set
- Verify MongoDB connection string
- Check Vercel function logs

### Frontend Not Loading
- Verify Output Directory is `frontend/dist`
- Check build logs for frontend build errors
- Ensure `frontend/dist/index.html` exists after build

## 🎯 Success Criteria

After deployment:
- ✅ Single URL for everything
- ✅ Frontend loads at root URL
- ✅ API accessible at `/api/*`
- ✅ No CORS errors
- ✅ Registration and login work



