import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import StudentRegister from './pages/StudentRegister';
import StudentLogin from './pages/StudentLogin';
import AdminRegister from './pages/AdminRegister';
import AdminLogin from './pages/AdminLogin';
import LanguageSelection from './pages/LanguageSelection';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CodingEnvironment from './pages/CodingEnvironment';
import Leaderboard from './pages/Leaderboard';
import VerifyEmail from './pages/VerifyEmail';
import ConductEvent from './pages/ConductEvent';

function PrivateRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: 'student' | 'admin' }) {
  const { isAuthenticated, user } = useAuth();

  // Debug logging
  console.log('PrivateRoute check:', { isAuthenticated, userRole: user?.role, requireRole });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    console.log(`Role mismatch: user role is ${user?.role}, required is ${requireRole}`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student/register" element={<StudentRegister />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          <Route
            path="/select-language"
            element={
              <PrivateRoute requireRole="student">
                <LanguageSelection />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute requireRole="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/coding/:eventId"
            element={
              <PrivateRoute requireRole="student">
                <CodingEnvironment />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requireRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/conduct-event"
            element={
              <PrivateRoute requireRole="admin">
                <ConductEvent />
              </PrivateRoute>
            }
          />
          
          <Route path="/leaderboard/:eventId" element={<Leaderboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

