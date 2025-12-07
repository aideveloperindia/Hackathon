# 🧪 Test Email Verification

## ✅ **What's Been Fixed**

1. **FRONTEND_URL Set** - Verification links now use production URL
2. **Resend Button Added** - Users can request new verification emails
3. **Better Error Handling** - Improved logging for email issues

---

## 📧 **How to Test**

### **Step 1: Register a New Account**
1. Go to: https://jits-coding-platform.vercel.app
2. Click "Student Register"
3. Fill in the form with your real email address
4. Submit registration

### **Step 2: Check Your Email**
1. **Check Inbox** - Look for email from `aideveloperindia@gmail.com`
2. **Check Spam/Junk** - Email might be in spam folder
3. **Subject:** "Verify your email - JITS Coding Event Platform"

### **Step 3: Verify Email**
1. Click the "Verify Email" button in the email
2. OR copy the verification link and paste in browser
3. You should see "Email Verified!" message

### **Step 4: Login**
1. Go to Student Login page
2. Enter your Hall Ticket Number and password
3. You should be able to login successfully

---

## 🔄 **If Email Not Received**

### **Option 1: Resend Verification Email**
1. Go to Student Login page
2. Try to login (you'll see error about email verification)
3. Click "Resend verification email" button
4. Enter your email address
5. Check inbox for new email

### **Option 2: Check Server Logs**
```bash
npx vercel logs [deployment-url] --follow
```

Look for:
- ✅ "Email sent successfully!" - Email was sent
- ❌ "Error sending email" - Email failed to send
- ❌ "EAUTH" - Gmail authentication error

---

## 🔐 **Gmail Configuration Check**

### **Verify Environment Variables:**
```bash
npx vercel env ls
```

Should show:
- ✅ `GMAIL_USER` - Your Gmail address
- ✅ `GMAIL_APP_PASSWORD` - 16-character app password
- ✅ `SMTP_FROM` - Sender email
- ✅ `FRONTEND_URL` - Production URL

### **If Gmail Not Working:**
1. **Check App Password:**
   - Go to Google Account → Security
   - Verify 2-Step Verification is enabled
   - Generate new App Password if needed
   - Update `GMAIL_APP_PASSWORD` in Vercel

2. **Check Email Settings:**
   - Make sure "Less secure app access" is not needed (use App Password instead)
   - Verify Gmail account is not locked

---

## 📝 **Common Issues**

### **Issue: Email goes to spam**
- **Solution:** Check spam folder, mark as "Not Spam"
- **Prevention:** Add sender to contacts

### **Issue: Verification link doesn't work**
- **Check:** Link should start with `https://jits-coding-platform.vercel.app`
- **Not:** `http://localhost:3001` (old issue, now fixed)

### **Issue: "Email service not configured"**
- **Check:** Gmail environment variables in Vercel
- **Verify:** `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set

### **Issue: "EAUTH" error**
- **Problem:** Gmail authentication failed
- **Solution:** 
  1. Verify App Password is correct (16 characters)
  2. Regenerate App Password if needed
  3. Update `GMAIL_APP_PASSWORD` in Vercel

---

## ✅ **Expected Behavior**

### **Registration:**
- ✅ Registration succeeds
- ✅ Verification email sent (check logs)
- ✅ User sees "Registration successful" message

### **Email:**
- ✅ Email arrives within 1-2 minutes
- ✅ Contains verification link
- ✅ Link points to production URL

### **Verification:**
- ✅ Clicking link verifies email
- ✅ User can now login
- ✅ No more "verify email" error

---

## 🚀 **Next Steps**

1. **Test Registration** - Register with your email
2. **Check Email** - Look in inbox and spam
3. **Verify Email** - Click verification link
4. **Login** - Should work now!

If you still have issues, check the server logs for detailed error messages.

---

**Status:** ✅ **READY FOR TESTING**



