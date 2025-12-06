import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendEmail, generateVerificationEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

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

    console.log('🔍 Verifying email with token:', token.substring(0, 8) + '...');

    const student = await prisma.student.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!student) {
      console.log('❌ Token not found in database. Token may have been used or expired.');
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

export default router;

