import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicApp from './public/PublicApp';
import AdminLogin from './admin/AdminLogin';
import AdminApp from './admin/AdminApp';
import { checkAuth } from './shared/utils/auth';
import useActivityTracker from './shared/hooks/useActivityTracker';

const ActivityTracker = () => {
  useActivityTracker();
  return null;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in as admin
    const token = localStorage.getItem('luk_admin_token');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <Router>
      <ActivityTracker />
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={<PublicApp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard/*"
          element={
            isAdmin ? <AdminApp /> : <Navigate to="/admin" />
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;