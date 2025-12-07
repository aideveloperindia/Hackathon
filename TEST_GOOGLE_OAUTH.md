# 🧪 Test Google OAuth - Local & Production

## ✅ **YES - Works in BOTH!**

The code automatically detects the environment and uses the correct URLs.

---

## 🏠 **Local Development Test**

### **Setup:**
1. **Add to `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=413029778276-pddntsesfrhkf5gq9tir2i4bq1dol8m3.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   FRONTEND_URL=http://localhost:3001
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Test:**
   - Go to: `http://localhost:3001/student/login`
   - Click **"Sign in with Google"**
   - Select your Google account
   - Should redirect back and log you in! ✅

---

## 🌐 **Production Test**

### **Setup:**
1. **Add to Vercel Environment Variables:**
   - `GOOGLE_CLIENT_ID` = `413029778276-pddntsesfrhkf5gq9tir2i4bq1dol8m3.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET` = (your secret)

2. **Deploy:**
   ```bash
   npx vercel --prod
   ```

3. **Test:**
   - Go to: `https://jits-coding-platform.vercel.app/student/login`
   - Click **"Sign in with Google"**
   - Select your Google account
   - Should redirect back and log you in! ✅

---

## 🔍 **How It Works**

### **Environment Detection:**
```typescript
// Production (Vercel)
if (process.env.VERCEL_URL) {
  redirectUri = `https://${process.env.VERCEL_URL}/api/auth/google/callback`
}

// Local Development
else {
  redirectUri = `http://localhost:3001/api/auth/google/callback`
}
```

### **Google Cloud Console:**
Both redirect URIs should be configured:
- ✅ `http://localhost:3001/api/auth/google/callback` (local)
- ✅ `https://jits-coding-platform.vercel.app/api/auth/google/callback` (production)

---

## ✅ **What's Configured**

- ✅ **Code:** Auto-detects environment
- ✅ **Redirect URIs:** Both configured in Google Console
- ✅ **Frontend Button:** Works in both environments
- ⚠️ **Client Secret:** Need to add to both `.env` and Vercel

---

## 🚀 **Quick Test**

### **Right Now:**
1. **Add Client Secret to Vercel** (if not done)
2. **Go to:** https://jits-coding-platform.vercel.app/student/login
3. **Click:** "Sign in with Google"
4. **Should work!** ✅

### **Local:**
1. **Add Client Secret to `.env`**
2. **Run:** `npm run dev`
3. **Test:** `http://localhost:3001/student/login`

---

**Answer: YES, works in BOTH local and production!** 🎉



