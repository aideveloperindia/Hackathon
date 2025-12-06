import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('🔍 Verification token from URL:', token ? token.substring(0, 20) + '...' : 'MISSING');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link - no token found in URL');
      return;
    }

    // Decode token in case it's URL encoded
    const decodedToken = decodeURIComponent(token);
    console.log('🔍 Decoded token:', decodedToken.substring(0, 20) + '...');

    api
      .post('/auth/student/verify-email', { token: decodedToken })
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      })
      .catch((error) => {
        setStatus('error');
        const errorData = error.response?.data;
        let errorMessage = errorData?.error || 'Verification failed. Please try again.';
        
        console.error('❌ Verification error:', errorData);
        
        // If already verified, show success message
        if (errorData?.alreadyVerified) {
          setStatus('success');
          errorMessage = 'This email is already verified! You can log in now.';
        } else if (errorData?.suggestion) {
          errorMessage = `${errorMessage} ${errorData.suggestion}`;
        }
        
        setMessage(errorMessage);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/student/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
              <p className="font-semibold mb-2">💡 Quick Fix:</p>
              <p>1. Go to login page</p>
              <p>2. Click "Resend verification email"</p>
              <p>3. Use the NEW link immediately</p>
            </div>
            <div className="space-y-3">
              <Link
                to="/student/login"
                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 text-center"
              >
                Go to Login & Resend
              </Link>
              <Link
                to="/"
                className="inline-block w-full text-gray-600 hover:text-gray-800 text-center"
              >
                ← Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

