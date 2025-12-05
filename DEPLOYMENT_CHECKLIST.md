# Deployment Checklist

## ✅ Completed
- [x] Gmail App Password saved: `ljzwemumicdcpsku` (in `gmail_password.txt`)
- [x] Git repository initialized
- [x] Vercel configuration files created
- [x] CORS updated for Vercel
- [x] Environment variables template created

## ⚠️ Action Required

### 1. Provide Gmail Email Address
**You need to provide your Gmail email address** to complete the configuration.

Once you provide it, I'll update:
- `backend/.env` file
- `ENV_VARIABLES_FOR_VERCEL.md` with your email

### 2. Update Backend .env File
Add to `backend/.env`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=your-email@gmail.com
```

### 3. Push to GitHub
```bash
# Create initial commit
git commit -m "Initial commit: JITS Coding Event Platform with Gmail integration"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/jits-coding-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel

#### Backend Deployment:
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables (see `ENV_VARIABLES_FOR_VERCEL.md`)
6. Deploy

#### Frontend Deployment:
1. Add another project in Vercel
2. Same repository, configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `REACT_APP_API_URL` = your backend Vercel URL
4. Deploy

### 5. Update Environment Variables After Deployment

After deploying both:
1. Get backend URL (e.g., `https://jits-backend.vercel.app`)
2. Update frontend `REACT_APP_API_URL` in Vercel
3. Get frontend URL (e.g., `https://jits-frontend.vercel.app`)
4. Update backend `FRONTEND_URL` in Vercel
5. Redeploy both projects

## Files Created for Deployment

- `backend/vercel.json` - Backend Vercel configuration
- `frontend/vercel.json` - Frontend Vercel configuration
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `ENV_VARIABLES_FOR_VERCEL.md` - Environment variables list
- `gmail_password.txt` - Gmail App Password (in .gitignore)

## Next Steps

1. **Provide Gmail email address** → I'll update the config
2. **Create GitHub repository** → Get the URL
3. **Push code to GitHub** → Use commands above
4. **Deploy to Vercel** → Follow steps above
5. **Test email verification** → Register a test student

