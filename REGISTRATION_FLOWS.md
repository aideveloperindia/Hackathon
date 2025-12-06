# Student Registration Flows

## ✅ Two Ways to Register

### Flow 1: Traditional Registration (Hall Ticket First)
1. Student goes to `/student/register`
2. Student enters:
   - Hall Ticket Number
   - Name
   - Branch
   - Section
   - Year
   - Phone Number
   - Email
   - Password
3. System creates:
   - Master Student record (if HT number doesn't exist)
   - Student account linked to that HT number
4. Verification email sent
5. Student verifies email
6. Student can login with HT number + password

### Flow 2: Gmail Login (Email First)
1. Student goes to `/student/login`
2. Student clicks **"Continue with Email"** button
3. Student signs in with **ANY Gmail account** (no restrictions)
4. Google OAuth verifies email automatically
5. System creates:
   - Temporary student account with `OAUTH-` prefix HT number
   - Email is auto-verified (no email verification needed)
6. Student is redirected to **Profile Completion** form
7. Student enters:
   - Hall Ticket Number
   - Name
   - Branch
   - Section
   - Year
   - Phone Number
8. System links:
   - The Gmail email → to the Hall Ticket Number
   - Updates the temporary record with real student details
9. Student can now use the platform

## 🔗 How Email Links to Hall Ticket

- **Traditional Flow**: Hall Ticket → Email (one-to-one relationship)
- **Gmail Flow**: Email → Hall Ticket (email can be linked to any valid HT number)

## ✅ Important Points

1. **Any Gmail can login** - No restrictions on which Gmail accounts can sign in
2. **Email is auto-verified** - Gmail OAuth users don't need email verification
3. **Hall Ticket validation** - Both flows validate HT number format
4. **No duplicate accounts** - One HT number = one account (can't register same HT twice)
5. **Email can be reused** - If a Gmail user completes profile with HT number, that email is linked to that HT

## 🔧 Technical Details

### OAuth Flow
- Redirect URI: `https://jits-coding-platform.vercel.app/api/auth/google/callback` (production)
- Redirect URI: `http://localhost:3001/api/auth/google/callback` (local)
- Uses `FRONTEND_URL` environment variable for consistent redirect URI

### Profile Completion
- Endpoint: `/api/auth/complete-profile`
- Requires authentication (JWT token)
- Updates master student record with real HT number and details
- Links email to hall ticket permanently

## 🚀 Status

✅ **Both flows are working and deployed!**

- Traditional registration: ✅ Working
- Gmail OAuth login: ✅ Working (fixed 400 error)
- Profile completion: ✅ Working
- Email linking: ✅ Working

