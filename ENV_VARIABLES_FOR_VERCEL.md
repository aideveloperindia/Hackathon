# Environment Variables for Vercel

Copy and paste these into Vercel Dashboard → Your Project → Settings → Environment Variables

## Backend Project Environment Variables

```env
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon

NODE_ENV=production

PORT=5001

JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random

GMAIL_USER=YOUR_GMAIL_ADDRESS@gmail.com

GMAIL_APP_PASSWORD=ljzwemumicdcpsku

SMTP_FROM=YOUR_GMAIL_ADDRESS@gmail.com

FRONTEND_URL=https://YOUR-FRONTEND-APP.vercel.app
```

**Important:** 
- Replace `YOUR_GMAIL_ADDRESS@gmail.com` with your actual Gmail address
- Replace `YOUR-FRONTEND-APP.vercel.app` with your actual Vercel frontend URL after deployment
- The `GMAIL_APP_PASSWORD` is already set (spaces removed): `ljzwemumicdcpsku`

## Frontend Project Environment Variables

```env
REACT_APP_API_URL=https://YOUR-BACKEND-APP.vercel.app
```

**Important:**
- Replace `YOUR-BACKEND-APP.vercel.app` with your actual Vercel backend URL after deployment

## How to Add in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (backend or frontend)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value (e.g., `mongodb+srv://...`)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project after adding variables

## After Deployment

1. Deploy backend first
2. Get backend URL (e.g., `https://jits-backend.vercel.app`)
3. Update frontend `REACT_APP_API_URL` with backend URL
4. Deploy frontend
5. Get frontend URL (e.g., `https://jits-frontend.vercel.app`)
6. Update backend `FRONTEND_URL` with frontend URL
7. Redeploy backend to apply CORS changes

