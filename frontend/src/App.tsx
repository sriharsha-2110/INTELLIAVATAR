import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyTeachers from './pages/MyTeachers';
import CreateTeacher from './pages/CreateTeacher';
import TeachingRoom from './pages/TeachingRoom';
import AITutor from './pages/AITutor';
import MyLearning from './pages/MyLearning';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        {/* Core 7 Application Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/teachers" element={<MyTeachers />} />
        <Route path="/create" element={<CreateTeacher />} />
        <Route path="/teaching" element={<TeachingRoom />} />
        <Route path="/tutor" element={<AITutor />} />
        <Route path="/learning" element={<MyLearning />} />
        <Route path="/settings" element={<Settings />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
