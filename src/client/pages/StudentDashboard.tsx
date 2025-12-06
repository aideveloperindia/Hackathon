import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkActiveEvent();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleJoinEvent = async () => {
    if (!activeEvent) return;

    try {
      await api.post(`/events/${activeEvent.id}/join`);
      // Refresh to update hasJoined status
      checkActiveEvent();
      fetchDashboardData();
      // Navigate to coding environment
      navigate(`/coding/${activeEvent.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join event');
    }
  };

  const handleGoToCoding = () => {
    if (!activeEvent) return;
    navigate(`/coding/${activeEvent.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {dashboardData?.student?.name || user?.name}
              </h1>
              <p className="text-gray-600">
                HT No: {dashboardData?.student?.htNo || user?.htNo} |{' '}
                {dashboardData?.student?.branch} - {dashboardData?.student?.section} | Year{' '}
                {dashboardData?.student?.year}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>

          {activeEvent && (
            <div className={`mb-6 p-6 border rounded-lg ${
              activeEvent.hasJoined 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${
                activeEvent.hasJoined 
                  ? 'text-blue-800' 
                  : 'text-green-800'
              }`}>
                {activeEvent.hasJoined ? "You're in the event!" : 'Event Active!'}
              </h3>
              <p className={`mb-4 ${
                activeEvent.hasJoined 
                  ? 'text-blue-700' 
                  : 'text-green-700'
              }`}>
                {activeEvent.title} - {activeEvent.language}
                {!activeEvent.hasJoined && (
                  <> | Participants: {activeEvent.participantCount}/{activeEvent.maxParticipants}</>
                )}
              </p>
              <button
                onClick={activeEvent.hasJoined ? handleGoToCoding : handleJoinEvent}
                type="button"
                className={`font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer ${
                  activeEvent.hasJoined
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {activeEvent.hasJoined ? 'Go to Coding Environment' : 'Join Event'}
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Events Participated</h3>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData?.stats?.eventsParticipated || 0}
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions Solved</h3>
              <p className="text-3xl font-bold text-green-600">
                {dashboardData?.stats?.questionsSolved || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Leaderboard Position</h3>
              <p className="text-3xl font-bold text-purple-600">
                {dashboardData?.stats?.leaderboardPosition
                  ? `#${dashboardData.stats.leaderboardPosition}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              to="/leaderboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              View Leaderboard
            </Link>
            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

