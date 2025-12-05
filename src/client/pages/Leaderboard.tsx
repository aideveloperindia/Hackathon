import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Leaderboard() {
  const { eventId } = useParams<{ eventId?: string }>();
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchLeaderboard(eventId);
    } else {
      fetchEvents();
    }
  }, [eventId]);

  const fetchLeaderboard = async (id: string) => {
    try {
      const response = await api.get(`/events/${id}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!eventId && events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Events Available</h2>
            <Link to="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Past Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/leaderboard/${event.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {event.language} | {new Date(event.startTime).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/" className="text-blue-600 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h2>
            {leaderboard?.event && (
              <p className="text-gray-600">
                {leaderboard.event.title} - {leaderboard.event.language}
              </p>
            )}
          </div>

          {leaderboard?.leaderboard && leaderboard.leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">Rank</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Name</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">HT No</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Branch/Year/Section</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">Score</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.leaderboard.map((entry: any, idx: number) => (
                    <tr
                      key={entry.studentId}
                      className={idx < 3 ? 'bg-yellow-50' : ''}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-bold">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold">{entry.studentName}</td>
                      <td className="border border-gray-300 px-4 py-3">{entry.htNo}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        {entry.branch} - Y{entry.year} - {entry.section}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-600">
                        {entry.totalScore}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{entry.timeTaken}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No participants yet.</p>
            </div>
          )}

          <div className="mt-6">
            <Link to="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

