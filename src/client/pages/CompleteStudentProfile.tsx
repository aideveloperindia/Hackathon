import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function CompleteStudentProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    htNo: '',
    year: '',
    section: '',
    phoneNumber: '',
    branch: 'CSE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (!formData.htNo.trim()) {
      newErrors.htNo = 'Hall Ticket Number is required';
    } else {
      const htNo = formData.htNo.trim().toUpperCase();
      // Simple validation: 10 characters, "27" at positions 3-4 (0-indexed: 2-3)
      if (htNo.length !== 10) {
        newErrors.htNo = 'Hall Ticket Number must be exactly 10 characters';
      } else if (htNo.charAt(2) !== '2' || htNo.charAt(3) !== '7') {
        newErrors.htNo = 'Invalid format: Characters at positions 3-4 must be "27"';
      }
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (parseInt(formData.year) < 1 || parseInt(formData.year) > 4) {
      newErrors.year = 'Year must be between 1 and 4';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10 digits starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/complete-profile', {
        name: formData.name.trim(),
        htNo: formData.htNo.trim().toUpperCase(),
        year: parseInt(formData.year),
        section: formData.section.trim().toUpperCase(),
        phoneNumber: formData.phoneNumber.trim(),
        branch: formData.branch,
      });

      // Refresh user data
      window.location.href = '/student/dashboard';
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save profile. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Complete Your Registration</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Please provide your student details to complete your registration
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="htNo" className="block text-sm font-medium text-gray-700 mb-1">
              Hall Ticket Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="htNo"
              name="htNo"
              value={formData.htNo}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                errors.htNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 22271A0501"
              maxLength={10}
            />
            {errors.htNo && <p className="text-red-500 text-xs mt-1">{errors.htNo}</p>}
            <p className="text-gray-500 text-xs mt-1">Must be 10 characters with "27" at positions 3-4</p>
          </div>

          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CSE">CSE</option>
              <option value="CSM">CSM</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                  errors.section ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="A, B, C"
                maxLength={1}
              />
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="9876543210"
              maxLength={10}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            <p className="text-gray-500 text-xs mt-1">10 digits starting with 6-9</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

