import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth errors
      let errorMessage = 'Authentication failed. Please try again.';
      if (error === 'oauth_cancelled') {
        errorMessage = 'Google sign-in was cancelled.';
      } else if (error === 'no_email') {
        errorMessage = 'No email found in Google account.';
      } else if (error === 'email_not_verified') {
        errorMessage = 'Your Google email is not verified.';
      }
      navigate(`/student/login?error=${encodeURIComponent(errorMessage)}`);
      return;
    }

    if (token && email) {
      // Store token and user data
      const userData = {
        id: '', // Will be set from token
        email: email,
        role: 'student' as const,
      };

      login(token, userData);
      
      // Navigate to language selection or dashboard
      setTimeout(() => {
        navigate('/select-language');
      }, 100);
    } else {
      navigate('/student/login?error=Invalid authentication response');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Completing Sign In...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

