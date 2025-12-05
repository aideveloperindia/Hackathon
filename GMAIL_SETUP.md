# Gmail Email Setup Guide

This guide will help you configure Gmail SMTP for real email verification in the JITS Coding Event Platform.

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable 2-Step Verification

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to **Security** settings
2. Under "Signing in to Google", find **App passwords**
3. Click on **App passwords**
4. You may need to sign in again
5. Select **Mail** as the app
6. Select **Other (Custom name)** as the device
7. Enter a name like "JITS Coding Platform"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - Remove spaces when using it (use: `abcdefghijklmnop`)

## Step 3: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
```

**Important Notes:**
- Use your **full Gmail address** (e.g., `yourname@gmail.com`)
- Use the **16-character App Password** (not your regular Gmail password)
- Remove spaces from the App Password
- The `SMTP_FROM` should match your `GMAIL_USER`

## Step 4: Restart Backend

After updating the `.env` file, restart the backend:

```bash
# If using Docker
docker-compose restart backend

# If running locally
cd backend
npm run dev
```

## Step 5: Test Email Sending

1. Register a new student account
2. Check your Gmail inbox (and spam folder)
3. You should receive a verification email

## Troubleshooting

### Error: "EAUTH" or "Authentication failed"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password doesn't have spaces

### Error: "Invalid login"
- Double-check your Gmail address is correct
- Ensure the App Password is exactly 16 characters (no spaces)

### No emails received
- Check your spam/junk folder
- Verify the email address in registration is correct
- Check backend logs for email sending errors

### Still using MailHog?
If you want to use MailHog for development instead:
```env
SMTP_HOST=mailhog
SMTP_PORT=1025
```
And make sure MailHog is running: `docker-compose up -d mailhog`

## Security Best Practices

- **Never commit** your `.env` file to git
- **Never share** your App Password
- Use a **dedicated Gmail account** for the platform (recommended)
- Regularly **rotate** your App Password

