
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shifts from './pages/Shifts';
import Exports from './pages/Exports';
import Incidents from './pages/Incidents';
import Assistant from './pages/Assistant';
import Certifications from './pages/Certifications';
import NotificationSettings from './pages/NotificationSettings';
import Onboarding from './pages/Onboarding';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

// Pages that should NOT show the bottom nav
const NO_BOTTOM_NAV = ['/', '/login', '/register', '/onboarding', '/terms', '/privacy', '/disclaimer'];

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const showBottomNav = user && !NO_BOTTOM_NAV.includes(location.pathname);

  return (
    <Box
      minHeight="100vh"
      bgcolor="background.default"
      // Add bottom padding on mobile when bottom nav is visible
      pb={{ xs: showBottomNav ? '72px' : 0, sm: 0 }}
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* Onboarding (protected) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shifts"
          element={
            <ProtectedRoute>
              <Shifts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exports"
          element={
            <ProtectedRoute>
              <Exports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <Incidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certifications"
          element={
            <ProtectedRoute>
              <Certifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* 404 fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Mobile bottom navigation */}
      {showBottomNav && <BottomNav />}
    </Box>
  );
};

export default App;
