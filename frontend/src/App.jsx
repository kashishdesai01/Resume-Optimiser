
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobTrackerPage from './pages/JobTrackerPage';
import DocumentsPage from './pages/DocumentsPage';
import InsightsPage from './pages/InsightsPage';
import AuthService from './services/auth.service';
import ApplicationDetailPage from './pages/ApplicationDetailPage';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  const handleLogin = () => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false}/>
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-grow w-full p-4 md:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/dashboard" element={<Navigate to="/dashboard/tracker" replace />} />
            
            <Route
              path="/dashboard/tracker"
              element={<ProtectedRoute><JobTrackerPage /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/tracker/:applicationId"
              element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/documents"
              element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/insights"
              element={<ProtectedRoute><InsightsPage /></ProtectedRoute>}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;