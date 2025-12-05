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
      
      // Handle different error cases - DO NOT proceed on error
      if (error.response?.data?.requiresVerification) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else if (error.response?.status === 401) {
        // Password or credentials wrong
        setError(error.response?.data?.error || 'Invalid Hall Ticket Number or password. Please check and try again.');
      } else if (error.response?.status === 403) {
        setError(error.response?.data?.error || 'Access denied. Please verify your email first.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      
      // Ensure we don't proceed on error
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Student Login</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
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

