import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, will be handled by interceptor
        return;
      }
      alert('Failed to load dashboard. Please try logging in again.');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async (eventId: string) => {
    try {
      console.log('Starting event:', eventId);
      await api.post(`/events/admin/${eventId}/start`);
      alert('Event started successfully!');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Start event error:', error);
      alert(error.response?.data?.error || 'Failed to start event');
    }
  };

  const handleStopEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to stop this event?')) return;

    try {
      console.log('Stopping event:', eventId);
      await api.post(`/events/admin/${eventId}/stop`);
      alert('Event stopped successfully!');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Stop event error:', error);
      alert(error.response?.data?.error || 'Failed to stop event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">Please try logging in again.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name || user?.email}</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/conduct-event"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer inline-block"
                onClick={(e) => {
                  console.log('Conduct Event button clicked');
                }}
              >
                Conduct Event
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Logout button clicked');
                  handleLogout();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>

          {dashboardData?.activeEvent && (
            <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Event</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Title: <span className="font-semibold">{dashboardData.activeEvent.title}</span></p>
                  <p className="text-gray-600">Language: <span className="font-semibold">{dashboardData.activeEvent.language}</span></p>
                  <p className="text-gray-600">Status: <span className="font-semibold">{dashboardData.activeEvent.status}</span></p>
                </div>
                <div>
                  <p className="text-gray-600">Participants: <span className="font-semibold">{dashboardData.activeEvent.participantCount}/{dashboardData.activeEvent.maxParticipants}</span></p>
                  <p className="text-gray-600">Questions: <span className="font-semibold">{dashboardData.activeEvent.questionsCount}</span></p>
                  <p className="text-gray-600">Started: <span className="font-semibold">{dashboardData.activeEvent.startTime ? new Date(dashboardData.activeEvent.startTime).toLocaleString() : 'N/A'}</span></p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to={`/leaderboard/${dashboardData.activeEvent.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer inline-block"
                >
                  View Leaderboard
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/edit-event/${dashboardData.activeEvent.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                >
                  Edit Questions
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Stop Event button clicked');
                    handleStopEvent(dashboardData.activeEvent.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                >
                  Stop Event
                </button>
              </div>
            </div>
          )}

          {!dashboardData?.activeEvent && (
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-gray-700 mb-4">No active event. Start a draft event below to get started.</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Draft Events {dashboardData?.draftEvents ? `(${dashboardData.draftEvents.length})` : ''}
            </h2>
            {dashboardData?.draftEvents && dashboardData.draftEvents.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.draftEvents.map((event: any) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{event.description || 'No description'}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Language: <span className="font-semibold">{event.language}</span></span>
                        <span>Questions: <span className="font-semibold">{event.questionsCount}</span></span>
                        <span>Max Participants: <span className="font-semibold">{event.maxParticipants}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer"
                      >
                        Edit Questions
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Start Event button clicked for:', event.id);
                          handleStartEvent(event.id);
                        }}
                        disabled={event.questionsCount === 0}
                        className={`font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer ${
                          event.questionsCount === 0
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {event.questionsCount === 0 ? 'No Questions' : 'Start Event'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-600">No draft events found. Use "Conduct Event" to create a new event.</p>
              </div>
            )}
          </div>

          {dashboardData?.leaderboard && dashboardData.leaderboard.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Leaderboard</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Rank</th>
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">HT No</th>
                      <th className="border border-gray-300 px-4 py-2">Branch/Year</th>
                      <th className="border border-gray-300 px-4 py-2">Score</th>
                      <th className="border border-gray-300 px-4 py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.leaderboard.map((entry: any) => (
                      <tr key={entry.studentId}>
                        <td className="border border-gray-300 px-4 py-2 text-center">{entry.rank}</td>
                        <td className="border border-gray-300 px-4 py-2">{entry.studentName}</td>
                        <td className="border border-gray-300 px-4 py-2">{entry.htNo}</td>
                        <td className="border border-gray-300 px-4 py-2">{entry.branch} - Y{entry.year}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{entry.totalScore}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{entry.timeTaken}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dashboardData?.pastEvents && dashboardData.pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Events</h2>
              <div className="space-y-2">
                {dashboardData.pastEvents.map((event: any) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.language} | {new Date(event.startTime).toLocaleDateString()}</p>
                    </div>
                    <Link
                      to={`/leaderboard/${event.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer inline-block"
                    >
                      View Results
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

