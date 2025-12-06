# Complete Vercel Environment Variables

Since this is now a **unified project**, you only need to set these variables in **ONE Vercel project**.

## Required Environment Variables for Vercel

Copy and paste these into **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Database
```env
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon
```

### Application Environment
```env
NODE_ENV=production
```
**Note:** `PORT` is NOT needed on Vercel - Vercel automatically sets the port for serverless functions. PORT is only used for local development.

### Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random
```
**⚠️ IMPORTANT:** Change this to a strong random string (minimum 32 characters) for production!

### Email Configuration (Gmail)
```env
GMAIL_USER=aideveloperindia@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=aideveloperindia@gmail.com
```

### Frontend URL
```env
FRONTEND_URL=https://YOUR-PROJECT-NAME.vercel.app
```
**⚠️ Replace `YOUR-PROJECT-NAME` with your actual Vercel deployment URL**

### Optional: Vercel Auto-Detected
```env
VERCEL_FRONTEND_URL=https://YOUR-PROJECT-NAME.vercel.app
```
(This is usually auto-set by Vercel, but you can set it manually)

---

## Complete List (Copy-Paste Ready)

Here's the complete list in a format you can copy:

```
DATABASE_URL=mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please-change-this-to-something-random
GMAIL_USER=aideveloperindia@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=aideveloperindia@gmail.com
FRONTEND_URL=https://YOUR-PROJECT-NAME.vercel.app
```

---

## Step-by-Step: Adding to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (or create new project from GitHub repo)
3. **Go to**: Settings → Environment Variables
4. **Add each variable**:
   - Click **Add New**
   - **Key**: `DATABASE_URL`
   - **Value**: `mongodb+srv://aideveloperindia_db_user:dTMeXZSFckyimshj@hackathon.chqxqsv.mongodb.net/jits_coding_platform?appName=Hackathon`
   - **Environment**: Select **Production**, **Preview**, and **Development** (all three)
   - Click **Save**
5. **Repeat for each variable** in the list above
6. **After adding all variables**: Go to **Deployments** tab and **Redeploy** your project

---

## Variable Details

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `DATABASE_URL` | MongoDB connection string | ✅ Yes | Your MongoDB Atlas connection |
| `NODE_ENV` | `production` | ✅ Yes | Sets production mode |
| `JWT_SECRET` | Random 32+ char string | ✅ Yes | **Change this!** Generate a secure random string |
| `PORT` | `5001` | ❌ No | **NOT needed on Vercel** - Only for local development |
| `GMAIL_USER` | `aideveloperindia@gmail.com` | ✅ Yes | Email sender address |
| `GMAIL_APP_PASSWORD` | `ljzwemumicdcpsku` | ✅ Yes | Gmail App Password (not regular password) |
| `SMTP_FROM` | `aideveloperindia@gmail.com` | ✅ Yes | Email "From" address |
| `FRONTEND_URL` | Your Vercel URL | ✅ Yes | **Update after deployment** |

---

## Important Notes

### 1. JWT_SECRET Security
**⚠️ CRITICAL:** Generate a strong random JWT secret for production:
```bash
# Generate a secure random string (32+ characters)
openssl rand -base64 32
```
Or use: https://randomkeygen.com/

### 2. FRONTEND_URL
- **Before first deployment**: Use placeholder `https://YOUR-PROJECT-NAME.vercel.app`
- **After deployment**: Update with your actual Vercel URL (e.g., `https://hackathon-xyz.vercel.app`)
- **Then redeploy** to apply CORS changes

### 3. Email Configuration
- Gmail App Password is already configured
- Emails will be sent from `aideveloperindia@gmail.com`
- Make sure Gmail App Password is still valid

### 4. Database
- MongoDB Atlas connection is already configured
- Database: `jits_coding_platform`
- Make sure the connection string is still valid

---

## Quick Setup Script

After deployment, update `FRONTEND_URL`:

1. Deploy your project to Vercel
2. Get your deployment URL (e.g., `https://hackathon-abc123.vercel.app`)
3. Update `FRONTEND_URL` in Vercel environment variables
4. Redeploy

---

## Verification

After setting all variables and deploying:

1. ✅ Check that API endpoints work: `https://your-app.vercel.app/api/health`
2. ✅ Test registration - should receive verification email
3. ✅ Test login - should work with JWT authentication
4. ✅ Check server logs in Vercel dashboard for any errors

---

## Troubleshooting

**If emails don't send:**
- Verify `GMAIL_APP_PASSWORD` is correct
- Check Gmail account settings
- Verify `SMTP_FROM` matches `GMAIL_USER`

**If database connection fails:**
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist (should allow all: `0.0.0.0/0`)
- Verify database user permissions

**If authentication fails:**
- Verify `JWT_SECRET` is set and is a strong random string
- Check that `NODE_ENV=production` is set

---

## Security Reminders

- ✅ Never commit `.env` file to Git (already in `.gitignore`)
- ✅ Never commit `github_token.txt` or other credentials
- ✅ Use strong `JWT_SECRET` in production
- ✅ Keep Gmail App Password secure
- ✅ Regularly rotate secrets in production

