import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendEmail, generateVerificationEmail } from '../utils/email';
import { authenticate, requireStudent } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = express.Router();

// Student Registration
router.post(
  '/student/register',
  [
    body('htNo').trim().notEmpty().withMessage('Hall Ticket Number is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('branch').trim().notEmpty().withMessage('Branch is required'),
    body('section').trim().notEmpty().withMessage('Section is required'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1, 2, 3, or 4'),
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { htNo, name, branch, section, year, email, password } = req.body;

      // Trim all inputs to remove whitespace
      // Trim and normalize HT number
      const trimmedHtNo = htNo?.trim().toUpperCase();
      const trimmedName = name?.trim();
      const trimmedBranch = branch?.trim().toUpperCase();
      const trimmedSection = section?.trim().toUpperCase();
      const trimmedYear = typeof year === 'string' ? parseInt(year, 10) : year;

      console.log('Registration attempt for HT:', trimmedHtNo);

      // Validate HT number format: 10 characters, "27" at positions 3-4 (0-indexed: 2-3)
      if (!trimmedHtNo || trimmedHtNo.length !== 10) {
        return res.status(400).json({ error: 'Hall Ticket Number must be exactly 10 characters long' });
      }

      if (trimmedHtNo.charAt(2) !== '2' || trimmedHtNo.charAt(3) !== '7') {
        return res.status(400).json({ 
          error: 'Invalid Hall Ticket Number. College code "27" must be at positions 3-4 (e.g., 22271A0660)' 
        });
      }

      console.log('✅ HT number format validated:', trimmedHtNo);

      // Check if HT number exists in master_students (optional - for reference only)
      // If not found, we can still allow registration since we're only checking format
      let masterStudent = await prisma.masterStudent.findUnique({
        where: { htNo: trimmedHtNo },
      });

      if (!masterStudent) {
        // HT number format is valid but not in master list - create master student record
        console.log('⚠️ HT number not in master list, creating new master record.');
        masterStudent = await prisma.masterStudent.create({
          data: {
            htNo: trimmedHtNo,
            name: trimmedName,
            branch: trimmedBranch,
            section: trimmedSection,
            year: trimmedYear,
          },
        });
        console.log('✅ Created master student record for HT:', trimmedHtNo);
      } else {
        console.log('✅ Master record found for HT:', trimmedHtNo);
      }

      // Check if account already exists for this HT No
      const existingStudent = await prisma.student.findUnique({
        where: { masterStudentId: masterStudent.id },
      });

      if (existingStudent) {
        return res.status(400).json({ error: 'An account already exists for this Hall Ticket Number' });
      }

      // Check if email is already used
      const existingEmail = await prisma.student.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // Create student account
      const passwordHash = await hashPassword(password);
      const verifyToken = uuidv4();
      const verifyExpiry = new Date();
      verifyExpiry.setHours(verifyExpiry.getHours() + 24); // 24 hours expiry

      const student = await prisma.student.create({
        data: {
          masterStudentId: masterStudent.id,
          email,
          passwordHash,
          emailVerifyToken: verifyToken,
          emailVerifyExpiry: verifyExpiry,
        },
      });

      // Generate verification URL for logging
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.FRONTEND_URL || 'http://localhost:3001');
      const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;

      // Send verification email (non-blocking - don't fail registration if email fails)
      sendEmail(generateVerificationEmail(verifyToken, email))
        .then(() => {
          console.log('✅ Verification email sent successfully to:', email);
          console.log('📧 Verification URL:', verifyUrl);
        })
        .catch((emailError: any) => {
          console.error('⚠️ Failed to send verification email (registration still successful):', emailError.message);
          if (emailError.code === 'EAUTH') {
            console.error('   ❌ Gmail authentication failed. Check GMAIL_APP_PASSWORD in environment variables.');
          }
          console.log('📧 Verification URL (use this if email not received):', verifyUrl);
        });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        studentId: student.id,
        ...(process.env.NODE_ENV === 'development' && {
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verifyToken}`,
        }),
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        if (error.meta?.target?.includes('email')) {
          errorMessage = 'Email is already registered.';
        } else if (error.meta?.target?.includes('masterStudentId')) {
          errorMessage = 'An account already exists for this Hall Ticket Number.';
        }
      } else if (error.message?.includes('Email service not configured')) {
        errorMessage = 'Email service is not configured. Please contact administrator.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      });
    }
  }
);

// Student Login
router.post(
  '/student/login',
  [
    body('htNo').trim().notEmpty().withMessage('Hall Ticket Number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { htNo, password } = req.body;

      // Find master student
      const masterStudent = await prisma.masterStudent.findUnique({
        where: { htNo },
        include: { student: true },
      });

      if (!masterStudent) {
        console.log(`Login attempt failed: HT Number ${htNo} not found in master records`);
        return res.status(401).json({ error: 'Hall Ticket Number not found. Please register first.' });
      }

      if (!masterStudent.student) {
        console.log(`Login attempt failed: No account exists for HT ${htNo}`);
        return res.status(401).json({ error: 'No account found for this Hall Ticket Number. Please register first.' });
      }

      const student = masterStudent.student;

      // Check email verification
      if (!student.isEmailVerified) {
        return res.status(403).json({
          error: 'Please verify your email before logging in',
          requiresVerification: true,
        });
      }

      // Check password - CRITICAL: Must validate password before allowing login
      const passwordMatch = await comparePassword(password, student.passwordHash);
      if (!passwordMatch) {
        console.log(`Login attempt failed for HT ${htNo}: Password mismatch`);
        return res.status(401).json({ error: 'Invalid password. Please check your password and try again.' });
      }
      
      console.log(`Login successful for HT ${htNo}`);

      // Generate token
      const token = generateToken({
        userId: student.id,
        email: student.email,
        role: 'student',
        htNo: masterStudent.htNo,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: student.id,
          email: student.email,
          htNo: masterStudent.htNo,
          name: masterStudent.name,
          branch: masterStudent.branch,
          section: masterStudent.section,
          year: masterStudent.year,
          role: 'student', // CRITICAL: Include role in user object
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// Email Verification
router.post('/student/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    console.log('🔍 Verifying email with token:', token.substring(0, 20) + '...');
    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token type:', typeof token);

    // Try to find student with this token
    const student = await prisma.student.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!student) {
      console.log('❌ Token not found in database. Token may have been used, expired, or invalid.');
      console.log('🔍 Searching for similar tokens...');
      
      // Debug: Check if there are any unverified students
      const unverifiedCount = await prisma.student.count({
        where: {
          isEmailVerified: false,
          emailVerifyToken: { not: null },
        },
      });
      console.log('📊 Unverified students with tokens:', unverifiedCount);
      // Check if student exists but token is null (already verified)
      const studentByEmail = await prisma.student.findFirst({
        where: {
          email: req.body.email || undefined,
        },
      });
      
      if (studentByEmail?.isEmailVerified) {
        return res.status(400).json({ 
          error: 'This email is already verified. You can log in now.',
          alreadyVerified: true 
        });
      }
      
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.',
        suggestion: 'Click "Resend verification email" to get a new link.'
      });
    }

    // Check if token expired (but allow verification even if slightly expired in dev)
    if (student.emailVerifyExpiry && student.emailVerifyExpiry < new Date()) {
      // In development, allow expired tokens (extend expiry)
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Token expired but allowing verification in development mode');
      } else {
        return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
      }
    }

    await prisma.student.update({
      where: { id: student.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    console.log('✅ Email verified for student:', student.id);
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Resend verification email (for development)
router.post('/student/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student account not found' });
    }

    if (student.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new token
    const verifyToken = uuidv4();
    const verifyExpiry = new Date();
    verifyExpiry.setHours(verifyExpiry.getHours() + 24);

    await prisma.student.update({
      where: { id: student.id },
      data: {
        emailVerifyToken: verifyToken,
        emailVerifyExpiry: verifyExpiry,
      },
    });

    // Generate verification URL for response
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.FRONTEND_URL || 'http://localhost:3001');
    const verificationUrl = `${baseUrl}/verify-email?token=${verifyToken}`;

    // Send email
    let emailSent = false;
    let emailError = null;
    try {
      await sendEmail(generateVerificationEmail(verifyToken, email));
      console.log('✅ Resend verification email sent to:', email);
      emailSent = true;
    } catch (emailErrorCaught: any) {
      emailError = emailErrorCaught;
      console.error('⚠️ Failed to send verification email:', emailErrorCaught.message);
      if (emailErrorCaught.code === 'EAUTH') {
        console.error('   ❌ Gmail authentication failed. Check GMAIL_APP_PASSWORD in environment variables.');
      }
    }

    // Always return verification URL so user can verify even if email fails
    res.json({ 
      message: emailSent 
        ? 'Verification email sent. Please check your inbox (and spam folder).'
        : 'Email sending failed, but you can use the verification link below.',
      verificationUrl: verificationUrl,
      emailSent: emailSent,
      ...(emailError && {
        emailError: emailError.message,
        note: 'If email is not working, use the verification URL above to verify your account.'
      })
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Admin Registration
router.post(
  '/admin/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    try {
      // Check if admin registration is enabled (can be controlled via env)
      if (process.env.ALLOW_ADMIN_REGISTRATION === 'false') {
        return res.status(403).json({ error: 'Admin registration is disabled' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if email already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      // Create admin
      const passwordHash = await hashPassword(password);
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      res.status(201).json({
        message: 'Admin registration successful',
        adminId: admin.id,
      });
    } catch (error: any) {
      console.error('Admin registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
);

// Admin Login
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password - CRITICAL: Must validate password before allowing login
      const passwordMatch = await comparePassword(password, admin.passwordHash);
      if (!passwordMatch) {
        console.log(`Admin login attempt failed for ${email}: Password mismatch`);
        return res.status(401).json({ error: 'Invalid password. Please check your password and try again.' });
      }
      
      console.log(`Admin login successful for ${email}`);

      const token = generateToken({
        userId: admin.id,
        email: admin.email,
        role: 'admin',
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin', // CRITICAL: Include role in user object
        },
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // Extract error message safely
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.code) {
        // Prisma or other error codes
        errorMessage = `Database error: ${error.code}`;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Google OAuth - Initiate login
router.get('/google', (req: Request, res: Response) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  // Get the redirect URL - must match Google Cloud Console configuration EXACTLY
  // Use FRONTEND_URL (fixed production URL) if set, otherwise use VERCEL_URL or localhost
  let redirectUri: string;
  
  if (process.env.FRONTEND_URL) {
    // Fixed production URL (preferred - set this in Vercel env vars)
    // Remove trailing slash if present
    const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    redirectUri = `${baseUrl}/api/auth/google/callback`;
  } else if (process.env.VERCEL_URL) {
    // Fallback to dynamic Vercel URL
    redirectUri = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
  } else {
    // Local development
    redirectUri = 'http://localhost:3001/api/auth/google/callback';
  }
  
  // Allow override from query parameter
  if (req.query.redirect_uri) {
    redirectUri = req.query.redirect_uri as string;
  }
  
  // Ensure no trailing slash and exact format
  redirectUri = redirectUri.replace(/\/$/, '');

  const scope = 'openid email profile';
  const responseType = 'code';
  const state = req.query.state as string || 'default';

  // Build Google OAuth URL with proper encoding
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  console.log('🔗 OAuth redirect URI:', redirectUri);
  console.log('🔗 OAuth URL:', googleAuthUrl.substring(0, 100) + '...');

  res.redirect(googleAuthUrl);
});

// Google OAuth - Callback handler
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/student/login?error=oauth_cancelled`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.FRONTEND_URL || 'http://localhost:3001');
      return res.redirect(`${frontendUrl}/student/login?error=oauth_not_configured`);
    }

    // Exchange code for tokens - must match the redirect URI used in the initial request EXACTLY
    // Use FRONTEND_URL (fixed production URL) if set, otherwise use VERCEL_URL or localhost
    let redirectUri: string;
    
    if (process.env.FRONTEND_URL) {
      // Fixed production URL (preferred - set this in Vercel env vars)
      // Remove trailing slash if present
      const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
      redirectUri = `${baseUrl}/api/auth/google/callback`;
    } else if (process.env.VERCEL_URL) {
      // Fallback to dynamic Vercel URL
      redirectUri = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
    } else {
      // Local development
      redirectUri = 'http://localhost:3001/api/auth/google/callback';
    }
    
    // Ensure no trailing slash and exact format
    redirectUri = redirectUri.replace(/\/$/, '');

    // Exchange code for tokens - use URLSearchParams for proper encoding
    const tokenParams = new URLSearchParams({
      code: code as string,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    console.log('🔄 Exchanging OAuth code for token...');
    console.log('   Redirect URI:', redirectUri);
    console.log('   Client ID:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');

    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        tokenParams.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (error: any) {
      console.error('❌ Google OAuth token exchange failed:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data);
      console.error('   Redirect URI used:', redirectUri);
      console.error('   Client ID:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
      throw error;
    }

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Google
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { email, name, picture, verified_email } = userInfoResponse.data;

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/student/login?error=no_email`);
    }

    // Check if email is verified by Google
    if (!verified_email) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/student/login?error=email_not_verified`);
    }

    // Find or create student account
    let student = await prisma.student.findUnique({
      where: { email },
      include: { masterStudent: true },
    });

    if (!student) {
      // Create a temporary master student record for OAuth users
      // They'll need to complete their profile later
      const tempHtNo = `OAUTH-${Date.now()}`;
      let masterStudent = await prisma.masterStudent.findUnique({
        where: { htNo: tempHtNo },
      });

      if (!masterStudent) {
        masterStudent = await prisma.masterStudent.create({
          data: {
            htNo: tempHtNo,
            name: name || 'OAuth User',
            branch: 'OAuth',
            section: 'OAuth',
            year: 1,
          },
        });
      }

      // Create student account with email verified (since Google verified it)
      const passwordHash = await hashPassword(uuidv4()); // Random password for OAuth users
      student = await prisma.student.create({
        data: {
          masterStudentId: masterStudent.id,
          email,
          passwordHash,
          isEmailVerified: true, // ✅ Auto-verified by Google!
          emailVerifyToken: null,
          emailVerifyExpiry: null,
        },
        include: { masterStudent: true },
      });
    } else {
      // Existing user - auto-verify their email if not already verified
      if (!student.isEmailVerified) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            isEmailVerified: true,
            emailVerifyToken: null,
            emailVerifyExpiry: null,
          },
        });
      }
      
      // Reload student to get updated masterStudent
      student = await prisma.student.findUnique({
        where: { id: student.id },
        include: { masterStudent: true },
      });
    }

    if (!student || !student.masterStudent) {
      console.error('❌ Student or masterStudent not found after OAuth login');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/student/login?error=student_not_found`);
    }

    // Check if student needs to complete profile
    // Either HT number starts with OAUTH- OR has incomplete profile data
    const needsProfileCompletion = 
      student.masterStudent.htNo.startsWith('OAUTH-') ||
      student.masterStudent.branch === 'OAuth' ||
      !student.masterStudent.phoneNumber;
    
    console.log('🔍 OAuth login check:');
    console.log('  - Student HT No:', student.masterStudent.htNo);
    console.log('  - Student Branch:', student.masterStudent.branch);
    console.log('  - Student Phone:', student.masterStudent.phoneNumber);
    console.log('  - Needs profile completion:', needsProfileCompletion);

    // Generate JWT token
    const token = generateToken({
      userId: student.id,
      email: student.email,
      role: 'student',
      htNo: student.masterStudent.htNo,
    });

    // Redirect to frontend with token
    const frontendUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.FRONTEND_URL || 'http://localhost:3001');
    
    if (needsProfileCompletion) {
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&email=${encodeURIComponent(email)}&completeProfile=true`);
    } else {
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`);
    }
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/student/login?error=oauth_failed`);
  }
});

// Complete student profile (for OAuth users)
router.post('/complete-profile', authenticate, requireStudent, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('htNo').trim().notEmpty().withMessage('Hall Ticket Number is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('branch').optional().trim(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user!.userId;
    const { name, htNo, year, section, phoneNumber, branch } = req.body;

    // Get current student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { masterStudent: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const trimmedHtNo = htNo.trim().toUpperCase();
    
    // Check if HT number is already taken by another student
    const existingMasterStudent = await prisma.masterStudent.findUnique({
      where: { htNo: trimmedHtNo },
      include: { student: true },
    });

    // If HT number exists and is linked to a different student account, reject
    if (existingMasterStudent && existingMasterStudent.student && existingMasterStudent.student.id !== studentId) {
      return res.status(400).json({ error: 'This Hall Ticket Number is already registered to another account' });
    }

    // Update or create master student record
    let masterStudent;
    if (student.masterStudent.htNo.startsWith('OAUTH-')) {
      // OAuth user completing profile - update temporary master student or link to existing
      if (existingMasterStudent && !existingMasterStudent.student) {
        // HT number exists but not linked to any student - link this student to it
        await prisma.student.update({
          where: { id: studentId },
          data: {
            masterStudentId: existingMasterStudent.id,
          },
        });
        // Delete the temporary master student
        await prisma.masterStudent.delete({
          where: { id: student.masterStudentId },
        });
        // Update the existing master student with new details
        masterStudent = await prisma.masterStudent.update({
          where: { id: existingMasterStudent.id },
          data: {
            name: name.trim(),
            year: parseInt(year),
            section: section.toUpperCase(),
            phoneNumber: phoneNumber.trim(),
            branch: (branch || 'CSE').toUpperCase(),
          },
        });
      } else {
        // Update existing temporary master student with real HT number
        masterStudent = await prisma.masterStudent.update({
          where: { id: student.masterStudentId },
          data: {
            htNo: trimmedHtNo,
            name: name.trim(),
            year: parseInt(year),
            section: section.toUpperCase(),
            phoneNumber: phoneNumber.trim(),
            branch: (branch || 'CSE').toUpperCase(),
          },
        });
      }
    } else {
      // Existing student updating profile - only update if HT number matches
      if (student.masterStudent.htNo !== trimmedHtNo) {
        return res.status(400).json({ error: 'Cannot change Hall Ticket Number. Please contact support.' });
      }
      // Update existing master student
      masterStudent = await prisma.masterStudent.update({
        where: { id: student.masterStudentId },
        data: {
          name: name.trim(),
          year: parseInt(year),
          section: section.toUpperCase(),
          phoneNumber: phoneNumber.trim(),
          branch: (branch || 'CSE').toUpperCase(),
        },
      });
    }

    res.json({
      message: 'Profile completed successfully',
      student: {
        id: student.id,
        email: student.email,
        htNo: masterStudent.htNo,
        name: masterStudent.name,
        branch: masterStudent.branch,
        section: masterStudent.section,
        year: masterStudent.year,
        phoneNumber: masterStudent.phoneNumber,
      },
    });
  } catch (error: any) {
    console.error('Complete profile error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Hall Ticket Number is already in use' });
    }
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

export default router;

