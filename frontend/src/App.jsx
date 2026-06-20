import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import WelcomePage           from './pages/WelcomePage';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';
import ForgotPasswordPage    from './pages/ForgotPasswordPage';
import OtpVerificationPage   from './pages/OtpVerificationPage';
import ResetPasswordPage     from './pages/ResetPasswordPage';

// App Pages
import HomePage              from './pages/HomePage';
import CollectionsPage       from './pages/CollectionsPage';
import CalendarMemoriesPage  from './pages/CalendarMemoriesPage';
import DiaryPage             from './pages/DiaryPage';
import StoryWritingPage      from './pages/StoryWritingPage';
import MemoryDetailPage      from './pages/MemoryDetailPage';
import FavoritesPage         from './pages/FavoritesPage';
import SearchPage            from './pages/SearchPage';
import ProfileSettingsPage   from './pages/ProfileSettingsPage';

/**
 * ProtectedRoute – redirects to /login if user is not authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, isLoadingUser } = useAuth();
  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#c8a882', fontSize: '16px' }}>
        Loading MemoryVerse...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * GuestRoute – redirects logged-in users away from auth pages.
 */
function GuestRoute({ children }) {
  const { user, isLoadingUser } = useAuth();
  if (isLoadingUser) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ===== GUEST ROUTES ===== */}
      <Route path="/welcome" element={<GuestRoute><WelcomePage /></GuestRoute>} />
      <Route path="/login"   element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/verify-otp"      element={<OtpVerificationPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* ===== PROTECTED APP ROUTES ===== */}
      <Route path="/" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/collections" element={
        <ProtectedRoute><CollectionsPage /></ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute><CalendarMemoriesPage /></ProtectedRoute>
      } />
      <Route path="/diary" element={
        <ProtectedRoute><DiaryPage /></ProtectedRoute>
      } />
      <Route path="/stories" element={
        <ProtectedRoute><StoryWritingPage /></ProtectedRoute>
      } />
      <Route path="/memory/:memoryId" element={
        <ProtectedRoute><MemoryDetailPage /></ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute><FavoritesPage /></ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute><SearchPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#3d2c1e',
              border: '1px solid #e8d5c0',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#9b8ec4', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
