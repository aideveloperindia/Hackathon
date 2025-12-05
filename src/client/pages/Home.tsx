import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Logo placeholder */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              JITS
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            JITS Coding Event Platform
          </h1>
          <p className="text-gray-600 text-lg mb-12">
            Participate in coding competitions and showcase your skills
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/student/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/admin/login"
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Admin Access
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'student' ? (
                  <Link
                    to="/student/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/leaderboard"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  View Leaderboard
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="mt-8">
              <p className="text-gray-600 mb-4">
                Logged in as: <span className="font-semibold">{user?.email}</span>
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

