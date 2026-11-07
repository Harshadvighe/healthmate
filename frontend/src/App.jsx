import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import FoodCheckerPage from './pages/FoodCheckerPage';
import ChatbotPage from './pages/ChatbotPage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#145B52] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">HM</span>
          </div>
          <span className="text-xs text-[#71807B] font-medium">Loading HealthMate...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Onboarding Wizard */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Main Authenticated Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/food-checker" element={<FoodCheckerPage />} />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
