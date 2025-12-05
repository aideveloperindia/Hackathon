# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository (for automatic deployments)
- MongoDB Atlas connection string
- Gmail App Password

## Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: JITS Coding Event Platform"

# Add remote repository
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? jits-backend
# - Directory? ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Deploy Frontend to Vercel

1. Add another project in Vercel
2. Same repository, but configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4. Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

#### Backend Environment Variables:

```env
# Database
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon

# Backend
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Gmail Email
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=your-email@gmail.com

# Frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend-app.vercel.app
```

#### Frontend Environment Variables:

```env
REACT_APP_API_URL=https://your-backend-app.vercel.app
```

### 5. Update CORS Settings

After deployment, update `backend/src/index.ts` CORS settings to include your Vercel frontend URL:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://your-frontend-app.vercel.app'
  ],
  credentials: true,
}));
```

### 6. Update Frontend API URL

Update `frontend/src/utils/api.ts` to use production API URL:

```typescript
const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5001';
```

## Important Notes

1. **MongoDB Atlas**: Ensure your IP is whitelisted (or allow from anywhere for Vercel)
2. **Gmail App Password**: Use the 16-character password without spaces
3. **JWT Secret**: Use a strong, random secret in production
4. **CORS**: Update CORS to allow your Vercel frontend domain
5. **Environment Variables**: Set separately for backend and frontend projects

## Post-Deployment

1. Test registration and email verification
2. Test admin login
3. Verify all API endpoints work
4. Check CORS errors in browser console

## Troubleshooting

### Build Fails
- Check Node.js version (Vercel uses Node 18+ by default)
- Ensure all dependencies are in `package.json`

### API Not Working
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Vercel function logs

### Email Not Sending
- Verify Gmail App Password is correct (no spaces)
- Check Gmail user email is correct
- Review Vercel function logs for email errors

