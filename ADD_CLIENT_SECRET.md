# 🔐 Add Google Client Secret to Vercel

## ✅ **Step 1: DONE**
- ✅ `GOOGLE_CLIENT_ID` added to Vercel

## ⚠️ **Step 2: Add Client Secret**

### **Option A: Using Vercel CLI (Recommended)**
```bash
npx vercel env add GOOGLE_CLIENT_SECRET production
```
When prompted, paste your Client Secret (looks like: `GOCSPX-...`)

### **Option B: Using Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Click: **jits-coding-platform** project
3. **Settings** → **Environment Variables**
4. Click **"Add New"**
5. **Key:** `GOOGLE_CLIENT_SECRET`
6. **Value:** Paste your Client Secret
7. **Environment:** Production
8. Click **Save**

---

## 🔍 **Where to Get Client Secret**

1. Go to: https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click on your OAuth client
4. **Copy the Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

## 🚀 **After Adding Secret**

1. **Redeploy:**
   ```bash
   npx vercel --prod
   ```

2. **Test:**
   - Go to: https://jits-coding-platform.vercel.app/student/login
   - Click "Sign in with Google"
   - Should work! ✅

---

**Current Status:**
- ✅ GOOGLE_CLIENT_ID: Added
- ⚠️ GOOGLE_CLIENT_SECRET: Need to add


