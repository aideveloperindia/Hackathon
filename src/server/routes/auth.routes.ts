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
        : (process.env.FRONTEND_URL || 'http://localhost:5001');
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

// Student Login with HT No and Phone Number (for team users)
router.post('/student/login-ht',   async (req: Request, res: Response) => {
    try {
      console.log('🔍 HT Login attempt:', { htNo: req.body.htNo, phoneNumber: req.body.phoneNumber ? '***' : 'missing' });
      
      // Simple validation
      if (!req.body.htNo || !req.body.phoneNumber) {
        return res.status(400).json({ error: 'Hall Ticket Number and Phone Number are required' });
      }

      const { htNo, phoneNumber } = req.body;
      const trimmedHtNo = htNo.trim().toUpperCase();
      const trimmedPhone = phoneNumber.trim();

      console.log('📋 Processing login for:', { htNo: trimmedHtNo, phoneLength: trimmedPhone.length });

      // Allowed HT Numbers (the 4 team users)
      const allowedHtNos = ['22271A6651', '22271A6652', '22271A6629', '232275A6601'];
      
      if (!allowedHtNos.includes(trimmedHtNo)) {
        console.log('❌ HT No not in allowed list:', trimmedHtNo);
        return res.status(403).json({ error: 'Access denied. Invalid Hall Ticket Number.' });
      }

      // Find master student by HT No
      console.log('🔍 Looking up master student...');
      const masterStudent = await prisma.masterStudent.findUnique({
        where: { htNo: trimmedHtNo },
        include: { student: true },
      });

      if (!masterStudent) {
        console.log('❌ Master student not found:', trimmedHtNo);
        return res.status(401).json({ error: 'Hall Ticket Number not found.' });
      }

      console.log('✅ Master student found:', { 
        htNo: masterStudent.htNo, 
        name: masterStudent.name,
        phoneNumber: masterStudent.phoneNumber,
        hasStudent: !!masterStudent.student 
      });

      // Verify phone number matches
      if (masterStudent.phoneNumber !== trimmedPhone) {
        console.log('❌ Phone number mismatch:', { 
          expected: masterStudent.phoneNumber, 
          received: trimmedPhone 
        });
        return res.status(401).json({ error: 'Invalid phone number. Please check and try again.' });
      }

      // Check if student account exists
      if (!masterStudent.student) {
        console.log('❌ No student account found for HT:', trimmedHtNo);
        return res.status(401).json({ error: 'No account found. Please contact support.' });
      }

      const student = masterStudent.student;
      console.log('✅ Student account found:', { id: student.id, email: student.email });

      // Generate token
      console.log('🔑 Generating token...');
      const token = generateToken({
        userId: student.id,
        email: student.email,
        role: 'student',
        htNo: masterStudent.htNo,
      });

      console.log(`✅ HT Login successful for ${trimmedHtNo}`);

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
          phoneNumber: masterStudent.phoneNumber,
          role: 'student',
        },
      });
    } catch (error: any) {
      console.error('❌ HT Login error:', error);
      console.error('   Error name:', error?.name);
      console.error('   Error message:', error?.message);
      console.error('   Error stack:', error?.stack);
      res.status(500).json({ 
        error: 'Login failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.message,
          stack: error?.stack 
        })
      });
    }
  }
);

// Student Login (Original - with email/password)
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
      : (process.env.FRONTEND_URL || 'http://localhost:5001');
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
  try {
    // Get Client ID from environment
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    
    // Validate Client ID exists
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === '') {
      console.error('❌ GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ 
        error: 'Google OAuth not configured',
        message: 'GOOGLE_CLIENT_ID environment variable is not set'
      });
    }

    // Determine redirect URI based on environment
    let redirectUri: string;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_URL;
    
    if (isProduction) {
      // Production - use hardcoded URL
      redirectUri = 'https://jits-coding-platform-new.vercel.app/api/auth/google/callback';
    } else {
      // Local development
      redirectUri = 'http://localhost:5001/api/auth/google/callback';
    }

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID.trim(),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: (req.query.state as string) || 'default'
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log('🔗 Redirecting to Google OAuth');
    console.log('   Redirect URI:', redirectUri);
    console.log('   Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

    // Redirect to Google
    res.redirect(googleAuthUrl);
  } catch (error: any) {
    console.error('❌ OAuth error:', error);
    const errorMessage = error?.message || 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to initiate OAuth login',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
});

// Google OAuth - Callback handler
router.get('/google/callback', async (req: Request, res: Response) => {
  // Helper function to get consistent frontend URL (used throughout this callback)
  const getFrontendUrl = (): string => {
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL.replace(/\/$/, '');
    } else if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    } else {
      return 'http://localhost:5001';
    }
  };

  try {
    const { code, state } = req.query;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!code) {
      return res.redirect(`${getFrontendUrl()}/student/login?error=oauth_cancelled`);
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${getFrontendUrl()}/student/login?error=oauth_not_configured`);
    }

    // Exchange code for tokens - must match the redirect URI used in the initial request EXACTLY
    // This MUST be identical to what was sent in the initial OAuth request
    // HARDCODE production URL to ensure exact match - NO DYNAMIC LOGIC
    let redirectUri: string;
    
    // Check if we're in local development
    const isLocalDev = !process.env.VERCEL_URL && process.env.NODE_ENV !== 'production';
    
    if (isLocalDev) {
      // Local development - ALWAYS use localhost:5001 (frontend port)
      redirectUri = 'http://localhost:5001/api/auth/google/callback';
    } else {
      // Production - HARDCODE to match initial request EXACTLY
      // This MUST match the redirect URI in Google Cloud Console character-for-character
      redirectUri = 'https://jits-coding-platform-new.vercel.app/api/auth/google/callback';
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
    console.log('   Redirect URI (EXACT):', redirectUri);
    console.log('   Redirect URI Length:', redirectUri.length);
    console.log('   Redirect URI Encoded:', encodeURIComponent(redirectUri));
    console.log('   Client ID (first 20 chars):', GOOGLE_CLIENT_ID?.substring(0, 20));
    console.log('   Code received:', code ? 'YES' : 'NO');
    console.log('   Code length:', (code as string)?.length || 0);

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
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Error Message:', error.message);
      console.error('   Redirect URI used:', redirectUri);
      console.error('   Redirect URI (should match Google Console EXACTLY):', redirectUri);
      console.error('   Client ID (first 20 chars):', GOOGLE_CLIENT_ID?.substring(0, 20));
      console.error('   Request URL:', req.url);
      console.error('   Request Query:', JSON.stringify(req.query));
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
      return res.redirect(`${getFrontendUrl()}/student/login?error=no_email`);
    }

    // Check if email is verified by Google
    if (!verified_email) {
      return res.redirect(`${getFrontendUrl()}/student/login?error=email_not_verified`);
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
      const frontendUrl = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL.replace(/\/$/, '')
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
      return res.redirect(`${frontendUrl}/student/login?error=student_not_found`);
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

    // Redirect to frontend with token - use FRONTEND_URL consistently
    // This must match the base URL used for the redirect URI
    let frontendUrl: string;
    if (process.env.FRONTEND_URL) {
      frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    } else if (process.env.VERCEL_URL) {
      frontendUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      frontendUrl = 'http://localhost:3001';
    }
    
    if (needsProfileCompletion) {
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&email=${encodeURIComponent(email)}&completeProfile=true`);
    } else {
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`);
    }
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Use consistent frontend URL for error redirects
    let frontendUrl: string;
    if (process.env.FRONTEND_URL) {
      frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    } else if (process.env.VERCEL_URL) {
      frontendUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      frontendUrl = 'http://localhost:3001';
    }
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
    
    console.log('🔍 Complete profile request:');
    console.log('  - Student ID:', studentId);
    console.log('  - Current HT No:', student.masterStudent.htNo);
    console.log('  - New HT No:', trimmedHtNo);
    
    // Validate HT number format: 10 characters, "27" at positions 3-4 (0-indexed: 2-3)
    if (!trimmedHtNo || trimmedHtNo.length !== 10) {
      return res.status(400).json({ error: 'Hall Ticket Number must be exactly 10 characters long' });
    }

    if (trimmedHtNo.charAt(2) !== '2' || trimmedHtNo.charAt(3) !== '7') {
      return res.status(400).json({
        error: 'Invalid Hall Ticket Number. College code "27" must be at positions 3-4 (e.g., 22271A0660)'
      });
    }
    
    // Check if HT number is already taken by another student
    const existingMasterStudent = await prisma.masterStudent.findUnique({
      where: { htNo: trimmedHtNo },
      include: { student: true },
    });

    // If HT number exists and is linked to a different student account, reject
    if (existingMasterStudent && existingMasterStudent.student && existingMasterStudent.student.id !== studentId) {
      console.log('❌ HT number already taken by different student');
      return res.status(400).json({ error: 'This Hall Ticket Number is already registered to another account' });
    }

    console.log('✅ HT number validation passed - proceeding to save');
    
    // Simple: just save the details - NO RESTRICTIONS ON CHANGING HT NUMBER
    let masterStudent;
    
    if (existingMasterStudent && !existingMasterStudent.student) {
      // HT number exists but not linked - link this student to it
      await prisma.student.update({
        where: { id: studentId },
        data: {
          masterStudentId: existingMasterStudent.id,
        },
      });
      // Delete old master student if it was temporary
      if (student.masterStudent.htNo.startsWith('OAUTH-')) {
        await prisma.masterStudent.delete({
          where: { id: student.masterStudentId },
        });
      }
      // Update the master student with new details
      masterStudent = await prisma.masterStudent.update({
        where: { id: existingMasterStudent.id },
        data: {
          htNo: trimmedHtNo,
          name: name.trim(),
          year: parseInt(year),
          section: section.toUpperCase(),
          phoneNumber: phoneNumber.trim(),
          branch: (branch || 'CSE').toUpperCase(),
        },
      });
    } else {
      // Update existing master student with new details
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

