import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicApp from './public/PublicApp';
import AdminLogin from './admin/AdminLogin';
import AdminApp from './admin/AdminApp';
import { verifySession } from './shared/utils/auth';
import useActivityTracker from './shared/hooks/useActivityTracker';

const ActivityTracker = () => {
  useActivityTracker();
  return null;
};

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00a84f] rounded-full animate-spin" />
  </div>
);

function AppRoutes() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(false);

  // Only the admin area needs a verified session. Public routes never pay for
  // the extra round-trip.
  const inAdminArea = location.pathname.startsWith('/admin/dashboard');

  useEffect(() => {
    if (!inAdminArea) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    // Ask the API whether the stored token is genuinely an admin token. The
    // previous check only tested for the presence of a localStorage string,
    // which anyone could create by hand.
    verifySession()
      .then((user) => {
        if (!cancelled) setIsAdmin(!!user);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inAdminArea]);

  if (inAdminArea && checking) {
    return <Spinner />;
  }

  return (
    <>
      <ActivityTracker />
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={<PublicApp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard/*"
          element={isAdmin ? <AdminApp /> : <Navigate to="/admin" replace />}
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
