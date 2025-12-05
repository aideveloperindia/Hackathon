import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function LanguageSelection() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeEvent, setActiveEvent] = useState<any>(null);

  useEffect(() => {
    checkActiveEvent();
  }, []);

  const checkActiveEvent = async () => {
    try {
      const response = await api.get('/events/active');
      if (response.data.event) {
        setActiveEvent(response.data.event);
      }
    } catch (error) {
      console.error('Error checking active event:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage) {
      setError('Please select a language');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/student/select-language', { language: selectedLanguage });
      if (activeEvent && !activeEvent.hasJoined) {
        navigate(`/coding/${activeEvent.id}`);
      } else {
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save language selection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Select Your Language
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Choose your preferred programming language for the upcoming event
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {['C', 'Python', 'Java', 'Other'].map((lang) => (
              <label
                key={lang}
                className={`cursor-pointer border-2 rounded-lg p-6 text-center transition duration-200 ${
                  selectedLanguage === lang
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={selectedLanguage === lang}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="sr-only"
                />
                <div className="text-2xl font-bold text-gray-800">{lang}</div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedLanguage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>

        {activeEvent ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              An event is currently active! You can join after selecting your language.
            </p>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please wait for admin to start an event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

