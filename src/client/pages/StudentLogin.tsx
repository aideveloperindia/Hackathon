import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function StudentLogin() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for error in URL params (from OAuth redirects)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome to JITS</h2>
        <p className="text-gray-600 text-center mb-8">Sign in with your Gmail to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="mb-2">{error}</p>
          </div>
        )}

        {/* Gmail Login Button - Primary and Only Option */}
        <button
          type="button"
          onClick={async () => {
            try {
              setLoading(true);
              // Use the API base URL to ensure correct routing
              const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');
              window.location.href = `${apiBase}/auth/google`;
            } catch (error) {
              console.error('Error redirecting to Google login:', error);
              alert('Failed to initiate login. Please try again.');
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 font-semibold py-4 px-6 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Gmail'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          By signing in, you'll be asked to provide your student details
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-800 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

