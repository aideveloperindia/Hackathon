# Email Setup for Local Development

## Email verification works locally! You have 3 options:

### Option 1: Use Gmail (Real Emails) ✅ Recommended

1. **Uncomment Gmail settings in `.env`**:
   ```bash
   # Edit .env file and uncomment these lines:
   GMAIL_USER=aideveloperindia@gmail.com
   GMAIL_APP_PASSWORD=ljzwemumicdcpsku
   SMTP_FROM=aideveloperindia@gmail.com
   ```

2. **Restart the server**:
   ```bash
   # Stop the current server (Ctrl+C) and restart
   npm run dev
   ```

3. **Register a new account** - you'll receive a real email!

### Option 2: Use MailHog (Development Email Testing) 📧

MailHog captures all emails locally so you can view them in a web interface.

1. **Start MailHog** (if using Docker):
   ```bash
   docker-compose up -d mailhog
   ```

2. **Uncomment MailHog settings in `.env`**:
   ```bash
   SMTP_HOST=mailhog
   SMTP_PORT=1025
   ```

3. **Restart the server**

4. **View emails**: Open http://localhost:8025 in your browser

5. **Register a new account** - check MailHog at http://localhost:8025

### Option 3: Use Console Logs (No Email Setup Needed) 🔍

Even without email configured, the verification URL is logged to the console!

1. **Register a new account**
2. **Check the server console** (where `npm run dev` is running)
3. **Look for this line**:
   ```
   📧 Verification URL (for manual testing): http://localhost:3001/verify-email?token=...
   ```
4. **Copy the URL** and open it in your browser

## Quick Setup (Gmail)

Edit your `.env` file:

```env
# Uncomment these lines:
GMAIL_USER=aideveloperindia@gmail.com
GMAIL_APP_PASSWORD=ljzwemumicdcpsku
SMTP_FROM=aideveloperindia@gmail.com
```

Then restart the server.

## Current Status

Your `.env` has email settings but they're **commented out** (lines start with `#`).

**To enable email:**
1. Open `.env` file
2. Remove the `#` from the Gmail lines
3. Restart server with `npm run dev`

## Testing

After enabling email:
1. Register a new student account
2. Check your email inbox (if using Gmail) OR
3. Check http://localhost:8025 (if using MailHog) OR
4. Check server console for the verification URL

## Troubleshooting

**If emails still don't send:**
- Check server console for error messages
- Verify Gmail App Password is correct
- Make sure server was restarted after changing `.env`
- Check that `.env` file is in the root directory

**Note:** Email works the same way locally and on Vercel - you just need to configure it!



