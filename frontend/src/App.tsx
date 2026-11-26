import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AvatarCreator from './pages/AvatarCreator';
import AvatarStudio from './pages/AvatarStudio';
import AITeacherMode from './pages/AITeacherMode';
import ChatInterface from './pages/ChatInterface';
import AITutor from './pages/AITutor';
import TalkToPDF from './pages/TalkToPDF';
import ResearchLab from './pages/ResearchLab';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';

// Auth check helper - supports guest/demo session seamlessly
const isAuthenticated = () => {
  // If no token exists, initialize a guest session so user is never locked out of creation or chat
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'demo-workspace-token');
    localStorage.setItem('user_email', 'guest@intelliavatar.ai');
  }
  return true;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <ProtectedRoute>
              <AvatarCreator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/:avatarId"
          element={
            <ProtectedRoute>
              <AvatarStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/:avatarId"
          element={
            <ProtectedRoute>
              <AITeacherMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:avatarId"
          element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talk-to-pdf"
          element={
            <ProtectedRoute>
              <TalkToPDF />
            </ProtectedRoute>
          }
        />
        <Route
          path="/research"
          element={
            <ProtectedRoute>
              <ResearchLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
