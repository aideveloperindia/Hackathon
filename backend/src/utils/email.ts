import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter based on environment
const createTransporter = () => {
  // Check if Gmail is configured
  if (process.env.SMTP_SERVICE === 'gmail' || process.env.GMAIL_USER) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || process.env.SMTP_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS, // Use App Password, not regular password
      },
    });
  }

  // For development with MailHog (fallback)
  if (process.env.NODE_ENV === 'development' && process.env.SMTP_HOST === 'mailhog') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mailhog',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: false,
    });
  }

  // For custom SMTP server
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  // Default: Gmail (if credentials are provided)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Fallback: log error
  console.error('⚠️ No email configuration found. Please set GMAIL_USER and GMAIL_APP_PASSWORD or SMTP settings.');
  throw new Error('Email service not configured');
};

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@jits.ac.in',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully!');
    console.log('   To:', options.to);
    console.log('   Subject:', options.subject);
    console.log('   Message ID:', info.messageId);
    
    if (process.env.NODE_ENV === 'development' && nodemailer.getTestMessageUrl(info)) {
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Please check your Gmail App Password.');
      console.error('   Make sure you are using an App Password, not your regular Gmail password.');
    }
    throw error; // Re-throw to let the caller handle it
  }
}

export function generateVerificationEmail(verifyToken: string, email: string): EmailOptions {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verifyToken}`;
  
  return {
    to: email,
    subject: 'Verify your email - JITS Coding Event Platform',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to JITS Coding Event Platform!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <a href="${verifyUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you did not register for this platform, please ignore this email.</p>
              <p>&copy; JITS Coding Event Platform</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

