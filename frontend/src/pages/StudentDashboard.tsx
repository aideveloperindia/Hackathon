import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

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
      alert('Successfully joined the event!');
      // Refresh to update hasJoined status
      checkActiveEvent();
      fetchDashboardData();
      // Navigate to coding environment
      navigate(`/coding/${activeEvent.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join event');
    }
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

          {activeEvent && !activeEvent.hasJoined && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-2">Event Active!</h3>
              <p className="text-green-700 mb-4">
                {activeEvent.title} - {activeEvent.language} | Participants:{' '}
                {activeEvent.participantCount}/{activeEvent.maxParticipants}
              </p>
              <button
                onClick={handleJoinEvent}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Join Event
              </button>
            </div>
          )}

          {activeEvent && activeEvent.hasJoined && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-2">You're in the event!</h3>
              <p className="text-blue-700 mb-4">{activeEvent.title}</p>
              <Link
                to={`/coding/${activeEvent.id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Go to Coding Environment
              </Link>
            </div>
          )}

          {dashboardData?.stats?.currentEventTitle && (
            <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                {dashboardData.stats.currentEventStatus === 'ACTIVE' ? '📍 Live Event' : '📋 Last Event'}
              </h3>
              <p className="font-medium text-gray-800">{dashboardData.stats.currentEventTitle}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Events Participated</h3>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData?.stats?.eventsParticipated ?? 0}
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions Solved (Total)</h3>
              <p className="text-3xl font-bold text-green-600">
                {dashboardData?.stats?.questionsSolved ?? 0}
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions Attempted</h3>
              <p className="text-3xl font-bold text-amber-600">
                {dashboardData?.stats?.questionsAttempted ?? 0}
                {dashboardData?.stats?.totalQuestionsInEvent
                  ? ` / ${dashboardData.stats.totalQuestionsInEvent}`
                  : ''}
              </p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Score</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {dashboardData?.stats?.totalScore ?? 0}
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Taken</h3>
              <p className="text-3xl font-bold text-purple-600">
                {formatTime(dashboardData?.stats?.totalTimeTaken ?? 0)}
              </p>
            </div>
            <div className="bg-rose-50 p-6 rounded-lg lg:col-span-2 xl:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Leaderboard Position</h3>
              <p className="text-3xl font-bold text-rose-600">
                {dashboardData?.stats?.leaderboardPosition != null
                  ? `#${dashboardData.stats.leaderboardPosition}`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to={dashboardData?.stats?.currentEventId ? `/leaderboard/${dashboardData.stats.currentEventId}` : '/leaderboard'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {dashboardData?.stats?.currentEventId ? 'View Current Leaderboard' : 'View Leaderboard'}
            </Link>
            <button
              type="button"
              onClick={() => {
                fetchDashboardData();
                checkActiveEvent();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Refresh Stats
            </button>
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

