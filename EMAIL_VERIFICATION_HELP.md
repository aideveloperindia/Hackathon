# Email Verification Help

## Issue: No Email Received

In development mode, emails are sent to **MailHog** (not your actual inbox).

## Solution 1: Check MailHog (Recommended)

1. Open MailHog web interface: **http://localhost:8025**
2. Look for the verification email
3. Click the verification link in the email

## Solution 2: Direct Verification Link

If MailHog is not running, use the direct verification link:

1. Find your verification token (see below)
2. Go to: `http://localhost:3001/verify-email?token=YOUR_TOKEN`
3. Or use the API directly

## Solution 3: Manual Verification via API

```bash
curl -X POST http://localhost:5001/api/auth/student/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_VERIFICATION_TOKEN"}'
```

## Solution 4: Resend Verification Email

```bash
curl -X POST http://localhost:5001/api/auth/student/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## Solution 5: Start MailHog

If MailHog is not running:

```bash
# Using Docker
docker-compose up -d mailhog

# Or download MailHog and run it
# Visit: https://github.com/mailhog/MailHog
```

## Quick Fix: Verify Without Email

For testing purposes, you can manually verify the email in the database or use the verification token directly.

## Finding Your Verification Token

Check the backend console logs when you registered - it should show the verification URL.

Or query the database to get your token.

