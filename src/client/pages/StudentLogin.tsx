import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    htNo: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.htNo.trim()) {
      setError('Please enter your Hall Ticket Number');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/student/login', {
        htNo: formData.htNo.trim(),
        password: formData.password.trim(),
      });
      
      // CRITICAL: Only proceed if we have valid token and user data
      if (!response.data || !response.data.token || !response.data.user) {
        setError('Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
      
      // Ensure user object has role (backend should provide it, but add as fallback)
      const userData = {
        ...response.data.user,
        role: response.data.user.role || 'student' as const,
      };
      
      console.log('Student login response:', { token: response.data.token, user: userData });
      
      // Store credentials and navigate
      login(response.data.token, userData);
      navigate('/select-language');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message safely - always ensure it's a string
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      let isVerificationError = false;
      
      if (error.response?.data?.requiresVerification || error.response?.status === 403) {
        errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
        isVerificationError = true;
      } else if (error.response?.status === 401) {
        const errorData = error.response?.data;
        if (typeof errorData?.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        } else {
          errorMessage = 'Invalid Hall Ticket Number or password. Please check and try again.';
        }
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else         if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
        // Check if error message indicates verification needed
        if (typeof errorData.error === 'string' && errorData.error.toLowerCase().includes('verify')) {
          isVerificationError = true;
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
        if (error.message.toLowerCase().includes('verify')) {
          isVerificationError = true;
        }
      }
      
      setError(errorMessage);
      setNeedsVerification(isVerificationError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Student Login</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="mb-2">{error}</p>
            {needsVerification && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const email = prompt('Enter your email address to resend verification:');
                      if (email && email.trim()) {
                        setLoading(true);
                        const response = await api.post('/auth/student/resend-verification', { email: email.trim() });
                        
                        // Show verification URL if email failed or always show it
                        const message = response.data.emailSent
                          ? '✅ Verification email sent! Please check your inbox (and spam folder).\n\n'
                          : '⚠️ Email sending failed, but you can verify using the link below.\n\n';
                        
                        const verificationUrl = response.data.verificationUrl;
                        const fullMessage = message + 
                          'Verification Link:\n' + verificationUrl + '\n\n' +
                          'Click OK to copy the link, or click Cancel to dismiss.';
                        
                        if (confirm(fullMessage)) {
                          // Copy to clipboard
                          navigator.clipboard.writeText(verificationUrl).then(() => {
                            alert('✅ Verification link copied to clipboard! Paste it in your browser to verify your email.');
                          }).catch(() => {
                            // Fallback if clipboard API fails
                            prompt('Copy this verification link:', verificationUrl);
                          });
                        }
                        
                        setError('');
                        setNeedsVerification(false);
                      }
                    } catch (err: any) {
                      const errorMsg = err.response?.data?.error || 'Failed to resend verification email. Please try again.';
                      alert('❌ ' + errorMsg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline font-semibold"
                >
                  📧 Resend verification email
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Hall Ticket Number</label>
            <input
              type="text"
              name="htNo"
              value={formData.htNo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                // Use the API base URL to ensure correct routing
                const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');
                window.location.href = `${apiBase}/auth/google`;
              } catch (error) {
                console.error('Error redirecting to Google login:', error);
                alert('Failed to initiate login. Please try again.');
              }
            }}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Email
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/student/register" className="text-blue-600 hover:underline font-semibold">
            Register
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

