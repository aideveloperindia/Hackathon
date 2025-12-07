# 🥄 Google OAuth Setup - Step by Step (Spoon Fed)

## 📋 **What You'll Get**
- Client ID (looks like: `123456789-abc.apps.googleusercontent.com`)
- Client Secret (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

## 🚀 **STEP 1: Go to Google Cloud Console**

1. **Open your browser**
2. **Go to:** https://console.cloud.google.com/
3. **Sign in** with your Google account (the one you want to use for OAuth)

---

## 🚀 **STEP 2: Create or Select a Project**

### **Option A: Create New Project**
1. Click the **project dropdown** at the top (it might say "Select a project" or show a project name)
2. Click **"New Project"**
3. **Project name:** `JITS Coding Platform` (or any name you like)
4. Click **"Create"**
5. **Wait 10-20 seconds** for project to be created
6. Click **"Select Project"** when it appears

### **Option B: Use Existing Project**
1. Click the **project dropdown** at the top
2. Select your existing project

---

## 🚀 **STEP 3: Enable Google+ API (if needed)**

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. If you see it, click on it and click **"Enable"**
4. If you don't see it, that's okay - skip this step

---

## 🚀 **STEP 4: Configure OAuth Consent Screen**

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. **User Type:** Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the form:
   - **App name:** `JITS Coding Platform`
   - **User support email:** Select your email (the one you're logged in with)
   - **App logo:** (Optional - skip for now)
   - **Application home page:** `https://jits-coding-platform.vercel.app`
   - **Application privacy policy link:** (Optional - skip for now)
   - **Application terms of service link:** (Optional - skip for now)
   - **Authorized domains:** Leave empty for now
   - **Developer contact information:** Your email
5. Click **"Save and Continue"**
6. **Scopes:** Click **"Add or Remove Scopes"**
   - Check: ✅ **`.../auth/userinfo.email`**
   - Check: ✅ **`.../auth/userinfo.profile`**
   - Click **"Update"**
7. Click **"Save and Continue"**
8. **Test users:** (Skip for now - we'll add later if needed)
9. Click **"Save and Continue"**
10. **Summary:** Review and click **"Back to Dashboard"**

---

## 🚀 **STEP 5: Create OAuth Credentials**

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (blue button at the top)
3. Select **"OAuth client ID"**

---

## 🚀 **STEP 6: Configure OAuth Client**

1. **Application type:** Select **"Web application"**
2. **Name:** `JITS Coding Platform Web Client`
3. **Authorized JavaScript origins:** Click **"+ ADD URI"** and add:
   ```
   http://localhost:3001
   https://jits-coding-platform.vercel.app
   ```
   (Add each one separately by clicking "+ ADD URI" for each)
4. **Authorized redirect URIs:** Click **"+ ADD URI"** and add:
   ```
   http://localhost:3001/api/auth/google/callback
   https://jits-coding-platform.vercel.app/api/auth/google/callback
   ```
   (Add each one separately)
5. Click **"CREATE"**

---

## 🚀 **STEP 7: Copy Your Credentials**

You'll see a popup with:
- **Your Client ID** (copy this!)
- **Your Client Secret** (copy this!)

**⚠️ IMPORTANT:**
- **Copy both** and save them somewhere safe
- The Client Secret will only be shown ONCE
- If you lose it, you'll need to create a new one

**Example format:**
- Client ID: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- Client Secret: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

---

## 🚀 **STEP 8: Add to Vercel**

1. Go to: https://vercel.com/dashboard
2. Click on your project: **"jits-coding-platform"**
3. Click **"Settings"** (top menu)
4. Click **"Environment Variables"** (left sidebar)
5. Click **"Add New"**
6. Add **first variable:**
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** Paste your Client ID
   - **Environment:** Select **"Production"** (and Preview if you want)
   - Click **"Save"**
7. Click **"Add New"** again
8. Add **second variable:**
   - **Key:** `GOOGLE_CLIENT_SECRET`
   - **Value:** Paste your Client Secret
   - **Environment:** Select **"Production"** (and Preview if you want)
   - Click **"Save"**

---

## ✅ **You're Done!**

Now I'll implement the Google OAuth code. Just send me:
- ✅ Your **Client ID**
- ✅ Your **Client Secret**

Or if you've added them to Vercel, just let me know and I'll implement the code!

---

## 🆘 **Troubleshooting**

### **Can't find "OAuth consent screen"?**
- Make sure you're in the correct project
- Try refreshing the page

### **"External" option not available?**
- You might be using a Google Workspace account
- Select "Internal" instead

### **Can't create OAuth client?**
- Make sure OAuth consent screen is configured first
- Check that you've enabled the required APIs

### **Lost your Client Secret?**
- Go back to Credentials
- Click on your OAuth client
- Click "Reset Secret" to generate a new one

---

## 📝 **Quick Checklist**

- [ ] Created/Selected Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client ID
- [ ] Copied Client ID and Client Secret
- [ ] Added to Vercel environment variables

**Once done, let me know and I'll implement the code!** 🚀



